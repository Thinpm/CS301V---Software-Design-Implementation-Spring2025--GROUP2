# English Vocabulary Learning Application

A web application for learning English vocabulary, taking tests, and tracking progress.

## Features

- User authentication (register, login, password recovery)
- Vocabulary topic management
  - Create, read, update, delete vocabulary topics
  - Organize vocabularies by topics
  - Track topic progress
- Vocabulary management
  - Add words with meanings and phonetic transcriptions
  - Group vocabularies by topics
  - Search and filter vocabularies
- Test system
  - Take vocabulary tests by topic
  - Track completion time and scores
  - View test history and progress
- Leaderboard system
  - Global rankings by topic
  - Personal ranking tracking
  - Top performers list
- Statistics and analytics
  - User performance metrics
  - Topic-wise statistics
  - Progress tracking

## Technical Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: MySQL
- **Authentication**: JWT
- **API**: RESTful architecture
- **Documentation**: OpenAPI/Swagger

### Frontend
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Validation**: Yup
- **Testing**: Jest and React Testing Library

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vocabulary-learning-app
```

2. Set up Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up Frontend:
```bash
cd frontend
npm install
```

4. Configure environment:
```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend (.env)
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API URL
```

5. Initialize database:
```bash
cd backend
flask db init
flask db migrate
flask db upgrade
mysql -u root -p < mysql.sql  # Import initial data
```

## Running the Application

1. Start Backend:
```bash
cd backend
flask run
```

2. Start Frontend:
```bash
cd frontend
npm start
```

## API Documentation

### Authentication

- `POST /api/auth/register`: Register new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/logout`: Logout user

### Vocabulary Topics

- `GET /api/learning/topics`: Get all vocabulary topics
- `POST /api/learning/topics`: Create new vocabulary topic
- `GET /api/learning/topics/<topic_id>`: Get topic details
- `PUT /api/learning/topics/<topic_id>`: Update topic
- `DELETE /api/learning/topics/<topic_id>`: Delete topic

### Vocabulary

- `GET /api/learning/topics/<topic_id>/vocabularies`: Get vocabularies in topic
- `POST /api/learning/topics/<topic_id>/vocabularies`: Add vocabulary to topic
- `GET /api/learning/vocabularies/<vocabulary_id>`: Get vocabulary details
- `PUT /api/learning/vocabularies/<vocabulary_id>`: Update vocabulary
- `DELETE /api/learning/vocabularies/<vocabulary_id>`: Delete vocabulary

### Tests

- `GET /api/learning/topics/<topic_id>/tests`: Get tests for topic
- `POST /api/learning/topics/<topic_id>/tests/start`: Start a test
- `POST /api/learning/topics/<topic_id>/tests/submit`: Submit test answers

### Test Results

- `GET /api/learning/user/results`: Get user's test results
- `GET /api/learning/topics/<topic_id>/results`: Get topic results
- `GET /api/learning/user/topics/<topic_id>/results`: Get user's topic results

### Leaderboard

- `GET /api/learning/topics/<topic_id>/leaderboard`: Get topic leaderboard
- `GET /api/learning/user/rank/<topic_id>`: Get user's rank in topic
- `GET /api/learning/topics/<topic_id>/top-users`: Get top users in topic

### Statistics

- `GET /api/learning/user/statistics`: Get user statistics
- `GET /api/learning/topics/<topic_id>/statistics`: Get topic statistics

## Development

### Running Tests

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm test
```

### Code Style

Backend:
```bash
black .
flake8
mypy .
```

Frontend:
```bash
npm run lint
npm run format
```

### Documentation

- Backend API documentation is available at `/api/docs` when running in development mode
- Frontend component documentation is available in `frontend/docs`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details
