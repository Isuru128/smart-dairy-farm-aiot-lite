import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.success && response.data?.accessToken) {
      localStorage.setItem('dairyfarm_token', response.data.accessToken);
      localStorage.setItem('dairyfarm_user', JSON.stringify(response.data.user));
    }
    return response;
  },

  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  logout: () => {
    localStorage.removeItem('dairyfarm_token');
    localStorage.removeItem('dairyfarm_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('dairyfarm_user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
