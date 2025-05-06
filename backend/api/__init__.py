from flask import Flask, after_this_request, request
from flask_cors import CORS
import os
import secrets
from datetime import timedelta
from backend.api.auth import auth_bp
from backend.api.learning import learning_bp
from backend.config.config import CORS_CONFIG

def create_app():
    app = Flask(__name__)
    
    # Cấu hình session tiêu chuẩn của Flask
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", secrets.token_hex(16))
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)
    app.config["SESSION_COOKIE_SAMESITE"] = "None"  # Cho phép cross-site cookies
    app.config["SESSION_COOKIE_SECURE"] = False  # Tắt trong môi trường dev
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_NAME"] = "vocab_vista_session"
    
    # Cấu hình CORS để hỗ trợ frontend từ các origin khác nhau
    CORS(app, 
         origins=CORS_CONFIG['allowed_origins'],
         supports_credentials=CORS_CONFIG['supports_credentials'],
         allow_headers=CORS_CONFIG['allow_headers'],
         expose_headers=CORS_CONFIG['expose_headers'],
         methods=CORS_CONFIG['methods'])
    
    # Đăng ký blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(learning_bp, url_prefix='/api/learning')
    
    return app

# This file makes the directory a Python package