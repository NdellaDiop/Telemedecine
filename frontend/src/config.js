// Configuration de l'API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configuration des rôles
export const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    PATIENT: 'patient',
    ASSISTANT: 'assistant'
};

// Configuration des routes
export const ROUTES = {
    // Routes publiques
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    
    // Routes patient
    PATIENT_DASHBOARD: '/patient/dashboard',
    PATIENT_APPOINTMENTS: '/patient/appointments',
    PATIENT_PROFILE: '/patient/profile',
    PATIENT_MEDICAL_RECORD: '/patient/medical-record',
    
    // Routes médecin
    DOCTOR_DASHBOARD: '/doctor/dashboard',
    DOCTOR_APPOINTMENTS: '/doctor/appointments',
    DOCTOR_PATIENTS: '/doctor/patients',
    DOCTOR_PROFILE: '/doctor/profile',
    DOCTOR_AGENDA: '/doctor/agenda',
    
    // Routes assistant
    ASSISTANT_DASHBOARD: '/assistant/dashboard',
    ASSISTANT_APPOINTMENTS: '/assistant/appointments',
    ASSISTANT_PATIENTS: '/assistant/patients',
    ASSISTANT_PROFILE: '/assistant/profile',
    
    // Routes admin
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_APPOINTMENTS: '/admin/appointments',
    ADMIN_SETTINGS: '/admin/settings',
    ADMIN_STATS: '/admin/stats'
};

// Configuration des statuts
export const STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
};

// Configuration des types de rendez-vous
export const APPOINTMENT_TYPES = {
    CONSULTATION: 'consultation',
    FOLLOW_UP: 'follow_up',
    EMERGENCY: 'emergency',
    VACCINATION: 'vaccination'
};

// Configuration des durées de rendez-vous (en minutes)
export const APPOINTMENT_DURATIONS = [
    15,
    30,
    45,
    60
];

// Configuration des jours de la semaine
export const WEEKDAYS = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche'
];

// Configuration des heures de travail
export const WORK_HOURS = {
    START: '08:00',
    END: '18:00',
    LUNCH_START: '12:00',
    LUNCH_END: '14:00'
};

// Configuration des messages d'erreur
export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Vous n\'êtes pas autorisé à accéder à cette ressource',
    FORBIDDEN: 'Accès interdit',
    NOT_FOUND: 'Ressource non trouvée',
    SERVER_ERROR: 'Erreur serveur',
    NETWORK_ERROR: 'Erreur de connexion',
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    INVALID_TOKEN: 'Session expirée, veuillez vous reconnecter',
    REQUIRED_FIELDS: 'Veuillez remplir tous les champs obligatoires',
    INVALID_EMAIL: 'Adresse email invalide',
    INVALID_PHONE: 'Numéro de téléphone invalide',
    INVALID_DATE: 'Date invalide',
    PASSWORD_MISMATCH: 'Les mots de passe ne correspondent pas',
    PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
    PASSWORD_NO_SPECIAL: 'Le mot de passe doit contenir au moins un caractère spécial',
    EMAIL_EXISTS: 'Cette adresse email est déjà utilisée',
    PHONE_EXISTS: 'Ce numéro de téléphone est déjà utilisé'
};

// Configuration des messages de succès
export const SUCCESS_MESSAGES = {
    LOGIN: 'Connexion réussie',
    LOGOUT: 'Déconnexion réussie',
    REGISTER: 'Inscription réussie',
    UPDATE: 'Mise à jour réussie',
    DELETE: 'Suppression réussie',
    CREATE: 'Création réussie',
    SAVE: 'Enregistrement réussi',
    SEND: 'Envoi réussi',
    RESET: 'Réinitialisation réussie'
};

// Configuration des limites
export const LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_APPOINTMENTS_PER_DAY: 20,
    MAX_LOGIN_ATTEMPTS: 3,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    PASSWORD_MIN_LENGTH: 8,
    NAME_MAX_LENGTH: 100,
    PHONE_LENGTH: 9,
    DESCRIPTION_MAX_LENGTH: 500
};

// Configuration des types de fichiers autorisés
export const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Configuration des intervalles de temps pour les rappels
export const REMINDER_INTERVALS = [
    { value: 1, label: '1 heure avant' },
    { value: 2, label: '2 heures avant' },
    { value: 4, label: '4 heures avant' },
    { value: 12, label: '12 heures avant' },
    { value: 24, label: '1 jour avant' },
    { value: 48, label: '2 jours avant' }
];

// Configuration des fréquences de sauvegarde
export const BACKUP_FREQUENCIES = [
    { value: 'hourly', label: 'Toutes les heures' },
    { value: 'daily', label: 'Quotidienne' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuelle' }
];

// Configuration des durées de conservation des logs
export const LOG_RETENTION_PERIODS = [
    { value: 7, label: '7 jours' },
    { value: 15, label: '15 jours' },
    { value: 30, label: '30 jours' },
    { value: 60, label: '60 jours' },
    { value: 90, label: '90 jours' }
];

// Configuration des thèmes
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Configuration des langues
export const LANGUAGES = {
    FR: 'fr',
    EN: 'en'
};

// Configuration par défaut
export const DEFAULT_SETTINGS = {
    theme: THEMES.LIGHT,
    language: LANGUAGES.FR,
    appointmentDuration: APPOINTMENT_DURATIONS[1], // 30 minutes
    reminderInterval: REMINDER_INTERVALS[3], // 12 heures
    backupFrequency: BACKUP_FREQUENCIES[1], // daily
    logRetention: LOG_RETENTION_PERIODS[2] // 30 jours
}; 