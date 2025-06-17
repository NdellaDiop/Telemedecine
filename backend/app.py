import os
import uuid
import re
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from flask_mail import Mail, Message
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from security.password_utils import hash_password, verify_password
import random
import string
import json
from PIL import Image
import numpy as np
import pydicom
from io import BytesIO

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
# Configuration CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Configuration de Flask-JWT-Extended
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Configuration des serveurs Orthanc
ORTHANC_SERVERS = [
    {"url": "http://localhost:8042", "name": "Orthanc Server 1", "auth": (os.getenv("ORTHANC_USERNAME", "orthanc"), os.getenv("ORTHANC_PASSWORD", "orthanc"))},
]

# Configuration de Flask-Mail (simplifiée, sans rappels pour l'instant)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
mail = Mail(app)

# Connexion à PostgreSQL avec pool de connexions
db_pool = SimpleConnectionPool(
    minconn=1,
    maxconn=20,
    dbname="telemedicine",
    user=os.getenv("DB_USER", "telemed_user"),
    password=os.getenv("DB_PASSWORD", "telemed2025"),
    host="localhost"
)

def get_db_connection():
    return db_pool.getconn()

def release_db_connection(conn):
    db_pool.putconn(conn)

def validate_invitation_code(invitation_code):
    if not invitation_code:
        return False
    return invitation_code.startswith('ASST-') and len(invitation_code) >= 8

# Configuration du dossier de stockage des fichiers DICOM
DICOM_STORAGE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'storage', 'dicom')
os.makedirs(DICOM_STORAGE_PATH, exist_ok=True)

@app.route('/')
def home():
    return jsonify({"message": "Bienvenue sur la plateforme i-health !"})

@app.route('/register', methods=['POST'])
def register():
    print("\n=== Début de l'inscription ===")
    data = request.get_json()
    print(f"Données reçues: {data}")

    email = data.get('email')
    plain_password = data.get('password')
    role = data.get('role')
    invitation_code = data.get('invitation_code')
    name = data.get('name')
    phone = data.get('phone')
    birthdate = data.get('birthdate')
    speciality = data.get('speciality')
    license_number = data.get('license_number')
    work_location = data.get('work_location')
    medical_history = data.get('medical_history')
    allergies = data.get('allergies')

    print(f"\nDonnées extraites:")
    print(f"Email: {email}")
    print(f"Rôle: {role}")
    print(f"Nom: {name}")
    print(f"Téléphone: {phone}")
    print(f"Date de naissance: {birthdate}")
    print(f"Code d'invitation: {invitation_code}")
    if role == 'doctor':
        print(f"Spécialité: {speciality}")
        print(f"Numéro de licence: {license_number}")
        print(f"Lieu de travail: {work_location}")

    # Validation des champs obligatoires
    if not all([email, plain_password, role, name]):
        missing_fields = []
        if not email: missing_fields.append('email')
        if not plain_password: missing_fields.append('password')
        if not role: missing_fields.append('role')
        if not name: missing_fields.append('name')
        error_msg = f"Champs obligatoires manquants: {', '.join(missing_fields)}"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 400

    if role not in ['patient', 'doctor', 'assistant', 'admin']:
        error_msg = f"Rôle invalide: {role}. Rôles autorisés: patient, doctor, assistant, admin"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 400

    # Validation d'email
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, email):
        error_msg = f"Adresse email invalide: {email}"
        print(f"❌ {error_msg}")
        return jsonify({"error": error_msg}), 400

    # Validation spécifique aux rôles
    if role == 'patient':
        if not phone or not re.match(r'^(7[0678])[0-9]{7}$', phone):
            error_msg = "Numéro de téléphone requis et invalide pour un patient"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 400
        if not birthdate:
            error_msg = "Date de naissance requise pour un patient"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 400
        try:
            birthdate_date = datetime.strptime(birthdate, '%Y-%m-%d')
            if birthdate_date > datetime.now():
                error_msg = "Date de naissance doit être dans le passé"
                print(f"❌ {error_msg}")
                return jsonify({"error": error_msg}), 400
        except ValueError:
            error_msg = "Format de date invalide (YYYY-MM-DD)"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 400

    if role in ['assistant', 'doctor']:
        if not invitation_code:
            error_msg = f"Code d'invitation requis pour les {role}s"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 400
        if not validate_invitation_code(invitation_code):
            error_msg = f"Code d'invitation invalide pour un {role}. Format attendu: ASST-XXX"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 400
        birthdate = None if not birthdate else birthdate

    if role == 'doctor':
        if not all([speciality, license_number, work_location]):
            missing_fields = []
            if not speciality: missing_fields.append('spécialité')
            if not license_number: missing_fields.append('numéro de licence')
            if not work_location: missing_fields.append('lieu de travail')
            error_msg = f"Champs requis manquants pour un médecin: {', '.join(missing_fields)}"
            print(f"❌ {error_msg}")
            return jsonify({"error": error_msg}), 400

    hashed_password = hash_password(plain_password)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        print("\nTentative d'insertion dans la base de données...")
        if role == 'doctor':
            cur.execute(
                """INSERT INTO users 
                   (email, password, role, name, phone, birthdate, speciality, license_number, work_location) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) 
                   RETURNING id""",
                (email, hashed_password, role, name, phone, birthdate, speciality, license_number, work_location)
            )
        else:
            cur.execute(
                """INSERT INTO users 
                   (email, password, role, name, phone, birthdate) 
                   VALUES (%s, %s, %s, %s, %s, %s) 
                   RETURNING id""",
                (email, hashed_password, role, name, phone, birthdate)
            )
        user_id = cur.fetchone()['id']
        print(f"✅ Utilisateur créé avec succès, ID: {user_id}")

        # Insérer dans medical_records pour les patients
        if role == 'patient' and (medical_history or allergies):
            cur.execute(
                """INSERT INTO medical_records (patient_id, medical_history, allergies, consultation_notes, analysis_results)
                   VALUES (%s, %s, %s, %s, %s)
                   ON CONFLICT (patient_id) DO NOTHING""",
                (user_id, medical_history or None, allergies or None, None, None)
            )
            print("✅ Dossier médical créé avec succès")

        conn.commit()
        print("✅ Transaction validée")
        return jsonify({"message": "Inscription réussie.", "user_id": user_id}), 201

    except psycopg2.IntegrityError as e:
        conn.rollback()
        error_msg = str(e)
        print(f"❌ Erreur d'intégrité: {error_msg}")
        if "users_email_key" in error_msg:
            return jsonify({"error": "Cette adresse email est déjà utilisée"}), 400
        return jsonify({"error": f"Erreur de base de données: {error_msg}"}), 400
    except Exception as e:
        conn.rollback()
        error_msg = str(e)
        print(f"❌ Erreur inattendue: {error_msg}")
        return jsonify({"error": f"Erreur lors de l'inscription: {error_msg}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)
        print("=== Fin de l'inscription ===\n")

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    plain_password = data.get('password')

    if not all([email, plain_password]):
        return jsonify({"error": "Email et mot de passe requis"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "SELECT id, email, password, role, name FROM users WHERE email = %s AND is_active = TRUE",
            (email,)
        )
        user = cur.fetchone()
        if not user:
            return jsonify({"error": "Utilisateur non trouvé ou désactivé"}), 401

        if user and verify_password(plain_password, user['password']):
            access_token = create_access_token(identity=user['id'], additional_claims={'role': user['role']})
            cur.execute("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s", (user['id'],))
            conn.commit()
            return jsonify({
                "message": "Connexion réussie",
                "access_token": access_token,
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "role": user['role'],
                    "name": user['name']
                }
            }), 200
        else:
            return jsonify({"error": "Email ou mot de passe incorrect"}), 401
    except Exception as e:
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient_profile(patient_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']

        if current_user_role == 'admin' or current_user_role == 'doctor' or current_user_id == patient_id:
            cur.execute(
                """
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    u.birthdate, 
                    m.consultation_notes AS medical_history
                FROM users u
                LEFT JOIN medical_records m ON u.id = m.patient_id
                WHERE u.id = %s AND u.role = 'patient'
                """, 
                (patient_id,)
            )
            patient_profile = cur.fetchone()
            if patient_profile:
                return jsonify(patient_profile), 200
            else:
                return jsonify({"error": "Profil patient non trouvé"}), 404
        else:
            return jsonify({"error": "Non autorisé à voir le profil de ce patient"}), 403
    except Exception as e:
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctors', methods=['GET'])
@jwt_required()
def get_doctors():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """SELECT id, name, speciality, work_location 
               FROM users WHERE role = 'doctor' AND is_active = TRUE"""
        )
        doctors = cur.fetchall()
        return jsonify({"doctors": doctors}), 200
    except Exception as e:
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')
    appointment_datetime = data.get('appointment_datetime')
    reason = data.get('reason')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        
        # Vérifier les permissions
        if current_user_role == 'admin':
            # Les admins peuvent tout faire
            pass
        elif current_user_role == 'doctor' and current_user_id == doctor_id:
            # Les médecins peuvent créer des rendez-vous pour eux-mêmes
            pass
        elif current_user_role == 'patient' and current_user_id == patient_id:
            # Les patients peuvent créer des rendez-vous pour eux-mêmes
            pass
        else:
            return jsonify({"error": "Non autorisé à créer ce rendez-vous"}), 403

        cur.execute(
            """
            INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, reason) 
            VALUES (%s, %s, %s, %s) RETURNING id""",
            (patient_id, doctor_id, appointment_datetime, reason)
        )
        appointment_id = cur.fetchone()['id']
        conn.commit()

        return jsonify({"message": "Rendez-vous créé", "appointment_id": appointment_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/appointments/<int:user_id>', methods=['GET'])
@jwt_required()
def get_appointments(user_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        print(f"\n🔍 GET /appointments/{user_id} - User {current_user_id} requesting appointments")
        
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        print(f"🔍 Current user role: {current_user_role}")
        
        if current_user_role != 'admin' and current_user_id != user_id:
            print("❌ Unauthorized access attempt")
            return jsonify({"error": "Non autorisé à voir ces rendez-vous"}), 403

        # Déterminer si l'utilisateur est un médecin ou un patient
        cur.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        user_role = cur.fetchone()['role']
        print(f"🔍 Requested user role: {user_role}")
        
        if user_role == 'doctor':
            print("🔍 Fetching appointments for doctor")
            # Pour un médecin, retourner tous ses rendez-vous
            cur.execute(
                """
                SELECT 
                    a.id, 
                    a.appointment_datetime, 
                    a.doctor_id, 
                    a.patient_id,
                    a.reason,
                    a.status,
                    a.duration,
                    a.is_video,
                    a.notes,
                    u1.name AS patient_name,
                    u1.phone AS patient_phone,
                    u2.name AS doctor_name, 
                    u2.speciality AS specialty
                FROM appointments a
                JOIN users u1 ON a.patient_id = u1.id
                JOIN users u2 ON a.doctor_id = u2.id
                WHERE a.doctor_id = %s
                ORDER BY a.appointment_datetime""",
                (user_id,)
            )
        else:
            print("🔍 Fetching appointments for patient")
            # Pour un patient, retourner ses rendez-vous
            cur.execute(
                """
                SELECT 
                    a.id, 
                    a.appointment_datetime, 
                    a.doctor_id, 
                    a.patient_id,
                    a.reason,
                    a.status,
                    a.duration,
                    a.is_video,
                    a.notes,
                    u1.name AS patient_name,
                    u1.phone AS patient_phone,
                    u2.name AS doctor_name, 
                    u2.speciality AS specialty
                FROM appointments a
                JOIN users u1 ON a.patient_id = u1.id
                JOIN users u2 ON a.doctor_id = u2.id
                WHERE a.patient_id = %s
                ORDER BY a.appointment_datetime""",
                (user_id,)
            )
        appointments = cur.fetchall()
        print(f"🔍 Found {len(appointments)} appointments:")
        for apt in appointments:
            print(f"  - RDV {apt['id']}: {apt['appointment_datetime']} - Dr. {apt['doctor_name']} - Patient: {apt['patient_name']}")
        
        return jsonify(appointments), 200
    except Exception as e:
        print(f"❌ Error in get_appointments: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctor/<int:doctor_id>/patients', methods=['GET'])
@jwt_required()
def get_doctor_patients(doctor_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à voir les patients"}), 403

        # Vérifier que le médecin demandé est le même que l'utilisateur connecté
        if current_user_id != doctor_id:
            return jsonify({"error": "Non autorisé à voir les patients d'un autre médecin"}), 403
            
        # Récupérer les patients du médecin avec leurs informations médicales
        cur.execute("""
            SELECT DISTINCT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.birthdate,
                mr.medical_history,
                mr.allergies,
                COUNT(a.id) as total_appointments,
                MAX(a.appointment_datetime) as last_appointment,
                MIN(CASE WHEN a.appointment_datetime >= CURRENT_TIMESTAMP THEN a.appointment_datetime END) as next_appointment
            FROM users u
            JOIN appointments a ON u.id = a.patient_id
            LEFT JOIN medical_records mr ON u.id = mr.patient_id
            WHERE a.doctor_id = %s AND u.role = 'patient'
            GROUP BY u.id, u.name, u.email, u.phone, u.birthdate, mr.medical_history, mr.allergies
            ORDER BY u.name
        """, (doctor_id,))
        patients = cur.fetchall()
        return jsonify({"patients": patients}), 200
        
    except Exception as e:
        print(f"❌ Error in get_doctor_patients: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctor/patients/<int:patient_id>/medical-record', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def create_medical_record(patient_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Vérifier si l'utilisateur est un médecin
        cursor.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cursor.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({'error': 'Accès non autorisé'}), 403
            
        if request.method == 'GET':
            # Récupérer le dossier médical du patient
            cursor.execute("""
                SELECT mr.*, u.name as patient_name
                FROM medical_records mr
                JOIN users u ON mr.patient_id = u.id
                WHERE mr.patient_id = %s
                ORDER BY mr.created_at DESC
            """, (patient_id,))
            records = cursor.fetchall()
            
            if not records:
                return jsonify({'message': 'Aucun dossier médical trouvé', 'records': []}), 200
                
            return jsonify({
                'message': 'Dossier médical récupéré avec succès',
                'records': records
            }), 200
            
        # Logique existante pour POST
        data = request.get_json()
        cur.execute("""
            INSERT INTO medical_records (
                patient_id,
                medical_history,
                allergies,
                family_history,
                lifestyle,
                vaccinations,
                created_at,
                updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        """, (
            patient_id,
            data.get('medical_history'),
            data.get('allergies'),
            data.get('family_history'),
            data.get('lifestyle'),
            data.get('vaccinations')
        ))
        medical_record = cursor.fetchone()
        conn.commit()
        print("✅ Dossier médical créé avec succès")
        return jsonify(medical_record), 201

    except Exception as e:
        conn.rollback()
        print(f"❌ Error in create_medical_record: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cursor.close()
        release_db_connection(conn)

@app.route('/doctor/patients/<int:patient_id>/consultations', methods=['GET'])
@jwt_required()
def get_patient_consultations(patient_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à voir les consultations"}), 403

        # Récupérer l'historique des consultations
        cur.execute("""
            SELECT 
                c.id,
                c.appointment_id,
                c.doctor_id,
                d.name as doctor_name,
                d.speciality as doctor_speciality,
                c.patient_id,
                p.name as patient_name,
                c.diagnosis,
                c.treatment_plan,
                c.notes,
                c.created_at,
                c.updated_at,
                a.appointment_datetime,
                a.status as appointment_status
            FROM consultations c
            JOIN appointments a ON c.appointment_id = a.id
            JOIN users d ON c.doctor_id = d.id
            JOIN users p ON c.patient_id = p.id
            WHERE c.patient_id = %s
            ORDER BY a.appointment_datetime DESC
        """, (patient_id,))
        consultations = cur.fetchall()
        return jsonify({"consultations": consultations}), 200

    except Exception as e:
        print(f"❌ Error in get_patient_consultations: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctor/appointments', methods=['GET'])
@jwt_required()
def get_doctor_appointments():
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à voir les rendez-vous"}), 403

        # Récupérer les rendez-vous du médecin
        cur.execute("""
            SELECT 
                a.*,
                p.name as patient_name,
                p.phone as patient_phone,
                p.email as patient_email
            FROM appointments a
            JOIN users p ON a.patient_id = p.id
            WHERE a.doctor_id = %s
            ORDER BY a.appointment_datetime DESC
        """, (current_user_id,))
        appointments = cur.fetchall()
        return jsonify(appointments), 200

    except Exception as e:
        print(f"❌ Error in get_doctor_appointments: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/agenda/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_agenda(doctor_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        if current_user_role != 'admin' and current_user_role != 'doctor' and current_user_id != doctor_id:
            return jsonify({"error": "Non autorisé à consulter cet agenda"}), 403

        cur.execute(
            """
            SELECT slot_date, duration, status
            FROM availability_slots
            WHERE doctor_id = %s
            ORDER BY slot_date""",
            (doctor_id,)
        )
        slots = cur.fetchall()
        return jsonify({"agenda": slots}), 200
    except Exception as e:
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/agenda/slots', methods=['POST'])
@jwt_required()
def add_availability_slot():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    doctor_id = data.get('doctor_id')
    slot_date = data.get('slot_date')
    slot_duration = data.get('slot_duration', 30)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        if current_user_role != 'admin' and current_user_role != 'doctor' and current_user_id != doctor_id:
            return jsonify({"error": "Non autorisé à ajouter des créneaux"}), 403

        cur.execute(
            """
            INSERT INTO availability_slots (doctor_id, slot_date, duration, status)
            VALUES (%s, %s, %s, 'available')
            RETURNING id""",
            (doctor_id, slot_date, slot_duration)
        )
        slot_id = cur.fetchone()['id']
        conn.commit()
        return jsonify({"message": "Créneau ajouté", "slot_id": slot_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/medical-record/<int:patient_id>', methods=['GET', 'POST'])
@jwt_required()
def manage_medical_record(patient_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        if current_user_role != 'admin' and current_user_role != 'doctor' and current_user_id != patient_id:
            return jsonify({"error": "Non autorisé à accéder au dossier médical"}), 403

        if request.method == 'GET':
            cur.execute(
                """
                SELECT medical_history, allergies, consultation_notes, analysis_results, updated_at
                FROM medical_records
                WHERE patient_id = %s""",
                (patient_id,)
            )
            record = cur.fetchone()
            return jsonify(record or {"message": "Aucun dossier médical trouvé"}), 200

        if request.method == 'POST':
            data = request.get_json()
            medical_history = data.get('medical_history')
            allergies = data.get('allergies')
            consultation_notes = data.get('consultation_notes')
            analysis_results = data.get('analysis_results')

            cur.execute(
                """
                INSERT INTO medical_records (patient_id, medical_history, allergies, consultation_notes, analysis_results)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (patient_id)
                DO UPDATE SET
                    medical_history = EXCLUDED.medical_history,
                    allergies = EXCLUDED.allergies,
                    consultation_notes = EXCLUDED.consultation_notes,
                    analysis_results = EXCLUDED.analysis_results,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id""",
                (patient_id, medical_history, allergies, consultation_notes, analysis_results)
            )
            record_id = cur.fetchone()['id']
            conn.commit()
            return jsonify({"message": "Dossier médical mis à jour", "record_id": record_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/medical-assistance/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_medical_assistance(patient_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        if current_user_role != 'admin' and current_user_role != 'doctor' and current_user_id != patient_id:
            return jsonify({"error": "Non autorisé à accéder à l'assistance médicale"}), 403

        # Récupérer les données médicales
        cur.execute(
            """
            SELECT medical_history, allergies, consultation_notes, analysis_results
            FROM medical_records
            WHERE patient_id = %s
            """,
            (patient_id,)
        )
        record = cur.fetchone() or {}

        cur.execute(
            """
            SELECT metric_type, value, recorded_at 
            FROM health_metrics 
            WHERE user_id = %s AND metric_type = 'weight'
            ORDER BY recorded_at DESC LIMIT 1
            """,
            (patient_id,)
        )
        latest_weight = cur.fetchone()

        # Logique simple de recommandations
        recommendations = []
        if record.get('medical_history') and 'hypertension' in record['medical_history'].lower():
            recommendations.append("Consultez un médecin si votre tension artérielle dépasse 140/90 mmHg.")
        if latest_weight and latest_weight['value'] > 100:
            recommendations.append("Un suivi nutritionnel est recommandé en raison d'un poids élevé.")
        if not recommendations:
            recommendations.append("Aucune recommandation spécifique pour le moment. Consultez votre médecin pour un avis personnalisé.")

        return jsonify({"recommendations": recommendations}), 200
    except Exception as e:
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    receiver_id = data.get('receiver_id')
    content = data.get('content')

    if not all([receiver_id, content]):
        return jsonify({"error": "Destinataire et contenu requis"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            "INSERT INTO messages (sender_id, receiver_id, content) VALUES (%s, %s, %s) RETURNING id",
            (current_user_id, receiver_id, content)
        )
        message_id = cur.fetchone()['id']
        conn.commit()
        return jsonify({"message": "Message envoyé", "message_id": message_id}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/health-metrics/<int:user_id>', methods=['GET'])
@jwt_required()
def get_health_metrics(user_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']

        if current_user_role != 'admin' and current_user_id != user_id:
            return jsonify({"error": "Non autorisé à voir ces données de santé"}), 403

        cur.execute(
            """
            SELECT id, metric_type, value, recorded_at
            FROM health_metrics
            WHERE user_id = %s
            ORDER BY recorded_at""",
            (user_id,)
        )
        metrics = cur.fetchall()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/health-metrics', methods=['POST'])
@jwt_required()
def add_health_metric():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    print(f"\n🔍 POST /health-metrics - Données reçues: {data}")
    
    user_id = data.get('user_id')
    metric_type = data.get('metric_type')
    value = data.get('value')
    recorded_at_str = data.get('recorded_at')
    notes = data.get('notes')

    print(f"🔍 Données extraites: user_id={user_id}, metric_type={metric_type}, value={value}, recorded_at={recorded_at_str}, notes={notes}")

    if not all([user_id, metric_type, value]):
        print("❌ Données manquantes")
        return jsonify({"error": "Données manquantes"}), 400

    # Convertir la chaîne en timestamp
    try:
        from datetime import datetime
        recorded_at = datetime.strptime(recorded_at_str, '%Y-%m-%d %H:%M')
        print(f"🔍 Timestamp converti: {recorded_at}")
    except ValueError as e:
        print(f"❌ Erreur de conversion de la date: {str(e)}")
        return jsonify({"error": f"Format de date invalide: {str(e)}"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        print(f"🔍 Rôle de l'utilisateur: {current_user_role}")

        if current_user_role != 'admin' and current_user_id != user_id:
            print("❌ Accès non autorisé")
            return jsonify({"error": "Non autorisé à ajouter cette donnée"}), 403

        print("🔍 Tentative d'insertion dans la base de données...")
        cur.execute(
            """
            INSERT INTO health_metrics (user_id, metric_type, value, recorded_at, notes) 
            VALUES (%s, %s, %s, %s, %s) 
            RETURNING id""",
            (user_id, metric_type, value, recorded_at, notes)
        )
        metric_id = cur.fetchone()['id']
        conn.commit()
        print(f"✅ Métrique ajoutée avec succès, id={metric_id}")
        return jsonify({"message": "Donnée de santé ajoutée", "metric_id": metric_id}), 201
    except Exception as e:
        conn.rollback()
        print(f"❌ Erreur lors de l'ajout de la métrique: {str(e)}")
        print(f"❌ Type d'erreur: {type(e)}")
        import traceback
        print(f"❌ Traceback complet:\n{traceback.format_exc()}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/health-metrics/<int:metric_id>', methods=['DELETE'])
@jwt_required()
def delete_health_metric(metric_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Vérifier que la métrique appartient bien à l'utilisateur
        cur.execute(
            "SELECT user_id FROM health_metrics WHERE id = %s",
            (metric_id,)
        )
        metric = cur.fetchone()
        
        if not metric:
            return jsonify({"error": "Métrique non trouvée"}), 404
            
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        
        # Vérifier les autorisations
        if current_user_role != 'admin' and current_user_id != metric['user_id']:
            return jsonify({"error": "Non autorisé à supprimer cette métrique"}), 403
        
        # Supprimer la métrique
        cur.execute("DELETE FROM health_metrics WHERE id = %s", (metric_id,))
        conn.commit()
        
        return jsonify({"message": "Métrique supprimée avec succès"}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/messages/<int:user_id>', methods=['GET'])
@jwt_required()
def get_messages(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
            current_user_role = cur.fetchone()['role']
            if current_user_role != 'admin':
                return jsonify({"error": "Non autorisé à voir ces messages"}), 403
        finally:
            cur.close()
            release_db_connection(conn)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute(
            """
            SELECT m.id, m.content, m.sent_at, u1.name as sender_name, u2.name as receiver_name
            FROM messages m
            JOIN users u1 ON m.sender_id = u1.id
            JOIN users u2 ON m.receiver_id = u2.id
            WHERE m.sender_id = %s OR m.receiver_id = %s
            ORDER BY m.sent_at""",
            (user_id, user_id)
        )
        messages = cur.fetchall()
        return jsonify({"messages": messages}), 200
    except Exception as e:
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

# Route pour les statistiques admin
@app.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier si l'utilisateur est admin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'admin':
            return jsonify({"error": "Accès non autorisé"}), 403

        # Récupérer les statistiques
        stats = {}
        
        # Total utilisateurs par rôle
        cur.execute("""
            SELECT role, COUNT(*) as count 
            FROM users 
            GROUP BY role
        """)
        role_counts = cur.fetchall()
        stats['totalUsers'] = sum(r['count'] for r in role_counts)
        stats['totalDoctors'] = next((r['count'] for r in role_counts if r['role'] == 'doctor'), 0)
        stats['totalPatients'] = next((r['count'] for r in role_counts if r['role'] == 'patient'), 0)
        stats['totalAssistants'] = next((r['count'] for r in role_counts if r['role'] == 'assistant'), 0)
        
        # Rendez-vous
        cur.execute("SELECT COUNT(*) as count FROM appointments")
        stats['totalAppointments'] = cur.fetchone()['count']
        
        # Rendez-vous aujourd'hui
        cur.execute("""
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE DATE(appointment_datetime) = CURRENT_DATE
        """)
        stats['todayAppointments'] = cur.fetchone()['count']
        
        # Utilisateurs actifs
        cur.execute("SELECT COUNT(*) as count FROM users WHERE is_active = true")
        stats['activeUsers'] = cur.fetchone()['count']
        
        # État du système (simplifié pour l'exemple)
        stats['systemStatus'] = 'healthy'
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        release_db_connection(conn)

# Route pour les statistiques assistant
@app.route('/assistant/stats', methods=['GET'])
@jwt_required()
def get_assistant_stats():
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier si l'utilisateur est assistant
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'assistant':
            return jsonify({"error": "Accès non autorisé"}), 403

        # Récupérer les statistiques
        stats = {}
        
        # Rendez-vous aujourd'hui
        cur.execute("""
            SELECT COUNT(*) as count 
            FROM appointments 
            WHERE DATE(appointment_datetime) = CURRENT_DATE
        """)
        stats['todayAppointments'] = cur.fetchone()['count']
        
        # Total rendez-vous
        cur.execute("SELECT COUNT(*) as count FROM appointments")
        stats['totalAppointments'] = cur.fetchone()['count']
        
        # Total patients
        cur.execute("SELECT COUNT(*) as count FROM users WHERE role = 'patient'")
        stats['totalPatients'] = cur.fetchone()['count']
        
        # Tâches en attente (simplifié pour l'exemple)
        stats['pendingTasks'] = 0
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        release_db_connection(conn)

# Route pour la gestion des utilisateurs (admin)
@app.route('/admin/users', methods=['GET', 'POST'])
@jwt_required()
def manage_users():
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier si l'utilisateur est admin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'admin':
            return jsonify({"error": "Accès non autorisé"}), 403

        if request.method == 'GET':
            # Récupérer tous les utilisateurs
            cur.execute("""
                SELECT id, name, email, role, phone, birthdate, 
                       speciality, license_number, work_location, 
                       is_active, created_at
                FROM users
                ORDER BY created_at DESC
            """)
            users = cur.fetchall()
            return jsonify(users)
        
        elif request.method == 'POST':
            # Créer un nouvel utilisateur
            data = request.get_json()
            required_fields = ['name', 'email', 'role']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Champs requis manquants"}), 400

            # Vérifier si l'email existe déjà
            cur.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
            if cur.fetchone():
                return jsonify({"error": "Cet email est déjà utilisé"}), 400

            # Générer un mot de passe temporaire
            temp_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            hashed_password = hash_password(temp_password)

            # Insérer le nouvel utilisateur
            cur.execute("""
                INSERT INTO users (
                    name, email, password, role, phone, birthdate,
                    speciality, license_number, work_location, is_active
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                data['name'],
                data['email'],
                hashed_password,
                data['role'],
                data.get('phone'),
                data.get('birthdate'),
                data.get('speciality'),
                data.get('license_number'),
                data.get('work_location'),
                data.get('is_active', True)
            ))
            new_user_id = cur.fetchone()['id']
            conn.commit()

            # TODO: Envoyer un email avec le mot de passe temporaire
            # Pour l'instant, on le retourne dans la réponse
            return jsonify({
                "message": "Utilisateur créé avec succès",
                "user_id": new_user_id,
                "temp_password": temp_password
            }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        release_db_connection(conn)

# Route pour modifier/supprimer un utilisateur (admin)
@app.route('/admin/users/<int:user_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_user(user_id):
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier si l'utilisateur est admin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'admin':
            return jsonify({"error": "Accès non autorisé"}), 403

        if request.method == 'PUT':
            # Modifier un utilisateur existant
            data = request.get_json()
            
            # Vérifier si l'utilisateur existe
            cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cur.fetchone():
                return jsonify({"error": "Utilisateur non trouvé"}), 404

            # Mettre à jour l'utilisateur
            update_fields = []
            update_values = []
            for field in ['name', 'email', 'role', 'phone', 'birthdate', 
                         'speciality', 'license_number', 'work_location', 'is_active']:
                if field in data:
                    update_fields.append(f"{field} = %s")
                    update_values.append(data[field])
            
            if update_fields:
                update_values.append(user_id)
                cur.execute(f"""
                    UPDATE users 
                    SET {', '.join(update_fields)}
                    WHERE id = %s
                """, update_values)
                conn.commit()
                return jsonify({"message": "Utilisateur modifié avec succès"})

        elif request.method == 'DELETE':
            # Supprimer un utilisateur
            cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
            if cur.rowcount == 0:
                return jsonify({"error": "Utilisateur non trouvé"}), 404
            conn.commit()
            return jsonify({"message": "Utilisateur supprimé avec succès"})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        release_db_connection(conn)

# Route pour les paramètres système (admin)
@app.route('/admin/settings', methods=['GET', 'PUT'])
@jwt_required()
def manage_system_settings():
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier si l'utilisateur est admin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'admin':
            return jsonify({"error": "Accès non autorisé"}), 403

        if request.method == 'GET':
            # Récupérer les paramètres système
            cur.execute("""
                SELECT setting_key, setting_value, setting_type, description
                FROM system_settings
                ORDER BY setting_key
            """)
            settings = cur.fetchall()
            
            # Convertir les valeurs selon leur type
            formatted_settings = {}
            for setting in settings:
                value = setting['setting_value']
                if setting['setting_type'] == 'boolean':
                    value = value.lower() == 'true'
                elif setting['setting_type'] == 'integer':
                    value = int(value)
                elif setting['setting_type'] == 'float':
                    value = float(value)
                formatted_settings[setting['setting_key']] = value
            
            return jsonify(formatted_settings)

        elif request.method == 'PUT':
            # Mettre à jour les paramètres système
            data = request.get_json()
            
            # Valider les données
            for key, value in data.items():
                # Vérifier si le paramètre existe
                cur.execute("""
                    SELECT setting_type 
                    FROM system_settings 
                    WHERE setting_key = %s
                """, (key,))
                setting = cur.fetchone()
                
                if not setting:
                    return jsonify({"error": f"Paramètre invalide: {key}"}), 400
                
                # Valider le type de la valeur
                try:
                    if setting['setting_type'] == 'boolean':
                        if not isinstance(value, bool):
                            raise ValueError("Valeur booléenne attendue")
                    elif setting['setting_type'] == 'integer':
                        if not isinstance(value, int):
                            raise ValueError("Valeur entière attendue")
                    elif setting['setting_type'] == 'float':
                        if not isinstance(value, (int, float)):
                            raise ValueError("Valeur numérique attendue")
                    elif setting['setting_type'] == 'string':
                        if not isinstance(value, str):
                            raise ValueError("Valeur texte attendue")
                except ValueError as e:
                    return jsonify({"error": f"Type de valeur invalide pour {key}: {str(e)}"}), 400
            
            # Mettre à jour les paramètres
            for key, value in data.items():
                cur.execute("""
                    UPDATE system_settings 
                    SET setting_value = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE setting_key = %s
                """, (str(value), key))
            
            conn.commit()
            return jsonify({"message": "Paramètres mis à jour avec succès"})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        release_db_connection(conn)

# Script d'initialisation des paramètres système
def init_system_settings():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Créer la table si elle n'existe pas
        cur.execute("""
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value TEXT NOT NULL,
                setting_type VARCHAR(20) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Paramètres par défaut
        default_settings = [
            # Paramètres généraux
            ('site_name', 'i-Health', 'string', 'Nom du site'),
            ('maintenance_mode', 'false', 'boolean', 'Mode maintenance'),
            ('max_appointments_per_day', '20', 'integer', 'Nombre maximum de rendez-vous par jour'),
            ('appointment_duration', '30', 'integer', 'Durée des rendez-vous en minutes'),
            
            # Paramètres de sécurité
            ('password_min_length', '8', 'integer', 'Longueur minimale des mots de passe'),
            ('require_special_chars', 'true', 'boolean', 'Caractères spéciaux requis dans les mots de passe'),
            ('session_timeout', '30', 'integer', 'Délai d\'expiration de session en minutes'),
            ('max_login_attempts', '3', 'integer', 'Nombre maximum de tentatives de connexion'),
            
            # Paramètres de notification
            ('email_notifications', 'true', 'boolean', 'Activer les notifications par email'),
            ('sms_notifications', 'false', 'boolean', 'Activer les notifications SMS'),
            ('reminder_before_appointment', '24', 'integer', 'Délai de rappel avant rendez-vous en heures'),
            
            # Paramètres système
            ('backup_frequency', 'daily', 'string', 'Fréquence des sauvegardes'),
            ('log_retention_days', '30', 'integer', 'Durée de conservation des logs en jours'),
            ('debug_mode', 'false', 'boolean', 'Mode debug')
        ]
        
        # Insérer les paramètres par défaut s'ils n'existent pas
        for key, value, type_, description in default_settings:
            cur.execute("""
                INSERT INTO system_settings (setting_key, setting_value, setting_type, description)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (setting_key) DO NOTHING
            """, (key, value, type_, description))
        
        conn.commit()
        print("✅ Paramètres système initialisés avec succès")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erreur lors de l'initialisation des paramètres système: {str(e)}")
    finally:
        cur.close()
        release_db_connection(conn)

# Appeler l'initialisation au démarrage de l'application
init_system_settings()

# Nouvelle route pour générer des codes d'invitation (admin uniquement)
@app.route('/admin/generate-invitation', methods=['POST'])
@jwt_required()
def generate_invitation_code():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    role = data.get('role')
    quantity = data.get('quantity', 1)  # Nombre de codes à générer

    if role not in ['doctor', 'assistant']:
        return jsonify({"error": "Rôle invalide. Doit être 'doctor' ou 'assistant'"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier si l'utilisateur est admin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'admin':
            return jsonify({"error": "Accès non autorisé"}), 403

        # Générer les codes
        codes = []
        for _ in range(quantity):
            if role == 'doctor':
                code = f"DR-{random.randint(100, 999)}"
            else:  # assistant
                code = f"ASST-{random.randint(100, 999)}"
            codes.append(code)

        # Stocker les codes dans la base de données
        for code in codes:
            cur.execute(
                """INSERT INTO invitation_codes (code, role, created_by, is_used)
                   VALUES (%s, %s, %s, FALSE)""",
                (code, role, current_user_id)
            )

        conn.commit()
        return jsonify({
            "message": f"{quantity} code(s) d'invitation généré(s) avec succès",
            "codes": codes
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctor/appointments/<int:appointment_id>/status', methods=['PATCH'])
@jwt_required()
def update_appointment_status(appointment_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    new_status = data.get('status')

    if not new_status:
        return jsonify({"error": "Le statut est requis"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à modifier le statut"}), 403

        # Vérifier que le rendez-vous appartient au médecin
        cur.execute("""
            SELECT doctor_id FROM appointments 
            WHERE id = %s
        """, (appointment_id,))
        appointment = cur.fetchone()
        if not appointment:
            return jsonify({"error": "Rendez-vous non trouvé"}), 404
        if appointment['doctor_id'] != current_user_id:
            return jsonify({"error": "Non autorisé à modifier ce rendez-vous"}), 403

        # Mettre à jour le statut
        cur.execute("""
            UPDATE appointments 
            SET status = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            RETURNING id, status
        """, (new_status, appointment_id))
        
        updated = cur.fetchone()
        conn.commit()

        if updated:
            return jsonify({
                "message": "Statut mis à jour avec succès",
                "appointment": {
                    "id": updated['id'],
                    "status": updated['status']
                }
            }), 200
        else:
            return jsonify({"error": "Erreur lors de la mise à jour du statut"}), 500

    except Exception as e:
        conn.rollback()
        print(f"❌ Error in update_appointment_status: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctor/prescriptions', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_prescriptions():
    if request.method == 'OPTIONS':
        return '', 200
        
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à voir les prescriptions"}), 403

        # Récupérer toutes les prescriptions du médecin
        cur.execute("""
            SELECT 
                p.*,
                u.name as patient_name,
                u.phone as patient_phone,
                a.appointment_datetime,
                a.reason as appointment_reason
            FROM prescriptions p
            JOIN users u ON p.patient_id = u.id
            LEFT JOIN appointments a ON p.appointment_id = a.id
            WHERE p.doctor_id = %s
            ORDER BY p.created_at DESC
        """, (current_user_id,))
        prescriptions = cur.fetchall()
        
        # Convertir les médicaments de JSON string en objet pour chaque prescription
        for prescription in prescriptions:
            if prescription['medications']:
                prescription['medications'] = json.loads(prescription['medications'])
                
        return jsonify({"prescriptions": prescriptions}), 200

    except Exception as e:
        print(f"❌ Error in get_prescriptions: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctor/prescriptions', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_prescription():
    if request.method == 'OPTIONS':
        return '', 200
        
    current_user_id = get_jwt_identity()
    data = request.get_json()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à créer des prescriptions"}), 403

        # Convertir les médicaments en JSON string
        medications_json = json.dumps(data.get('medications', []))

        # Créer la prescription
        cur.execute("""
            INSERT INTO prescriptions (
                doctor_id, patient_id, appointment_id, medications,
                instructions, duration, notes, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            RETURNING *
        """, (
            current_user_id,
            data.get('patient_id'),
            data.get('appointment_id'),
            medications_json,
            data.get('instructions'),
            data.get('duration'),
            data.get('notes')
        ))
        
        new_prescription = cur.fetchone()
        conn.commit()

        # Convertir les médicaments de JSON string en objet pour la réponse
        if new_prescription and 'medications' in new_prescription:
            new_prescription['medications'] = json.loads(new_prescription['medications'])

        return jsonify(new_prescription), 201

    except Exception as e:
        conn.rollback()
        print(f"❌ Error in create_prescription: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctor/patients/<int:patient_id>/prescriptions', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_patient_prescriptions(patient_id):
    if request.method == 'OPTIONS':
        return '', 200
        
    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à voir les prescriptions"}), 403

        # Récupérer les prescriptions du patient
        cur.execute("""
            SELECT 
                p.*,
                u.name as patient_name,
                u.phone as patient_phone,
                a.appointment_datetime,
                a.reason as appointment_reason
            FROM prescriptions p
            JOIN users u ON p.patient_id = u.id
            LEFT JOIN appointments a ON p.appointment_id = a.id
            WHERE p.patient_id = %s AND p.doctor_id = %s
            ORDER BY p.created_at DESC
        """, (patient_id, current_user_id))
        prescriptions = cur.fetchall()
        
        # Convertir les médicaments de JSON string en objet pour chaque prescription
        for prescription in prescriptions:
            if prescription['medications']:
                prescription['medications'] = json.loads(prescription['medications'])
                
        return jsonify({"prescriptions": prescriptions}), 200

    except Exception as e:
        print(f"❌ Error in get_patient_prescriptions: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctor/patients/<int:patient_id>/dicom-files', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_patient_dicom_files(patient_id):
    if request.method == 'OPTIONS':
        return '', 200

    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à accéder aux fichiers DICOM"}), 403

        # Récupérer les fichiers DICOM du patient
        cur.execute("""
            SELECT 
                df.id,
                df.file_name,
                df.file_path,
                df.file_size,
                df.mime_type,
                df.dicom_metadata,
                df.study_date,
                df.modality,
                df.body_part,
                df.description,
                df.created_at,
                df.updated_at,
                d.name as doctor_name
            FROM dicom_files df
            JOIN users d ON df.doctor_id = d.id
            WHERE df.patient_id = %s
            ORDER BY df.created_at DESC
        """, (patient_id,))
        dicom_files = cur.fetchall()

        # Convertir les objets datetime en chaînes ISO
        for file in dicom_files:
            if file['created_at']:
                file['created_at'] = file['created_at'].isoformat()
            if file['updated_at']:
                file['updated_at'] = file['updated_at'].isoformat()
            if file['study_date']:
                file['study_date'] = file['study_date'].isoformat()

        return jsonify(dicom_files), 200

    except Exception as e:
        print(f"❌ Error in get_patient_dicom_files: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/storage/dicom/<path:filename>')
@jwt_required()
def serve_dicom_file(filename):
    if request.method == 'OPTIONS':
        return '', 200

    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à accéder aux fichiers DICOM"}), 403

        # Vérifier que le fichier existe dans la base de données
        cur.execute("""
            SELECT file_path FROM dicom_files 
            WHERE file_name = %s AND (
                doctor_id = %s OR 
                patient_id IN (
                    SELECT patient_id FROM appointments 
                    WHERE doctor_id = %s
                )
            )
        """, (filename, current_user_id, current_user_id))
        file_record = cur.fetchone()

        if not file_record:
            return jsonify({"error": "Fichier non trouvé ou accès non autorisé"}), 404

        return send_from_directory(
            DICOM_STORAGE_PATH,
            filename,
            mimetype='application/dicom',
            as_attachment=False
        )

    except Exception as e:
        print(f"❌ Error in serve_dicom_file: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/doctor/patients', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_doctor_patients_list():
    if request.method == 'OPTIONS':
        return '', 200

    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à voir les patients"}), 403

        # Récupérer les patients du médecin
        cur.execute("""
            SELECT DISTINCT 
                u.id,
                u.name,
                u.email,
                u.phone,
                u.birthdate,
                mr.medical_history,
                mr.allergies,
                COUNT(a.id) as total_appointments,
                MAX(a.appointment_datetime) as last_appointment,
                MIN(CASE WHEN a.appointment_datetime >= CURRENT_TIMESTAMP THEN a.appointment_datetime END) as next_appointment
            FROM users u
            JOIN appointments a ON u.id = a.patient_id
            LEFT JOIN medical_records mr ON u.id = mr.patient_id
            WHERE a.doctor_id = %s AND u.role = 'patient'
            GROUP BY u.id, u.name, u.email, u.phone, u.birthdate, mr.medical_history, mr.allergies
            ORDER BY u.name
        """, (current_user_id,))
        patients = cur.fetchall()

        # Convertir les dates en format ISO
        for patient in patients:
            if patient['birthdate']:
                patient['birthdate'] = patient['birthdate'].isoformat()
            if patient['last_appointment']:
                patient['last_appointment'] = patient['last_appointment'].isoformat()
            if patient['next_appointment']:
                patient['next_appointment'] = patient['next_appointment'].isoformat()

        return jsonify(patients), 200

    except Exception as e:
        print(f"❌ Error in get_doctor_patients_list: {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/api/doctor/dicom-files', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_all_dicom_files():
    if request.method == 'OPTIONS':
        return '', 200

    current_user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Vérifier que l'utilisateur est un médecin
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        user = cur.fetchone()
        if not user or user['role'] != 'doctor':
            return jsonify({"error": "Non autorisé à accéder aux fichiers DICOM"}), 403

        # Récupérer tous les fichiers DICOM accessibles au médecin
        cur.execute("""
            SELECT 
                df.id,
                df.file_name,
                df.file_path,
                df.file_size,
                df.mime_type,
                df.dicom_metadata,
                df.study_date,
                df.modality,
                df.body_part,
                df.description,
                df.created_at,
                df.updated_at,
                p.name as patient_name,
                d.name as doctor_name
            FROM dicom_files df
            JOIN users p ON df.patient_id = p.id
            JOIN users d ON df.doctor_id = d.id
            WHERE df.doctor_id = %s 
               OR df.patient_id IN (
                   SELECT patient_id 
                   FROM appointments 
                   WHERE doctor_id = %s
               )
            ORDER BY df.created_at DESC
        """, (current_user_id, current_user_id))
        dicom_files = cur.fetchall()

        # Convertir les dates en format ISO
        for file in dicom_files:
            if file['created_at']:
                file['created_at'] = file['created_at'].isoformat()
            if file['updated_at']:
                file['updated_at'] = file['updated_at'].isoformat()
            if file['study_date']:
                file['study_date'] = file['study_date'].isoformat()

        return jsonify(dicom_files), 200

    except Exception as e:
        print(f"❌ Erreur lors du chargement des fichiers DICOM (get_all_dicom_files) : {str(e)}")
        return jsonify({"error": f"Erreur lors du chargement des fichiers DICOM : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

@app.route('/api/doctor/dicom-preview/<int:file_id>', methods=['GET'])
@jwt_required()
def get_dicom_preview(file_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Récupérer le chemin du fichier DICOM
        cur.execute("""
            SELECT file_path 
            FROM dicom_files 
            WHERE id = %s
        """, (file_id,))
        
        result = cur.fetchone()
        if not result:
            return jsonify({"error": "Fichier DICOM non trouvé"}), 404
            
        file_path = result['file_path']
        
        # Corrige le chemin en se basant sur la racine du projet (Telemedecine/)
        # Plutôt que le répertoire courant du backend (Telemedecine/backend)
        project_root = os.path.dirname(os.getcwd())
        full_path = os.path.join(project_root, file_path)
        
        print(f"🔍 TENTATIVE DE LECTURE DICOM: {full_path}")

        if not os.path.exists(full_path):
            print(f"❌ Erreur: Fichier non trouvé sur le serveur à {full_path}")
            return jsonify({"error": "Fichier non trouvé sur le serveur"}), 404

        # Lire le fichier DICOM
        try:
            ds = pydicom.dcmread(full_path)
            print(f"✅ Fichier DICOM lu avec succès: {full_path}")
            
            # Convertir en image PIL
            pixel_array = ds.pixel_array
            
            # Normaliser les valeurs entre 0 et 255
            if pixel_array.dtype != np.uint8:
                pixel_array = ((pixel_array - pixel_array.min()) * 255.0 / 
                             (pixel_array.max() - pixel_array.min())).astype(np.uint8)
            
            # Créer une image PIL
            image = Image.fromarray(pixel_array)
            
            # Convertir en JPEG en mémoire
            img_io = BytesIO()
            image.save(img_io, 'JPEG', quality=95)
            img_io.seek(0);
            
            return send_file(
                img_io,
                mimetype='image/jpeg',
                as_attachment=False,
                download_name=f'preview_{file_id}.jpg'
            )
            
        except Exception as e:
            print(f"❌ Erreur lors de la conversion DICOM: {str(e)}")
            # En cas d'erreur, renvoyer une image de placeholder
            placeholder = Image.new('RGB', (512, 512), color='gray')
            img_io = BytesIO()
            placeholder.save(img_io, 'JPEG')
            img_io.seek(0);
            return send_file(
                img_io,
                mimetype='image/jpeg',
                as_attachment=False,
                download_name=f'error_{file_id}.jpg'
            )
            
    except Exception as e:
        print(f"❌ Erreur serveur (get_dicom_preview): {str(e)}")
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            release_db_connection(conn)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
