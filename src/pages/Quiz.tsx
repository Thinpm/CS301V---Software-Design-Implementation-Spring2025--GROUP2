
import React, { useState, useEffect } from 'react';
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
      try {
        // Get all available questions
        const allQuestions = await getQuizQuestions(topicId);
        
        // Randomly select 10 questions (or less if there are fewer than 10 questions)
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);
        
        setQuestions(selected);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error loading quiz questions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [topicId, navigate]);

  const handleAnswer = (isCorrect: boolean) => {
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
    
    try {
      const completionTime = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
      await submitQuizScore("1", topicId, score, completionTime); // userId hardcoded for now
    } catch (error) {
      console.error('Error submitting quiz score:', error);
    }
    
    setQuizCompleted(true);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setStartTime(Date.now());
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
