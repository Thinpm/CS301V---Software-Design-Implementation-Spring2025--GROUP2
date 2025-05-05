
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { getLeaderboard, LeaderboardEntry } from '@/api/vocabulary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { checkAuthStatus } from '@/api/auth';
import { Medal } from 'lucide-react';

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (!isAuthenticated) {
        navigate('/');
      } else {
        loadLeaderboard();
      }
    };
    
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await getLeaderboard();
        setEntries(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const getMedalColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'text-vocab-yellow';
      case 2: return 'text-gray-400';
      case 3: return 'text-vocab-red';
      default: return 'text-muted-foreground';
    }
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
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 rounded-lg animate-pulse bg-muted"></div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Xếp hạng</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead className="text-right">Điểm</TableHead>
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
                    <TableCell>{entry.username}</TableCell>
                    <TableCell className="text-right font-medium">{entry.score}</TableCell>
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
