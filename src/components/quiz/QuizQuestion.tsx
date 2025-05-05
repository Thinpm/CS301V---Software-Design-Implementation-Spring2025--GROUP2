
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QuizQuestion as QuizQuestionType } from '@/api/vocabulary';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  isLast: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  onAnswer,
  onNext,
  isLast
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleOptionSelect = (value: string) => {
    if (!hasAnswered) {
      setSelectedOption(value);
    }
  };
  
  const handleSubmit = () => {
    if (selectedOption && !hasAnswered) {
      const correct = selectedOption === question.correctAnswer;
      setIsCorrect(correct);
      setHasAnswered(true);
      onAnswer(correct);
    }
  };
  
  const getOptionStyle = (option: string) => {
    if (!hasAnswered) return "";
    
    if (option === question.correctAnswer) {
      return "bg-green-100 border-green-500 text-green-800";
    }
    
    if (option === selectedOption && option !== question.correctAnswer) {
      return "bg-red-100 border-red-500 text-red-800";
    }
    
    return "";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-xl">
          What is the meaning of "{question.word}"?
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <RadioGroup value={selectedOption || ""} className="space-y-3">
          {question.options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer ${getOptionStyle(option)}`}
              onClick={() => handleOptionSelect(option)}
            >
              <RadioGroupItem value={option} id={`option-${index}`} disabled={hasAnswered} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!hasAnswered ? (
          <Button 
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="w-full"
          >
            Kiểm tra
          </Button>
        ) : (
          <div className="w-full space-y-4">
            <div className={`p-3 rounded-md ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isCorrect ? 'Chính xác!' : `Sai. Đáp án đúng là: ${question.correctAnswer}`}
            </div>
            <Button onClick={onNext} className="w-full">
              {isLast ? 'Kết thúc' : 'Câu tiếp theo'}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuizQuestion;
