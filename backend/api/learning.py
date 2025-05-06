from flask import Blueprint, request, jsonify, session
from backend.business_layer.services.user_service import UserService
from backend.business_layer.services.vocabulary_topics_service import VocabularyTopicService
from backend.business_layer.services.vocabulary_service import VocabularyService
from backend.business_layer.services.test_service import TestService
from backend.business_layer.services.test_result_service import TestResultService
from backend.business_layer.services.leaderboard_service import LeaderboardService
from backend.dao.users.user_dao import UserDAO
from backend.dao.vocabularies.vocabulary_dao import VocabularyDAO
from backend.dao.tests.test_dao import TestDAO
from backend.dao.test_results.test_result_dao import TestResultDAO
from backend.dao.leaderboards.leaderboard_dao import LeaderboardDAO
from backend.dao.vocabulary_topics.vocabulary_topic_dao import VocabularyTopicDAO
from backend.utils.exceptions import (
    ValidationError, AuthenticationError, AuthorizationError,
    ResourceNotFoundError, DatabaseError, ServiceError
)
from backend.utils.validation import (
    validate_required_fields, validate_string_length,
    validate_email, validate_password, validate_integer,
    validate_integer_range, validate_float_range
)
from backend.utils.logger import setup_logger
from backend.api.auth import login_required

# Setup logger
logger = setup_logger(__name__)

learning_bp = Blueprint('learning', __name__)

# Error handlers
@learning_bp.errorhandler(ValidationError)
def handle_validation_error(error):
    logger.warning(f"Validation error: {str(error)}")
    return jsonify({'error': str(error)}), 400

@learning_bp.errorhandler(AuthenticationError)
def handle_authentication_error(error):
    logger.warning(f"Authentication error: {str(error)}")
    return jsonify({'error': str(error)}), 401

@learning_bp.errorhandler(AuthorizationError)
def handle_authorization_error(error):
    logger.warning(f"Authorization error: {str(error)}")
    return jsonify({'error': str(error)}), 403

@learning_bp.errorhandler(ResourceNotFoundError)
def handle_not_found_error(error):
    logger.warning(f"Resource not found: {str(error)}")
    return jsonify({'error': str(error)}), 404

@learning_bp.errorhandler(DatabaseError)
def handle_database_error(error):
    logger.error(f"Database error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

@learning_bp.errorhandler(ServiceError)
def handle_service_error(error):
    logger.error(f"Service error: {str(error)}")
    return jsonify({'error': str(error)}), 500

@learning_bp.errorhandler(Exception)
def handle_generic_error(error):
    logger.error(f"Unexpected error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

# User APIs
@learning_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            raise ValidationError("No data provided")

        # Validate required fields
        errors = validate_required_fields(data, ['username', 'password', 'email'])
        if errors:
            raise ValidationError(errors[0])
        
        username = data['username']
        password = data['password']
        email = data['email']
        
        # Validate field formats
        username_error = validate_string_length(username, 'username', min_length=3)
        if username_error:
            raise ValidationError(username_error)
            
        password_error = validate_password(password)
        if password_error:
            raise ValidationError(password_error)
            
        email_error = validate_email(email)
        if email_error:
            raise ValidationError(email_error)
        
        # Initialize services
        user_dao = UserDAO()
        user_service = UserService(user_dao)
        
        # Try to register
        user = user_service.register(username, password, email)
        if not user:
            raise ServiceError('Username already exists')
            
        logger.info(f"User registered successfully: {username}")
        return jsonify(user.to_dict()), 201
        
    except ValidationError as e:
        logger.warning(f"Registration validation failed: {str(e)}")
        raise
    except ServiceError as e:
        logger.error(f"Registration service error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Registration failed with unexpected error: {str(e)}")
        raise

@learning_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        validate_required_fields(data, ['username', 'password'])
        
        username = data['username']
        password = data['password']
        
        user_dao = UserDAO()
        user_service = UserService(user_dao)
        result = user_service.login(username, password)
        
        if not result:
            raise AuthenticationError('Invalid credentials')
            
        logger.info(f"User logged in successfully: {username}")
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise

# Topic APIs
@learning_bp.route('/topics', methods=['GET'])
@login_required
def get_topics():
    try:
        topic_service = VocabularyTopicService(VocabularyTopicDAO())
        topics = topic_service.get_all_topics()
        return jsonify([topic.to_dict() for topic in topics]), 200
    except Exception as e:
        logger.error(f"Failed to get topics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@learning_bp.route('/topics/<int:topic_id>', methods=['GET'])
@login_required
def get_topic(topic_id):
    try:
        topic_service = VocabularyTopicService(VocabularyTopicDAO())
        topic = topic_service.get_topic_by_id(topic_id)
        
        if not topic:
            return jsonify({'error': 'Topic not found'}), 404
            
        return jsonify(topic.to_dict()), 200
    except Exception as e:
        logger.error(f"Failed to get topic: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Vocabulary APIs
@learning_bp.route('/topics/<int:topic_id>/vocabularies', methods=['GET'])
@login_required
def get_vocabularies(topic_id):
    try:
        validate_integer(topic_id, 'topic_id', min_value=1)
        vocabulary_dao = VocabularyDAO()
        vocabulary_service = VocabularyService(vocabulary_dao)
        vocabularies = vocabulary_service.get_vocabularies_by_topic(topic_id)
        return jsonify([vocabulary.to_dict() for vocabulary in vocabularies]), 200
    except Exception as e:
        logger.error(f"Failed to get vocabularies: {str(e)}")
        raise

@learning_bp.route('/vocabularies/<int:vocabulary_id>', methods=['GET'])
@login_required
def get_vocabulary(vocabulary_id):
    try:
        vocabulary_dao = VocabularyDAO()
        vocabulary_service = VocabularyService(vocabulary_dao)
        vocabulary = vocabulary_service.get_vocabulary_by_id(vocabulary_id)
        
        if not vocabulary:
            return jsonify({'error': 'Vocabulary not found'}), 404
            
        return jsonify(vocabulary.to_dict()), 200
    except Exception as e:
        logger.error(f"Failed to get vocabulary: {str(e)}")
        raise

# Test APIs
@learning_bp.route('/topics/<int:topic_id>/tests', methods=['GET'])
@login_required
def get_tests(topic_id):
    try:
        # Validate user is logged in - Sử dụng request.user_id từ decorator login_required
        user_id = request.user_id
        if not user_id:
            raise AuthenticationError('Authentication required')
            
        # Validate topic_id
        validate_integer(topic_id, 'topic_id', min_value=1)
        
        # Log để debug
        logger.info(f"Fetching tests for topic {topic_id}, user_id: {user_id}")
        
        # Initialize services
        test_dao = TestDAO()
        test_result_dao = TestResultDAO()
        test_result_service = TestResultService(test_result_dao)
        leaderboard_dao = LeaderboardDAO()
        leaderboard_service = LeaderboardService(leaderboard_dao)
        test_service = TestService(test_dao, test_result_service, leaderboard_service)
        
        # Get tests
        tests = test_service.get_tests_by_topic(topic_id)
        
        # Log the result
        logger.info(f"Found {len(tests)} tests for topic {topic_id}")
        
        # Return response
        return jsonify([test.to_dict() for test in tests]), 200
    except ValidationError as e:
        logger.warning(f"Validation error in get_tests: {str(e)}")
        raise
    except AuthenticationError as e:
        logger.warning(f"Authentication error in get_tests: {str(e)}")
        raise
    except DatabaseError as e:
        logger.error(f"Database error in get_tests: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_tests: {str(e)}")
        raise

@learning_bp.route('/tests/<int:test_id>', methods=['GET'])
@login_required
def get_test(test_id):
    try:
        # Validate user is logged in - Sử dụng request.user_id từ decorator login_required
        user_id = request.user_id
        if not user_id:
            raise AuthenticationError('Authentication required')
            
        # Validate test_id
        validate_integer(test_id, 'test_id', min_value=1)
        
        # Log để debug
        logger.info(f"Fetching test {test_id}, user_id: {user_id}")
        
        # Initialize services
        test_dao = TestDAO()
        test_result_dao = TestResultDAO()
        test_result_service = TestResultService(test_result_dao)
        leaderboard_dao = LeaderboardDAO()
        leaderboard_service = LeaderboardService(leaderboard_dao)
        test_service = TestService(test_dao, test_result_service, leaderboard_service)
        
        # Get test
        test = test_service.get_test_by_id(test_id)
        
        if not test:
            raise ResourceNotFoundError(f'Test with id {test_id} not found')
            
        # Log the result
        logger.info(f"Found test {test_id}")
            
        # Return response
        return jsonify(test.to_dict()), 200
    except ValidationError as e:
        logger.warning(f"Validation error in get_test: {str(e)}")
        raise
    except AuthenticationError as e:
        logger.warning(f"Authentication error in get_test: {str(e)}")
        raise
    except ResourceNotFoundError as e:
        logger.warning(f"Test not found: {str(e)}")
        raise
    except DatabaseError as e:
        logger.error(f"Database error in get_test: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_test: {str(e)}")
        raise

@learning_bp.route('/topics/<int:topic_id>/tests/', methods=['POST'])
@learning_bp.route('/topics/<int:topic_id>/tests', methods=['POST'])
@login_required
def submit_test(topic_id):
    try:
        # Validate user is logged in - Sử dụng request.user_id từ decorator login_required
        user_id = request.user_id
        if not user_id:
            raise AuthenticationError('Authentication required')
            
        # Log để debug
        logger.info(f"Submitting test for topic {topic_id}, user_id: {user_id}")
            
        # Get and validate request data
        data = request.get_json()
        if not data:
            raise ValidationError('No data provided')
            
        # Validate required fields
        required_fields = ['answers', 'completion_time']
        errors = validate_required_fields(data, required_fields)
        if errors:
            raise ValidationError(errors[0])
            
        answers = data['answers']
        completion_time = data['completion_time']
        
        # Log request data để debug
        logger.info(f"Test submission data: answers={answers}, completion_time={completion_time}")
        
        # Validate field types and values
        if not isinstance(answers, dict):
            raise ValidationError('Answers must be a dictionary of test_id: answer')
        for test_id, answer in answers.items():
            try:
                test_id = int(test_id)
                if test_id <= 0:
                    raise ValueError
            except (ValueError, TypeError):
                raise ValidationError(f'Invalid test_id: {test_id}')
            if not isinstance(answer, str):
                raise ValidationError(f'Answer for test {test_id} must be a string')
                
        validate_integer(completion_time, 'completion_time', min_value=0)
        
        # Convert string test_ids to integers
        answers = {int(k): v for k, v in answers.items()}
        
        # Initialize services
        test_dao = TestDAO()
        test_result_dao = TestResultDAO()
        test_result_service = TestResultService(test_result_dao)
        leaderboard_dao = LeaderboardDAO()
        leaderboard_service = LeaderboardService(leaderboard_dao)
        test_service = TestService(test_dao, test_result_service, leaderboard_service)
        
        # Submit test
        result = test_service.submit_test_result(
            user_id=user_id,
            topic_id=topic_id,
            answers=answers,
            completion_time=completion_time
        )
        
        # Log kết quả
        logger.info(f"Test submission result: {result}")
        
        # Return response with detailed information
        response = {
            'success': True,
            'message': 'Test submitted successfully',
            'result': result
        }
        return jsonify(response), 200
        
    except ValidationError as e:
        logger.warning(f"Validation error in submit_test: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except AuthenticationError as e:
        logger.warning(f"Authentication error in submit_test: {str(e)}")
        return jsonify({'error': str(e)}), 401
    except ResourceNotFoundError as e:
        logger.warning(f"Resource not found in submit_test: {str(e)}")
        return jsonify({'error': str(e)}), 404
    except DatabaseError as e:
        logger.error(f"Database error in submit_test: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in submit_test: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Test Result APIs
@learning_bp.route('/user/results', methods=['GET'])
@login_required
def get_user_results():
    user_id = request.user_id
    logger.info(f"Fetching results for user {user_id}")
    test_result_dao = TestResultDAO()
    test_result_service = TestResultService(test_result_dao)
    results = test_result_service.get_user_results(user_id)
    logger.info(f"Found {len(results)} results for user {user_id}")
    return jsonify([result.to_dict() for result in results]), 200

@learning_bp.route('/topics/<int:topic_id>/results', methods=['GET'])
@login_required
def get_topic_results(topic_id):
    test_result_dao = TestResultDAO()
    test_result_service = TestResultService(test_result_dao)
    results = test_result_service.get_topic_results(topic_id)
    return jsonify([result.to_dict() for result in results]), 200

@learning_bp.route('/user/topics/<int:topic_id>/results', methods=['GET'])
@login_required
def get_user_topic_results(topic_id):
    user_id = request.user_id
    logger.info(f"Fetching results for user {user_id} and topic {topic_id}")
    test_result_dao = TestResultDAO()
    test_result_service = TestResultService(test_result_dao)
    results = test_result_service.get_user_topic_results(user_id, topic_id)
    logger.info(f"Found {len(results)} results for user {user_id} and topic {topic_id}")
    return jsonify([result.to_dict() for result in results]), 200

# Leaderboard APIs
@learning_bp.route('/topics/<int:topic_id>/leaderboard', methods=['GET'])
@login_required
def get_topic_leaderboard(topic_id):
    leaderboard_dao = LeaderboardDAO()
    leaderboard_service = LeaderboardService(leaderboard_dao)
    leaderboard = leaderboard_service.get_topic_leaderboard(topic_id)
    return jsonify([entry.to_dict() for entry in leaderboard]), 200

@learning_bp.route('/user/rank/<int:topic_id>', methods=['GET'])
@login_required
def get_user_rank(topic_id):
    user_id = request.user_id
    logger.info(f"Fetching rank for user {user_id} in topic {topic_id}")
    leaderboard_dao = LeaderboardDAO()
    leaderboard_service = LeaderboardService(leaderboard_dao)
    rank = leaderboard_service.get_user_rank(user_id, topic_id)
    logger.info(f"User {user_id} rank in topic {topic_id}: {rank}")
    return jsonify(rank), 200

@learning_bp.route('/topics/<int:topic_id>/top-users', methods=['GET'])
@login_required
def get_top_users(topic_id):
    limit = request.args.get('limit', default=10, type=int)
    leaderboard_dao = LeaderboardDAO()
    leaderboard_service = LeaderboardService(leaderboard_dao)
    top_users = leaderboard_service.get_top_users(topic_id, limit)
    return jsonify([user.to_dict() for user in top_users]), 200

# Statistics APIs
@learning_bp.route('/user/statistics', methods=['GET'])
@login_required
def get_user_statistics():
    user_id = request.user_id
    logger.info(f"Fetching statistics for user {user_id}")
    test_result_dao = TestResultDAO()
    test_result_service = TestResultService(test_result_dao)
    leaderboard_dao = LeaderboardDAO()
    leaderboard_service = LeaderboardService(leaderboard_dao)
    
    test_stats = test_result_service.get_user_statistics(user_id)
    leaderboard_stats = leaderboard_service.get_user_statistics(user_id)
    
    logger.info(f"Found statistics for user {user_id}")
    return jsonify({
        'test_statistics': test_stats,
        'leaderboard_statistics': leaderboard_stats
    }), 200

@learning_bp.route('/topics/<int:topic_id>/statistics', methods=['GET'])
@login_required
def get_topic_statistics(topic_id):
    test_result_dao = TestResultDAO()
    test_result_service = TestResultService(test_result_dao)
    leaderboard_dao = LeaderboardDAO()
    leaderboard_service = LeaderboardService(leaderboard_dao)
    
    test_stats = test_result_service.get_topic_statistics(topic_id)
    leaderboard_stats = leaderboard_service.get_topic_statistics(topic_id)
    
    return jsonify({
        'test_statistics': test_stats,
        'leaderboard_statistics': leaderboard_stats
    }), 200

# Simple endpoint to check if user is authenticated
@learning_bp.route('/check-auth', methods=['GET'])
@login_required
def check_auth():
    """Check if user is authenticated"""
    user_id = request.user_id
    username = request.username
    logger.info(f"Auth check for user {username} (ID: {user_id})")
    return jsonify({
        'authenticated': True,
        'user_id': user_id,
        'username': username
    }), 200 