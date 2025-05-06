from typing import Dict, List
from datetime import datetime
from .leaderboard_entity import LeaderboardEntity

class Leaderboard:
    """Leaderboard class with behavior and business logic"""
    
    def __init__(self, user_id: int, topic_id: int, total_score: int, 
                 tests_completed: int, average_score: float, 
                 last_updated: datetime, rank: int = None, username: str = None):
        self.user_id = user_id
        self.topic_id = topic_id
        self.total_score = total_score
        self.tests_completed = tests_completed
        self.average_score = average_score
        self.last_updated = last_updated
        self.rank = rank
        self.username = username
        
    @classmethod
    def from_entity(cls, entity: LeaderboardEntity) -> 'Leaderboard':
        """Create Leaderboard instance from LeaderboardEntity"""
        username = getattr(entity, 'username', None)
        return cls(
            user_id=entity.user_id,
            topic_id=entity.topic_id,
            total_score=entity.total_score,
            tests_completed=entity.tests_completed,
            average_score=entity.average_score,
            last_updated=entity.last_updated,
            rank=None,  # Rank is calculated separately
            username=username
        )
        
    def to_entity(self) -> LeaderboardEntity:
        """Convert to LeaderboardEntity"""
        return LeaderboardEntity(
            id=None,  # ID is assigned by database
            user_id=self.user_id,
            topic_id=self.topic_id,
            total_score=self.total_score,
            tests_completed=self.tests_completed,
            average_score=self.average_score,
            last_updated=self.last_updated
        )
        
    def validate(self) -> bool:
        """Validate leaderboard data"""
        return bool(
            self.user_id > 0 and
            self.topic_id > 0 and
            self.total_score >= 0 and
            self.tests_completed > 0 and
            self.average_score >= 0
        )
        
    def to_dict(self) -> Dict:
        """Convert to dictionary (for API responses)"""
        return {
            'user_id': self.user_id,
            'topic_id': self.topic_id,
            'total_score': self.total_score,
            'tests_completed': self.tests_completed,
            'average_score': self.average_score,
            'last_updated': self.last_updated.strftime('%Y-%m-%d %H:%M:%S') if self.last_updated else None,
            'rank': self.rank,
            'username': self.username
        }
        
    @staticmethod
    def calculate_percentile(rank: int, total_users: int) -> float:
        """Calculate percentile rank"""
        if total_users == 0:
            return 0.0
        return ((total_users - rank) / total_users) * 100
        
    @staticmethod
    def get_rank_label(rank: int) -> str:
        """Get rank label (e.g., 1st, 2nd, 3rd)"""
        if rank % 100 in [11, 12, 13]:
            return f"{rank}th"
        elif rank % 10 == 1:
            return f"{rank}st"
        elif rank % 10 == 2:
            return f"{rank}nd"
        elif rank % 10 == 3:
            return f"{rank}rd"
        else:
            return f"{rank}th"
            
    @staticmethod
    def get_medal(rank: int) -> str:
        """Get medal based on rank"""
        if rank == 1:
            return "🥇"
        elif rank == 2:
            return "🥈"
        elif rank == 3:
            return "🥉"
        return "" 