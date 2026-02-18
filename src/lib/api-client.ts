// lib/api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Read token from localStorage on EVERY request
    this.client.interceptors.request.use(
      (config) => {
        // Always get fresh token from localStorage
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token && config.headers) {
            console.log('🔐 Adding token to request:', token.substring(0, 20) + '...');
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            console.log('🔐 No token found in localStorage');
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle responses globally - with user-friendly error messages
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
          console.log('🔐 401 received - authentication expired');

          // Show user-friendly message
          this.showAuthExpiredMessage();

          // Clear tokens
          this.clearToken();

          // Redirect to login page after a delay
        

          return Promise.reject(new Error('Session expired. Please login again.'));
        }

        // Handle other errors with user-friendly messages
        if (error.response) {
          const status = error.response.status;
          const data: any = error.response.data;

          switch (status) {
            case 400:
              toast.error('Bad Request', {
                description: data.error || 'Please check your input and try again.',
              });
              break;
            case 403:
              toast.error('Access Denied', {
                description: 'You do not have permission to perform this action.',
              });
              break;
            case 404:
              toast.error('Not Found', {
                description: 'The requested resource was not found.',
              });
              break;
            case 429:
              toast.error('Too Many Requests', {
                description: 'Please wait a moment before trying again.',
              });
              break;
            case 500:
              toast.error('Server Error', {
                description: 'Something went wrong on our end. Please try again later.',
              });
              break;
            default:
              toast.error('Request Failed', {
                description: data.error || 'An unexpected error occurred.',
              });
          }
        } else if (error.request) {
          // Network error
          toast.error('Network Error', {
            description: 'Please check your internet connection and try again.',
          });
        } else {
          // Request setup error
          toast.error('Request Error', {
            description: 'Unable to process your request. Please try again.',
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // Show user-friendly authentication expired message
  private showAuthExpiredMessage() {
    // Create a custom toast that stays until user acknowledges
    toast.error('Session Expired', {
      description: 'Your session has expired. Please login again to continue.',
      duration: 5000,
      action: {
        label: 'Login Now',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },
      onDismiss: () => {
        // Auto-redirect if user dismisses without clicking
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }, 1000);
      }
    });

    // Also log to console for debugging
    console.warn('🔄 Session expired - redirecting to login');
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      console.log('🔐 Token saved to localStorage');
    }
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      console.log('🔐 Tokens cleared from localStorage');
    }
  }

  loadToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  // Get remaining token time (if using JWT with exp claim)
  getTokenExpiration(): Date | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        return new Date(payload.exp * 1000); // Convert to milliseconds
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }

    return null;
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) return true;

    return expiration < new Date();
  }

  // Auto-check token expiration on app load
  setupTokenExpirationCheck() {
    if (typeof window === 'undefined') return;

    // Check immediately
    if (this.isTokenExpired() && this.isAuthenticated()) {
      console.log('🔐 Token expired on app load');
      this.showAuthExpiredMessage();
      this.clearToken();
    }

    // Set up periodic check (every 30 seconds)
    setInterval(() => {
      if (this.isTokenExpired() && this.isAuthenticated()) {
        console.log('🔐 Token expired during session');
        this.showAuthExpiredMessage();
        this.clearToken();
      }
    }, 30000); // 30 seconds
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const res = await this.client.post<ApiResponse>('/api/auth/login', {
      email,
      password,
    });

    if (res.data.success && res.data.data?.token) {
      this.setToken(res.data.data.token);

      if (res.data.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
      }

      // Show success message
      toast.success('Login Successful', {
        description: 'Welcome back!',
      });
    } else if (!res.data.success) {
      // Show login-specific error
      toast.error('Login Failed', {
        description: res.data.error || 'Invalid email or password.',
      });
    }

    return res.data;
  }

  async signup(email: string, password: string): Promise<ApiResponse> {
    const res = await this.client.post<ApiResponse>('/api/auth/signup', {
      email,
      password,
    });

    if (!res.data.success) {
      toast.error('Signup Failed', {
        description: res.data.error || 'Unable to create account. Please try again.',
      });
    } else {
      toast.success('Account Created', {
        description: 'Please check your email to verify your account.',
      });
    }

    return res.data;
  }

  async updateProfile(name: string): Promise<ApiResponse> {
    try {
      const res = await this.client.put<ApiResponse>('/api/user/profile', { name });

      if (res.data.success) {
        toast.success('Profile Updated', {
          description: 'Your profile has been updated successfully.',
        });
      }

      return res.data;
    } catch (error: any) {
      // Already handled by interceptor
      throw error;
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const res = await this.client.post<ApiResponse>('/api/auth/logout');
      this.clearToken();

      toast.info('Logged Out', {
        description: 'You have been successfully logged out.',
      });

      return res.data;
    } catch (error: any) {
      // Even if API call fails, clear local tokens
      this.clearToken();
      toast.info('Logged Out', {
        description: 'You have been logged out.',
      });
      return { success: true };
    }
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const res = await this.client.get<ApiResponse>('/api/auth/me');
    return res.data;
  }

  // DOCUMENTS
  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await this.client.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress(progress);
        }
      },
    });

    return res.data;
  }

  async getDocuments() {
    console.log('🔐 getDocuments called, token:', localStorage.getItem('auth_token')?.substring(0, 20) + '...');
    const res = await this.client.get('/api/documents');
    return res.data;
  }

  async getDocument(id: string) {
    const res = await this.client.get(`/api/documents/${id}`);
    return res.data;
  }

  async deleteDocument(id: string) {
    const res = await this.client.delete(`/api/documents/${id}`);
    return res.data;
  }

  // CHAT
  async queryChat(query: string, documentId?: string) {
    const res = await this.client.post('/api/chat/query', {
      query,
      document_id: documentId,
    });
    return res.data;
  }

  // GRAPH
  async getGlobalGraph() {
    const res = await this.client.get('/api/graph');
    return res.data;
  }

  async searchDocuments(query: string, documentId?: string, options?: {
    minScore?: number;
    topK?: number;
  }) {
    const res = await this.client.post('/api/chat/search', {
      query,
      documentId,
      ...options
    });
    return res.data;
  }

  async getChatHistory(options?: {
    documentId?: string | null; // null for global chat
    sessionId?: string;
    limit?: number;
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();

    if (options?.documentId !== undefined) {
      params.append('documentId', options.documentId === null ? 'null' : options.documentId);
    }

    if (options?.sessionId) {
      params.append('sessionId', options.sessionId);
    }

    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }

    const res = await this.client.get(`/api/chat/history?${params}`);
    return res.data;
  }

  async clearChat(options?: {
    documentId?: string | null; // null for global chat
    sessionId?: string;
  }): Promise<ApiResponse> {
    const res = await this.client.delete('/api/chat/clear', {
      data: options
    });
    return res.data;
  }


  async healthCheck() {
    const res = await this.client.get('/health');
    return res.data;
  }
}

// Singleton export
export const apiClient = new ApiClient();

// Initialize token expiration check when module loads in browser
if (typeof window !== 'undefined') {
  apiClient.setupTokenExpirationCheck();
}