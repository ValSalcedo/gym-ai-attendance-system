from flask import jsonify, Response, request
from app.camera import (
    test_camera,
    get_camera_url,
    enroll_multiple_faces,
    train_model,
    recognize_face_from_frame,
    recognize_face_from_image_path,
)
import cv2


def register_routes(app):

    # Root endpoint
    @app.route("/")
    def home():
        return jsonify({
            "message": "Python AI service is running"
        })


    # Test camera connection
    @app.route("/camera/test")
    def camera_test():
        return jsonify(test_camera())


    # Enroll multiple face samples for a member
    @app.route("/camera/enroll-multiple", methods=["POST"])
    def camera_enroll_multiple():
        data = request.get_json(silent=True) or {}
        member_id = str(data.get("member_id", "")).strip()
        sample_count = int(data.get("sample_count", 5))

        if not member_id:
            return jsonify({
                "status": "error",
                "message": "member_id is required"
            }), 400

        return jsonify(enroll_multiple_faces(member_id, sample_count))


    # Train the recognition model
    @app.route("/camera/train", methods=["POST"])
    def camera_train():
        return jsonify(train_model())


    # Recognize face from live camera (single frame)
    @app.route("/camera/recognize")
    def camera_recognize():

        camera_url = get_camera_url()

        if not camera_url:
            return jsonify({
                "status": "error",
                "message": "No camera URL configured"
            }), 400

        cap = cv2.VideoCapture(camera_url)

        if not cap.isOpened():
            return jsonify({
                "status": "error",
                "message": "Unable to connect to camera"
            }), 500

        ret, frame = cap.read()
        cap.release()

        if not ret:
            return jsonify({
                "status": "error",
                "message": "No frame received"
            }), 500

        result = recognize_face_from_frame(frame)

        return jsonify(result)


    # Recognize face from saved image (no camera required)
    @app.route("/camera/recognize-image", methods=["POST"])
    def camera_recognize_image():

        data = request.get_json(silent=True) or {}
        image_path = str(data.get("image_path", "")).strip()

        if not image_path:
            return jsonify({
                "status": "error",
                "message": "image_path is required"
            }), 400

        return jsonify(recognize_face_from_image_path(image_path))


    # Live camera stream
    @app.route("/camera/stream")
    def camera_stream():

        camera_url = get_camera_url()

        if not camera_url:
            return jsonify({
                "status": "error",
                "message": "No camera URL configured"
            }), 400

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

                if "box" in result:
                    x, y, w, h = result["box"]

                    color = (0, 255, 0) if result.get("recognized") else (0, 0, 255)
                    name = result.get("member_id", "Unknown")
                    conf = result.get("confidence", 0)

                    cv2.rectangle(
                        frame,
                        (x, y),
                        (x + w, y + h),
                        color,
                        2
                    )

                    cv2.putText(
                        frame,
                        f"{name} ({conf:.1f})",
                        (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        color,
                        2
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