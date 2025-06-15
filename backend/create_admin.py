# create_admin.py - Script pour créer un admin via votre API
import requests
import json

def create_admin():
    url = "http://localhost:5000/register"
    
    admin_data = {
        "name": "Administrateur Principal",
        "email": "admin@i-health.com",
        "password": "admin123",
        "role": "admin",
        "phone": "771234567",  # Numéro factice
        "birthdate": "1980-01-01"  # Date factice
    }
    
    try:
        response = requests.post(url, json=admin_data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            print("✅ Admin créé avec succès!")
        else:
            print("❌ Erreur lors de la création de l'admin")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    create_admin()
