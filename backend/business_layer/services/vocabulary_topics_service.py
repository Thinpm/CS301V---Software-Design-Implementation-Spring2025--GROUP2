from typing import List, Optional
from backend.dao.vocabulary_topics.vocabulary_topic_dao import VocabularyTopicDAO
from backend.business_layer.interfaces.vocabulary_topics_service_interface import IVocabularyTopicService
from backend.dao.vocabulary_topics.vocabulary_topic_class import VocabularyTopic

class VocabularyTopicService(IVocabularyTopicService):
    """Implementation of VocabularyTopic Service"""
    
    def __init__(self, topic_dao: VocabularyTopicDAO):
        self.topic_dao = topic_dao
        
    def get_all_topics(self) -> List[VocabularyTopic]:
        """Get all topics"""
        entities = self.topic_dao.get_all()
        return [VocabularyTopic.from_entity(entity) for entity in entities]
        
    def get_topic_by_id(self, topic_id: int) -> Optional[VocabularyTopic]:
        """Get topic by ID"""
        entity = self.topic_dao.get_by_id(topic_id)
        return VocabularyTopic.from_entity(entity) if entity else None
        
    def create_topic(self, name: str, description: str) -> Optional[VocabularyTopic]:
        """Create a new topic"""
        # Create topic in database
        topic_id = self.topic_dao.create(name, description)
        if not topic_id:
            return None
            
        # Return the created topic
        return self.get_topic_by_id(topic_id)
        
    def update_topic(self, topic_id: int, name: str, description: str) -> bool:
        """Update an existing topic"""
        # Get topic
        topic = self.topic_dao.get_by_id(topic_id)
        if not topic:
            return False
            
        # Update topic
        return self.topic_dao.update(topic_id, name, description)
        
    def delete_topic(self, topic_id: int) -> bool:
        """Delete a topic"""
        # Get topic
        topic = self.topic_dao.get_by_id(topic_id)
        if not topic:
            return False
            
        # Delete topic
        return self.topic_dao.delete(topic_id)
        
    def get_topics_by_user(self, user_id: int) -> List[VocabularyTopic]:
        """Get topics created by a user"""
        # Note: Currently not supported as we don't track topic creators
        return [] 