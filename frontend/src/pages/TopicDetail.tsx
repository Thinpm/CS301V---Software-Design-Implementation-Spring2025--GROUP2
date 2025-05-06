import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import VocabularyCard from '@/components/vocabulary/VocabularyCard';
import { Button } from "@/components/ui/button";
import { getVocabularyByTopic, getVocabularyTopics, VocabularyTopic, VocabularyWord } from '@/api/vocabulary';
import { ArrowLeft, BookOpen, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { checkAuthStatus } from '@/api/auth';
import { useToast } from '@/components/ui/use-toast';

const TopicDetail = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [topic, setTopic] = useState<VocabularyTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    if (!topicId) {
      setError('Không tìm thấy chủ đề');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      console.log('Loading data for topic:', topicId);
      
      // Tải chủ đề trước để xác định chủ đề tồn tại
      const topicsData = await getVocabularyTopics();
      console.log('Topics data loaded:', topicsData.length);
      
      // Kiểm tra xem chủ đề có tồn tại không
      const currentTopic = topicsData.find(t => t.id === topicId);
      if (!currentTopic) {
        console.warn('Topic not found in the list of topics:', topicId);
        setError('Không tìm thấy thông tin về chủ đề này');
        setIsLoading(false);
        return;
      }
      
      // Nếu tìm thấy chủ đề, thì mới tải từ vựng
      setTopic(currentTopic);
      
      // Sau đó tải từ vựng
      const wordData = await getVocabularyByTopic(topicId);
      console.log('Word data loaded:', wordData.length);
      setWords(wordData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Không thể tải thông tin từ vựng. Vui lòng thử lại sau.');
      toast({
        title: "Lỗi khi tải dữ liệu",
        description: "Không thể tải thông tin từ vựng. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [topicId, toast]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await checkAuthStatus();
        if (!isAuthenticated) {
          console.log('Not authenticated, redirecting to login');
          navigate('/auth');
          return;
        }
        
        loadData();
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [topicId, navigate, loadData]);

  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
    word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
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
            disabled={isLoading || Boolean(error) || words.length === 0}
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
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-500 mb-4">{error}</p>
            <Button 
              onClick={loadData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        ) : words.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Chủ đề này chưa có từ vựng nào
            </p>
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
                  <VocabularyCard key={word.id || index} word={word} index={index} />
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
