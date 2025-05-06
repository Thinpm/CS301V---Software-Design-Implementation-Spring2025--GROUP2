
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  topicId: string;
  onRetry: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({
  score,
  totalQuestions,
  topicId,
  onRetry
}) => {
  const navigate = useNavigate();
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getFeedback = () => {
    if (percentage >= 90) return "Xuất sắc!";
    if (percentage >= 70) return "Tốt lắm!";
    if (percentage >= 50) return "Khá tốt!";
    return "Hãy tiếp tục cố gắng!";
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          Kết quả
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-3xl font-bold">
            {score}/{totalQuestions}
          </p>
          <p className="text-muted-foreground mt-1">{getFeedback()}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Kết quả</span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <Button onClick={onRetry} className="w-full">
          Làm lại bài kiểm tra
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/topics/${topicId}`)}
        >
          Quay lại từ vựng
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizResult;
