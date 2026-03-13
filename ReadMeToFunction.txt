Gym Management System
How to Run the System (Step-by-Step)

Running Systems:
1. Laravel API
2. Python AI (Camera + Face Recognition)
3. React Admin Dashboard


1️⃣ Start XAMPP (Database)
Open:
   XAMPP Control Panel
Start:
   Apache
   MySQL



2️⃣ Run Python AI (Camera System)
   cd C:\xampp\htdocs\gym\python-ai
   venv\Scripts\activate
         pip install -r requirements.txt (Use this ONLY is it saids 'Flask not found')
   python main.py

You should see:
Running on http://127.0.0.1:5000

Test in browser:
http://127.0.0.1:5000

Camera test:
http://127.0.0.1:5000/camera/test

Camera stream:
http://127.0.0.1:5000/camera/stream



3️⃣ Run Laravel Backend
Open this folder:
   C:\xampp\htdocs\gym\api

Run:
   php artisan serve

Laravel will start at:
http://127.0.0.1:8000



4️⃣ Run React Admin Dashboard
Open this folder:
   C:\xampp\htdocs\gym\web-admin

Run:
   npm run dev

React will start at:
http://localhost:5173

Open:
Attendance Page

You should see the camera feed.


 
5️⃣ Start Phone Camera
Open **IP Webcam** app on phone.

Press:
   Start Server

Example stream:
http://192.168.1.60:8080/videofeed

Make sure this is in:
   python-ai/.env
      CAMERA_RTSP_URL=http://192.168.1.60:8080/videofeed


System Flow
   Phone Camera
      ↓
   Python AI (OpenCV)
      ↓
   Flask API
      ↓
   Laravel API
      ↓
   MySQL Database
      ↓
   React Admin Dashboard



Files You Run
   python-ai/main.py
   api/php artisan serve
   web-admin/npm run dev



In VS Code:
Terminal 1 → Python AI
Terminal 2 → Laravel
Terminal 3 → React


Then run:
   python main.py
   php artisan serve
   npm run dev
