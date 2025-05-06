from abc import ABC, abstractmethod
from typing import List, Optional
from backend.dao.vocabulary_topics.vocabulary_topic_class import VocabularyTopic

class IVocabularyTopicService(ABC):
    """Interface for VocabularyTopic Service"""
    
    @abstractmethod
    def get_all_topics(self) -> List[VocabularyTopic]:
        """Get all topics"""
        pass
        
    @abstractmethod
    def get_topic_by_id(self, topic_id: int) -> Optional[VocabularyTopic]:
        """Get topic by ID"""
        pass
        
    @abstractmethod
    def create_topic(self, name: str, description: str) -> Optional[VocabularyTopic]:
        """Create a new topic"""
        pass
        
    @abstractmethod
    def update_topic(self, topic_id: int, name: str, description: str) -> bool:
        """Update an existing topic"""
        pass
        
    @abstractmethod
    def delete_topic(self, topic_id: int) -> bool:
        """Delete a topic"""
        pass
        
    @abstractmethod
    def get_topics_by_user(self, user_id: int) -> List[VocabularyTopic]:
        """Get topics created by a user"""
        pass 