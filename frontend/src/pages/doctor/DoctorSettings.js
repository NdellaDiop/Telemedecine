import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Button, Form, Alert, Badge, Modal, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, faSave, faDownload, faUpload, faTrash, faSync, faShield,
  faDatabase, faFileExport, faFileImport, faCalendarAlt, faBell,
  faLanguage, faPalette, faDesktop, faMobile, faTablet, faWifi,
  faCloud, faHardDrive, faExclamationTriangle, faCheck, faInfo
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function DoctorSettings() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  
  const [settings, setSettings] = useState({
    // Paramètres généraux
    language: 'fr',
    timezone: 'Africa/Dakar',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h',
    currency: 'FCFA',
    
    // Interface
    theme: 'light',
    sidebarCollapsed: false,
    showAvatars: true,
    animationsEnabled: true,
    soundNotifications: true,
    
    // Rendez-vous
    defaultAppointmentDuration: 30,
    appointmentReminder: 24, // heures avant
    allowOnlineBooking: true,
    requireConfirmation: true,
    maxAdvanceBooking: 30, // jours
    
    // Données
    autoSave: true,
    autoSaveInterval: 5, // minutes
    dataRetention: 365, // jours
    anonymizeOldData: true,
    
    // Sécurité
    sessionTimeout: 30, // minutes
    requirePasswordChange: 90, // jours
    allowMultipleSessions: false,
    logUserActivity: true,
    
    // Intégrations
    orthancServer: 'http://localhost:8042',
    orthancUsername: 'orthanc',
    orthancPassword: 'orthanc',
    emailService: 'gmail',
    smsService: 'orange',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: true,
    desktopNotifications: true,
    notificationSound: 'default',
    
    // Sauvegarde
    autoBackup: true,
    backupFrequency: 'daily',
    backupLocation: 'cloud',
    retainBackups: 30 // jours
  });

  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    lastUpdate: '2025-01-15',
    databaseSize: '245 MB',
    storageUsed: '1.2 GB',
    storageTotal: '10 GB',
    uptime: '15 jours',
    lastBackup: '2025-01-15 02:00',
    activeUsers: 1,
    totalPatients: 45,
    totalAppointments: 156
  });

  useEffect(() => {
    loadSettings();
    loadSystemInfo();
  }, []);

  const loadSettings = async () => {
    try {
      // Simulation - remplacer par appel API
      console.log('Chargement des paramètres');
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const loadSystemInfo = async () => {
    try {
      // Simulation - remplacer par appel API
      console.log('Chargement infos système');
    } catch (error) {
      console.error('Erreur chargement système:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Ici, vous feriez l'appel API pour sauvegarder les paramètres
      console.log('Sauvegarde paramètres:', settings);
      
      setTimeout(() => {
        setShowSuccessAlert(true);
        setLoading(false);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setLoading(false);
    }
  };

  const handleBackupData = async () => {
    try {
      // Ici, vous déclencheriez la sauvegarde
      console.log('Démarrage sauvegarde manuelle');
      setShowBackupModal(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleImportData = async () => {
    try {
      // Ici, vous gèreriez l'importation
      console.log('Importation des données');
      setShowImportModal(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error('Erreur importation:', error);
    }
  };

  const handleResetSettings = async () => {
    try {
      // Réinitialiser aux paramètres par défaut
      setSettings({
        language: 'fr',
        timezone: 'Africa/Dakar',
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h',
        currency: 'FCFA',
        theme: 'light',
        sidebarCollapsed: false,
        showAvatars: true,
        animationsEnabled: true,
        soundNotifications: true,
        defaultAppointmentDuration: 30,
        appointmentReminder: 24,
        allowOnlineBooking: true,
        requireConfirmation: true,
        maxAdvanceBooking: 30,
        autoSave: true,
        autoSaveInterval: 5,
        dataRetention: 365,
        anonymizeOldData: true,
        sessionTimeout: 30,
        requirePasswordChange: 90,
        allowMultipleSessions: false,
        logUserActivity: true,
        orthancServer: 'http://localhost:8042',
        orthancUsername: 'orthanc',
        orthancPassword: 'orthanc',
        emailService: 'gmail',
        smsService: 'orange',
        emailNotifications: true,
        smsNotifications: true,
        desktopNotifications: true,
        notificationSound: 'default',
        autoBackup: true,
        backupFrequency: 'daily',
        backupLocation: 'cloud',
        retainBackups: 30
      });
      
      setShowResetModal(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
    }
  };

  const getStoragePercentage = () => {
    const used = parseFloat(systemInfo.storageUsed.split(' ')[0]);
    const total = parseFloat(systemInfo.storageTotal.split(' ')[0]);
    return Math.round((used / total) * 100);
  };

  return (
    <div className="doctor-settings">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faCog} className="me-2 text-primary" />
            Paramètres Système
          </h2>
          <p className="text-muted mb-0">
            Configurez les paramètres avancés de votre plateforme i-health
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate('/doctor/profile')}>
            Mon Profil
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveSettings}
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
          Paramètres sauvegardés avec succès !
        </Alert>
      )}

      <Row>
        <Col lg={8} className="mb-4">
          {/* Paramètres généraux */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faCog} className="me-2 text-primary" />
                Paramètres généraux
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Langue</Form.Label>
                    <Form.Select
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="wo">Wolof</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fuseau horaire</Form.Label>
                    <Form.Select
                      value={settings.timezone}
                      onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    >
                      <option value="Africa/Dakar">Dakar (GMT+0)</option>
                      <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
                      <option value="Europe/Paris">Paris (GMT+1)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Format de date</Form.Label>
                    <Form.Select
                      value={settings.dateFormat}
                      onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
                    >
                      <option value="dd/MM/yyyy">JJ/MM/AAAA</option>
                      <option value="MM/dd/yyyy">MM/JJ/AAAA</option>
                      <option value="yyyy-MM-dd">AAAA-MM-JJ</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Format d'heure</Form.Label>
                    <Form.Select
                      value={settings.timeFormat}
                      onChange={(e) => setSettings({...settings, timeFormat: e.target.value})}
                    >
                      <option value="24h">24 heures</option>
                      <option value="12h">12 heures (AM/PM)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Devise</Form.Label>
                    <Form.Select
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    >
                      <option value="FCFA">FCFA</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar ($)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Interface utilisateur */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faPalette} className="me-2 text-info" />
                Interface utilisateur
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Thème</Form.Label>
                    <Form.Select
                      value={settings.theme}
                      onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    >
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="auto">Automatique</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Son des notifications</Form.Label>
                    <Form.Select
                      value={settings.notificationSound}
                      onChange={(e) => setSettings({...settings, notificationSound: e.target.value})}
                    >
                      <option value="default">Par défaut</option>
                      <option value="chime">Carillon</option>
                      <option value="bell">Cloche</option>
                      <option value="none">Aucun</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="sidebar-collapsed"
                    label="Menu latéral réduit par défaut"
                    checked={settings.sidebarCollapsed}
                    onChange={(e) => setSettings({...settings, sidebarCollapsed: e.target.checked})}
                    className="mb-3"
                  />
                </Col>
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="show-avatars"
                    label="Afficher les avatars"
                    checked={settings.showAvatars}
                    onChange={(e) => setSettings({...settings, showAvatars: e.target.checked})}
                    className="mb-3"
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="animations-enabled"
                    label="Activer les animations"
                    checked={settings.animationsEnabled}
                    onChange={(e) => setSettings({...settings, animationsEnabled: e.target.checked})}
                    className="mb-3"
                  />
                </Col>
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="sound-notifications"
                    label="Notifications sonores"
                    checked={settings.soundNotifications}
                    onChange={(e) => setSettings({...settings, soundNotifications: e.target.checked})}
                    className="mb-3"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Rendez-vous */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-success" />
                Gestion des rendez-vous
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Durée par défaut (minutes)</Form.Label>
                    <Form.Select
                      value={settings.defaultAppointmentDuration}
                      onChange={(e) => setSettings({...settings, defaultAppointmentDuration: parseInt(e.target.value)})}
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 heure</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rappel avant RDV (heures)</Form.Label>
                    <Form.Select
                      value={settings.appointmentReminder}
                      onChange={(e) => setSettings({...settings, appointmentReminder: parseInt(e.target.value)})}
                    >
                      <option value={1}>1 heure</option>
                      <option value={2}>2 heures</option>
                      <option value={6}>6 heures</option>
                      <option value={24}>24 heures</option>
                      <option value={48}>48 heures</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="allow-online-booking"
                    label="Autoriser la prise de RDV en ligne"
                    checked={settings.allowOnlineBooking}
                    onChange={(e) => setSettings({...settings, allowOnlineBooking: e.target.checked})}
                    className="mb-3"
                  />
                </Col>
                <Col md={6}>
                  <Form.Check
                    type="switch"
                    id="require-confirmation"
                    label="Demander confirmation des RDV"
                    checked={settings.requireConfirmation}
                    onChange={(e) => setSettings({...settings, requireConfirmation: e.target.checked})}
                    className="mb-3"
                  />
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Intégrations */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faCloud} className="me-2 text-warning" />
                Intégrations
              </h5>
            </Card.Header>
            <Card.Body>
              <h6 className="fw-medium mb-3">Serveur Orthanc (Imagerie DICOM)</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>URL du serveur</Form.Label>
                    <Form.Control
                      type="url"
                      value={settings.orthancServer}
                      onChange={(e) => setSettings({...settings, orthancServer: e.target.value})}
                      placeholder="http://172.20.10.3:8042"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom d'utilisateur</Form.Label>
                    <Form.Control
                      type="text"
                      value={settings.orthancUsername}
                      onChange={(e) => setSettings({...settings, orthancUsername: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mot de passe</Form.Label>
                    <Form.Control
                      type="password"
                      value={settings.orthancPassword}
                      onChange={(e) => setSettings({...settings, orthancPassword: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <h6 className="fw-medium mb-3 mt-4">Services de communication</h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Service Email</Form.Label>
                    <Form.Select
                      value={settings.emailService}
                      onChange={(e) => setSettings({...settings, emailService: e.target.value})}
                    >
                      <option value="gmail">Gmail</option>
                      <option value="outlook">Outlook</option>
                      <option value="yahoo">Yahoo</option>
                      <option value="custom">Personnalisé</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Service SMS</Form.Label>
                    <Form.Select
                      value={settings.smsService}
                      onChange={(e) => setSettings({...settings, smsService: e.target.value})}
                    >
                      <option value="orange">Orange Sénégal</option>
                      <option value="free">Free</option>
                      <option value="expresso">Expresso</option>
                      <option value="custom">Personnalisé</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Informations système */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faDatabase} className="me-2 text-info" />
                Informations système
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Version</small>
                  <Badge bg="primary">{systemInfo.version}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Dernière mise à jour</small>
                  <small>{systemInfo.lastUpdate}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Temps de fonctionnement</small>
                  <small>{systemInfo.uptime}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Utilisateurs actifs</small>
                  <Badge bg="success">{systemInfo.activeUsers}</Badge>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Stockage utilisé</small>
                  <small>{systemInfo.storageUsed} / {systemInfo.storageTotal}</small>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar" 
                    style={{ width: `${getStoragePercentage()}%` }}
                  ></div>
                </div>
                <small className="text-muted">{getStoragePercentage()}% utilisé</small>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Base de données</small>
                  <small>{systemInfo.databaseSize}</small>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-muted">Total patients</small>
                  <Badge bg="info">{systemInfo.totalPatients}</Badge>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">Total RDV</small>
                  <Badge bg="warning">{systemInfo.totalAppointments}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Actions de sauvegarde */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faHardDrive} className="me-2 text-success" />
                Sauvegarde et données
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">Dernière sauvegarde</small>
                  <small>{systemInfo.lastBackup}</small>
                </div>
                <Form.Check
                  type="switch"
                  id="auto-backup"
                  label="Sauvegarde automatique"
                  checked={settings.autoBackup}
                  onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
                  className="mb-3"
                />
                {settings.autoBackup && (
                  <Form.Group className="mb-3">
                    <Form.Label>Fréquence</Form.Label>
                    <Form.Select
                      value={settings.backupFrequency}
                      onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                      size="sm"
                    >
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuelle</option>
                    </Form.Select>
                  </Form.Group>
                )}
              </div>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="success" 
                  size="sm"
                  onClick={() => setShowBackupModal(true)}
                >
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Sauvegarde manuelle
                </Button>
                <Button 
                  variant="info" 
                  size="sm"
                  onClick={() => setShowImportModal(true)}
                >
                  <FontAwesomeIcon icon={faUpload} className="me-2" />
                  Importer des données
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    // Exporter les paramètres
                    const dataStr = JSON.stringify(settings, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'i-health-settings.json';
                    link.click();
                  }}
                >
                  <FontAwesomeIcon icon={faFileExport} className="me-2" />
                  Exporter paramètres
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Actions système */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">
                <FontAwesomeIcon icon={faShield} className="me-2 text-danger" />
                Actions système
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="outline-info" 
                  size="sm"
                  onClick={() => {
                    loadSettings();
                    loadSystemInfo();
                  }}
                >
                  <FontAwesomeIcon icon={faSync} className="me-2" />
                  Actualiser
                </Button>
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  onClick={() => setShowResetModal(true)}
                >
                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                  Réinitialiser paramètres
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => window.open('/logs', '_blank')}
                >
                  <FontAwesomeIcon icon={faInfo} className="me-2" />
                  Voir les logs
                </Button>
              </div>
              
              <Alert variant="warning" className="mt-3 py-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                <small>
                  Les actions de réinitialisation sont irréversibles. 
                  Assurez-vous d'avoir une sauvegarde récente.
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Sauvegarde */}
      <Modal show={showBackupModal} onHide={() => setShowBackupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faDownload} className="me-2 text-success" />
            Sauvegarde manuelle
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <FontAwesomeIcon icon={faInfo} className="me-2" />
            Cette action va créer une sauvegarde complète de toutes vos données :
          </Alert>
          <ul className="mb-3">
            <li>Profils des patients</li>
            <li>Rendez-vous et historique</li>
            <li>Dossiers médicaux</li>
            <li>Prescriptions</li>
            <li>Paramètres système</li>
            <li>Images DICOM (si sélectionné)</li>
          </ul>
          <Form.Check
            type="checkbox"
            id="include-images"
            label="Inclure les images médicales (peut prendre plus de temps)"
            className="mb-3"
          />
          <Form.Group>
            <Form.Label>Destination</Form.Label>
            <Form.Select>
              <option value="local">Téléchargement local</option>
              <option value="cloud">Stockage cloud</option>
              <option value="ftp">Serveur FTP</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBackupModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={handleBackupData}>
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Démarrer la sauvegarde
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Import */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUpload} className="me-2 text-info" />
            Importer des données
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Attention :</strong> L'importation va remplacer les données existantes.
            Assurez-vous d'avoir une sauvegarde récente.
          </Alert>
          <Form.Group className="mb-3">
            <Form.Label>Type d'importation</Form.Label>
            <Form.Select>
              <option value="full">Importation complète</option>
              <option value="patients">Patients uniquement</option>
              <option value="appointments">Rendez-vous uniquement</option>
              <option value="settings">Paramètres uniquement</option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Fichier de sauvegarde</Form.Label>
            <Form.Control type="file" accept=".json,.zip,.sql" />
            <Form.Text className="text-muted">
              Formats acceptés : JSON, ZIP, SQL
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImportModal(false)}>
            Annuler
          </Button>
          <Button variant="info" onClick={handleImportData}>
            <FontAwesomeIcon icon={faUpload} className="me-2" />
            Importer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Réinitialisation */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-danger" />
            Réinitialiser les paramètres
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            <strong>Action irréversible !</strong>
          </Alert>
          <p>
            Cette action va remettre tous les paramètres à leurs valeurs par défaut :
          </p>
          <ul className="mb-3">
            <li>Paramètres généraux</li>
            <li>Préférences d'interface</li>
            <li>Configuration des notifications</li>
            <li>Paramètres de sécurité</li>
            <li>Configuration des intégrations</li>
          </ul>
          <p className="text-muted">
            <strong>Note :</strong> Vos données patients et rendez-vous ne seront pas affectées.
          </p>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Tapez 'CONFIRMER' pour valider"
              className="text-center"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleResetSettings}>
            <FontAwesomeIcon icon={faTrash} className="me-2" />
            Réinitialiser
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default DoctorSettings;