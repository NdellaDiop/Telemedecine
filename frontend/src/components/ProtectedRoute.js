import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Attendre que l'authentification soit vérifiée
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Vérification de votre session...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    console.log('🔍 Accès non autorisé, redirection vers login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si des rôles sont spécifiés, vérifier l'autorisation
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.log('🔍 Rôle non autorisé:', user?.role, 'Requis:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  // Route protégée accessible
  return children;
};

// Composant pour les routes publiques (quand connecté, rediriger vers dashboard)
export const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="text-muted">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si déjà connecté, rediriger vers le dashboard approprié
  if (isAuthenticated && user) {
    const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : 
                         user.role === 'doctor' ? '/doctor/dashboard' : 
                         '/patient/dashboard';
    
    console.log('🔍 Utilisateur connecté, redirection vers:', dashboardPath);
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Composant pour page non autorisée
export const UnauthorizedPage = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-1 text-danger">403</h1>
        <h2>Accès non autorisé</h2>
        <p className="lead">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <p className="text-muted">
          Connecté en tant que: <strong>{user?.role}</strong>
        </p>
        <div className="mt-4">
          <button className="btn btn-primary me-2" onClick={() => window.history.back()}>
            Retour
          </button>
          <button className="btn btn-outline-secondary" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;