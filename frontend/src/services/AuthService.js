// Authentication service functions
export const authService = {
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  },
  
  logout: () => {
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
