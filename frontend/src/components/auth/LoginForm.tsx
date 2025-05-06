import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { loginUser } from '@/api/auth';

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Validation Error",
        description: "Vui lòng nhập tên đăng nhập và mật khẩu",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await loginUser({ username, password });
      
      if (response.success) {
        // Đăng nhập thành công
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng trở lại!"
        });
        
        console.log('Login successful, navigating to /topics');
        navigate("/topics");
      } else {
        // Đăng nhập thất bại nhưng không throw exception
        toast({
          title: "Đăng nhập thất bại",
          description: response.message || "Tên đăng nhập hoặc mật khẩu không đúng",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Đăng nhập thất bại",
        description: "Tên đăng nhập hoặc mật khẩu không đúng",
        variant: "destructive"
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Đăng Nhập</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Hãy sử dụng tên đăng nhập đã đăng ký (không phải email). Nếu có khoảng trắng, vui lòng nhập chính xác.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <a href="#" className="text-sm text-primary underline underline-offset-4">
                Quên mật khẩu?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          Chưa có tài khoản?{" "}
          <button
            onClick={onToggleForm}
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Đăng ký
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
