from flask import jsonify, Response, request
import cv2

from app.services.attendance_sender import send_attendance
from app.services.recognition_memory import can_log_attendance
from app.camera import (
    test_camera,
    get_camera_url,
    enroll_multiple_faces,
    train_model,
    recognize_face_from_frame,
    recognize_face_from_image_path,
)


def register_routes(app):
    def error_response(message, status_code=400, extra=None):
        payload = {
            "success": False,
            "message": message
        }
        if extra:
            payload.update(extra)
        return jsonify(payload), status_code

    def open_camera():
        camera_url = get_camera_url()

        if not camera_url:
            return None, error_response("No camera URL configured", 400)

        cap = cv2.VideoCapture(camera_url)

        if not cap.isOpened():
            cap.release()
            return None, error_response("Unable to connect to camera", 500)

        return cap, None

    def try_send_attendance(recognition_result):
        if not recognition_result:
            return None

        recognized = recognition_result.get("recognized", False)
        member_id = recognition_result.get("member_id")
        confidence = recognition_result.get("confidence", 0)

        if recognized is not True:
            return None

        if member_id is None:
            return None

        member_id_str = str(member_id)

        if not can_log_attendance(member_id_str):
            return {
                "success": False,
                "status_code": 429,
                "message": "Cooldown active. Attendance not sent.",
                "response": None
            }

        try:
            member_id_int = int(member_id)
        except (TypeError, ValueError):
            return {
                "success": False,
                "status_code": 400,
                "message": "Invalid member_id from recognition result",
                "response": None
            }

        try:
            confidence_float = float(confidence)
        except (TypeError, ValueError):
            confidence_float = 0.0

        attendance_result = send_attendance(
            member_id=member_id_int,
            confidence=confidence_float,
            camera_name="Gym Entrance CCTV"
        )

        return attendance_result

    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "success": True,
            "message": "Python AI service is running"
        })

    @app.route("/camera/test", methods=["GET"])
    def camera_test():
        return jsonify(test_camera())

    @app.route("/camera/enroll-multiple", methods=["POST"])
    def camera_enroll_multiple():
        data = request.get_json(silent=True) or {}
        member_id = str(data.get("member_id", "")).strip()

        try:
            sample_count = int(data.get("sample_count", 5))
        except (TypeError, ValueError):
            return error_response("sample_count must be a valid integer", 400)

        if not member_id:
            return error_response("member_id is required", 400)

        if sample_count <= 0:
            return error_response("sample_count must be greater than 0", 400)

        result = enroll_multiple_faces(member_id, sample_count)
        return jsonify(result)

    @app.route("/camera/train", methods=["POST"])
    def camera_train():
        result = train_model()
        return jsonify(result)

    @app.route("/camera/recognize", methods=["GET"])
    def camera_recognize():
        cap, camera_error = open_camera()
        if camera_error:
            return camera_error

        ret, frame = cap.read()
        cap.release()

        if not ret:
            return error_response("No frame received", 500)

        frame_result = recognize_face_from_frame(frame)

        if not frame_result:
            return error_response("No face recognized", 404)

        attendance_result = try_send_attendance(frame_result)

        return jsonify({
            "success": True,
            "recognized": frame_result,
            "attendance_sent": attendance_result,
            "attendance_message": attendance_result.get("message") if attendance_result else None
        })

    @app.route("/camera/recognize-image", methods=["POST"])
    def camera_recognize_image():
        data = request.get_json(silent=True) or {}
        image_path = str(data.get("image_path", "")).strip()

        if not image_path:
            return error_response("image_path is required", 400)

        result = recognize_face_from_image_path(image_path)
        return jsonify(result)

    @app.route("/camera/stream", methods=["GET"])
    def camera_stream():
        camera_url = get_camera_url()

        if not camera_url:
            return error_response("No camera URL configured", 400)

        def generate():
            cap = cv2.VideoCapture(camera_url)

            if not cap.isOpened():
                cap.release()
                return

            while True:
                success, frame = cap.read()

                if not success:
                    break

                result = recognize_face_from_frame(frame)

                if result and "box" in result:
                    x, y, w, h = result["box"]

                    is_recognized = result.get("recognized", False)
                    member_id = result.get("member_id", "Unknown")

                    try:
                        confidence = float(result.get("confidence", 0))
                    except (TypeError, ValueError):
                        confidence = 0.0

                    color = (0, 255, 0) if is_recognized else (0, 0, 255)

                    cv2.rectangle(
                        frame,
                        (x, y),
                        (x + w, y + h),
                        color,
                        2
                    )

                    label = f"{member_id} ({confidence:.1f})"

                    cv2.putText(
                        frame,
                        label,
                        (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        color,
                        2
                    )

                    attendance_result = try_send_attendance(result)
                    if attendance_result:
                        print(
                            f"[ATTENDANCE] member_id={result.get('member_id')} | "
                            f"status={attendance_result.get('status_code')} | "
                            f"message={attendance_result.get('message')}"
                        )

                ret, buffer = cv2.imencode(".jpg", frame)

                if not ret:
                    continue

                frame_bytes = buffer.tobytes()

                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" +
                    frame_bytes +
                    b"\r\n"
                )

            cap.release()

        return Response(
            generate(),
            mimetype="multipart/x-mixed-replace; boundary=frame"
        )