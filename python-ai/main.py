from flask import Flask
from dotenv import load_dotenv
from app.routes import register_routes

load_dotenv(override=True)

def create_app():
    app = Flask(__name__)
    register_routes(app)
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)