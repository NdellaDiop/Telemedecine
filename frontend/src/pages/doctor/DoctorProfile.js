import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Form, Alert, Badge, Modal, Tabs, Tab } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faPlus, faSave, faCamera, faLock, faBell, faShield,
  faStethoscope, faCheck, faTimes,
  faEye, faEyeSlash, faKey, faUserCircle, faCog
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function DoctorProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  const [profileData, setProfileData] = useState({
    // Informations personnelles
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    birthdate: '',
    address: '',
    city: '',
    avatar: null,
    
    // Informations professionnelles
    speciality: '',
    licenseNumber: '',
    workLocation: '',
    experience: '',
    education: '',
    certifications: [],
    languages: ['Français'],
    consultationFee: '',
    
    // Disponibilité
    workingHours: {
      monday: { start: '08:00', end: '17:00', active: true },
      tuesday: { start: '08:00', end: '17:00', active: true },
      wednesday: { start: '08:00', end: '17:00', active: true },
      thursday: { start: '08:00', end: '17:00', active: true },
      friday: { start: '08:00', end: '17:00', active: true },
      saturday: { start: '08:00', end: '12:00', active: false },
      sunday: { start: '', end: '', active: false }
    },
    vacationMode: false,
    
    // Préférences
    notifications: {
      email: true,
      sms: true,
      newAppointment: true,
      appointmentReminder: true,
      cancelledAppointment: true,
      newPatient: true,
      emergencyAlert: true
    },
    
    // Sécurité
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginHistory: []
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    expiryDate: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Simulation des données - remplacer par appel API
      setProfileData(prev => ({
        ...prev,
        name: user?.name || 'Dr. Example',
        email: user?.email || 'doctor@example.com',
        phone: '77 123 45 67',
        birthdate: '1980-05-15',
        address: 'Rue 10, Fann Résidence',
        city: 'Dakar',
        speciality: 'Médecine générale',
        licenseNumber: 'ML2024001',
        workLocation: 'Clinique de la Paix',
        experience: '15 ans',
        education: 'Doctorat en Médecine - UCAD',
        consultationFee: '25000',
        certifications: [
          {
            id: 1,
            name: 'Certification en Cardiologie',
            issuer: 'Société Sénégalaise de Cardiologie',
            date: '2020-03-15',
            expiryDate: '2025-03-15'
          },
          {
            id: 2,
            name: 'Formation en Urgences Médicales',
            issuer: 'SAMU Dakar',
            date: '2019-11-20',
            expiryDate: '2024-11-20'
          }
        ],
        loginHistory: [
          { date: '2025-01-15 08:30', ip: '192.168.1.100', device: 'Chrome - Windows' },
          { date: '2025-01-14 14:45', ip: '192.168.1.100', device: 'Firefox - Windows' },
          { date: '2025-01-13 09:15', ip: '41.82.45.123', device: 'Safari - Mobile' }
        ]
      }));
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Ici, vous feriez l'appel API pour sauvegarder le profil
      console.log('Sauvegarde profil:', profileData);
      
      // Simulation d'une sauvegarde réussie
      setTimeout(() => {
        setShowSuccessAlert(true);
        setLoading(false);
        // Masquer l'alerte après 3 secondes
        setTimeout(() => setShowSuccessAlert(false), 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      // Ici, vous feriez l'appel API pour changer le mot de passe
      console.log('Changement mot de passe');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      const certification = {
        id: Date.now(),
        ...newCertification
      };
      setProfileData({
        ...profileData,
        certifications: [...profileData.certifications, certification]
      });
      setNewCertification({ name: '', issuer: '', date: '', expiryDate: '' });
    }
  };

  const handleRemoveCertification = (id) => {
    setProfileData({
      ...profileData,
      certifications: profileData.certifications.filter(cert => cert.id !== id)
    });
  };

  const toggleWorkingDay = (day) => {
    setProfileData({
      ...profileData,
      workingHours: {
        ...profileData.workingHours,
        [day]: {
          ...profileData.workingHours[day],
          active: !profileData.workingHours[day].active
        }
      }
    });
  };

  const getDayName = (day) => {
    const days = {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    };
    return days[day];
  };

  return (
    <div className="doctor-profile">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
            Mon Profil
          </h2>
          <p className="text-muted mb-0">
            Gérez vos informations personnelles et professionnelles
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate('/doctor')}>
            Retour au tableau de bord
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alerte de succès */}
      {showSuccessAlert && (
        <Alert variant="success" className="d-flex align-items-center mb-4">
          <FontAwesomeIcon icon={faCheck} className="me-2" />
          Profil mis à jour avec succès !
        </Alert>
      )}

      <Row>
        <Col lg={4} className="mb-4">
          {/* Carte profil principal */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center">
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={profileData.avatar || "/images/default-doctor.png"}
                  alt="Avatar"
                  className="rounded-circle"
                  width="120"
                  height="120"
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjYwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik02MCA2MEMxNy41IDYwIDMwIDQ3LjUgMzAgMzBDMzAgMTIuNSA0Mi41IDAgNjAgMEM3Ny41IDAgOTAgMTIuNSA5MCAzMEM5MCA0Ny41IDc3LjUgNjAgNjAgNjBaIiBmaWxsPSIjNjg3NTg5Ii8+CjxwYXRoIGQ9Ik02MCA4NEM0Mi41IDg0IDMwIDk2LjUgMzAgMTE0QzMwIDExNi41IDMyLjUgMTE5IDM1IDExOUg4NUM4Ny41IDExOSA5MCAxMTYuNSA5MCAxMTRDOTAgOTYuNSA3Ny41IDg0IDYwIDg0WiIgZmlsbD0iIzY4NzU4OSIvPgo8L3N2Zz4K';
                  }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  className="position-absolute bottom-0 end-0 rounded-circle"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => document.getElementById('avatar-input').click()}
                >
                  <FontAwesomeIcon icon={faCamera} />
                </Button>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>
              <h4 className="fw-bold">{profileData.name}</h4>
              <p className="text-muted mb-2">{profileData.speciality}</p>
              <Badge bg="success" className="mb-3">
                <FontAwesomeIcon icon={faStethoscope} className="me-1" />
                {profileData.experience} d'expérience
              </Badge>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <FontAwesomeIcon icon={faLock} className="me-2" />
                  Changer le mot de passe
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Statistiques rapides */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h6 className="fw-bold mb-0">Statistiques rapides</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Patients suivis</span>
                <Badge bg="primary">45</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Consultations ce mois</span>
                <Badge bg="success">156</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Taux de satisfaction</span>
                <Badge bg="info">89%</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Prochains RDV</span>
                <Badge bg="warning">8</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <Tabs activeKey={activeTab} onSelect={setActiveTab}>
                <Tab eventKey="profile" title="Profil">
                </Tab>
                <Tab eventKey="professional" title="Professionnel">
                </Tab>
                <Tab eventKey="schedule" title="Horaires">
                </Tab>
                <Tab eventKey="notifications" title="Notifications">
                </Tab>
                <Tab eventKey="security" title="Sécurité">
                </Tab>
              </Tabs>
            </Card.Header>
            <Card.Body>
              {/* Onglet Profil */}
              {activeTab === 'profile' && (
                <Form>
                  <h5 className="fw-bold mb-3">Informations personnelles</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nom complet *</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Téléphone</Form.Label>
                        <Form.Control
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date de naissance</Form.Label>
                        <Form.Control
                          type="date"
                          value={profileData.birthdate}
                          onChange={(e) => setProfileData({...profileData, birthdate: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3">
                        <Form.Label>Adresse</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Ville</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileData.city}
                          onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              )}

              {/* Onglet Professionnel */}
              {activeTab === 'professional' && (
                <Form>
                  <h5 className="fw-bold mb-3">Informations professionnelles</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Spécialité *</Form.Label>
                        <Form.Select
                          value={profileData.speciality}
                          onChange={(e) => setProfileData({...profileData, speciality: e.target.value})}
                        >
                          <option value="">Sélectionner une spécialité</option>
                          <option value="Médecine générale">Médecine générale</option>
                          <option value="Cardiologie">Cardiologie</option>
                          <option value="Pédiatrie">Pédiatrie</option>
                          <option value="Gynécologie">Gynécologie</option>
                          <option value="Dermatologie">Dermatologie</option>
                          <option value="Neurologie">Neurologie</option>
                          <option value="Orthopédie">Orthopédie</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Numéro de licence *</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileData.licenseNumber}
                          onChange={(e) => setProfileData({...profileData, licenseNumber: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Lieu de travail</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileData.workLocation}
                          onChange={(e) => setProfileData({...profileData, workLocation: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tarif de consultation (FCFA)</Form.Label>
                        <Form.Control
                          type="number"
                          value={profileData.consultationFee}
                          onChange={(e) => setProfileData({...profileData, consultationFee: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-3">
                    <Form.Label>Formation</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={profileData.education}
                      onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                    />
                  </Form.Group>

                  {/* Certifications */}
                  <h6 className="fw-bold mb-3">Certifications</h6>
                  {profileData.certifications.map((cert) => (
                    <Card key={cert.id} className="border mb-2">
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-medium">{cert.name}</div>
                            <small className="text-muted">
                              {cert.issuer} - {new Date(cert.date).toLocaleDateString('fr-FR')}
                              {cert.expiryDate && ` (Expire le ${new Date(cert.expiryDate).toLocaleDateString('fr-FR')})`}
                            </small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveCertification(cert.id)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}

                  <Card className="border-dashed mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-2">
                            <Form.Control
                              type="text"
                              placeholder="Nom de la certification"
                              value={newCertification.name}
                              onChange={(e) => setNewCertification({...newCertification, name: e.target.value})}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-2">
                            <Form.Control
                              type="text"
                              placeholder="Organisme émetteur"
                              value={newCertification.issuer}
                              onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-2">
                            <Form.Control
                              type="date"
                              value={newCertification.date}
                              onChange={(e) => setNewCertification({...newCertification, date: e.target.value})}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-2">
                            <Form.Control
                              type="date"
                              placeholder="Date d'expiration (optionnel)"
                              value={newCertification.expiryDate}
                              onChange={(e) => setNewCertification({...newCertification, expiryDate: e.target.value})}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Button variant="outline-primary" onClick={handleAddCertification}>
                            <FontAwesomeIcon icon={faPlus} className="me-1" />
                            Ajouter
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Form>
              )}

              {/* Onglet Horaires */}
              {activeTab === 'schedule' && (
                <div>
                  <h5 className="fw-bold mb-3">Horaires de travail</h5>
                  
                  <div className="mb-4">
                    <Form.Check
                      type="switch"
                      id="vacation-mode"
                      label="Mode vacances (désactive tous les créneaux)"
                      checked={profileData.vacationMode}
                      onChange={(e) => setProfileData({...profileData, vacationMode: e.target.checked})}
                      className="mb-3"
                    />
                  </div>

                  {Object.entries(profileData.workingHours).map(([day, hours]) => (
                    <Card key={day} className="border mb-3">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={3}>
                            <Form.Check
                              type="switch"
                              id={`${day}-active`}
                              label={getDayName(day)}
                              checked={hours.active}
                              onChange={() => toggleWorkingDay(day)}
                              disabled={profileData.vacationMode}
                            />
                          </Col>
                          {hours.active && (
                            <>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Début</Form.Label>
                                  <Form.Control
                                    type="time"
                                    value={hours.start}
                                    onChange={(e) => setProfileData({
                                      ...profileData,
                                      workingHours: {
                                        ...profileData.workingHours,
                                        [day]: { ...hours, start: e.target.value }
                                      }
                                    })}
                                    disabled={profileData.vacationMode}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Form.Group>
                                  <Form.Label>Fin</Form.Label>
                                  <Form.Control
                                    type="time"
                                    value={hours.end}
                                    onChange={(e) => setProfileData({
                                      ...profileData,
                                      workingHours: {
                                        ...profileData.workingHours,
                                        [day]: { ...hours, end: e.target.value }
                                      }
                                    })}
                                    disabled={profileData.vacationMode}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={3}>
                                <Badge bg="success">
                                  {hours.start} - {hours.end}
                                </Badge>
                              </Col>
                            </>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h5 className="fw-bold mb-3">Préférences de notifications</h5>
                  
                  <h6 className="fw-medium mb-3">Canaux de notification</h6>
                  <Row className="mb-4">
                    <Col md={6}>
                      <Form.Check
                        type="switch"
                        id="email-notifications"
                        label="Notifications par email"
                        checked={profileData.notifications.email}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notifications: { ...profileData.notifications, email: e.target.checked }
                        })}
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Check
                        type="switch"
                        id="sms-notifications"
                        label="Notifications par SMS"
                        checked={profileData.notifications.sms}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          notifications: { ...profileData.notifications, sms: e.target.checked }
                        })}
                      />
                    </Col>
                  </Row>

                  <h6 className="fw-medium mb-3">Types de notifications</h6>
                  <div className="mb-2">
                    <Form.Check
                      type="switch"
                      id="new-appointment"
                      label="Nouveau rendez-vous"
                      checked={profileData.notifications.newAppointment}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: { ...profileData.notifications, newAppointment: e.target.checked }
                      })}
                    />
                  </div>
                  <div className="mb-2">
                    <Form.Check
                      type="switch"
                      id="appointment-reminder"
                      label="Rappels de rendez-vous"
                      checked={profileData.notifications.appointmentReminder}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: { ...profileData.notifications, appointmentReminder: e.target.checked }
                      })}
                    />
                  </div>
                  <div className="mb-2">
                    <Form.Check
                      type="switch"
                      id="cancelled-appointment"
                      label="Rendez-vous annulés"
                      checked={profileData.notifications.cancelledAppointment}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: { ...profileData.notifications, cancelledAppointment: e.target.checked }
                      })}
                    />
                  </div>
                  <div className="mb-2">
                    <Form.Check
                      type="switch"
                      id="new-patient"
                      label="Nouveau patient"
                      checked={profileData.notifications.newPatient}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: { ...profileData.notifications, newPatient: e.target.checked }
                      })}
                    />
                  </div>
                  <div className="mb-2">
                    <Form.Check
                      type="switch"
                      id="emergency-alert"
                      label="Alertes d'urgence"
                      checked={profileData.notifications.emergencyAlert}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        notifications: { ...profileData.notifications, emergencyAlert: e.target.checked }
                      })}
                    />
                  </div>
                </div>
              )}

              {/* Onglet Sécurité */}
              {activeTab === 'security' && (
                <div>
                  <h5 className="fw-bold mb-3">Paramètres de sécurité</h5>
                  
                  <Card className="border mb-4">
                    <Card.Body>
                      <h6 className="fw-medium mb-3">Authentification à deux facteurs</h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p className="mb-1">Sécurisez votre compte avec l'authentification à deux facteurs</p>
                          <small className="text-muted">
                            {profileData.twoFactorEnabled ? 'Activée' : 'Désactivée'}
                          </small>
                        </div>
                        <Form.Check
                          type="switch"
                          id="two-factor"
                          checked={profileData.twoFactorEnabled}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            twoFactorEnabled: e.target.checked
                          })}
                        />
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="border mb-4">
                    <Card.Body>
                      <h6 className="fw-medium mb-3">Timeout de session</h6>
                      <Form.Group>
                        <Form.Label>Déconnexion automatique après (minutes)</Form.Label>
                        <Form.Select
                          value={profileData.sessionTimeout}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            sessionTimeout: parseInt(e.target.value)
                          })}
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 heure</option>
                          <option value={120}>2 heures</option>
                          <option value={240}>4 heures</option>
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  <Card className="border">
                    <Card.Header className="bg-white">
                      <h6 className="fw-medium mb-0">Historique des connexions</h6>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <table className="table table-sm mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Date et heure</th>
                              <th>Adresse IP</th>
                              <th>Appareil</th>
                              <th>Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileData.loginHistory.map((login, index) => (
                              <tr key={index}>
                                <td>{login.date}</td>
                                <td>{login.ip}</td>
                                <td>{login.device}</td>
                                <td>
                                  <Badge bg={index === 0 ? 'success' : 'secondary'}>
                                    {index === 0 ? 'Session actuelle' : 'Terminée'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal changement de mot de passe */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faLock} className="me-2 text-warning" />
            Changer le mot de passe
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe actuel *</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPasswordFields ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Entrez votre mot de passe actuel"
                />
                <Button
                  variant="link"
                  className="position-absolute end-0 top-50 translate-middle-y border-0"
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                >
                  <FontAwesomeIcon icon={showPasswordFields ? faEyeSlash : faEye} />
                </Button>
              </div>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe *</Form.Label>
              <Form.Control
                type={showPasswordFields ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                placeholder="Entrez le nouveau mot de passe"
              />
              <Form.Text className="text-muted">
                Le mot de passe doit contenir au moins 8 caractères
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirmer le nouveau mot de passe *</Form.Label>
              <Form.Control
                type={showPasswordFields ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                placeholder="Confirmez le nouveau mot de passe"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="warning" 
            onClick={handleChangePassword}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            <FontAwesomeIcon icon={faKey} className="me-2" />
            Changer le mot de passe
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DoctorProfile;