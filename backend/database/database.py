import mysql.connector
import logging
from mysql.connector import Error
from typing import Any
from backend.config.config import DB_CONFIG
from backend.utils.exceptions import DatabaseError

logger = logging.getLogger(__name__)

_db_connection = None

def get_db():
    """
    Get database connection singleton
    
    Returns:
        Database connection object
        
    Raises:
        DatabaseError: If connection fails
    """
    global _db_connection
    
    try:
        logger.debug(f"Connecting to database with config: {DB_CONFIG}")
        if _db_connection is None:
            _db_connection = mysql.connector.connect(
                host=DB_CONFIG['host'],
                port=DB_CONFIG['port'],
                user=DB_CONFIG['user'],
                password=DB_CONFIG['password'],
                database=DB_CONFIG['database']
            )
            
        if not _db_connection.is_connected():
            _db_connection.reconnect()
            
        logger.info("Database connection successful")
        return _db_connection
        
    except Error as e:
        logger.error(f"Failed to connect to database: {str(e)}")
        raise DatabaseError(f"Failed to connect to database: {str(e)}")
        
def close_db() -> None:
    """Close database connection"""
    global _db_connection
    
    if _db_connection:
        _db_connection.close()
        _db_connection = None 