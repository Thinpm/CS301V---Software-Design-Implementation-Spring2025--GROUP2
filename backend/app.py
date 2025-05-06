from backend.api import create_app
from backend.config import APP_CONFIG
from backend.utils.logger import logger

app = create_app()

if __name__ == '__main__':
    logger.info("Starting Flask application...")
    app.run(
        debug=APP_CONFIG['debug'],
        host=APP_CONFIG['host'],
        port=APP_CONFIG['port']
    ) 