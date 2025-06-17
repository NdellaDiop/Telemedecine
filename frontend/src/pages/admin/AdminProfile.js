import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, Row, Col, Card, Button, Form, 
  Alert, InputGroup, Badge 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faSave, faTimes, faLock,
  faEnvelope, faPhone, faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function AdminProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    // Charger les données du profil
    setProfileData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    }));
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/admin/profile`,
        {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mettre à jour le contexte d'authentification
      updateUser(response.data);
      setMessage('Profil mis à jour avec succès !');
      
      // Réinitialiser les champs de mot de passe
      setProfileData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setError(error.response?.data?.error || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (profileData.new_password !== profileData.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/admin/change-password`,
        {
          current_password: profileData.current_password,
          new_password: profileData.new_password
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Mot de passe mis à jour avec succès !');
      
      // Réinitialiser les champs de mot de passe
      setProfileData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error) {
      console.error('Erreur mise à jour mot de passe:', error);
      setError(error.response?.data?.error || 'Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
          Profil Administrateur
        </h2>
        <p className="text-muted mb-0">
          Gérez vos informations personnelles et votre mot de passe
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

      <Row>
        {/* Informations du profil */}
        <Col md={6}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                Informations personnelles
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom complet</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faUser} />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faEnvelope} />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faPhone} />
                    </InputGroup.Text>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                      pattern="^(7[0678])[0-9]{7}$"
                      placeholder="7XXXXXXXX"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Format: 7XXXXXXXX (7 suivi de 8 chiffres)
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end">
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
            </Card.Body>
          </Card>
        </Col>

        {/* Changement de mot de passe */}
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faLock} className="me-2 text-primary" />
                Sécurité
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe actuel</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faLock} />
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      name="current_password"
                      value={profileData.current_password}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nouveau mot de passe</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faLock} />
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={profileData.new_password}
                      onChange={handleChange}
                      required
                      minLength={8}
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Minimum 8 caractères, incluant lettres, chiffres et caractères spéciaux
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faLock} />
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      value={profileData.confirm_password}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                        Mettre à jour le mot de passe
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminProfile; 