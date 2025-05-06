from datetime import datetime
from typing import Optional, Dict
import bcrypt
import logging
from .user_entity import UserEntity

logger = logging.getLogger(__name__)

class User:
    """User class with behavior and business logic"""
    
    def __init__(self, id: Optional[int], username: str, email: str, password: str, created_at: Optional[datetime] = None):
        self.id = id
        self.username = username
        self.email = email
        self._password = self._hash_password(password) if not password.startswith('$2a$') and not password.startswith('$2b$') else password
        self.created_at = created_at or datetime.now()
        
    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        try:
            logger.debug(f"Hashing password for user")
            salt = bcrypt.gensalt(rounds=10, prefix=b'2a')
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            logger.debug(f"Password hashed successfully")
            return hashed.decode('utf-8')
        except Exception as e:
            logger.error(f"Error hashing password: {str(e)}")
            raise
        
    def verify_password(self, password: str) -> bool:
        """Verify password"""
        try:
            logger.debug(f"Verifying password for user {self.username}")
            logger.debug(f"Stored password hash: {self._password}")
            logger.debug(f"Input password: {password}")
            
            # Convert stored hash and input password to bytes for bcrypt
            stored_hash = self._password.encode('utf-8')
            input_password = password.encode('utf-8')
            
            # Use bcrypt to verify the password
            result = bcrypt.checkpw(input_password, stored_hash)
            logger.debug(f"Password verification result: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error verifying password for user {self.username}: {str(e)}")
            return False
        
    def validate(self) -> bool:
        """
        Validate user data
        
        Returns:
            True if valid, False otherwise
        """
        if not self.username or len(self.username) > 255:
            return False
            
        if not self.email or len(self.email) > 255 or '@' not in self.email:
            return False
            
        if not self._password or len(self._password) > 255:
            return False
            
        return True
        
    @property
    def password(self) -> str:
        """Get hashed password"""
        return self._password
        
    @password.setter
    def password(self, value: str):
        """Set and hash password"""
        self._password = self._hash_password(value)
        
    def to_dict(self) -> Dict:
        """
        Convert user to dictionary for API responses
        
        Returns:
            Dictionary representation of user
        """
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

    def to_entity(self) -> UserEntity:
        """
        Convert to UserEntity
        
        Returns:
            UserEntity object
        """
        return UserEntity(
            id=self.id,
            username=self.username,
            email=self.email,
            password=self._password,
            created_at=self.created_at
        )
        
    @classmethod
    def from_entity(cls, entity: UserEntity) -> 'User':
        """
        Create User from UserEntity
        
        Args:
            entity: UserEntity object
            
        Returns:
            User object
        """
        return cls(
            id=entity.id,
            username=entity.username,
            email=entity.email,
            password=entity.password,
            created_at=entity.created_at
        )

    def update_email(self, new_email: str) -> None:
        """Update user email"""
        if '@' not in new_email:
            raise ValueError("Invalid email format")
        self.email = new_email
        
    def check_password(self, password: str) -> bool:
        """Check if password matches"""
        # In real application, use proper password hashing
        return self._password == password
        
    def update_password(self, new_password: str) -> None:
        """Update user password"""
        self.password = new_password
        
    def to_dict(self) -> dict:
        """Convert to dictionary (for API responses)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        } 