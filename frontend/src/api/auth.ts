import { apiGet, apiPost } from './client';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  user?: UserData;
  token?: string;
  message?: string;
}

// Lưu token vào localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Lấy token từ localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Kiểm tra trạng thái xác thực bằng cách gọi API /me
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    console.log('Checking auth status with API...');
    
    // Lấy token từ localStorage
    const token = getAuthToken();
    
    // Nếu không có token, user chưa đăng nhập
    if (!token) {
      console.log('No auth token found, user is not logged in');
      return false;
    }
    
    // Gọi API với token để kiểm tra
    const response = await apiGet<any>('/api/auth/me');
    
    console.log('Auth check response:', response);
    
    if (response && response.authenticated && response.user) {
      console.log('User is authenticated');
      
      // Lưu thông tin người dùng vào localStorage
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      return true;
    }
    
    // Không xác thực -> xóa token và thông tin người dùng
    console.log('User is not authenticated');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    return false;
  } catch (error) {
    console.error('Error checking auth status:', error);
    
    // Lỗi trong quá trình kiểm tra -> xóa token và thông tin người dùng
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    return false;
  }
};

// Helper function để lấy dữ liệu người dùng từ localStorage
export const getUserData = (): UserData | null => {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user_data');
    return null;
  }
};

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    console.log('Attempting login with:', data.username);
    const response = await apiPost<any>('/api/auth/login', data);
    
    console.log('Login response:', response);
    
    // Xử lý response từ backend
    if (response && response.token) {
      console.log(`Received token (first 20 chars): ${response.token.substring(0, 20)}...`);
      
      // Lưu token vào localStorage
      setAuthToken(response.token);
      console.log('Token saved to localStorage');
      
      // Kiểm tra lại token đã lưu
      const savedToken = getAuthToken();
      console.log(`Verification - token from localStorage (first 20 chars): ${savedToken?.substring(0, 20)}...`);
      
      // Lưu thông tin người dùng
      if (response.user) {
        localStorage.setItem('user_data', JSON.stringify(response.user));
        console.log('User data saved to localStorage');
      }
      
      return {
        success: true,
        user: response.user,
        token: response.token,
        message: response.message || 'Login successful'
      };
    }
    
    // Trường hợp không nhận được token
    console.error('No token received in login response:', response);
    return {
      success: false,
      message: 'Đăng nhập không thành công, không nhận được token'
    };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    console.log('Attempting registration with:', data.username);
    const response = await apiPost<any>('/api/auth/register', {
      username: data.username,
      email: data.email,
      password: data.password
    });
    
    console.log('Registration response:', response);
    
    // Xử lý response từ backend
    if (response && response.token && response.user) {
      // Lưu token vào localStorage
      setAuthToken(response.token);
      
      // Lưu thông tin người dùng
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      return {
        success: true,
        user: response.user,
        token: response.token
      };
    }
    
    // Trường hợp không rõ
    return {
      success: false,
      message: 'Đăng ký không thành công, định dạng response không hợp lệ'
    };
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    // Gọi API logout - không thực sự cần thiết cho JWT nhưng vẫn giữ để tương thích
    await apiPost('/api/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Xóa token và thông tin người dùng từ localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};
