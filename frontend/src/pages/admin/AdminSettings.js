import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, Row, Col, Card, Button, Form, 
  Alert, InputGroup, Tabs, Tab 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, faSave, faTimes, faBell,
  faShieldAlt, faDatabase, faServer,
  faEnvelope, faLock, faUserShield
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function AdminSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    // Paramètres généraux
    site_name: 'i-Health',
    maintenance_mode: false,
    max_appointments_per_day: 20,
    appointment_duration: 30,
    
    // Paramètres de sécurité
    password_min_length: 8,
    require_special_chars: true,
    session_timeout: 30,
    max_login_attempts: 3,
    
    // Paramètres de notification
    email_notifications: true,
    sms_notifications: false,
    reminder_before_appointment: 24,
    
    // Paramètres système
    backup_frequency: 'daily',
    log_retention_days: 30,
    debug_mode: false
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadSettings();
  }, [user, navigate]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      setError('Erreur lors du chargement des paramètres.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/admin/settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Paramètres mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur mise à jour paramètres:', error);
      setError(error.response?.data?.error || 'Erreur lors de la mise à jour des paramètres.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading && !settings.site_name) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          <FontAwesomeIcon icon={faCog} className="me-2 text-primary" />
          Paramètres système
        </h2>
        <p className="text-muted mb-0">
          Configurez les paramètres de la plateforme
        </p>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Tabs defaultActiveKey="general" className="mb-4">
          {/* Paramètres généraux */}
          <Tab eventKey="general" title={
            <span>
              <FontAwesomeIcon icon={faCog} className="me-2" />
              Général
            </span>
          }>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom du site</Form.Label>
                      <Form.Control
                        type="text"
                        name="site_name"
                        value={settings.site_name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mode maintenance</Form.Label>
                      <Form.Check
                        type="switch"
                        id="maintenance_mode"
                        name="maintenance_mode"
                        label="Activer le mode maintenance"
                        checked={settings.maintenance_mode}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rendez-vous max par jour</Form.Label>
                      <Form.Control
                        type="number"
                        name="max_appointments_per_day"
                        value={settings.max_appointments_per_day}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Durée des rendez-vous (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        name="appointment_duration"
                        value={settings.appointment_duration}
                        onChange={handleChange}
                        min="15"
                        step="15"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          {/* Paramètres de sécurité */}
          <Tab eventKey="security" title={
            <span>
              <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
              Sécurité
            </span>
          }>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Longueur minimale des mots de passe</Form.Label>
                      <Form.Control
                        type="number"
                        name="password_min_length"
                        value={settings.password_min_length}
                        onChange={handleChange}
                        min="6"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Caractères spéciaux requis</Form.Label>
                      <Form.Check
                        type="switch"
                        id="require_special_chars"
                        name="require_special_chars"
                        label="Activer"
                        checked={settings.require_special_chars}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Délai d'expiration de session (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        name="session_timeout"
                        value={settings.session_timeout}
                        onChange={handleChange}
                        min="5"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tentatives de connexion max</Form.Label>
                      <Form.Control
                        type="number"
                        name="max_login_attempts"
                        value={settings.max_login_attempts}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          {/* Paramètres de notification */}
          <Tab eventKey="notifications" title={
            <span>
              <FontAwesomeIcon icon={faBell} className="me-2" />
              Notifications
            </span>
          }>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Notifications par email</Form.Label>
                      <Form.Check
                        type="switch"
                        id="email_notifications"
                        name="email_notifications"
                        label="Activer"
                        checked={settings.email_notifications}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Notifications SMS</Form.Label>
                      <Form.Check
                        type="switch"
                        id="sms_notifications"
                        name="sms_notifications"
                        label="Activer"
                        checked={settings.sms_notifications}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rappel avant rendez-vous (heures)</Form.Label>
                      <Form.Control
                        type="number"
                        name="reminder_before_appointment"
                        value={settings.reminder_before_appointment}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          {/* Paramètres système */}
          <Tab eventKey="system" title={
            <span>
              <FontAwesomeIcon icon={faServer} className="me-2" />
              Système
            </span>
          }>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fréquence des sauvegardes</Form.Label>
                      <Form.Select
                        name="backup_frequency"
                        value={settings.backup_frequency}
                        onChange={handleChange}
                      >
                        <option value="hourly">Toutes les heures</option>
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuelle</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Conservation des logs (jours)</Form.Label>
                      <Form.Control
                        type="number"
                        name="log_retention_days"
                        value={settings.log_retention_days}
                        onChange={handleChange}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mode debug</Form.Label>
                      <Form.Check
                        type="switch"
                        id="debug_mode"
                        name="debug_mode"
                        label="Activer"
                        checked={settings.debug_mode}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        {/* Boutons d'action */}
        <div className="d-flex justify-content-end gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/admin')}
          >
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            Annuler
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enregistrement...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="me-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default AdminSettings; 