import os
from datetime import datetime

import requests
from dotenv import load_dotenv

load_dotenv()

LARAVEL_API_URL = os.getenv("LARAVEL_API_URL", "http://127.0.0.1:8000/api")
API_TOKEN = os.getenv("LARAVEL_API_TOKEN", "gym-ai-secret-2026")

ATTENDANCE_ENDPOINT = f"{LARAVEL_API_URL}/attendance/auto-log"


def send_attendance(member_id, confidence=None, camera_name="Gym Entrance CCTV"):
    try:
        payload = {
            "member_id": int(member_id),
            "confidence": float(confidence) if confidence is not None else None,
            "camera_name": camera_name,
            "recognized_at": datetime.now().isoformat()
        }

        headers = {
            "Authorization": f"Bearer {API_TOKEN}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        response = requests.post(
            ATTENDANCE_ENDPOINT,
            json=payload,
            headers=headers,
            timeout=5
        )

        try:
            response_data = response.json()
        except Exception:
            response_data = {"raw": response.text}

        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "message": response_data.get("message", "No message returned"),
            "response": response_data
        }

    except Exception as e:
        return {
            "success": False,
            "status_code": 500,
            "message": str(e),
            "response": None
        }