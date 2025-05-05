
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import TopicCard from '@/components/vocabulary/TopicCard';
import { getVocabularyTopics, VocabularyTopic } from '@/api/vocabulary';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { checkAuthStatus } from '@/api/auth';

const TopicsList = () => {
  const [topics, setTopics] = useState<VocabularyTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        navigate('/');
      } else {
        loadTopics();
      }
    };
    
    const loadTopics = async () => {
      setIsLoading(true);
      try {
        const data = await getVocabularyTopics();
        setTopics(data);
      } catch (error) {
        console.error('Error loading topics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

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
        ) : (
          <>
            {filteredTopics.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Không tìm thấy chủ đề nào phù hợp với "{searchQuery}"
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
