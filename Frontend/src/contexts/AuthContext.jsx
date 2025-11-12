import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificare se c'è un token salvato
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Verificare se il token è ancora valido
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: parseInt(decoded.sub),
            nome: decoded.nome,
            email: decoded.email,
            role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User',
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, userId, nome, email: userEmail, role } = response.data;

      localStorage.setItem('token', token);
      setUser({
        id: userId,
        nome,
        email: userEmail,
        role,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Errore durante il login',
      };
    }
  };

  const register = async (nome, email, password) => {
    try {
      await authAPI.register(nome, email, password);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Errore durante la registrazione',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
