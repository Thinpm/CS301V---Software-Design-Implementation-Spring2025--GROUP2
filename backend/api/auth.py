from flask import Blueprint, request, jsonify, session, make_response
from functools import wraps
import jwt
import datetime
import os
from backend.business_layer.services.user_service import UserService
from backend.dao.users.user_dao import UserDAO
from backend.utils.validation import validate_required_fields
from backend.utils.exceptions import ValidationError, AuthenticationError, DatabaseError
from backend.utils.logger import setup_logger
from backend.database.database import get_db

logger = setup_logger(__name__)
user_service = UserService(UserDAO())

auth_bp = Blueprint('auth', __name__)

# Khóa bí mật để ký JWT
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev_secret_key')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # Token hết hạn sau 7 ngày

def generate_jwt_token(user_id, username):
    """Tạo JWT token cho user"""
    try:
        # Đảm bảo user_id là kiểu dữ liệu chuỗi
        user_id_str = str(user_id)
        
        payload = {
            'sub': user_id_str,  # subject (ID của người dùng)
            'name': username,
            'iat': datetime.datetime.utcnow(),  # thời gian tạo token
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)  # thời gian hết hạn
        }
        
        logger.info(f"Generating token with payload: {payload}")
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        logger.info(f"Generated JWT token for user {username}, token type: {type(token)}")
        
        # PyJWT 2.x trả về string, nhưng phiên bản cũ trả về bytes
        if isinstance(token, bytes):
            token = token.decode('utf-8')
            
        return token
        
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise

def decode_jwt_token(token):
    """Giải mã JWT token"""
    try:
        if token is None or token.strip() == '':
            logger.warning("Empty token provided")
            return None
            
        logger.info(f"Decoding token: {token[:10]}...")
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        logger.info(f"Token decoded successfully. Payload: {payload}")
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error decoding token: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return None

def get_token_from_request():
    """Lấy token từ Authorization header"""
    auth_header = request.headers.get('Authorization')
    logger.info(f"Authorization header: {auth_header}")
    
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1].strip()
        logger.info(f"Token extracted from header: {token[:10]}...")
        return token
    
    # Kiểm tra cả query param cho testing
    token = request.args.get('token')
    if token:
        logger.info(f"Token found in query param: {token[:10]}...")
        return token
        
    logger.warning("No token found in request")
    return None

def login_required(f):
    """Decorator để kiểm tra xác thực bằng JWT"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            logger.warning("No token provided")
            raise AuthenticationError('Authentication required')
            
        payload = decode_jwt_token(token)
        if not payload:
            logger.warning("Invalid or expired token")
            raise AuthenticationError('Invalid or expired token')
            
        # Lưu thông tin user vào request để có thể truy cập trong các view
        request.user_id = payload['sub']
        request.username = payload['name']
        
        # Lưu thông tin user vào session để đảm bảo tính nhất quán
        session['user_id'] = payload['sub']
        session['username'] = payload['name']
        logger.info(f"User authenticated: {payload['name']} (ID: {payload['sub']})")
        
        return f(*args, **kwargs)
    return decorated_function

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        # Get and validate request data
        data = request.get_json()
        if not data:
            raise ValidationError('No data provided')
            
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        errors = validate_required_fields(data, required_fields)
        if errors:
            raise ValidationError(errors[0])
            
        # Register user
        user = user_service.register(
            username=data['username'],
            email=data['email'],
            password=data['password']
        )
        
        if not user:
            raise ValidationError('Username or email already exists')
            
        logger.info(f"User registered successfully: {data['username']}")
        
        # Generate JWT token
        token = generate_jwt_token(user.id, user.username)
        
        return jsonify({
            'message': 'Registration successful',
            'user': user.to_dict(),
            'token': token
        }), 201
        
    except ValidationError as e:
        logger.warning(f"Registration validation failed: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        # Get and validate request data
        data = request.get_json()
        logger.info(f"Login attempt with data: {data}")
        
        if not data:
            raise ValidationError('No data provided')
            
        # Validate required fields
        required_fields = ['username', 'password']
        errors = validate_required_fields(data, required_fields)
        if errors:
            raise ValidationError(errors[0])
            
        # Login user
        result = user_service.login(
            username=data['username'],
            password=data['password']
        )
        
        if not result:
            raise AuthenticationError('Invalid username or password')
        
        # Get user data
        user = result['user']
        
        # Generate JWT token
        user_id = user['id']
        username = user['username']
        
        logger.info(f"User authenticated successfully: {username} (ID: {user_id})")
        logger.info(f"User data type - id: {type(user_id)}, username: {type(username)}")
        
        try:
            # Tạo JWT token
            token = generate_jwt_token(user_id, username)
            logger.info(f"JWT token generated: {token[:20]}...")
            
            # Test decode để xác minh token hợp lệ
            try:
                test_payload = decode_jwt_token(token)
                if not test_payload:
                    logger.error("JWT token verification failed - cannot decode token")
                    raise Exception("Token verification failed")
                logger.info(f"Token verification successful: {test_payload}")
            except Exception as e:
                logger.error(f"Token verification error: {str(e)}")
                raise Exception(f"Token verification error: {str(e)}")
                
        except Exception as e:
            logger.error(f"Token generation error: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            raise Exception(f"Failed to generate token: {str(e)}")
        
        # Return user data and token
        return jsonify({
            'message': 'Login successful',
            'user': user,
            'token': token
        }), 200
        
    except ValidationError as e:
        logger.warning(f"Login validation failed: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except AuthenticationError as e:
        logger.warning(f"Login authentication failed: {str(e)}")
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    # JWT là stateless nên không cần xóa token ở backend
    # Client cần tự xóa token từ localStorage
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/debug/db', methods=['GET'])
def debug_db():
    """Debug endpoint to check database connection"""
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        cursor.execute("SELECT id, username, email FROM users LIMIT 1")
        user = cursor.fetchone()
        return jsonify({
            'status': 'success',
            'user_count': count,
            'sample_user': {
                'id': user[0],
                'username': user[1],
                'email': user[2]
            } if user else None
        })
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user from token"""
    try:
        logger.info(f"Request headers: {dict(request.headers)}")
        
        token = get_token_from_request()
        
        if not token:
            logger.warning("No token provided in /me endpoint")
            return jsonify({'authenticated': False, 'message': 'Not authenticated'}), 401
            
        try:
            payload = decode_jwt_token(token)
            
            if not payload:
                logger.warning("Invalid or expired token in /me endpoint")
                return jsonify({'authenticated': False, 'message': 'Invalid or expired token'}), 401
        except Exception as e:
            logger.error(f"Error decoding token: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return jsonify({'authenticated': False, 'message': f'Error decoding token: {str(e)}'}), 401
        
        try:
            # Lấy thông tin user từ database
            if 'sub' not in payload:
                logger.error(f"Missing 'sub' in token payload: {payload}")
                return jsonify({'authenticated': False, 'message': 'Invalid token format - missing user ID'}), 401
                
            user_id = payload['sub']
            logger.info(f"Getting user with ID {user_id} from database")
            
            user_dao = UserDAO()
            
            try:
                # Xử lý user_id đúng định dạng
                if isinstance(user_id, str) and user_id.isdigit():
                    user_id = int(user_id)
                    
                user = user_dao.get_by_id(user_id)
                
                if not user:
                    logger.warning(f"User with ID {user_id} not found in database")
                    return jsonify({'authenticated': False, 'message': 'User not found'}), 401
                    
                # Trả về thông tin user
                logger.info(f"User {user.username} authenticated successfully via token")
                
                response_data = {
                    'authenticated': True,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                }
                logger.info(f"Returning user data: {response_data}")
                
                return jsonify(response_data), 200
            except Exception as db_error:
                logger.error(f"Database error: {str(db_error)}")
                import traceback
                logger.error(traceback.format_exc())
                return jsonify({
                    'authenticated': False, 
                    'message': 'Database error', 
                    'error': str(db_error),
                    'user_id': user_id
                }), 500
            
        except Exception as e:
            logger.error(f"Error getting user data: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return jsonify({
                'authenticated': False, 
                'message': 'Error getting user data', 
                'error': str(e)
            }), 500
            
    except Exception as e:
        logger.error(f"Unexpected error in get_current_user: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({
            'authenticated': False, 
            'message': 'Server error', 
            'error': str(e)
        }), 500

@auth_bp.route('/test-token', methods=['GET'])
def test_token():
    """Test endpoint để kiểm tra token"""
    token = get_token_from_request()
    
    if not token:
        return jsonify({
            'valid': False,
            'message': 'No token provided'
        }), 401
        
    payload = decode_jwt_token(token)
    
    if not payload:
        return jsonify({
            'valid': False,
            'message': 'Invalid or expired token'
        }), 401
        
    return jsonify({
        'valid': True,
        'payload': payload
    }), 200 