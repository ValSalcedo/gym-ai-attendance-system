import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

LARAVEL_API_URL = os.getenv("LARAVEL_API_URL")
API_TOKEN = os.getenv("LARAVEL_API_TOKEN")

ATTENDANCE_ENDPOINT = f"{LARAVEL_API_URL}/attendance/auto-log"


def send_attendance(member_id, confidence=None, camera_name="Gym Entrance CCTV"):
    try:
        payload = {
            "member_id": member_id,
            "confidence": confidence,
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

        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "response": response.json() if response.content else {}
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }