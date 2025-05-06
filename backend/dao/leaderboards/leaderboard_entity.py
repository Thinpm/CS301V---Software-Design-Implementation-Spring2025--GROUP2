from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class LeaderboardEntity:
    """Entity representing a leaderboard entry in the database"""
    id: Optional[int]
    user_id: int
    topic_id: int
    total_score: int
    tests_completed: int
    average_score: float
    last_updated: datetime
    
    @staticmethod
    def from_db_row(row: tuple) -> 'LeaderboardEntity':
        """Create LeaderboardEntity from database row"""
        return LeaderboardEntity(
            id=row[0],
            user_id=row[1],
            topic_id=row[2],
            total_score=row[3],
            tests_completed=row[4],
            average_score=row[5],
            last_updated=row[6]
        )
        
    def to_db_tuple(self) -> tuple:
        """Convert to database tuple for insertion/update"""
        return (
            self.user_id,
            self.topic_id,
            self.total_score,
            self.tests_completed,
            self.average_score,
            self.last_updated
        ) 