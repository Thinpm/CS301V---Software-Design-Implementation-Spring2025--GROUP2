from typing import List, Optional, Dict
import logging
from backend.dao.test_results.test_result_dao import TestResultDAO
from backend.business_layer.interfaces.test_result_service_interface import ITestResultService
from backend.dao.test_results.test_result_class import TestResult

logger = logging.getLogger(__name__)

class TestResultService(ITestResultService):
    """Implementation of Test Result Service"""
    
    def __init__(self, test_result_dao: TestResultDAO, leaderboard_service=None):
        """
        Initialize the TestResultService.

        Args:
            test_result_dao (TestResultDAO): The DAO for test results
            leaderboard_service: Optional service for updating leaderboards
        """
        self.test_result_dao = test_result_dao
        self.leaderboard_service = leaderboard_service
        
    def get_user_results(self, user_id: int) -> List[TestResult]:
        """Get all test results for a user"""
        entities = self.test_result_dao.get_by_user(user_id)
        return [TestResult.from_entity(entity) for entity in entities]
        
    def get_topic_results(self, topic_id: int) -> List[TestResult]:
        """Get all test results for a topic"""
        entities = self.test_result_dao.get_by_topic(topic_id)
        return [TestResult.from_entity(entity) for entity in entities]
        
    def get_user_topic_results(self, user_id: int, topic_id: int) -> List[TestResult]:
        """Get all test results for a user in a specific topic"""
        entities = self.test_result_dao.get_by_user_and_topic(user_id, topic_id)
        return [TestResult.from_entity(entity) for entity in entities]
        
    def save_result(self, user_id: int, topic_id: int, score: int,
                     total_questions: int, completion_time: int) -> Optional[TestResult]:
        """
        Save a test result to the database.

        Args:
            user_id (int): The ID of the user who took the test
            topic_id (int): The ID of the topic the test was on
            score (int): The score achieved on the test
            total_questions (int): The total number of questions in the test (used for score calculation)
            completion_time (int): The time taken to complete the test in seconds

        Returns:
            Optional[TestResult]: The created test result entity, or None if creation failed
        """
        try:
            # Calculate percentage score
            percentage_score = int((score / total_questions) * 100) if total_questions > 0 else 0
            
            result = self.test_result_dao.create(
                user_id=user_id,
                topic_id=topic_id,
                score=percentage_score,
                completion_time=completion_time
            )
            if result and self.leaderboard_service:
                self.leaderboard_service.update_user_score(user_id, topic_id, percentage_score)
            return TestResult.from_entity(result) if result else None
        except Exception as e:
            logger.error(f"Error saving test result: {str(e)}")
            return None
        
    def get_user_statistics(self, user_id: int) -> Dict:
        """Get user's test statistics"""
        results = self.get_user_results(user_id)
        if not results:
            return {
                'total_tests': 0,
                'average_score': 0,
                'total_correct_answers': 0,
                'average_completion_time': 0
            }
            
        total_tests = len(results)
        total_score = sum(result.score for result in results)
        total_completion_time = sum(result.completion_time for result in results)
        
        return {
            'total_tests': total_tests,
            'average_score': total_score / total_tests if total_tests > 0 else 0,
            'total_correct_answers': total_score,
            'average_completion_time': total_completion_time / total_tests if total_tests > 0 else 0
        }
        
    def get_topic_statistics(self, topic_id: int) -> Dict:
        """Get topic's test statistics"""
        results = self.get_topic_results(topic_id)
        if not results:
            return {
                'total_tests': 0,
                'average_score': 0,
                'total_correct_answers': 0,
                'average_completion_time': 0
            }
            
        total_tests = len(results)
        total_score = sum(result.score for result in results)
        total_completion_time = sum(result.completion_time for result in results)
        
        return {
            'total_tests': total_tests,
            'average_score': total_score / total_tests if total_tests > 0 else 0,
            'total_correct_answers': total_score,
            'average_completion_time': total_completion_time / total_tests if total_tests > 0 else 0
        } 