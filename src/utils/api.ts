import axios from 'axios';
import { API_URL } from './config-global';
import { QueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

let logoutCallback: (() => void) | null = null;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

api.interceptors.request.use(config => {
  const token = Cookies.get("__accessToken_");
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;


    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const accessToken = Cookies.get("__accessToken_");
      const refreshToken = Cookies.get("__refreshToken_");

      console.log(document.cookie);

      if (!refreshToken || !accessToken) {
        if (logoutCallback) {
          logoutCallback();
          localStorage.clear();
        }
        return Promise.reject(error);
      }

      try {
        await api.get(`${API_URL}${endpoints.auth.rotateToken}`, { withCredentials: true });

        const newAccessToken = Cookies.get("__accessToken_");

        console.log(newAccessToken);

        if (!newAccessToken) {
          throw new Error("Failed to refresh access token");
        }

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        Cookies.remove("__accessToken_");
        Cookies.remove("__refreshToken_");
        if (logoutCallback) {
          logoutCallback();
          localStorage.clear();
        }
        return Promise.reject(refreshError);
      }
    } else if (error.response && error.response.status === 401) {
      if (logoutCallback) {
        logoutCallback();
        localStorage.clear();
      }
    }

    return Promise.reject(error);
  }
);

export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 3 },
  },
});
export const endpoints = {
  google: {
    callback: "/auth/google"
  },
  user: {
    login: '/user/login',
    register: '/user/signup',
  },
  problems: {
    all: (page: number) => `/ctf/problems?page=${page}`,
    one: (id: string) => `/ctf/problem/${id}`
  },
  filter: {
    static: '/filter',
    course: '/filter/course',
  },

  course: { list: "/courses/list", details: (id: string) => `/courses/details/${id}` },
  search: {
    query: '/search',
  },
  country: {
    search: '/country/search',
    list: '/country/list',
    details: (id: string) => `/country/overview/${id}`,
  },
  FAQ: '/faq',
  university: {
    search: '/university/search',
    list: '/university/list',
    home: '/university/home',
    details: (id: string) => `/university/details/${id}`,
  },
  auth: {
    login: '/login',
    register: '/register',
    logout: '/auth/logout',
    rotateToken: "/auth/rotateToken",
  },
  password: {
    changePassword: '/change-password',
    forgotPassword: '/password/forgot',
    resetPassword: '/password/reset',
  },
};

export default api;
