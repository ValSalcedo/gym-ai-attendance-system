import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    CAMERA_RTSP_URL = os.getenv("CAMERA_RTSP_URL")
    LARAVEL_API_URL = os.getenv("LARAVEL_API_URL")