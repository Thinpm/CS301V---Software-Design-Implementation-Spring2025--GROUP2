import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import TopicCard from '@/components/vocabulary/TopicCard';
import { getVocabularyTopics, VocabularyTopic } from '@/api/vocabulary';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import { checkAuthStatus } from '@/api/auth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const TopicsList = () => {
  const [topics, setTopics] = useState<VocabularyTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Lấy danh sách chủ đề
      console.log('Fetching topics...');
      const data = await getVocabularyTopics();
      
      if (!data || data.length === 0) {
        console.warn('No topics returned from API');
        setError('Không có chủ đề nào được trả về từ server');
        setTopics([]);
        return;
      }
      
      console.log('Topics loaded successfully:', data.length);
      setTopics(data);
    } catch (error) {
      console.error('Error in TopicsList:', error);
      setError('Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
      toast({
        title: "Lỗi khi tải dữ liệu",
        description: "Không thể tải danh sách chủ đề. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Kiểm tra xác thực - đã là hàm async
        const isAuthenticated = await checkAuthStatus();
        console.log('Authentication status in TopicsList:', isAuthenticated);
        
        if (!isAuthenticated) {
          console.log('Not authenticated in TopicsList, redirecting to login...');
          navigate('/auth');
          return;
        }
        
        await loadTopics();
      } catch (error) {
        console.error('Authentication error in TopicsList:', error);
        navigate('/auth');
      }
    };
    
    init();
  }, [navigate, toast]);

  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Chủ Đề Từ Vựng</h1>
          <p className="text-muted-foreground mt-2">
            Chọn một chủ đề để bắt đầu học từ vựng
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Tìm kiếm chủ đề..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 rounded-lg animate-pulse bg-muted"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-red-500 mb-4">{error}</p>
            <Button 
              onClick={loadTopics}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        ) : (
          <>
            {filteredTopics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  {searchQuery ? 
                    `Không tìm thấy chủ đề nào phù hợp với "${searchQuery}"` : 
                    "Hiện chưa có chủ đề nào. Vui lòng quay lại sau."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTopics.map(topic => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default TopicsList;
