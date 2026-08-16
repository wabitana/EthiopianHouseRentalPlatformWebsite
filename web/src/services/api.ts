import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT from Zustand persisted localStorage
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const zustandState = localStorage.getItem('auth-storage');
      if (zustandState) {
        const parsed = JSON.parse(zustandState);
        const token = parsed?.state?.accessToken;
        if (token && config.headers) {
          config.headers['Authorization'] = 'Bearer ' + token;
        }
      }
    } catch {}
  }
  return config;
});

// Unwrap response.data and normalize errors
axiosInstance.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Request failed';
    return Promise.reject({ error: { message }, status: error.response?.status });
  }
);

export const apiClient = {
  get: (url: string, _auth = false) => axiosInstance.get(url) as Promise<any>,
  post: (url: string, data?: any, _auth = false) => axiosInstance.post(url, data) as Promise<any>,
  put: (url: string, data?: any, _auth = false) => axiosInstance.put(url, data) as Promise<any>,
  patch: (url: string, data?: any, _auth = false) => axiosInstance.patch(url, data) as Promise<any>,
  delete: (url: string, _auth = false) => axiosInstance.delete(url) as Promise<any>,
};

export default axiosInstance;
