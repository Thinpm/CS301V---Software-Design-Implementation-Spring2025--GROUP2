
import React, { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Award, LogOut, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { logoutUser } from "@/api/auth";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  
  const handleLogout = () => {
    logoutUser();
    toast({
      title: "Đã đăng xuất",
      description: "Tạm biệt! Hẹn gặp lại bạn.",
    });
    navigate("/");
  };
  
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen size={24} />
          <h1 className="text-xl font-bold">Vocab Vista</h1>
        </div>
        <Button variant="ghost" size="icon">
          <List />
        </Button>
      </header>
      
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-border p-4">
        <div className="flex items-center space-x-2 mb-8 p-2">
          <BookOpen size={24} className="text-primary" />
          <h1 className="text-xl font-bold">Vocab Vista</h1>
        </div>
        
        <nav className="flex flex-col space-y-2 flex-1">
          <Button
            variant={isActivePath("/topics") ? "default" : "ghost"}
            className="justify-start"
            onClick={() => navigate("/topics")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Chủ Đề Từ Vựng
          </Button>
          
          <Button
            variant={isActivePath("/leaderboard") ? "default" : "ghost"}
            className="justify-start"
            onClick={() => navigate("/leaderboard")}
          >
            <Award className="mr-2 h-4 w-4" />
            Bảng Xếp Hạng
          </Button>
        </nav>
        
        <div className="pt-4 border-t border-border mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">{user.name || "User"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Đăng Xuất
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
