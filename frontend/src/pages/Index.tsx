import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthStatus } from "@/api/auth";

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bây giờ cần async vì checkAuthStatus đã thay đổi thành async
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const isAuthenticated = await checkAuthStatus();
        console.log('Is authenticated:', isAuthenticated);
        
        if (isAuthenticated) {
          console.log('User is authenticated, navigating to /topics');
          navigate('/topics');
        } else {
          console.log('User is not authenticated, navigating to /auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    // Thêm một chút delay để đảm bảo app đã load xong
    setTimeout(() => {
      checkAuth();
    }, 500);
  }, [navigate]);

  // This is just a loading screen while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg mt-4">Đang tải ứng dụng...</p>
      </div>
    </div>
  );
};

export default Index;
