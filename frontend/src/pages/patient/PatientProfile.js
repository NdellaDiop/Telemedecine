import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Badge, Tab, Tabs } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faEnvelope, faPhone, faMapMarkerAlt, faCalendarAlt, 
  faEdit, faSave, faTimes, faEye, faEyeSlash, faShieldAlt,
  faUserEdit, faCog, faBell, faLock, faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

function PatientProfile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthdate: '',
    address: '',
    city: '',
    postalCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: {
      bloodType: '',
      allergies: '',
      chronicConditions: '',
      medications: ''
    }
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    prescriptionReminders: true,
    healthTips: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        birthdate: user.birthdate || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
        medicalInfo: {
          bloodType: user.bloodType || '',
          allergies: user.allergies || '',
          chronicConditions: user.chronicConditions || '',
          medications: user.medications || ''
        }
      });
    }
    
    // Charger les préférences de notifications depuis le localStorage
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      try {
        setNotificationSettings(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Erreur parsing notifications:', error);
      }
    }
    
    // Charger le profil depuis le localStorage si disponible
    const savedProfile = localStorage.getItem('patientProfile');
    if (savedProfile && !user) {
      try {
        setFormData(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Erreur parsing profil:', error);
      }
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('medical.')) {
      const medicalField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        medicalInfo: {
          ...prev.medicalInfo,
          [medicalField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // TODO: Remplacer par votre vraie API
      // await saveNotificationSettings(notificationSettings);
      
      // Sauvegarde locale pour la démo
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      
      setMessage({ type: 'success', text: 'Préférences de notification sauvegardées !' });
      
      // Auto-effacement du message
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Erreur sauvegarde notifications:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la sauvegarde des préférences.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = () => {
    // Créer un input file invisible
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setMessage({ type: 'danger', text: 'La photo ne doit pas dépasser 5MB.' });
          return;
        }
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          setMessage({ type: 'danger', text: 'Veuillez sélectionner une image valide.' });
          return;
        }
        
        // Créer un aperçu de l'image
        const reader = new FileReader();
        reader.onload = (e) => {
          // TODO: Implémenter l'upload de photo
          setMessage({ type: 'info', text: 'Fonctionnalité de changement de photo en cours de développement.' });
          console.log('Fichier sélectionné:', file.name);
          console.log('Preview URL:', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    
    // Déclencher la sélection de fichier
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validation des champs requis
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setMessage({ type: 'danger', text: 'Veuillez remplir tous les champs obligatoires.' });
        setLoading(false);
        return;
      }

      // Pour l'instant, on simule la sauvegarde
      // TODO: Remplacer par votre vraie API
      
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Si updateUser existe dans le contexte, l'utiliser
      if (updateUser) {
        await updateUser(formData);
      }
      
      // Sauvegarde locale pour la démo
      localStorage.setItem('patientProfile', JSON.stringify(formData));
      
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setEditing(false);
      
      // Auto-effacement du message après 3 secondes
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      setMessage({ type: 'danger', text: 'Erreur lors de la mise à jour du profil. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation des mots de passe
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'danger', text: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'danger', text: 'Les nouveaux mots de passe ne correspondent pas.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Remplacer par votre vraie API
      // await changePassword(passwordData);
      
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Auto-effacement du message
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setMessage({ type: 'danger', text: 'Erreur lors du changement de mot de passe. Vérifiez votre mot de passe actuel.' });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = () => {
    if (!formData.birthdate) return 'Non renseigné';
    const today = new Date();
    const birth = new Date(formData.birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} ans`;
  };

  return (
    <div className="patient-profile">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">Mon Profil</h2>
            <p className="text-muted mb-0">Gérez vos informations personnelles et paramètres</p>
          </div>
          <div>
            <Badge bg="primary" className="me-2">Patient</Badge>
            <Badge bg="success">Compte vérifié</Badge>
          </div>
        </div>
      </div>

      {message.text && (
        <Alert variant={message.type} className="mb-4">
          {message.text}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="profile" title={<span><FontAwesomeIcon icon={faUser} className="me-2" />Profil</span>}>
          <Row>
            <Col lg={8}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">
                      <FontAwesomeIcon icon={faUserEdit} className="me-2 text-primary" />
                      Informations personnelles
                    </h5>
                    {!editing ? (
                      <Button variant="primary" onClick={() => setEditing(true)}>
                        <FontAwesomeIcon icon={faEdit} className="me-2" />
                        Modifier
                      </Button>
                    ) : (
                      <div>
                        <Button variant="success" onClick={handleSaveProfile} disabled={loading} className="me-2">
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Sauvegarder
                        </Button>
                        <Button variant="secondary" onClick={() => setEditing(false)}>
                          <FontAwesomeIcon icon={faTimes} className="me-2" />
                          Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleSaveProfile}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Prénom</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={!editing}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nom</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={!editing}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!editing}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Téléphone</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date de naissance</Form.Label>
                          <Form.Control
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Âge</Form.Label>
                          <Form.Control
                            type="text"
                            value={calculateAge()}
                            disabled
                            className="bg-light"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Adresse</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!editing}
                      />
                    </Form.Group>

                    <Row>
                      <Col md={8}>
                        <Form.Group className="mb-3">
                          <Form.Label>Ville</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Code postal</Form.Label>
                          <Form.Control
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <hr className="my-4" />
                    <h6 className="fw-bold mb-3">Contact d'urgence</h6>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nom du contact</Form.Label>
                          <Form.Control
                            type="text"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Téléphone d'urgence</Form.Label>
                          <Form.Control
                            type="tel"
                            name="emergencyPhone"
                            value={formData.emergencyPhone}
                            onChange={handleInputChange}
                            disabled={!editing}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {/* Informations médicales */}
              <Card className="border-0 shadow-sm mt-4">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="fw-bold mb-0">
                    <FontAwesomeIcon icon={faShieldAlt} className="me-2 text-success" />
                    Informations médicales
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Groupe sanguin</Form.Label>
                    <Form.Select
                      name="medical.bloodType"
                      value={formData.medicalInfo.bloodType}
                      onChange={handleInputChange}
                      disabled={!editing}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Allergies</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="medical.allergies"
                      value={formData.medicalInfo.allergies}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Indiquez vos allergies connues..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Conditions chroniques</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="medical.chronicConditions"
                      value={formData.medicalInfo.chronicConditions}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Maladies chroniques, conditions particulières..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Médicaments actuels</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="medical.medications"
                      value={formData.medicalInfo.medications}
                      onChange={handleInputChange}
                      disabled={!editing}
                      placeholder="Médicaments pris régulièrement..."
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                  >
                    {formData.firstName?.charAt(0) || 'P'}
                  </div>
                  <h4 className="fw-bold">{formData.firstName} {formData.lastName}</h4>
                  <p className="text-muted">Patient</p>
                  <Badge bg="success" className="mb-3">Compte vérifié</Badge>
                  
                  <div className="text-start">
                    <div className="mb-2">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2 text-info" />
                      <small>{formData.email}</small>
                    </div>
                    {formData.phone && (
                      <div className="mb-2">
                        <FontAwesomeIcon icon={faPhone} className="me-2 text-success" />
                        <small>{formData.phone}</small>
                      </div>
                    )}
                    <div className="mb-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-warning" />
                      <small>Âge: {calculateAge()}</small>
                    </div>
                    {formData.city && (
                      <div className="mb-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2 text-danger" />
                        <small>{formData.city}</small>
                      </div>
                    )}
                  </div>

                  <Button variant="outline-primary" className="w-100 mt-3" onClick={handlePhotoChange}>
                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                    Changer la photo
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="security" title={<span><FontAwesomeIcon icon={faLock} className="me-2" />Sécurité</span>}>
          <Row>
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="fw-bold mb-0">
                    <FontAwesomeIcon icon={faLock} className="me-2 text-warning" />
                    Changer le mot de passe
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handlePasswordChange}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mot de passe actuel</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Nouveau mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                        required
                      />
                    </Form.Group>

                    <Button type="submit" variant="warning" disabled={loading}>
                      <FontAwesomeIcon icon={faLock} className="me-2" />
                      Changer le mot de passe
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="notifications" title={<span><FontAwesomeIcon icon={faBell} className="me-2" />Notifications</span>}>
          <Row>
            <Col lg={6}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="fw-bold mb-0">
                    <FontAwesomeIcon icon={faBell} className="me-2 text-info" />
                    Préférences de notification
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <Form.Check
                      type="switch"
                      id="email-notifications"
                      label="Notifications par email"
                      checked={notificationSettings.emailNotifications}
                      onChange={() => handleNotificationChange('emailNotifications')}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <Form.Check
                      type="switch"
                      id="sms-notifications"
                      label="Notifications par SMS"
                      checked={notificationSettings.smsNotifications}
                      onChange={() => handleNotificationChange('smsNotifications')}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <Form.Check
                      type="switch"
                      id="appointment-reminders"
                      label="Rappels de rendez-vous"
                      checked={notificationSettings.appointmentReminders}
                      onChange={() => handleNotificationChange('appointmentReminders')}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <Form.Check
                      type="switch"
                      id="prescription-reminders"
                      label="Rappels d'ordonnances"
                      checked={notificationSettings.prescriptionReminders}
                      onChange={() => handleNotificationChange('prescriptionReminders')}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <Form.Check
                      type="switch"
                      id="health-tips"
                      label="Conseils santé"
                      checked={notificationSettings.healthTips}
                      onChange={() => handleNotificationChange('healthTips')}
                    />
                  </div>

                  <Button variant="success" className="w-100" onClick={handleSaveNotifications} disabled={loading}>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
}

export default PatientProfile;