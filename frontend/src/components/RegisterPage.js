// components/RegisterPage.js - Mise à jour avec gestion des rôles
import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, faUser, faEnvelope, faPhone, faArrowRight, 
  faIdCard, faCalendarAlt, faHospital, faStethoscope,
  faUserShield, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    birthdate: '',
    password: '',
    confirmPassword: '',
    userType: 'patient', // Par défaut patient
    acceptTerms: false,
    // Champs pour les professionnels
    speciality: '',
    licenseNumber: '',
    workLocation: '',
    // Code d'invitation pour assistant (optionnel)
    invitationCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user && !authLoading) {
      const dashboardPath = user.role === 'doctor' ? '/doctor' : 
                            user.role === 'patient' ? '/patient' : 
                            user.role === 'admin' ? '/admin' :
                            '/patient';
      navigate(dashboardPath, { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (error) setError(''); // Reset error when user types
  };

  const validateStep1 = () => {
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.phone || !formData.birthdate) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    // Validation téléphone sénégalais
    const phoneRegex = /^(7[0678])[0-9]{7}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      setError('Veuillez entrer un numéro de téléphone valide (format: 7X XXX XX XX)');
      return false;
    }

    // Validation date de naissance
    const today = new Date();
    const birthdate = new Date(formData.birthdate);
    if (birthdate > today) {
      setError('La date de naissance ne peut pas être dans le futur');
      return false;
    }

    // Validation champs professionnels
    if (formData.userType === 'doctor') {
      if (!formData.speciality || !formData.licenseNumber || !formData.workLocation) {
        setError('Veuillez remplir tous les champs professionnels obligatoires');
        return false;
      }
    }

    // Validation code d'invitation pour assistant
    if (formData.userType === 'assistant') {
      if (!formData.invitationCode) {
        setError('Un code d\'invitation est requis pour créer un compte assistant');
        return false;
      }
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, incluant une lettre, un chiffre et un caractère spécial');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions générales d\'utilisation');
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setError('');
      setStep(2);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Préparer les données selon l'API Flask
      const userData = {
        name: `${formData.firstname} ${formData.lastname}`,
        email: formData.email,
        phone: formData.phone.replace(/\s/g, ''),
        birthdate: formData.birthdate,
        password: formData.password,
        role: formData.userType // patient, doctor, ou assistant
      };

      // Ajouter les champs spécifiques selon le type d'utilisateur
      if (formData.userType === 'doctor') {
        userData.speciality = formData.speciality;
        userData.license_number = formData.licenseNumber;
        userData.work_location = formData.workLocation;
        userData.invitation_code = formData.invitationCode; // Ajout du code d'invitation pour les médecins
      } else if (formData.userType === 'assistant') {
        userData.invitation_code = formData.invitationCode;
      }

      console.log('Données envoyées:', userData); // Pour le débogage

      // Appel API
      const response = await axios.post('http://localhost:5000/register', userData);
      
      if (response.data && response.data.error) {
        setError(response.data.error);
        return;
      }
      
      // Stockage email pour connexion
      localStorage.setItem('registeredEmail', formData.email);
      
      // Toast de succès
      toast.success('Inscription réussie ! Redirection vers la connexion...', {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Redirection
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            success: true, 
            message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.'
          }
        });
      }, 3000);
      
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
        toast.error(err.response.data.error, {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        const errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
          <Col md={10} lg={8}>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Créer un compte</h2>
                  <p className="text-muted">Rejoignez i-health pour gérer votre santé en ligne</p>
                </div>

                {/* Indicateur de progression */}
                <div className="progress-indicator mb-4">
                  <div className="d-flex justify-content-between">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                      <div className="step-number">1</div>
                      <div className="step-title">Informations personnelles</div>
                    </div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                      <div className="step-number">2</div>
                      <div className="step-title">Sécurité</div>
                    </div>
                  </div>
                  <div className="progress mt-2" style={{ height: '6px' }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{ width: step === 1 ? '50%' : '100%' }}
                    ></div>
                  </div>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {step === 1 && (
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label>Prénom <span className="text-danger">*</span></Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FontAwesomeIcon icon={faUser} />
                              </span>
                              <Form.Control
                                type="text"
                                name="firstname"
                                placeholder="Votre prénom"
                                value={formData.firstname}
                                onChange={handleChange}
                                required
                                disabled={loading}
                              />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label>Nom <span className="text-danger">*</span></Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FontAwesomeIcon icon={faIdCard} />
                              </span>
                              <Form.Control
                                type="text"
                                name="lastname"
                                placeholder="Votre nom"
                                value={formData.lastname}
                                onChange={handleChange}
                                required
                                disabled={loading}
                              />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-4">
                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FontAwesomeIcon icon={faEnvelope} />
                          </span>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Téléphone <span className="text-danger">*</span></Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FontAwesomeIcon icon={faPhone} />
                          </span>
                          <Form.Control
                            type="tel"
                            name="phone"
                            placeholder="77 123 45 67"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Date de naissance <span className="text-danger">*</span></Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                          </span>
                          <Form.Control
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Type de compte</Form.Label>
                        <div>
                          <Form.Check
                            inline
                            type="radio"
                            id="patient"
                            name="userType"
                            value="patient"
                            label="Patient"
                            checked={formData.userType === 'patient'}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            id="doctor"
                            name="userType"
                            value="doctor"
                            label="Médecin"
                            checked={formData.userType === 'doctor'}
                            onChange={handleChange}
                            disabled={loading}
                          />
                          <Form.Check
                            inline
                            type="radio"
                            id="assistant"
                            name="userType"
                            value="assistant"
                            label="Assistant médical"
                            checked={formData.userType === 'assistant'}
                            onChange={handleChange}
                            disabled={loading}
                          />
                        </div>
                      </Form.Group>

                      {/* Message d'info pour admin */}
                      <Alert variant="info" className="mb-4">
                        <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                        <strong>Compte administrateur :</strong> Les comptes administrateurs sont créés uniquement par l'équipe i-health pour des raisons de sécurité.
                      </Alert>

                      {/* Champs pour assistant médical */}
                      {formData.userType === 'assistant' && (
                        <>
                          <hr className="my-4" />
                          <h5 className="mb-3">
                            <FontAwesomeIcon icon={faUserShield} className="me-2" />
                            Assistant médical
                          </h5>
                          
                          <Form.Group className="mb-4">
                            <Form.Label>Code d'invitation <span className="text-danger">*</span></Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FontAwesomeIcon icon={faIdCard} />
                              </span>
                              <Form.Control
                                type="text"
                                name="invitationCode"
                                placeholder="Code fourni par votre médecin"
                                value={formData.invitationCode}
                                onChange={handleChange}
                                required={formData.userType === 'assistant'}
                                disabled={loading}
                              />
                            </div>
                            <Form.Text className="text-muted">
                              Ce code vous a été fourni par le médecin avec qui vous allez travailler.
                            </Form.Text>
                          </Form.Group>
                        </>
                      )}

                      {/* Champs pour médecin */}
                      {formData.userType === 'doctor' && (
                        <>
                          <hr className="my-4" />
                          <h5 className="mb-3">Informations professionnelles</h5>
                          
                          <Form.Group className="mb-4">
                            <Form.Label>Spécialité <span className="text-danger">*</span></Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FontAwesomeIcon icon={faStethoscope} />
                              </span>
                              <Form.Select
                                name="speciality"
                                value={formData.speciality}
                                onChange={handleChange}
                                required={formData.userType === 'doctor'}
                                disabled={loading}
                              >
                                <option value="">Sélectionnez une spécialité</option>
                                <option value="Médecine générale">Médecine générale</option>
                                <option value="Cardiologie">Cardiologie</option>
                                <option value="Dermatologie">Dermatologie</option>
                                <option value="Gynécologie">Gynécologie</option>
                                <option value="Pédiatrie">Pédiatrie</option>
                                <option value="Neurologie">Neurologie</option>
                                <option value="Orthopédie">Orthopédie</option>
                                <option value="Ophtalmologie">Ophtalmologie</option>
                                <option value="Psychiatrie">Psychiatrie</option>
                                <option value="Radiologie">Radiologie</option>
                              </Form.Select>
                            </div>
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label>Numéro de licence <span className="text-danger">*</span></Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FontAwesomeIcon icon={faIdCard} />
                              </span>
                              <Form.Control
                                type="text"
                                name="licenseNumber"
                                placeholder="Numéro d'ordre ou licence professionnelle"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                required={formData.userType === 'doctor'}
                                disabled={loading}
                              />
                            </div>
                          </Form.Group>

                          <Form.Group className="mb-4">
                            <Form.Label>Lieu d'exercice <span className="text-danger">*</span></Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <FontAwesomeIcon icon={faHospital} />
                              </span>
                              <Form.Control
                                type="text"
                                name="workLocation"
                                placeholder="Nom de l'établissement ou cabinet"
                                value={formData.workLocation}
                                onChange={handleChange}
                                required={formData.userType === 'doctor'}
                                disabled={loading}
                              />
                            </div>
                          </Form.Group>
                        </>
                      )}

                      <div className="d-grid gap-2">
                        <Button
                          variant="primary"
                          onClick={nextStep}
                          className="py-2"
                          disabled={loading}
                        >
                          Continuer <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                        </Button>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="mb-4">
                        <h5 className="mb-3">Résumé de vos informations</h5>
                        <ul className="list-group">
                          <li className="list-group-item">
                            <strong>Nom complet :</strong> {formData.firstname} {formData.lastname}
                          </li>
                          <li className="list-group-item">
                            <strong>Email :</strong> {formData.email}
                          </li>
                          <li className="list-group-item">
                            <strong>Type de compte :</strong> {
                              formData.userType === 'patient' ? 'Patient' : 
                              formData.userType === 'doctor' ? 'Médecin' : 
                              'Assistant médical'
                            }
                          </li>
                          {formData.userType === 'doctor' && (
                            <>
                              <li className="list-group-item">
                                <strong>Spécialité :</strong> {formData.speciality}
                              </li>
                              <li className="list-group-item">
                                <strong>Lieu d'exercice :</strong> {formData.workLocation}
                              </li>
                            </>
                          )}
                        </ul>
                      </div>

                      <Form.Group className="mb-4">
                        <Form.Label>Mot de passe <span className="text-danger">*</span></Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FontAwesomeIcon icon={faLock} />
                          </span>
                          <Form.Control
                            type="password"
                            name="password"
                            placeholder="Créez un mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />
                        </div>
                        <Form.Text className="text-muted">
                          Minimum 8 caractères, incluant une lettre, un chiffre et un caractère spécial
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Confirmer le mot de passe <span className="text-danger">*</span></Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FontAwesomeIcon icon={faLock} />
                          </span>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirmez votre mot de passe"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Check
                          type="checkbox"
                          id="acceptTerms"
                          name="acceptTerms"
                          label={
                            <span>
                              J'accepte les <Link to="/terms" target="_blank">conditions générales d'utilisation</Link> et la <Link to="/privacy" target="_blank">politique de confidentialité</Link>
                            </span>
                          }
                          checked={formData.acceptTerms}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </Form.Group>

                      <div className="d-flex gap-2 mb-4">
                        <Button
                          variant="outline-secondary"
                          onClick={prevStep}
                          className="px-4"
                          disabled={loading}
                        >
                          Retour
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading}
                          className="flex-grow-1 py-2"
                        >
                          {loading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Création du compte...
                            </>
                          ) : (
                            'Créer mon compte'
                          )}
                        </Button>
                      </div>
                    </>
                  )}

                  <div className="text-center mt-3">
                    <p className="mb-0">
                      Déjà inscrit? <Link to="/login" className="text-primary fw-bold">Se connecter</Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
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

export default RegisterPage;