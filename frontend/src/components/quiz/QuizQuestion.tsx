import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuizQuestion as QuizQuestionType } from '@/api/vocabulary';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (isCorrect: boolean, questionId: string, selectedAnswer: string) => void;
  onNext: () => void;
  isLast: boolean;
  isSubmitting: boolean; // ✅ Thêm prop này
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  onAnswer,
  onNext,
  isLast,
  isSubmitting // ✅ Nhận prop
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrect(false);
  }, [question.id]);
  
  useEffect(() => {
    console.log('QuizQuestion mounted with question:', question);
    console.log('Options:', question.options);
  }, [question]);
  
  const handleOptionSelect = (value: string) => {
    if (!hasAnswered) {
      console.log('Selected option:', value);
      setSelectedOption(value);
    }
  };
  
  const handleSubmit = () => {
    if (selectedOption && !hasAnswered) {
      const correct = selectedOption === question.correctAnswer;
      setIsCorrect(correct);
      setHasAnswered(true);
      onAnswer(correct, question.id, selectedOption);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{question.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          className="space-y-4"
          value={selectedOption || undefined}
          onValueChange={handleOptionSelect}
        >
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-3 rounded-md ${
                hasAnswered
                  ? option === question.correctAnswer
                    ? 'bg-green-100 border border-green-400'
                    : selectedOption === option && option !== question.correctAnswer
                    ? 'bg-red-100 border border-red-400'
                    : ''
                  : 'hover:bg-gray-100 border'
              }`}
            >
              <RadioGroupItem
                value={option}
                id={`option-${index}`}
                disabled={hasAnswered}
              />
              <Label htmlFor={`option-${index}`} className="w-full cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {hasAnswered && (
          <div
            className={`mt-4 p-3 rounded-md ${
              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            <p className="font-semibold">
              {isCorrect ? 'Đúng!' : 'Sai!'} {isCorrect ? '👍' : '😢'}
            </p>
            {!isCorrect && (
              <p>
                Đáp án đúng là:{' '}
                <span className="font-semibold">{question.correctAnswer}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        {!hasAnswered ? (
          <Button onClick={handleSubmit} disabled={!selectedOption}>
            Trả lời
          </Button>
        ) : (
          <Button
            onClick={onNext}
            disabled={isSubmitting} // ✅ Chặn bấm nếu đang gửi
          >
            {isLast ? 'Hoàn thành' : 'Câu tiếp theo'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizQuestion;
