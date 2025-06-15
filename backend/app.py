import os
import uuid
import re
import requests
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from flask_mail import Mail, Message
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from security.password_utils import hash_password, verify_password

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Configuration de Flask-JWT-Extended
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

# Configuration des serveurs Orthanc
ORTHANC_SERVERS = [
    {"url": "http://172.20.10.3:8042", "name": "Orthanc Server 1", "auth": (os.getenv("ORTHANC_USERNAME", "admin"), os.getenv("ORTHANC_PASSWORD", "telemed2025"))},
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
    """
    Valide le code d'invitation pour les assistants médicaux
    Pour l'instant, on accepte tous les codes qui commencent par 'ASST-'
    À adapter selon vos besoins
    """
    if not invitation_code:
        return False
    
    # Pour l'instant, codes valides : ASST-XXX
    return invitation_code.startswith('ASST-') and len(invitation_code) >= 8

@app.route('/')
def home():
    return jsonify({"message": "Bienvenue sur la plateforme i-health !"})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
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

    # Validation des champs obligatoires
    if not all([email, plain_password, role, name]):
        return jsonify({"error": "Email, mot de passe, rôle et nom sont requis"}), 400

    if role not in ['patient', 'doctor', 'assistant', 'admin']:
        return jsonify({"error": "Rôle invalide"}), 400

    # Validation d'email
    email_regex = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Adresse email invalide"}), 400

    # Validation spécifique aux rôles
    if role == 'patient':
        if not phone or not re.match(r'^(7[0678])[0-9]{7}$', phone):
            return jsonify({"error": "Numéro de téléphone requis et invalide pour un patient"}), 400
        if not birthdate:
            return jsonify({"error": "Date de naissance requise pour un patient"}), 400
        try:
            birthdate_date = datetime.strptime(birthdate, '%Y-%m-%d')
            if birthdate_date > datetime.now():
                return jsonify({"error": "Date de naissance doit être dans le passé"}), 400
        except ValueError:
            return jsonify({"error": "Format de date invalide (YYYY-MM-DD)"}), 400

    if role == 'assistant':
        if not invitation_code:
            return jsonify({"error": "Code d'invitation requis pour les assistants"}), 400
        # Vérifier le code d'invitation (logique à implémenter)
        if not validate_invitation_code(invitation_code):
            return jsonify({"error": "Code d'invitation invalide"}), 400

    if role == 'doctor':
        if not all([speciality, license_number, work_location]):
            return jsonify({"error": "Spécialité, numéro de licence et lieu de travail requis pour un médecin"}), 400

    hashed_password = hash_password(plain_password)

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
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

        # Insérer dans medical_records pour les patients
        if role == 'patient' and (medical_history or allergies):
           cur.execute(
    """INSERT INTO medical_records (patient_id, medical_history, allergies, consultation_notes, analysis_results)
       VALUES (%s, %s, %s, %s, %s)
       ON CONFLICT (patient_id) DO NOTHING""",
    (user_id, medical_history or None, allergies or None, None, None)
)

        conn.commit()
        return jsonify({"message": "Inscription réussie.", "user_id": user_id}), 201
    except psycopg2.IntegrityError:
        conn.rollback()
        return jsonify({"error": "Email déjà utilisé"}), 400
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Erreur : {str(e)}"}), 500
    finally:
        cur.close()
        release_db_connection(conn)

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
    appointment_date = data.get('appointment_date')

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        
        if current_user_role != 'admin' and current_user_id != patient_id:
            return jsonify({"error": "Non autorisé à créer ce rendez-vous"}), 403

        cur.execute(
            """
            INSERT INTO appointments (patient_id, doctor_id, appointment_date) 
            VALUES (%s, %s, %s) RETURNING id""",
            (patient_id, doctor_id, appointment_date)
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
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        
        if current_user_role != 'admin' and current_user_id != user_id:
            return jsonify({"error": "Non autorisé à voir ces rendez-vous"}), 403

        cur.execute(
            """
            SELECT a.id, a.appointment_date, a.doctor_id, u2.name AS doctor_name, u2.speciality AS specialty
            FROM appointments a
            JOIN users u2 ON a.doctor_id = u2.id
            WHERE a.patient_id = %s
            ORDER BY a.appointment_date""",
            (user_id,)
        )
        appointments = cur.fetchall()
        return jsonify(appointments), 200
    except Exception as e:
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
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']
        
        # Vérifier que l'utilisateur est le médecin ou un admin
        if current_user_role != 'admin' and current_user_id != doctor_id:
            return jsonify({"error": "Non autorisé à voir ces patients"}), 403
            
        # Récupérer tous les patients qui ont pris RDV avec ce médecin
        cur.execute(
            """
            SELECT DISTINCT 
                u.id, u.name, u.email, u.phone, u.birthdate,
                mr.medical_history, mr.allergies,
                COUNT(a.id) as total_appointments,
                MAX(a.appointment_date) as last_appointment,
                MIN(CASE WHEN a.appointment_date >= CURRENT_TIMESTAMP THEN a.appointment_date END) as next_appointment
            FROM users u
            JOIN appointments a ON u.id = a.patient_id
            LEFT JOIN medical_records mr ON u.id = mr.patient_id
            WHERE a.doctor_id = %s AND u.role = 'patient'
            GROUP BY u.id, u.name, u.email, u.phone, u.birthdate, mr.medical_history, mr.allergies
            ORDER BY MAX(a.appointment_date) DESC
            """,
            (doctor_id,)
        )
        patients = cur.fetchall()
        return jsonify({"patients": patients}), 200
        
    except Exception as e:
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
    user_id = data.get('user_id')
    metric_type = data.get('metric_type')
    value = data.get('value')

    if not all([user_id, metric_type, value]):
        return jsonify({"error": "Données manquantes"}), 400

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT role FROM users WHERE id = %s", (current_user_id,))
        current_user_role = cur.fetchone()['role']

        if current_user_role != 'admin' and current_user_id != user_id:
            return jsonify({"error": "Non autorisé à ajouter cette donnée"}), 403

        cur.execute(
            """
            INSERT INTO health_metrics (user_id, metric_type, value, recorded_at) 
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP) 
            RETURNING id""",
            (user_id, metric_type, value)
        )
        metric_id = cur.fetchone()['id']
        conn.commit()
        return jsonify({"message": "Donnée de santé ajoutée", "metric_id": metric_id}), 201
    except Exception as e:
        conn.rollback()
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
