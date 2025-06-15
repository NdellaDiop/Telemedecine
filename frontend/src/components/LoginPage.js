// components/LoginPage.js - Correction du useContext
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loginMessage, setLoginMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Déplacer useContext au niveau du composant
  const { user, loading, login } = useContext(AuthContext);
  useEffect(() => {
  console.log('🔍 DEBUG LOGIN - User state:', user);
  console.log('🔍 DEBUG LOGIN - User role:', user?.role);
  console.log('🔍 DEBUG LOGIN - Loading:', loading);
}, [user, loading]);

  const navigate = useNavigate();
  const location = useLocation();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user && !loading) {
      const redirectPath = getDashboardPath(user.role);
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate]);

  // Récupérer le message de succès d'inscription
  useEffect(() => {
    if (location.state?.success) {
      setLoginMessage(location.state.message);
      
      // Récupérer l'email pré-enregistré
      const savedEmail = localStorage.getItem('registeredEmail');
      if (savedEmail) {
        setFormData(prev => ({
          ...prev,
          email: savedEmail
        }));
        localStorage.removeItem('registeredEmail');
      }
    }
  }, [location]);

  // Vérifier email mémorisé
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Et dans votre fonction getDashboardPath, remplacez par :
const getDashboardPath = (role) => {
  console.log('🔍 getDashboardPath appelé avec role:', role);
  console.log('🔍 Type de role:', typeof role);
  
  switch (role) {
    case 'patient':
      console.log('🔍 Redirection patient');
      return '/patient';
    case 'doctor':
      console.log('🔍 Redirection doctor');
      return '/doctor';
    case 'admin':
      console.log('🔍 Redirection admin vers /admin');
      return '/admin';
    case 'assistant':
      console.log('🔍 Redirection assistant');
      return '/assistant';
    default:
      console.log('🔍 Rôle non reconnu:', role, '- redirection par défaut');
      return '/patient';
  }
};

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Reset error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Validation côté client
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      setSubmitting(false);
      return;
    }

    try {
      // Utiliser la fonction login du contexte (déjà disponible)
      const result = await login(formData.email, formData.password);
      
      if (result && result.id) { // Votre login retourne directement l'user
        setLoginMessage('Connexion réussie ! Redirection...');
        
        // Gérer "Se souvenir de moi"
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Redirection après délai
        setTimeout(() => {
          const redirectPath = getDashboardPath(result.role);
          navigate(redirectPath, { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      if (error.response) {
        setError(error.response.data?.error || 'Identifiants incorrects');
      } else if (error.request) {
        setError('Impossible de contacter le serveur');
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Header simplifié */}
      <header className="bg-white shadow-sm py-3 mb-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <Link to="/" className="text-decoration-none d-flex align-items-center">
              <img src="/images/logo.png" alt="i-health Logo" height="40" className="me-2" />
              <span className="fw-bold fs-4" style={{ color: '#f5a623' }}>i-health</span>
            </Link>
          </div>
        </Container>
      </header>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Connexion</h2>
                  <p className="text-muted">Accédez à votre espace personnel i-health</p>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                {loginMessage && (
                  <Alert variant="success" className="mb-4">
                    {loginMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Mot de passe</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Votre mot de passe"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      label="Se souvenir de moi"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      disabled={submitting}
                    />
                    <Link to="/forgot-password" className="text-primary">
                      Mot de passe oublié?
                    </Link>
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={submitting}
                    className="w-100 py-2 mb-4"
                  >
                    {submitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        Se connecter <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="mb-0">
                      Vous n'avez pas de compte? <Link to="/register" className="text-primary fw-bold">S'inscrire</Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <div className="mt-4 text-center">
              <div className="d-flex justify-content-center gap-3">
                <Link to="/nosmedecin" className="text-decoration-none">Nos médecins</Link>
                <span className="text-muted">|</span>
                <Link to="/professionnel" className="text-decoration-none">Espace professionnel</Link>
                <span className="text-muted">|</span>
                <Link to="/aide" className="text-decoration-none">Aide</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer minimaliste */}
      <footer className="bg-dark text-white py-3 mt-auto">
        <Container className="text-center">
          <p className="mb-0">© 2025 i-health. Tous droits réservés.</p>
        </Container>
      </footer>
    </div>
  );
}

export default LoginPage;