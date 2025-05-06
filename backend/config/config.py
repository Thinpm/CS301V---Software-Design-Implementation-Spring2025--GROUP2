import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info("Loading environment variables...")

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '12345678'),
    'database': os.getenv('DB_NAME', 'vocabulary_learning')
}

# Application configuration
APP_CONFIG = {
    'debug': os.getenv('FLASK_DEBUG', 'True').lower() == 'true',
    'host': os.getenv('FLASK_HOST', '0.0.0.0'),
    'port': int(os.getenv('FLASK_PORT', 5000))
}

# CORS configuration
CORS_CONFIG = {
    'allowed_origins': os.getenv('ALLOWED_ORIGINS', 'http://localhost:8080,http://localhost:8081,http://172.20.48.1:8080,http://172.20.48.1:8081').split(','),
    'supports_credentials': True,
    'allow_headers': ["Content-Type", "Authorization", "Cookie", "Set-Cookie", "X-Requested-With"],
    'expose_headers': ["Set-Cookie", "Content-Type", "Content-Length", "Authorization"],
    'methods': ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}

# Logging configuration
LOG_CONFIG = {
    'level': os.getenv('LOG_LEVEL', 'INFO'),
    'file': os.getenv('LOG_FILE', 'app.log')
}

# Database URL for SQLAlchemy
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}/{DB_CONFIG['database']}"

# Table names configuration
TABLE_CONFIG = {
    'users': 'users',
    'topics': 'vocabulary_topics',
    'vocabularies': 'vocabularies',
    'tests': 'tests',
    'test_results': 'test_results',
    'leaderboards': 'leaderboards'
} 