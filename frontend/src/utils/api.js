import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Créer une instance axios avec la configuration de base
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
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

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Erreur avec réponse du serveur
            if (error.response.status === 401) {
                // Token expiré ou invalide
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            return Promise.reject(error.response.data);
        }
        // Erreur sans réponse du serveur
        return Promise.reject({
            error: 'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.'
        });
    }
);

export default api;
