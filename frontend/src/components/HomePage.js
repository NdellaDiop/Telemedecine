import React, { useState, useContext } from 'react';
import { Container, Row, Col, Button, Card, Form, InputGroup, Alert, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faCalendarCheck, faUserMd, faVideo, faPills, faBell, 
  faPhone, faEnvelope, faMapMarkerAlt, faMedkit, faHeartbeat, 
  faStethoscope, faAmbulance, faShieldAlt, faStar
} from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { user, logout, loading } = useContext(AuthContext);
  const [location, setLocation] = useState('Sénégal');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Nouvelles fonctionnalités ajoutées
  const [popularSpecialties] = useState([
    { name: 'Médecine générale', icon: faStethoscope, count: 45 },
    { name: 'Cardiologie', icon: faHeartbeat, count: 23 },
    { name: 'Pédiatrie', icon: faMedkit, count: 18 },
    { name: 'Gynécologie', icon: faUserMd, count: 15 }
  ]);

  const [testimonials] = useState([
    {
      name: "Aminata Diallo",
      location: "Dakar",
      rating: 5,
      comment: "Service excellent ! J'ai pu prendre rendez-vous facilement et le médecin était très professionnel.",
      specialty: "Consultation générale"
    },
    {
      name: "Mamadou Sow", 
      location: "Thiès",
      rating: 5,
      comment: "Très pratique pour gérer mes rendez-vous. La téléconsultation m'a fait gagner beaucoup de temps.",
      specialty: "Cardiologie"
    },
    {
      name: "Fatou Ndiaye",
      location: "Saint-Louis", 
      rating: 5,
      comment: "Interface intuitive et médecins compétents. Je recommande vivement i-health !",
      specialty: "Pédiatrie"
    }
  ]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Veuillez saisir une spécialité ou un nom de médecin');
      return;
    }

    setSearchLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/users/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const doctors = response.data.doctors.filter(doctor => 
        (doctor.speciality.toLowerCase().includes(searchQuery.toLowerCase()) || 
         doctor.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        doctor.work_location.toLowerCase().includes(location.toLowerCase())
      );

      if (doctors.length === 0) {
        setError(`Aucun médecin trouvé pour "${searchQuery}" à ${location}`);
        setSearchLoading(false);
        return;
      }

      navigate('/nosmedecin', { state: { doctors, searchQuery, location } });
    } catch (err) {
      setError('Erreur lors de la recherche des médecins. Veuillez réessayer.');
      console.error('Erreur recherche:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSpecialtyClick = (specialty) => {
    setSearchQuery(specialty);
    handleSearch();
  };

  const handleEmergency = () => {
    setShowEmergencyModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
    <div className="homepage">
      {/* Header amélioré */}
      <header className="bg-white shadow-sm py-3 sticky-top">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="text-decoration-none d-flex align-items-center">
              <img src="/images/logo.png" alt="i-health Logo" height="40" className="me-2" />
              <span className="fw-bold fs-4" style={{ color: '#f5a623' }}>i-health</span>
            </a>

            {/* Bouton urgence toujours visible */}
            <Button 
              variant="danger" 
              size="sm" 
              className="d-flex align-items-center me-3"
              onClick={handleEmergency}
            >
              <FontAwesomeIcon icon={faAmbulance} className="me-1" />
              <span className="d-none d-md-inline">URGENCE</span>
            </Button>

            <div className="d-flex gap-2">
              {user ? (
                <>
                  <div className="d-none d-lg-flex align-items-center me-3">
                    <small className="text-muted">Bonjour, {user.name}</small>
                  </div>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate(
                      user.role === 'doctor' ? '/doctor-dashboard' : 
                      user.role === 'patient' ? '/patient-dashboard' : 
                      user.role === 'assistant' ? '/assistant-dashboard' :
                      '/admin-dashboard'
                    )}
                  >
                    TABLEAU DE BORD
                  </Button>
                  <Button
                    variant="outline-warning"
                    onClick={handleLogout}
                  >
                    SE DÉCONNECTER
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="d-none d-lg-block"
                    onClick={() => navigate('/professionnel')}
                  >
                    PROFESSIONNEL DE SANTÉ ?
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate('/nosmedecin')}
                  >
                    NOS MÉDECINS
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate('/register')}
                  >
                    S'INSCRIRE
                  </Button>
                  <Button
                    variant="outline-warning"
                    onClick={() => navigate('/login')}
                  >
                    SE CONNECTER
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Section améliorée */}
      <section className="position-relative">
        <div
          className="position-absolute w-100 h-100"
          style={{
            backgroundImage: "url('/images/doctorvideo.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
          }}
        ></div>
        <div
          className="hero-content position-relative py-5"
          style={{
            background: 'linear-gradient(135deg, rgba(0,123,255,0.9) 0%, rgba(40,167,69,0.9) 100%)',
            color: 'white',
          }}
        >
          <Container className="py-4 text-center">
            <h1 className="display-4 mb-3">Votre santé, notre priorité</h1>
            <p className="lead mb-4">
              Trouvez et consultez les meilleurs médecins du Sénégal. Prenez rendez-vous en ligne en quelques clics.
            </p>

            {error && (
              <Alert variant="warning" className="mx-auto" style={{maxWidth: '600px'}}>
                {error}
              </Alert>
            )}

            <Row className="justify-content-center">
              <Col md={10} lg={8}>
                <InputGroup className="mb-4 shadow">
                  <Form.Control
                    placeholder="Votre ville (ex: Dakar, Thiès...)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="py-3"
                  />
                  <Form.Control
                    placeholder="Spécialité ou nom du médecin..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-start-0 border-end-0 py-3"
                  />
                  <Button
                    variant="success"
                    className="px-4"
                    onClick={handleSearch}
                    disabled={searchLoading}
                  >
                    {searchLoading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSearch} className="me-2" /> 
                        Rechercher
                      </>
                    )}
                  </Button>
                </InputGroup>

                {/* Spécialités populaires */}
                <div className="text-center">
                  <small className="text-light opacity-75 d-block mb-2">Spécialités populaires :</small>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {popularSpecialties.map((specialty, index) => (
                      <Button
                        key={index}
                        variant="outline-light"
                        size="sm"
                        className="rounded-pill"
                        onClick={() => handleSpecialtyClick(specialty.name)}
                      >
                        <FontAwesomeIcon icon={specialty.icon} className="me-1" />
                        {specialty.name} ({specialty.count})
                      </Button>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Statistiques rapides */}
      <section className="py-4 bg-light">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-3 mb-md-0">
              <div className="fw-bold fs-2 text-primary">150+</div>
              <div className="text-muted">Médecins partenaires</div>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <div className="fw-bold fs-2 text-success">5000+</div>
              <div className="text-muted">Patients satisfaits</div>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <div className="fw-bold fs-2 text-warning">24/7</div>
              <div className="text-muted">Support disponible</div>
            </Col>
            <Col md={3}>
              <div className="fw-bold fs-2 text-info">98%</div>
              <div className="text-muted">Taux de satisfaction</div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section améliorée */}
      <section className="py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Pourquoi choisir i-health ?</h2>
            <p className="lead text-muted">
              Une plateforme complète pour gérer votre santé et celle de votre famille
            </p>
          </div>

          <Row>
            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0 transition-hover">
                <Card.Body className="text-center p-4">
                  <div className="mb-3 text-primary">
                    <FontAwesomeIcon icon={faSearch} size="2x" />
                  </div>
                  <h3 className="h5 mb-3">Recherche intelligente</h3>
                  <p className="text-muted mb-0">
                    Trouvez le bon médecin grâce à notre moteur de recherche avancé par spécialité, localisation et disponibilité.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0 transition-hover">
                <Card.Body className="text-center p-4">
                  <div className="mb-3 text-success">
                    <FontAwesomeIcon icon={faCalendarCheck} size="2x" />
                  </div>
                  <h3 className="h5 mb-3">Réservation instantanée</h3>
                  <p className="text-muted mb-0">
                    Réservez vos rendez-vous 24h/24 avec confirmation immédiate et rappels automatiques.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0 transition-hover">
                <Card.Body className="text-center p-4">
                  <div className="mb-3 text-info">
                    <FontAwesomeIcon icon={faShieldAlt} size="2x" />
                  </div>
                  <h3 className="h5 mb-3">Dossier médical sécurisé</h3>
                  <p className="text-muted mb-0">
                    Vos données médicales et examens d'imagerie stockés en toute sécurité et accessibles partout.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0 transition-hover">
                <Card.Body className="text-center p-4">
                  <div className="mb-3 text-danger">
                    <FontAwesomeIcon icon={faPills} size="2x" />
                  </div>
                  <h3 className="h5 mb-3">Prescriptions numériques</h3>
                  <p className="text-muted mb-0">
                    Recevez vos ordonnances directement sur la plateforme et partagez-les facilement avec votre pharmacie.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm border-0 transition-hover">
                <Card.Body className="text-center p-4">
                  <div className="mb-3 text-secondary">
                    <FontAwesomeIcon icon={faBell} size="2x" />
                  </div>
                  <h3 className="h5 mb-3">Suivi personnalisé</h3>
                  <p className="text-muted mb-0">
                    Rappels de rendez-vous, médicaments et suivis post-consultation pour ne rien oublier.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Section témoignages */}
      <section className="py-5 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Ce que disent nos patients</h2>
            <p className="lead text-muted">
              Des milliers de Sénégalais nous font déjà confiance
            </p>
          </div>

          <Row>
            {testimonials.map((testimonial, index) => (
              <Col md={4} key={index} className="mb-4">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="p-4">
                    <div className="mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FontAwesomeIcon key={i} icon={faStar} className="text-warning me-1" />
                      ))}
                    </div>
                    <p className="text-muted mb-3">"{testimonial.comment}"</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{testimonial.name}</div>
                        <small className="text-muted">{testimonial.location}</small>
                      </div>
                      <small className="badge bg-primary">{testimonial.specialty}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-5 bg-primary text-white">
          <Container className="text-center">
            <h2 className="mb-3">Prêt à prendre soin de votre santé ?</h2>
            <p className="lead mb-4">
              Rejoignez des milliers de Sénégalais qui utilisent déjà i-health
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button 
                variant="light" 
                size="lg"
                onClick={() => navigate('/register')}
              >
                Créer un compte patient
              </Button>
              <Button 
                variant="outline-light" 
                size="lg"
                onClick={() => navigate('/professionnel')}
              >
                Espace professionnel
              </Button>
            </div>
          </Container>
        </section>
      )}

      {/* Modal urgence */}
      <Modal show={showEmergencyModal} onHide={() => setShowEmergencyModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faAmbulance} className="me-2" />
            Numéros d'urgence
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-4">
              <FontAwesomeIcon icon={faPhone} size="2x" className="text-danger mb-3" />
              <h4>En cas d'urgence médicale</h4>
            </div>
            
            <div className="row">
              <div className="col-6 mb-3">
                <Button 
                  variant="outline-danger" 
                  size="lg" 
                  className="w-100"
                  href="tel:15"
                >
                  <div className="fw-bold">SAMU</div>
                  <div>15</div>
                </Button>
              </div>
              <div className="col-6 mb-3">
                <Button 
                  variant="outline-danger" 
                  size="lg" 
                  className="w-100"
                  href="tel:18"
                >
                  <div className="fw-bold">Pompiers</div>
                  <div>18</div>
                </Button>
              </div>
            </div>
            
            <Alert variant="warning" className="mt-3">
              <small>
                <strong>Note :</strong> Pour les urgences non vitales, vous pouvez rechercher un médecin de garde sur notre plateforme.
              </small>
            </Alert>
          </div>
        </Modal.Body>
      </Modal>

      {/* Footer (identique à votre version) */}
      <footer className="bg-dark text-white py-5">
        <Container>
          <Row>
            <Col lg={3} md={6} className="mb-4 mb-lg-0">
              <h5 className="text-warning mb-3">i-health</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate('/about')}>
                    À propos de nous
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate('/services')}>
                    Nos services
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate('/careers')}>
                    Carrières
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate('/blog')}>
                    Blog
                  </Button>
                </li>
              </ul>
            </Col>

            <Col lg={3} md={6} className="mb-4 mb-lg-0">
              <h5 className="text-warning mb-3">Pour les patients</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate('/nosmedecin')}>
                    Rechercher un médecin
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate(user ? '/patient-dashboard' : '/login')}>
                    Prendre rendez-vous
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate(user ? '/patient-dashboard' : '/login')}>
                    Consulter mon dossier
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate('/faq')}>
                    FAQ
                  </Button>
                </li>
              </ul>
            </Col>

            <Col lg={3} md={6} className="mb-4 mb-lg-0">
              <h5 className="text-warning mb-3">Pour les médecins</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate('/professionnel')}>
                    Rejoindre i-health
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate(user && user.role === 'doctor' ? '/doctor-dashboard' : '/register')}>
                    Gérer votre agenda
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate('/solutions')}>
                    Nos solutions
                  </Button>
                </li>
                <li className="mb-2">
                  <Button variant="link" className="text-decoration-none text-light p-0" onClick={() => navigate('/support')}>
                    Support
                  </Button>
                </li>
              </ul>
            </Col>

            <Col lg={3} md={6}>
              <h5 className="text-warning mb-3">Contact</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="tel:338888888" className="text-decoration-none text-light">
                    <FontAwesomeIcon icon={faPhone} className="me-2" /> 33 888 88 88
                  </a>
                </li>
                <li className="mb-2">
                  <a href="mailto:contact@i-health.com" className="text-decoration-none text-light">
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" /> contact@i-health.com
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-light">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" /> Dakar, Sénégal
                  </a>
                </li>
              </ul>
            </Col>
          </Row>

          <div className="text-center pt-4 mt-4 border-top border-secondary">
            <p className="text-muted mb-0">© 2025 i-health. Tous droits réservés.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

export default HomePage;