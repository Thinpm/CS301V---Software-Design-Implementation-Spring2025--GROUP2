import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { getLeaderboard, LeaderboardEntry, getVocabularyTopics, VocabularyTopic } from '@/api/vocabulary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { checkAuthStatus } from '@/api/auth';
import { Medal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Leaderboard = () => {
  const { topicId } = useParams<{ topicId?: string }>();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [topics, setTopics] = useState<VocabularyTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(topicId || 'all');
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Bắt đầu tải dữ liệu leaderboard...');
      
      // Tải topics trước
      const topicsData = await getVocabularyTopics();
      console.log('Đã tải dữ liệu topics:', topicsData);
      setTopics(topicsData);
      
      // Sau đó tải leaderboard
      console.log('Tải dữ liệu leaderboard cho topic:', selectedTopicId);
      const leaderboardData = await getLeaderboard(selectedTopicId !== 'all' ? selectedTopicId : undefined);
      console.log('Đã tải dữ liệu leaderboard:', leaderboardData);
      
      if (leaderboardData.length === 0) {
        console.warn('Không có dữ liệu leaderboard nào được trả về');
        setError('Không có dữ liệu bảng xếp hạng');
      }
      
      setEntries(leaderboardData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      setError('Không thể tải dữ liệu bảng xếp hạng. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        navigate('/auth');
      } else {
        loadData();
      }
    };
    
    checkAuth();
  }, [navigate, selectedTopicId, topicId]);

  const handleTopicChange = (topicId: string) => {
    setSelectedTopicId(topicId);
  };

  const getMedalColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'text-vocab-yellow';
      case 2: return 'text-gray-400';
      case 3: return 'text-vocab-red';
      default: return 'text-muted-foreground';
    }
  };

  const handleRetry = () => {
    loadData();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Bảng Xếp Hạng</h1>
            <p className="text-muted-foreground mt-2">
              Top học viên có thành tích cao nhất
            </p>
          </div>
        </div>
        
        <Tabs defaultValue={selectedTopicId} onValueChange={handleTopicChange}>
          <TabsList className="w-full overflow-x-auto flex flex-nowrap">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            {topics.map((topic) => (
              <TabsTrigger key={topic.id} value={topic.id} className="whitespace-nowrap">
                {topic.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 rounded-lg animate-pulse bg-muted"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleRetry}
            >
              Thử lại
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Chưa có dữ liệu bảng xếp hạng cho chủ đề này</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Xếp hạng</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead className="text-right">Điểm Tổng</TableHead>
                  <TableHead className="text-right">Bài Kiểm Tra</TableHead>
                  <TableHead className="text-right">Điểm TB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(entry => (
                  <TableRow key={entry.userId}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {entry.rank <= 3 ? (
                          <Medal className={`h-5 w-5 ${getMedalColor(entry.rank)}`} />
                        ) : (
                          <span>{entry.rank}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {entry.username && entry.username !== 'User' && entry.username !== `User ${entry.rank}` 
                        ? entry.username 
                        : `Người dùng ${entry.rank}`}
                    </TableCell>
                    <TableCell className="text-right font-medium">{entry.totalScore}</TableCell>
                    <TableCell className="text-right">{entry.testsCompleted}</TableCell>
                    <TableCell className="text-right">{entry.averageScore.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Leaderboard;
