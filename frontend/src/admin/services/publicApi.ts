import axios from 'axios';

const publicApi = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add a request interceptor to include the token
publicApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default publicApi; 