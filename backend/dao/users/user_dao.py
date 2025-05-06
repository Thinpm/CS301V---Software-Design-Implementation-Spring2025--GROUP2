from typing import List, Optional
from datetime import datetime
import logging
from backend.database.database import get_db
from backend.config.config import TABLE_CONFIG
from .user_interface import IUserDAO
from .user_entity import UserEntity
from backend.dao.users.user_class import User
from backend.utils.exceptions import DatabaseError

logger = logging.getLogger(__name__)

class UserDAO(IUserDAO):
    """Implementation of User Data Access Object"""
    
    def __init__(self):
        self.db = get_db()
        self.table = TABLE_CONFIG['users']
        
    def get_all(self) -> List[User]:
        """Get all users"""
        try:
            cursor = self.db.cursor()
            cursor.execute(f"SELECT id, username, email, password, created_at FROM {self.table}")
            rows = cursor.fetchall()
            return [User(
                id=row[0],
                username=row[1], 
                email=row[2],
                password=row[3],
                created_at=row[4]
            ) for row in rows]
        except Exception as e:
            raise DatabaseError(f"Failed to get users: {str(e)}")
        
    def get_by_id(self, user_id) -> Optional[User]:
        """Get user by ID"""
        try:
            # Đảm bảo user_id là kiểu số
            if isinstance(user_id, str):
                logger.info(f"Converting user_id from string '{user_id}' to integer")
                try:
                    user_id = int(user_id)
                except ValueError as e:
                    logger.error(f"Cannot convert user_id to integer: {str(e)}")
                    return None
                
            logger.info(f"Getting user by ID: {user_id} (type: {type(user_id)})")
            
            cursor = self.db.cursor()
            cursor.execute(
                f"SELECT id, username, email, password, created_at FROM {self.table} WHERE id = %s",
                (user_id,)
            )
            row = cursor.fetchone()
            if not row:
                logger.info(f"User with ID {user_id} not found")
                return None
                
            user = User(
                id=row[0],
                username=row[1],
                email=row[2], 
                password=row[3],
                created_at=row[4]
            )
            logger.info(f"Found user: {user.username}, id: {user.id}")
            return user
        except Exception as e:
            logger.error(f"Failed to get user by ID {user_id}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise DatabaseError(f"Failed to get user: {str(e)}")
        
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        try:
            logger.debug(f"Getting user by username: {username}")
            cursor = self.db.cursor()
            cursor.execute(
                f"SELECT id, username, email, password, created_at FROM {self.table} WHERE username = %s",
                (username,)
            )
            row = cursor.fetchone()
            if not row:
                logger.debug(f"User not found: {username}")
                return None
                
            user = User(
                id=row[0],
                username=row[1],
                email=row[2],
                password=row[3],
                created_at=row[4]
            )
            logger.debug(f"Found user: {user.username}, id: {user.id}")
            return user
        except Exception as e:
            logger.error(f"Failed to get user by username {username}: {str(e)}")
            raise DatabaseError(f"Failed to get user: {str(e)}")
        
    def create(self, user: User) -> Optional[User]:
        """Create new user
        
        Args:
            user: User object to create
            
        Returns:
            Created user object with ID if successful, None otherwise
            
        Raises:
            DatabaseError: If database operation fails
        """
        cursor = None
        try:
            cursor = self.db.cursor()
            logger.debug(f"Creating new user: {user.username}")
            
            # Insert user
            cursor.execute(
                f"INSERT INTO {self.table} (username, email, password, created_at) VALUES (%s, %s, %s, %s)",
                (user.username, user.email, user.password, user.created_at or datetime.now())
            )
            
            # Get inserted ID
            user_id = cursor.lastrowid
            
            # Commit transaction
            self.db.commit()
            
            # Return user with ID
            user.id = user_id
            logger.info(f"Created user successfully: {user.username}, id: {user.id}")
            return user
                
        except Exception as e:
            # Rollback on error
            if self.db:
                self.db.rollback()
            logger.error(f"Failed to create user {user.username}: {str(e)}")
            raise DatabaseError(f"Failed to create user: {str(e)}")
        finally:
            if cursor:
                cursor.close()
        
    def update(self, user: User) -> bool:
        """Update user
        
        Args:
            user: User object to update
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            DatabaseError: If database operation fails
        """
        cursor = None
        try:
            cursor = self.db.cursor()
            
            # Update user
            cursor.execute(
                f"UPDATE {self.table} SET username = %s, email = %s, password = %s WHERE id = %s",
                (user.username, user.email, user.password, user.id)
            )
            
            # Commit transaction
            self.db.commit()
            
            return cursor.rowcount > 0
                
        except Exception as e:
            # Rollback on error
            if self.db:
                self.db.rollback()
            raise DatabaseError(f"Failed to update user: {str(e)}")
        finally:
            if cursor:
                cursor.close()
            
    def delete(self, user_id: int) -> bool:
        """Delete user"""
        cursor = None
        try:
            cursor = self.db.cursor()
            
            cursor.execute(f"DELETE FROM {self.table} WHERE id = %s", (user_id,))
            
            # Commit transaction
            self.db.commit()
            
            return cursor.rowcount > 0
                
        except Exception as e:
            # Rollback on error
            if self.db:
                self.db.rollback()
            raise DatabaseError(f"Failed to delete user: {str(e)}")
        finally:
            if cursor:
                cursor.close()

    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            cursor = self.db.cursor()
            cursor.execute(
                f"SELECT id, username, email, password, created_at FROM {self.table} WHERE email = %s",
                (email,)
            )
            row = cursor.fetchone()
            if not row:
                return None
                
            return User(
                id=row[0],
                username=row[1],
                email=row[2],
                password=row[3],
                created_at=row[4]
            )
        except Exception as e:
            raise DatabaseError(f"Failed to get user: {str(e)}") 