
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { VocabularyTopic } from '@/api/vocabulary';

interface TopicCardProps {
  topic: VocabularyTopic;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/topics/${topic.id}`);
  };

  return (
    <Card className="vocab-topic" onClick={handleClick}>
      <CardHeader className="space-y-1 text-center">
        <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center rounded-full bg-primary/10">
          <img 
            src={topic.imageUrl} 
            alt={topic.name} 
            className="w-10 h-10 object-contain"
          />
        </div>
        <CardTitle>{topic.name}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-center text-muted-foreground">{topic.description}</p>
        <p className="text-sm font-medium text-center mt-2">{topic.wordCount} từ</p>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full" onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}>
          Học Ngay <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TopicCard;
