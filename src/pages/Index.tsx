
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthStatus } from "@/api/auth";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        navigate('/topics');
      } else {
        navigate('/auth');
      }
    };

    checkAuth();
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
