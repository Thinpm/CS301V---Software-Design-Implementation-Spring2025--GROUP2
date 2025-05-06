from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import datetime

@dataclass
class VocabularyEntity:
    """Entity representing a vocabulary record in database"""
    id: int
    topic_id: int
    word: str
    meaning: str
    phonetic: Optional[str] = None
    created_at: Optional[str] = None
    
    @staticmethod
    def from_db_tuple(db_tuple: tuple) -> 'VocabularyEntity':
        """Create entity from database tuple"""
        return VocabularyEntity(
            id=db_tuple[0],
            topic_id=db_tuple[1],
            word=db_tuple[2],
            meaning=db_tuple[3],
            phonetic=db_tuple[4] if len(db_tuple) > 4 else None,
            created_at=db_tuple[5].strftime('%Y-%m-%d %H:%M:%S') if len(db_tuple) > 5 and db_tuple[5] else None
        )
        
    def to_db_tuple(self) -> tuple:
        """Convert to database tuple for insertion/update"""
        return (
            self.topic_id,
            self.word,
            self.meaning,
            self.phonetic
        )
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON response"""
        return {
            'id': self.id,
            'topic_id': self.topic_id,
            'word': self.word,
            'meaning': self.meaning,
            'phonetic': self.phonetic,
            'created_at': self.created_at
        } 