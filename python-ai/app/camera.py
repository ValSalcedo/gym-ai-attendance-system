import cv2
import os
from dotenv import load_dotenv
from datetime import datetime
import numpy as np

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

load_dotenv(override=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "lbph_model.yml")
LABELS_PATH = os.path.join(MODEL_DIR, "labels.txt")


def get_camera_url():
    return os.getenv("CAMERA_RTSP_URL", "").strip()


def test_camera():
    camera_url = get_camera_url()

    if not camera_url:
        return {"status": "error", "message": "No RTSP URL configured"}

    cap = cv2.VideoCapture(camera_url)
    if not cap.isOpened():
        return {"status": "error", "message": f"Unable to connect to camera: {camera_url}"}

    ret, frame = cap.read()
    cap.release()

    if not ret:
        return {"status": "error", "message": "Camera connected but no frame received"}

    return {
        "status": "success",
        "message": "Camera stream working",
        "resolution": f"{frame.shape[1]}x{frame.shape[0]}",
        "camera_url": camera_url
    }


def detect_largest_face(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.2,
        minNeighbors=3,
        minSize=(20, 20)
    )

    if len(faces) == 0:
        return None, 0

    x, y, w, h = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]
    return (x, y, w, h), len(faces)


def enroll_multiple_faces(member_id: str, sample_count: int = 5):
    camera_url = get_camera_url()

    if not camera_url:
        return {"status": "error", "message": "No RTSP URL configured"}

    cap = cv2.VideoCapture(camera_url)
    if not cap.isOpened():
        return {"status": "error", "message": "Unable to connect to camera"}

    member_folder = os.path.join(DATASET_DIR, member_id)
    os.makedirs(member_folder, exist_ok=True)

    saved_files = []
    attempts = 0
    max_attempts = sample_count * 20

    while len(saved_files) < sample_count and attempts < max_attempts:
        attempts += 1
        ret, frame = cap.read()
        if not ret:
            continue

        face_box, face_count = detect_largest_face(frame)
        if face_box is None:
            continue

        x, y, w, h = face_box

        padding = 20
        x1 = max(x - padding, 0)
        y1 = max(y - padding, 0)
        x2 = min(x + w + padding, frame.shape[1])
        y2 = min(y + h + padding, frame.shape[0])

        face_crop = frame[y1:y2, x1:x2]

        if face_crop.size == 0:
            continue

        filename = f"{member_id}_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.jpg"
        filepath = os.path.join(member_folder, filename)

        if cv2.imwrite(filepath, face_crop):
            saved_files.append(filepath)
            cv2.waitKey(200)

    cap.release()

    if not saved_files:
        return {
            "status": "error",
            "message": "No face samples were captured. Please face the camera clearly and try again."
        }

    return {
        "status": "success",
        "message": "Face samples enrolled successfully",
        "member_id": member_id,
        "saved_count": len(saved_files),
        "files": saved_files
    }


def train_model():
    if not os.path.exists(DATASET_DIR):
        return {"status": "error", "message": "Dataset folder not found"}

    faces = []
    labels = []
    label_map = {}
    current_label = 0

    for member_id in os.listdir(DATASET_DIR):
        member_folder = os.path.join(DATASET_DIR, member_id)
        if not os.path.isdir(member_folder):
            continue

        label_map[current_label] = member_id

        for filename in os.listdir(member_folder):
            file_path = os.path.join(member_folder, filename)
            img = cv2.imread(file_path)
            if img is None:
                continue

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            resized = cv2.resize(gray, (200, 200))

            faces.append(resized)
            labels.append(current_label)

        current_label += 1

    if not faces:
        return {"status": "error", "message": "No training images found"}

    os.makedirs(MODEL_DIR, exist_ok=True)

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.train(faces, np.array(labels))
    recognizer.save(MODEL_PATH)

    with open(LABELS_PATH, "w", encoding="utf-8") as f:
        for label_id, member_id in label_map.items():
            f.write(f"{label_id}:{member_id}\n")

    return {
        "status": "success",
        "message": "Model trained successfully",
        "members_trained": len(label_map),
        "images_used": len(faces)
    }


def load_labels():
    labels = {}
    if not os.path.exists(LABELS_PATH):
        return labels

    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if ":" in line:
                label_id, member_id = line.split(":", 1)
                labels[int(label_id)] = member_id
    return labels


def recognize_face_from_frame(frame):
    if not os.path.exists(MODEL_PATH):
        return {"recognized": False, "message": "Model not trained yet"}

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.3,
        minNeighbors=5,
        minSize=(30, 30)
    )

    if len(faces) == 0:
        return {"recognized": False, "message": "No face detected"}

    x, y, w, h = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]
    face_crop = gray[y:y+h, x:x+w]
    face_crop = cv2.resize(face_crop, (200, 200))

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(MODEL_PATH)

    label_id, confidence = recognizer.predict(face_crop)
    labels = load_labels()
    member_id = labels.get(label_id, "Unknown")

    # Lower confidence is better in LBPH
    recognized = confidence < 80

    return {
        "recognized": recognized,
        "member_id": member_id if recognized else "Unknown",
        "confidence": float(confidence),
        "box": [int(x), int(y), int(w), int(h)]
    }

def recognize_face_from_image_path(image_path):
    if not os.path.exists(image_path):
        return {
            "status": "error",
            "message": f"Image not found: {image_path}"
        }

    frame = cv2.imread(image_path)
    if frame is None:
        return {
            "status": "error",
            "message": "Failed to load image"
        }

    result = recognize_face_from_frame(frame)

    return {
        "status": "success",
        "image_path": image_path,
        **result
    }