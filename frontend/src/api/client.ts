import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
console.log('Using API Base URL:', API_BASE_URL);

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Cấu hình CORS
  withCredentials: true,
});

// Request interceptor để thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('auth_token');
    
    // Log chi tiết về request
    console.log(`Preparing ${config.method?.toUpperCase()} request to ${config.url}`);
    
    // Nếu có token, thêm vào header Authorization
    if (token) {
      console.log(`Token found: ${token.substring(0, 20)}...`);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No auth token found');
    }
    
    // Log chi tiết headers sau khi thêm token
    console.log('Request headers:', config.headers);
    
    return config;
  },
  (error) => {
    console.error('Error in request interceptor:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
let isRedirecting = false; // Biến để theo dõi trạng thái chuyển hướng

apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log chi tiết lỗi để debug
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
        headers: error.response.headers
      });
    } else {
      console.error('API Error (no response):', error.message);
    }
    
    // Xử lý lỗi xác thực (401) và quyền truy cập (403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Không chuyển hướng ngay nếu đang ở trang đăng nhập hoặc đăng ký
      const currentPath = window.location.pathname;
      
      // Không redirect trong các trường hợp sau:
      // 1. Đang ở trang đăng nhập/đăng ký
      // 2. Đang kiểm tra authentication (/api/auth/me)
      // 3. Đang gọi API đăng nhập/đăng ký
      const isAuthPath = currentPath.includes('/auth');
      const isAuthAPI = error.config?.url?.includes('/api/auth/login') || 
                       error.config?.url?.includes('/api/auth/register') || 
                       error.config?.url?.includes('/api/auth/me');
      
      if (isAuthPath || isAuthAPI) {
        console.log('Auth error on auth page or auth API, not redirecting');
        return Promise.reject(error);
      }
      
      if (!isRedirecting) {
        isRedirecting = true;
        console.log('Authentication error, redirecting to login page...');
        
        // Xóa dữ liệu đăng nhập
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Chuyển hướng đến trang đăng nhập
        setTimeout(() => {
          window.location.href = '/auth';
          isRedirecting = false;
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for API calls
export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  console.log(`Sending GET request to ${url}`);
  const response: AxiosResponse<T> = await apiClient.get(url, config);
  return response.data;
};

export const apiPost = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  // Add debugging to see what's being sent to the server
  console.log(`Sending POST request to ${url} with data:`, data);
  
  // Make sure we're not transforming the data unexpectedly
  const response: AxiosResponse<T> = await apiClient.post(url, data, config);
  return response.data;
};

export const apiPut = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.put(url, data, config);
  return response.data;
};

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.delete(url, config);
  return response.data;
};

export default apiClient;