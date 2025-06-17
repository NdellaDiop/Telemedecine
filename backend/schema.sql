-- Ajouter la colonne phone à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Mettre à jour la structure de la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'assistant', 'admin')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    birthdate DATE,
    speciality VARCHAR(100),
    license_number VARCHAR(50),
    work_location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT valid_phone CHECK (phone ~ '^(7[0678])[0-9]{7}$')
);

-- Ajouter les colonnes manquantes à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birthdate DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS speciality VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Supprimer d'abord la contrainte existante si elle existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
END $$;

-- Recréer la contrainte avec les valeurs correctes
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('patient', 'doctor', 'assistant', 'admin'));

-- Ajouter les contraintes si elles n'existent pas
DO $$ 
BEGIN
    -- Contrainte sur le numéro de téléphone
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_phone') THEN
        ALTER TABLE users ADD CONSTRAINT valid_phone 
        CHECK (phone ~ '^(7[0678])[0-9]{7}$');
    END IF;
END $$; 

-- Table pour les dossiers médicaux
CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    medical_history TEXT,
    allergies TEXT,
    medications TEXT,
    family_history TEXT,
    social_history TEXT,
    last_physical_exam TIMESTAMP,
    vital_signs JSONB,
    lab_results JSONB,
    imaging_results JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    UNIQUE(patient_id)
);

-- Table pour les consultations
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id),
    doctor_id INTEGER REFERENCES users(id),
    patient_id INTEGER REFERENCES users(id),
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mise à jour de la table medical_records
ALTER TABLE medical_records 
ADD COLUMN IF NOT EXISTS family_history TEXT,
ADD COLUMN IF NOT EXISTS lifestyle TEXT,
ADD COLUMN IF NOT EXISTS vaccinations TEXT;

-- Table pour les prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES users(id),
    patient_id INTEGER REFERENCES users(id),
    appointment_id INTEGER REFERENCES appointments(id),
    medications JSONB,
    instructions TEXT,
    duration TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id ON prescriptions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Table pour les rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES users(id),
    doctor_id INTEGER NOT NULL REFERENCES users(id),
    appointment_datetime TIMESTAMP NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    duration INTEGER NOT NULL DEFAULT 30,
    is_urgent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_appointment_time CHECK (appointment_datetime > CURRENT_TIMESTAMP)
);

-- Création des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_datetime);

-- Création de la table invitation_codes
CREATE TABLE IF NOT EXISTS invitation_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('doctor', 'assistant')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN DEFAULT FALSE,
    used_by INTEGER REFERENCES users(id),
    CONSTRAINT valid_code_format CHECK (
        (role = 'doctor' AND code ~ '^DR-[0-9]{3}$') OR
        (role = 'assistant' AND code ~ '^ASST-[0-9]{3}$')
    )
);

-- Création d'un index sur le code pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_invitation_codes_code ON invitation_codes(code);

-- Création d'un index sur le rôle pour filtrer les codes par type
CREATE INDEX IF NOT EXISTS idx_invitation_codes_role ON invitation_codes(role);

-- Création d'un index sur is_used pour filtrer les codes disponibles
CREATE INDEX IF NOT EXISTS idx_invitation_codes_is_used ON invitation_codes(is_used);

-- Supprimer la table si elle existe déjà pour éviter les conflits
DROP TABLE IF EXISTS dicom_files CASCADE;

-- Table pour les fichiers DICOM
CREATE TABLE dicom_files (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id),
    doctor_id INTEGER REFERENCES users(id),
    appointment_id INTEGER REFERENCES appointments(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    dicom_metadata JSONB,
    study_instance_uid VARCHAR(255),
    series_instance_uid VARCHAR(255),
    sop_instance_uid VARCHAR(255),
    study_date DATE,
    modality VARCHAR(50),
    body_part VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances des recherches
CREATE INDEX idx_dicom_files_patient_id ON dicom_files(patient_id);
CREATE INDEX idx_dicom_files_doctor_id ON dicom_files(doctor_id);
CREATE INDEX idx_dicom_files_appointment_id ON dicom_files(appointment_id);
CREATE INDEX idx_dicom_files_study_instance_uid ON dicom_files(study_instance_uid);
CREATE INDEX idx_dicom_files_series_instance_uid ON dicom_files(series_instance_uid);

-- Insertion d'un fichier DICOM
INSERT INTO dicom_files (
    patient_id,
    doctor_id,
    appointment_id,
    file_name,
    file_path,
    file_size,
    mime_type,
    dicom_metadata,
    study_instance_uid,
    series_instance_uid,
    sop_instance_uid,
    study_date,
    modality,
    body_part,
    description
) VALUES (
    5, -- patient_id (Tsunade)
    6, -- doctor_id (Luomen)
    3, -- appointment_id (rendez-vous complété du 22/03/2024)
    '1-034.dcm',
    'backend/storage/dicom/1-034.dcm',
    1048576,
    'application/dicom',
    '{
        "PatientName": "BATHIAN^Tsunade",
        "PatientID": "P12345",
        "StudyDate": "20240322",
        "StudyTime": "091500",
        "AccessionNumber": "ACC123",
        "StudyDescription": "CT Thorax",
        "SeriesDescription": "Axial",
        "ImageType": ["DERIVED", "PRIMARY", "AXIAL"],
        "SliceThickness": "1.0",
        "KVP": "120",
        "ExposureTime": "1000",
        "XRayTubeCurrent": "200",
        "Exposure": "200",
        "FilterType": "BODY",
        "ConvolutionKernel": "B30f",
        "PixelSpacing": ["0.5", "0.5"],
        "WindowCenter": "40",
        "WindowWidth": "400"
    }'::jsonb,
    '1.2.3.4.5.6.7.8.9.0',
    '1.2.3.4.5.6.7.8.9.1',
    '1.2.3.4.5.6.7.8.9.2',
    '2024-03-22',
    'CT',
    'CHEST',
    'CT Thorax sans injection - Consultation Dr. Luomen'
); 