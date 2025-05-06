import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import QuizQuestion from '@/components/quiz/QuizQuestion';
import QuizResult from '@/components/quiz/QuizResult';
import { getQuizQuestions, submitQuizScore, QuizQuestion as QuizQuestionType } from '@/api/vocabulary';
import { Progress } from '@/components/ui/progress';
import { checkAuthStatus } from '@/api/auth';

const Quiz = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [questions, setQuestions] = useState<QuizQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSubmittedRef = useRef(false); // ✅ chống gọi lại

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        navigate('/');
      } else {
        loadQuestions();
      }
    };

    const loadQuestions = async () => {
      if (!topicId) return;

      setIsLoading(true);
      setError(null);
      setUserAnswers({});
      try {
        console.log('Loading quiz questions for topic:', topicId);
        const allQuestions = await getQuizQuestions(topicId);
        console.log('Received questions from API:', allQuestions);

        if (!allQuestions || allQuestions.length === 0) {
          setError('Không có câu hỏi nào cho chủ đề này. Vui lòng thử chủ đề khác.');
          setIsLoading(false);
          return;
        }

        const invalidQuestions = allQuestions.filter(q =>
          !q.options || !Array.isArray(q.options) || q.options.length === 0
        );

        if (invalidQuestions.length > 0) {
          console.error('Found invalid questions:', invalidQuestions);
        }

        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(5, shuffled.length));

        console.log('Selected questions for quiz:', selected);
        setQuestions(selected);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error loading quiz questions:', error);
        setError('Đã xảy ra lỗi khi tải câu hỏi. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [topicId, navigate]);

  const handleAnswer = (isCorrect: boolean, questionId: string, selectedAnswer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    if (!topicId) return;

    // ✅ Ngăn gọi lại nhiều lần triệt để
    if (hasSubmittedRef.current) {
      console.warn('completeQuiz đã được gọi rồi, bỏ qua...');
      return;
    }
    hasSubmittedRef.current = true; // ✅ Đặt flag NGAY LẬP TỨC

    try {
      setIsSubmitting(true);
      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      const userId = localStorage.getItem('user_id') || "1";
      console.log('User answers before submission:', userAnswers);

      await submitQuizScore(userId, topicId, score, completionTime, userAnswers);
      setQuizCompleted(true);
    } catch (error) {
      console.error('Error submitting quiz score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setError(null);
    setStartTime(Date.now());
    hasSubmittedRef.current = false; // ✅ reset lại flag khi làm lại bài
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate(`/topics/${topicId}`)}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Quay lại danh sách từ vựng
          </button>
        </div>
      </MainLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4">
            Không có câu hỏi nào cho chủ đề này.
          </div>
          <button
            onClick={() => navigate(`/topics/${topicId}`)}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Quay lại danh sách từ vựng
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        {!quizCompleted ? (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span>Câu hỏi {currentQuestionIndex + 1}/{questions.length}</span>
                <span>Điểm: {score}</span>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
            </div>

            {questions.length > 0 && (
              <QuizQuestion
                question={questions[currentQuestionIndex]}
                onAnswer={handleAnswer}
                onNext={handleNextQuestion}
                isLast={currentQuestionIndex === questions.length - 1}
                isSubmitting={isSubmitting}
              />
            )}
          </>
        ) : (
          <QuizResult
            score={score}
            totalQuestions={questions.length}
            topicId={topicId || ''}
            onRetry={handleRetry}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Quiz;
