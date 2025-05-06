from typing import List, Optional
from backend.dao.vocabularies.vocabulary_dao import VocabularyDAO
from backend.business_layer.interfaces.vocabulary_service_interface import IVocabularyService
from backend.dao.vocabularies.vocabulary_entity import VocabularyEntity

class VocabularyService(IVocabularyService):
    """Implementation of Vocabulary Service"""
    
    def __init__(self, vocabulary_dao: VocabularyDAO):
        self.vocabulary_dao = vocabulary_dao
        
    def get_vocabularies_by_topic(self, topic_id: int) -> List[VocabularyEntity]:
        """Get all vocabularies in a topic"""
        return self.vocabulary_dao.get_vocabularies_by_topic(topic_id)
        
    def get_vocabulary_by_id(self, vocabulary_id: int) -> Optional[VocabularyEntity]:
        """Get vocabulary by ID"""
        return self.vocabulary_dao.get_vocabulary_by_id(vocabulary_id)
        
    def create_vocabulary(self, topic_id: int, word: str, meaning: str, phonetic: str) -> Optional[VocabularyEntity]:
        """Create a new vocabulary"""
        return self.vocabulary_dao.create_vocabulary(topic_id, word, meaning, phonetic)
        
    def update_vocabulary(self, vocabulary_id: int, word: str, meaning: str, phonetic: str) -> bool:
        """Update an existing vocabulary"""
        return self.vocabulary_dao.update_vocabulary(vocabulary_id, word, meaning, phonetic)
        
    def delete_vocabulary(self, vocabulary_id: int) -> bool:
        """Delete a vocabulary"""
        return self.vocabulary_dao.delete_vocabulary(vocabulary_id)
        
    def search_vocabularies(self, keyword: str) -> List[VocabularyEntity]:
        """Search vocabularies by keyword"""
        return self.vocabulary_dao.search_vocabularies(keyword) 