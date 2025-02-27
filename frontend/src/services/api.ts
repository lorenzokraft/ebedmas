const API_BASE_URL = 'http://localhost:5000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
}

interface TopicDetails {
  id: number;
  name: string;
  description: string;
  stats: {
    skills: number;
    games: number;
  };
}

interface Section {
  id: number;
  name: string;
  questionCount: number;
  topic_id: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const api = {
  // Auth endpoints
  async checkEmailAvailability(email: string) {
    try {
      console.log('Making API request to check email:', email);
      const response = await fetch(`${API_BASE_URL}/users/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('API response status:', response.status);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      console.log('API response data:', data);
      return data;
    } catch (error) {
      console.error('Error checking email:', error);
      throw error;
    }
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.token) {
        throw new Error('No token received');
      }

      const adminRoles = ['admin', 'super_admin'];
      if (!adminRoles.includes(data.user.role)) {
        throw new Error('Admin access required');
      }

      localStorage.setItem('adminToken', data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response;
  },

  // Default pricing endpoints
  getDefaultPricing: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/default-pricing`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch default pricing');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching default pricing:', error);
      throw error;
    }
  },

  updateDefaultPricing: async (pricingData: any) => {
    const response = await fetch(`${API_BASE_URL}/subscriptions/default-pricing`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(pricingData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update default pricing');
    }
    
    return response.json();
  },

  // Topics endpoints
  getTopicDetails: async (topicId: string): Promise<TopicDetails> => {
    const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Sections endpoints
  getSectionsByTopic: async (topicId: string): Promise<Section[]> => {
    const response = await fetch(`${API_BASE_URL}/sections/by-topic/${topicId}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Stats endpoints
  getSubjectStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subjects/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch subject stats');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error loading stats:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch subject stats');
    }
  }
};

export default api;