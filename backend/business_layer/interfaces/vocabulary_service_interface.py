from abc import ABC, abstractmethod
from typing import List, Optional
from backend.dao.vocabularies.vocabulary_entity import VocabularyEntity

class IVocabularyService(ABC):
    """Interface for Vocabulary Service"""
    
    @abstractmethod
    def get_vocabularies_by_topic(self, topic_id: int) -> List[VocabularyEntity]:
        """Get all vocabularies in a topic"""
        pass
        
    @abstractmethod
    def get_vocabulary_by_id(self, vocabulary_id: int) -> Optional[VocabularyEntity]:
        """Get vocabulary by ID"""
        pass
        
    @abstractmethod
    def create_vocabulary(self, topic_id: int, word: str, meaning: str, 
                         phonetic: str) -> Optional[VocabularyEntity]:
        """Create a new vocabulary"""
        pass
        
    @abstractmethod
    def update_vocabulary(self, vocabulary_id: int, word: str, meaning: str,
                         phonetic: str) -> bool:
        """Update an existing vocabulary"""
        pass
        
    @abstractmethod
    def delete_vocabulary(self, vocabulary_id: int) -> bool:
        """Delete a vocabulary"""
        pass
        
    @abstractmethod
    def search_vocabularies(self, keyword: str) -> List[VocabularyEntity]:
        """Search vocabularies by keyword"""
        pass 