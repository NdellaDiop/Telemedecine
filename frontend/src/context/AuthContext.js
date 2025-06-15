// src/context/AuthContext.js - Version corrigée avec persistance stable
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour sauvegarder l'utilisateur de manière complète
  const saveUserToStorage = (userData, token) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userData.id);
      localStorage.setItem('ihealth_user_full', JSON.stringify(userData));
      localStorage.setItem('ihealth_session_active', 'true');
      console.log('✅ Session sauvegardée:', userData.firstName || userData.name);
    } catch (error) {
      console.error('❌ Erreur sauvegarde session:', error);
    }
  };

  // Fonction pour récupérer l'utilisateur complet
  const getUserFromStorage = () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userFull = localStorage.getItem('ihealth_user_full');
      const sessionActive = localStorage.getItem('ihealth_session_active');
      
      if (token && userId && userFull && sessionActive === 'true') {
        return JSON.parse(userFull);
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération session:', error);
      return null;
    }
  };

  // Fonction pour nettoyer complètement la session
  const clearSession = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('ihealth_user_full');
      localStorage.removeItem('ihealth_session_active');
      localStorage.removeItem('patientProfile');
      localStorage.removeItem('notificationSettings');
      console.log('🧹 Session nettoyée');
    } catch (error) {
      console.error('❌ Erreur nettoyage session:', error);
    }
  };

  // Fonction pour mettre à jour le profil utilisateur
  const updateUser = async (profileData) => {
    try {
      // TODO: Appel API pour mettre à jour le profil
      // const response = await axios.put(`http://localhost:5000/users/${user.id}`, profileData, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });

      // Pour l'instant, on simule et on met à jour localement
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      // Sauvegarder les modifications
      const token = localStorage.getItem('token');
      saveUserToStorage(updatedUser, token);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      throw error;
    }
  };

  // Initialisation robuste au démarrage
  useEffect(() => {
    console.log('🔍 AuthContext - Initialisation robuste');
    
    const initializeAuth = async () => {
      // 1. Vérifier d'abord la session locale
      const storedUser = getUserFromStorage();
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        console.log('🔍 Session locale trouvée pour:', storedUser.firstName || storedUser.name);
        setUser(storedUser);
        setLoading(false);
        return;
      }

      // 2. Si pas de session locale mais token présent, vérifier avec l'API
      if (token && !storedUser) {
        console.log('🔍 Token trouvé mais pas de session locale, vérification API...');
        try {
          const response = await axios.get('http://localhost:5000/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const userId = localStorage.getItem('userId');
          const foundUser = response.data.users.find(u => u.id === parseInt(userId));
          
          if (foundUser) {
            console.log('🔍 Utilisateur vérifié via API:', foundUser.firstName || foundUser.name);
            setUser(foundUser);
            saveUserToStorage(foundUser, token);
          } else {
            console.log('🔍 Utilisateur non trouvé, nettoyage session');
            clearSession();
          }
        } catch (error) {
          console.log('🔍 Erreur vérification API, nettoyage session:', error.message);
          clearSession();
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Fonction login améliorée
  const login = async (email, password) => {
    try {
      console.log('🔍 Tentative de connexion pour:', email);
      setError(null);
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/login', { email, password });
      console.log('🔍 Réponse login:', response.data);
      
      const { access_token, user } = response.data;
      
      // Sauvegarder la session complète
      saveUserToStorage(user, access_token);
      setUser(user);
      
      console.log('✅ Connexion réussie pour:', user.firstName || user.name, 'Role:', user.role);
      return { success: true, user };
    } catch (error) {
      console.log('❌ Erreur login:', error.message);
      const errorMessage = error.response?.data?.error || 'Erreur de connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Fonction register
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post('http://localhost:5000/register', userData);
      console.log('✅ Inscription réussie:', response.data.message);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log('❌ Erreur inscription:', error.message);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Fonction logout améliorée
  const logout = () => {
    console.log('🔍 Déconnexion de:', user?.firstName || user?.name);
    clearSession();
    setUser(null);
    setError(null);
  };

  // Fonction pour réinitialiser les erreurs
  const resetError = () => {
    setError(null);
  };

  // Propriétés dérivées pour compatibilité
  const isAuthenticated = !!user;
  const role = user?.role || null;

  // Debug des changements d'état (plus détaillé)
  useEffect(() => {
    if (user) {
      console.log('🔍 État AuthContext mis à jour:', {
        userName: user.firstName || user.name,
        email: user.email,
        role: user.role,
        isAuthenticated: isAuthenticated,
        loading: loading,
        hasToken: !!localStorage.getItem('token')
      });
    }
  }, [user, isAuthenticated, loading]);

  // Fonction pour vérifier périodiquement la validité du token
  useEffect(() => {
    if (user && !loading) {
      const checkTokenValidity = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('🔍 Token manquant, déconnexion');
          logout();
          return;
        }

        try {
          // Vérification périodique du token (optionnel)
          const response = await axios.get('http://localhost:5000/users', {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (!response.data.users.find(u => u.id === user.id)) {
            console.log('🔍 Utilisateur non trouvé, déconnexion');
            logout();
          }
        } catch (error) {
          console.log('🔍 Token invalide, déconnexion');
          logout();
        }
      };

      // Vérifier toutes les 5 minutes (optionnel)
      const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, loading]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      isAuthenticated,
      role,
      login, 
      register,
      logout,
      resetError,
      updateUser // Nouvelle fonction pour mettre à jour le profil
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};