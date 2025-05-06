# Hướng dẫn phát triển Frontend cho Ứng dụng Học Từ Vựng Tiếng Anh

## Tổng quan

### Công nghệ sử dụng
- **Framework**: React với TypeScript
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Yup
- **Testing**: Jest và React Testing Library

### Cấu trúc thư mục
```
frontend/
├── public/
├── src/
│   ├── api/                 # API calls và axios config
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Shared components
│   │   ├── common/        # Basic UI components
│   │   ├── forms/         # Form components
│   │   └── layout/        # Layout components
│   ├── features/          # Feature-based components
│   │   ├── auth/         
│   │   ├── vocabulary/    
│   │   ├── quiz/         
│   │   └── leaderboard/   
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Page components
│   ├── redux/             # Redux store, slices
│   ├── routes/            # Route configurations
│   ├── types/             # TypeScript types/interfaces
│   │   ├── vocabulary.d.ts # Type definitions for vocabulary features
│   │   └── ...           # Other type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Root component
```

## Chi tiết triển khai

### 1. Authentication (features/auth)

#### Components
- `LoginForm`: Form đăng nhập
- `RegisterForm`: Form đăng ký
- `ForgotPassword`: Form quên mật khẩu
- `AuthLayout`: Layout cho trang authentication

#### Redux Slice
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    // ...
  }
});
```

### 2. Vocabulary Management (features/vocabulary)

#### Components
- `VocabularyTopicList`: Danh sách chủ đề từ vựng
- `VocabularyTopicDetail`: Chi tiết chủ đề từ vựng
- `VocabularyList`: Danh sách từ vựng
- `VocabularyCard`: Card hiển thị từ vựng
- `AddVocabularyForm`: Form thêm từ mới

#### Data Structure
```typescript
interface VocabularyTopic {
  id: number;
  name: string;
  description: string;
  totalWords: number;
}

interface Vocabulary {
  id: number;
  word: string;
  meaning: string;
  example: string;
  topicId: number;
}
```

### 3. Quiz System (features/quiz)

#### Components
- `QuizStart`: Màn hình bắt đầu quiz
- `QuizQuestion`: Component câu hỏi
- `QuizProgress`: Thanh tiến trình
- `QuizResult`: Kết quả quiz
- `QuizHistory`: Lịch sử làm quiz

#### Quiz Flow
1. Chọn chủ đề từ vựng
2. Cấu hình quiz (số câu hỏi, thời gian)
3. Làm quiz
4. Hiển thị kết quả
5. Lưu và cập nhật leaderboard

### 4. Leaderboard (features/leaderboard)

#### Components
- `LeaderboardTable`: Bảng xếp hạng
- `UserRank`: Hiển thị thứ hạng người dùng
- `TopUsers`: Top người dùng xuất sắc
- `LeaderboardFilters`: Bộ lọc (theo chủ đề, thời gian)

### 5. Common Components (components/common)

- `Button`: Custom button với các variant
- `Input`: Custom input field
- `Select`: Custom select component
- `Modal`: Reusable modal
- `Alert`: System alerts/notifications
- `Loading`: Loading indicators
- `ErrorBoundary`: Error handling component

### 6. Layout (components/layout)

- `MainLayout`: Layout chính với navigation
- `Sidebar`: Thanh điều hướng
- `Header`: Header với user info
- `Footer`: Footer component

## API Integration

### Backend API Endpoints Detail

#### 1. Authentication APIs

```typescript
// Authentication
POST /api/auth/register
Request:
{
  username: string,
  email: string,
  password: string
}
Response:
{
  id: number,
  username: string,
  email: string,
  created_at: string
}

POST /api/auth/login
Request:
{
  username: string,
  password: string
}
Response:
{
  message: string,
  user: {
    id: number,
    username: string,
    email: string,
    created_at: string
  }
}

POST /api/auth/logout
Response:
{
  message: string
}
```

#### 2. Vocabulary Topic APIs

```typescript
// Vocabulary Topics
GET /api/learning/topics
Response:
{
  topics: Array<{
    id: number,
    name: string,
    description: string,
    created_at: string,
    total_vocabularies: number
  }>
}

GET /api/learning/topics/:id
Response:
{
  id: number,
  name: string,
  description: string,
  created_at: string,
  vocabularies: Array<{
    id: number,
    word: string,
    meaning: string,
    phonetic: string
  }>
}

POST /api/learning/topics
Request:
{
  name: string,
  description: string
}
Response:
{
  id: number,
  name: string,
  description: string,
  created_at: string
}
```

#### 3. Vocabulary APIs

```typescript
GET /api/learning/topics/:topicId/vocabularies
Response:
{
  vocabularies: Array<{
    id: number,
    topic_id: number,
    word: string,
    meaning: string,
    phonetic: string
  }>
}

POST /api/learning/topics/:topicId/vocabularies
Request:
{
  word: string,
  meaning: string,
  phonetic: string
}
Response:
{
  id: number,
  topic_id: number,
  word: string,
  meaning: string,
  phonetic: string
}
```

#### 4. Quiz APIs

```typescript
POST /api/learning/topics/:topicId/quiz/start
Response:
{
  quiz_id: number,
  questions: Array<{
    id: number,
    question: string,
    options: string[]
  }>
}

POST /api/learning/topics/:topicId/quiz/submit
Request:
{
  quiz_id: number,
  answers: {
    [question_id: number]: string
  },
  completion_time: number
}
Response:
{
  score: number,
  correct_answers: number,
  total_questions: number,
  completion_time: number
}
```

#### 5. Leaderboard APIs

```typescript
GET /api/learning/topics/:topicId/leaderboard
Response:
{
  leaderboard: Array<{
    rank: number,
    user_id: number,
    username: string,
    total_score: number,
    tests_completed: number,
    average_score: number
  }>
}

GET /api/learning/topics/:topicId/rank
Response:
{
  rank: number,
  total_score: number,
  tests_completed: number,
  average_score: number
}

GET /api/learning/topics/:topicId/top-users
Response:
{
  users: Array<{
    rank: number,
    user_id: number,
    username: string,
    total_score: number,
    tests_completed: number,
    average_score: number
  }>
}
```

## Redux Store Structure

```typescript
interface RootState {
  auth: AuthState;
  vocabularyTopics: {
    topics: VocabularyTopic[];
    currentTopic: VocabularyTopic | null;
    isLoading: boolean;
    error: string | null;
  };
  vocabularies: {
    items: Vocabulary[];
    isLoading: boolean;
    error: string | null;
  };
  quiz: {
    currentQuiz: Quiz | null;
    results: QuizResult[];
    isLoading: boolean;
    error: string | null;
  };
  leaderboard: {
    rankings: LeaderboardEntry[];
    userRank: UserRank | null;
    isLoading: boolean;
    error: string | null;
  };
}
```

## Routing Configuration

```typescript
// src/routes/index.tsx
const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/topics', element: <VocabularyTopicList /> },
      { path: '/topics/:id', element: <VocabularyTopicDetail /> },
      { path: '/quiz', element: <QuizStart /> },
      { path: '/quiz/:id', element: <QuizQuestion /> },
      { path: '/leaderboard', element: <LeaderboardTable /> },
      { path: '/profile', element: <UserProfile /> }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginForm /> },
      { path: 'register', element: <RegisterForm /> },
      { path: 'forgot-password', element: <ForgotPassword /> }
    ]
  }
];
```

## Theme và Styling

```typescript
// theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    secondary: {
      main: '#ff4081',
      light: '#ff79b0',
      dark: '#c60055',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem' },
    h2: { fontSize: '2rem' },
    h3: { fontSize: '1.75rem' },
    h4: { fontSize: '1.5rem' },
    h5: { fontSize: '1.25rem' },
    h6: { fontSize: '1rem' },
  },
});
```

## Form Validation

```typescript
// utils/validation.ts
import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object({
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match'),
});
```

## Error Handling

```typescript
// utils/errorHandler.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server error response
    return {
      message: error.response.data.message || 'Server error',
      status: error.response.status,
    };
  } else if (error.request) {
    // No response from server
    return {
      message: 'No response from server',
      status: 503,
    };
  } else {
    // Request setup error
    return {
      message: 'Request failed',
      status: 400,
    };
  }
};
```

## Testing

### Unit Test Example
```typescript
// components/VocabularyCard/VocabularyCard.test.tsx
import { render, screen } from '@testing-library/react';
import VocabularyCard from './VocabularyCard';

describe('VocabularyCard', () => {
  const mockVocabulary = {
    id: 1,
    word: 'Hello',
    meaning: 'Xin chào',
    example: 'Hello, how are you?',
  };

  it('renders vocabulary information correctly', () => {
    render(<VocabularyCard vocabulary={mockVocabulary} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Xin chào')).toBeInTheDocument();
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
  });
});
```

## Performance Optimization

1. **Code Splitting**
   - Sử dụng React.lazy() cho các route
   - Tách các bundle theo feature

2. **Caching**
   - Cache API responses
   - Implement service workers
   - Local storage cho user preferences

3. **Memoization**
   - Sử dụng React.memo cho components
   - useMemo cho expensive calculations
   - useCallback cho callbacks

## Deployment

1. **Build Process**
```bash
npm run build
```

2. **Environment Variables**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

3. **Nginx Configuration**
```nginx
server {
    listen 80;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
    }
}
```

## Security Considerations

1. **XSS Protection**
   - Sanitize user input
   - Use Content Security Policy
   - Implement proper escaping

2. **CSRF Protection**
   - Include CSRF tokens
   - Use secure cookies

3. **Authentication**
   - Implement JWT properly
   - Handle token expiration
   - Secure storage of tokens

## Accessibility

1. **ARIA Labels**
2. **Keyboard Navigation**
3. **Color Contrast**
4. **Screen Reader Support**

## Mobile Responsiveness

1. **Breakpoints**
```typescript
const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};
```

2. **Media Queries**
3. **Flexible Layouts**
4. **Touch-friendly UI**

## Next Steps

1. Setup dự án với Create React App và TypeScript
2. Cài đặt các dependencies cần thiết
3. Thiết lập cấu trúc thư mục
4. Implement authentication
5. Phát triển các feature theo thứ tự ưu tiên
6. Thêm tests
7. Tối ưu performance
8. Deploy 