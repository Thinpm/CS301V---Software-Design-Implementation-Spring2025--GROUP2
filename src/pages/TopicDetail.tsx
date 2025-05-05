
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import VocabularyCard from '@/components/vocabulary/VocabularyCard';
import { Button } from "@/components/ui/button";
import { getVocabularyByTopic, getVocabularyTopics, VocabularyTopic, VocabularyWord } from '@/api/vocabulary';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { checkAuthStatus } from '@/api/auth';

const TopicDetail = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [topic, setTopic] = useState<VocabularyTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        navigate('/');
      } else {
        loadData();
      }
    };
    
    const loadData = async () => {
      if (!topicId) return;
      
      setIsLoading(true);
      try {
        const [wordData, topicsData] = await Promise.all([
          getVocabularyByTopic(topicId),
          getVocabularyTopics()
        ]);
        
        setWords(wordData);
        const currentTopic = topicsData.find(t => t.id === topicId);
        setTopic(currentTopic || null);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [topicId, navigate]);

  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    word.englishMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.vietnameseMeaning.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/topics')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">{topic?.name || 'Từ vựng'}</h1>
            <p className="text-muted-foreground">{topic?.description}</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Tìm từ vựng..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            className="md:w-auto w-full"
            onClick={() => navigate(`/topics/${topicId}/quiz`)}
          >
            Làm Bài Kiểm Tra
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-lg animate-pulse bg-muted"></div>
            ))}
          </div>
        ) : (
          <>
            {filteredWords.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Không tìm thấy từ vựng nào phù hợp với "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="space-y-4 pb-8">
                {filteredWords.map((word, index) => (
                  <VocabularyCard key={word.id} word={word} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default TopicDetail;
