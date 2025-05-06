from typing import List, Optional, Dict
from backend.dao.leaderboards.leaderboard_dao import LeaderboardDAO
from backend.business_layer.interfaces.leaderboard_service_interface import ILeaderboardService
from backend.dao.leaderboards.leaderboard_class import Leaderboard
import logging

logger = logging.getLogger(__name__)

class LeaderboardService(ILeaderboardService):
    """Implementation of Leaderboard Service"""
    
    def __init__(self, leaderboard_dao: LeaderboardDAO):
        self.leaderboard_dao = leaderboard_dao
        
    def get_topic_leaderboard(self, topic_id: int) -> List[Leaderboard]:
        """Get leaderboard for a specific topic"""
        entities = self.leaderboard_dao.get_entries_by_topic(topic_id)
        return [Leaderboard.from_entity(entity) for entity in entities]
        
    def update_user_score(self, user_id: int, topic_id: int, score: int) -> bool:
        """Update user's score in leaderboard"""
        try:
            # Get existing entry
            entity = self.leaderboard_dao.get_entry_by_user_and_topic(user_id, topic_id)
            
            if entity:
                # Update existing entry
                return self.leaderboard_dao.update_score(entity.id, score)
            else:
                # Create new entry
                entity = self.leaderboard_dao.create_entry(
                    user_id=user_id,
                    topic_id=topic_id,
                    score=score
                )
                return entity is not None
        except Exception as e:
            logger.error(f"Error updating user score: {str(e)}")
            return False
        
    def get_user_rank(self, user_id: int, topic_id: int) -> Optional[int]:
        """Get user's rank in topic leaderboard"""
        return self.leaderboard_dao.get_user_rank(user_id, topic_id)
        
    def get_top_users(self, topic_id: int, limit: int = 10) -> List[Leaderboard]:
        """Get top users in topic leaderboard"""
        entries = self.leaderboard_dao.get_top_scores(topic_id, limit)
        return [Leaderboard(
            user_id=entry['user_id'],
            topic_id=topic_id,
            total_score=entry['total_score'],
            tests_completed=entry['tests_completed'],
            average_score=entry['average_score'],
            last_updated=entry['last_updated'],
            rank=entry['rank']
        ) for entry in entries]
        
    def get_user_statistics(self, user_id: int) -> Dict:
        """Get user's leaderboard statistics across all topics"""
        # Get all user's entries
        entries = self.leaderboard_dao.get_entries_by_user(user_id)
        
        if not entries:
            return {
                'topics': [],
                'total_topics_participated': 0,
                'best_rank': None,
                'total_tests_completed': 0,
                'average_score_overall': 0
            }
            
        # Process statistics for each topic
        topic_stats = []
        total_tests = 0
        total_score = 0
        best_rank = float('inf')
        
        for entry in entries:
            rank = self.get_user_rank(user_id, entry.topic_id)
            total_participants = len(self.get_topic_leaderboard(entry.topic_id))
            
            topic_stat = {
                'topic_id': entry.topic_id,
                'total_score': entry.total_score,
                'tests_completed': entry.tests_completed,
                'average_score': entry.average_score,
                'rank': rank,
                'total_participants': total_participants,
                'percentile': Leaderboard.calculate_percentile(rank, total_participants) if rank else 0
            }
            topic_stats.append(topic_stat)
            
            # Update aggregates
            total_tests += entry.tests_completed
            total_score += entry.total_score
            if rank and rank < best_rank:
                best_rank = rank
        
        return {
            'topics': topic_stats,
            'total_topics_participated': len(entries),
            'best_rank': best_rank if best_rank != float('inf') else None,
            'total_tests_completed': total_tests,
            'average_score_overall': total_score / total_tests if total_tests > 0 else 0
        }
        
    def get_topic_statistics(self, topic_id: int) -> Dict:
        """Get topic's leaderboard statistics"""
        entries = self.leaderboard_dao.get_top_scores(topic_id)
        if not entries:
            return {
                'total_participants': 0,
                'average_score': 0,
                'highest_score': 0,
                'total_tests': 0,
                'score_distribution': {
                    'excellent': 0,  # > 90%
                    'good': 0,       # 70-90%
                    'average': 0,    # 50-70%
                    'below_average': 0  # < 50%
                },
                'top_performers': []
            }
            
        total_participants = len(entries)
        total_tests = sum(entry['tests_completed'] for entry in entries)
        total_score = sum(entry['average_score'] for entry in entries)
        average_score = total_score / total_participants
        
        # Calculate score distribution
        score_distribution = {
            'excellent': 0,
            'good': 0,
            'average': 0,
            'below_average': 0
        }
        
        for entry in entries:
            score = entry['average_score']
            if score >= 90:
                score_distribution['excellent'] += 1
            elif score >= 70:
                score_distribution['good'] += 1
            elif score >= 50:
                score_distribution['average'] += 1
            else:
                score_distribution['below_average'] += 1
        
        # Get top 5 performers with detailed info
        top_performers = [{
            'rank': entry['rank'],
            'user_id': entry['user_id'],
            'username': entry['username'],
            'total_score': entry['total_score'],
            'tests_completed': entry['tests_completed'],
            'average_score': entry['average_score'],
            'last_updated': entry['last_updated'].strftime('%Y-%m-%d %H:%M:%S') if entry['last_updated'] else None
        } for entry in entries[:5]]
        
        return {
            'total_participants': total_participants,
            'total_tests': total_tests,
            'average_score': average_score,
            'highest_score': entries[0]['average_score'] if entries else 0,
            'score_distribution': score_distribution,
            'top_performers': top_performers
        } 