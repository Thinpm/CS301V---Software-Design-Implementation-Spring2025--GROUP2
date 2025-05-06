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
          <h3 className="text-lg font-bold">{word.word || 'Từ vựng không tên'}</h3>
          <span className="text-sm text-muted-foreground">{word.phonetic || ''}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Nghĩa:</p>
            <p className="font-medium text-primary">{word.meaning || 'Chưa có nghĩa'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VocabularyCard;
