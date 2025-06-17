import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, Row, Col, Card, Button, Form, 
  Alert, InputGroup
} from 'react-bootstrap';
import Badge from 'react-bootstrap/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faEnvelope, faPhone, faLock,
  faSave, faTimes, faUserShield
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function AssistantProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'assistant') {
      navigate('/login');
      return;
    }
    // Charger les données du profil
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    }));
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      // Si un nouveau mot de passe est fourni
      if (formData.new_password) {
        if (formData.new_password !== formData.confirm_password) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }
        if (!formData.current_password) {
          setError('Le mot de passe actuel est requis pour changer le mot de passe');
          return;
        }
        updateData.current_password = formData.current_password;
        updateData.new_password = formData.new_password;
      }

      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mettre à jour le contexte utilisateur
      updateUser(response.data);
      setMessage('Profil mis à jour avec succès !');
      
      // Réinitialiser les champs de mot de passe
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setError(error.response?.data?.error || 'Erreur lors de la mise à jour du profil.');
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
          <FontAwesomeIcon icon={faUserShield} className="me-2 text-primary" />
          Mon profil
        </h2>
        <p className="text-muted mb-0">
          Gérez vos informations personnelles
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
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Informations personnelles */}
                <h5 className="mb-4">Informations personnelles</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Nom
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label>
                    <FontAwesomeIcon icon={faPhone} className="me-2" />
                    Téléphone
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </Form.Group>

                {/* Changement de mot de passe */}
                <h5 className="mb-4 mt-5">Changer le mot de passe</h5>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faLock} className="me-2" />
                    Mot de passe actuel
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.current_password}
                    onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nouveau mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        value={formData.new_password}
                        onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirmer le mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Boutons d'action */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/assistant')}
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
            </Card.Body>
          </Card>
        </Col>

        {/* Informations supplémentaires */}
        <Col md={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Informations du compte</h5>
              <div className="mb-3">
                <small className="text-muted d-block">Rôle</small>
                <strong>Assistant médical</strong>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Compte créé le</small>
                <strong>{new Date(user.created_at).toLocaleDateString()}</strong>
              </div>
              <div>
                <small className="text-muted d-block">Statut</small>
                <Badge bg={user.is_active ? 'success' : 'danger'}>
                  {user.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Sécurité</h5>
              <p className="text-muted small">
                Pour votre sécurité, utilisez un mot de passe fort et unique.
                <br />
                Ne partagez jamais vos identifiants avec d'autres personnes.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AssistantProfile; 