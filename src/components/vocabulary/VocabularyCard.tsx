
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VocabularyWord } from '@/api/vocabulary';

interface VocabularyCardProps {
  word: VocabularyWord;
  index: number;
}

const VocabularyCard: React.FC<VocabularyCardProps> = ({ word, index }) => {
  return (
    <Card className="vocab-word" style={{ animationDelay: `${index * 0.05}s` }}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">{word.word}</h3>
          <span className="text-sm text-muted-foreground">{word.pronunciation}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Nghĩa Tiếng Anh:</p>
            <p>{word.englishMeaning}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Nghĩa Tiếng Việt:</p>
            <p className="font-medium text-primary">{word.vietnameseMeaning}</p>
          </div>
          
          {word.example && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Ví dụ:</p>
              <p className="italic text-sm">{word.example}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VocabularyCard;
