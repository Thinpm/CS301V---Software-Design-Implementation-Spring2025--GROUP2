from typing import Optional, Dict
from datetime import datetime
import logging
from backend.dao.users.user_dao import UserDAO
from backend.dao.users.user_class import User
from backend.utils.exceptions import ValidationError
from backend.business_layer.interfaces.user_service_interface import IUserService

logger = logging.getLogger(__name__)

class UserService(IUserService):
    """Implementation of User Service"""
    
    def __init__(self, user_dao: UserDAO):
        self.user_dao = user_dao
        
    def register(self, username: str, password: str, email: str) -> Optional[User]:
        """Register a new user"""
        # Check if username already exists
        if self.user_dao.get_by_username(username):
            return None
            
        # Create new user
        user = User(
            id=None,
            username=username,
            password=password,  # Password will be hashed in User class
            email=email,
            created_at=datetime.now()
        )
        
        # Validate user data
        if not user.validate():
            return None
            
        # Save to database
        return self.user_dao.create(user)
        
    def login(self, username: str, password: str) -> Optional[Dict]:
        """Login user and return user data"""
        try:
            # Get user by username
            user = self.user_dao.get_by_username(username)
            if not user:
                logger.warning(f"Login failed: User {username} not found")
                return None
                
            # Verify password
            if not user.verify_password(password):
                logger.warning(f"Login failed: Invalid password for user {username}")
                return None
                
            logger.info(f"User {username} logged in successfully")
            return {
                'message': 'Login successful',
                'user': user.to_dict()
            }
        except Exception as e:
            logger.error(f"Error during login for user {username}: {str(e)}")
            raise
        
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.user_dao.get_by_id(user_id)
        
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.user_dao.get_by_username(username)
        
    def update_user(self, user_id: int, username: str, email: str) -> bool:
        """Update user information"""
        user = self.user_dao.get_by_id(user_id)
        if not user:
            return False
            
        # Check if new username is already taken
        existing_user = self.user_dao.get_by_username(username)
        if existing_user and existing_user.id != user_id:
            return False
            
        # Update user
        user.username = username
        user.email = email
        
        return self.user_dao.update(user)
        
    def change_password(self, user_id: int, old_password: str, new_password: str) -> bool:
        """Change user password"""
        user = self.user_dao.get_by_id(user_id)
        if not user:
            return False
            
        # Verify old password
        if not user.verify_password(old_password):
            return False
            
        # Update password
        user.password = new_password
        return self.user_dao.update(user) 