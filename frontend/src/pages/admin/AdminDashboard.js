// pages/admin/AdminDashboard.js - Dashboard admin simple
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faUserMd, faCalendarAlt, 
  faChartLine, faCog, faSignOutAlt,
  faUserShield, faUserNurse, faUser
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAssistants: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    activeUsers: 0,
    systemStatus: 'healthy'
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faUserShield} className="me-2 text-danger" />
            Tableau de bord Administrateur
          </h2>
          <p className="text-muted mb-0">
            Bienvenue, {user.name}
          </p>
        </div>
        <Button variant="outline-danger" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Déconnexion
        </Button>
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

      {/* Cartes de statistiques */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total utilisateurs</h6>
                  <h3 className="mb-0">{stats.totalUsers}</h3>
                </div>
                <div className="display-6 text-primary">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Médecins</h6>
                  <h3 className="mb-0">{stats.totalDoctors}</h3>
                </div>
                <div className="display-6 text-success">
                  <FontAwesomeIcon icon={faUserMd} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Patients</h6>
                  <h3 className="mb-0">{stats.totalPatients}</h3>
                </div>
                <div className="display-6 text-info">
                  <FontAwesomeIcon icon={faUser} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Assistants</h6>
                  <h3 className="mb-0">{stats.totalAssistants}</h3>
                </div>
                <div className="display-6 text-warning">
                  <FontAwesomeIcon icon={faUserNurse} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Deuxième rangée de statistiques */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Rendez-vous aujourd'hui</h6>
                  <h3 className="mb-0">{stats.todayAppointments}</h3>
                </div>
                <div className="display-6 text-primary">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total rendez-vous</h6>
                  <h3 className="mb-0">{stats.totalAppointments}</h3>
                </div>
                <div className="display-6 text-success">
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Utilisateurs actifs</h6>
                  <h3 className="mb-0">{stats.activeUsers}</h3>
                </div>
                <div className="display-6 text-info">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Actions rapides */}
      <Row>
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Actions rapides</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" onClick={() => navigate('/admin/users')}>
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  Gérer les utilisateurs
                </Button>
                <Button variant="outline-success" onClick={() => navigate('/admin/appointments')}>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Gérer les rendez-vous
                </Button>
                <Button variant="outline-info" onClick={() => navigate('/admin/settings')}>
                  <FontAwesomeIcon icon={faCog} className="me-2" />
                  Paramètres système
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">État du système</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className={`status-indicator ${stats.systemStatus === 'healthy' ? 'bg-success' : 'bg-danger'} me-3`} 
                     style={{width: '12px', height: '12px', borderRadius: '50%'}}></div>
                <div>
                  <h6 className="mb-1">Statut: {stats.systemStatus === 'healthy' ? 'Opérationnel' : 'Problème détecté'}</h6>
                  <p className="text-muted mb-0">Dernière vérification: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;