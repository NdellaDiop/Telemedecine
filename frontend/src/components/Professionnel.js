import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Accordion, Badge, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserMd, 
  faCalendarCheck, 
  faLaptopMedical, 
  faFileAlt, 
  faShieldAlt, 
  faQuestionCircle,
  faEnvelope,
  faArrowRight,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

function ProfessionalPage() {
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Ici, vous pourriez implémenter l'envoi du formulaire au backend
    alert('Votre demande a été envoyée, nous vous contacterons prochainement.');
    setShowContactModal(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      message: ''
    });
  };

  const features = [
    {
      icon: faCalendarCheck,
      title: "Gestion des rendez-vous",
      description: "Planifiez et gérez facilement vos consultations en présentiel et à distance."
    },
    {
      icon: faFileAlt,
      title: "Dossiers patients",
      description: "Accédez aux dossiers médicaux électroniques complets de vos patients."
    },
    {
      icon: faShieldAlt,
      title: "Sécurité maximale",
      description: "Plateforme conforme aux normes de sécurité sanitaire et RGPD."
    }
  ];

  return (
    <>
      {/* Header avec bannière */}
      <div className="bg-light">
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
      </div>

      <Container className="mb-5">
        {/* Section Avantages */}
        <Row className="justify-content-center mb-5">
          <Col md={10} lg={8} className="text-center">
            <h2 className="fw-bold mb-4">Pourquoi choisir i-health ?</h2>
            <p className="lead mb-5">
              Notre plateforme est conçue par et pour les professionnels de santé, pour faciliter votre quotidien
              et optimiser la qualité des soins.
            </p>
          </Col>
        </Row>
        <Row className="gy-4 mb-5">
          {features.map((feature, index) => (
            <Col md={6} key={index}>
              <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary text-white p-3 rounded-circle me-3">
                      <FontAwesomeIcon icon={feature.icon} size="lg" />
                    </div>
                    <h3 className="h5 fw-bold mb-0">{feature.title}</h3>
                  </div>
                  <p className="mb-0 text-muted">{feature.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Section principale avec les options */}
        <Row className="justify-content-center mb-5">
          <Col md={10} lg={8}>
            <Card className="shadow border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="d-inline-block p-3 bg-primary text-white rounded-circle mb-3">
                    <FontAwesomeIcon icon={faUserMd} size="2x" />
                  </div>
                  <h2 className="fw-bold">Rejoignez i-health en tant que professionnel de santé</h2>
                  <p className="lead mb-0">
                    Plus de 2000 médecins font déjà confiance à notre plateforme pour leur pratique quotidienne.
                  </p>
                </div>

                <hr className="my-4" />

                <div className="d-flex flex-column gap-3 mb-4">
                  <Button
                    variant="primary"
                    size="lg"
                    className="py-3"
                    onClick={() => navigate('/register', { state: { role: 'doctor' } })}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    S'inscrire en tant que médecin
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    onClick={() => navigate('/login')}
                  >
                    J'ai déjà un compte
                  </Button>
                </div>

                <div className="d-flex justify-content-center gap-3">
                  <Button 
                    variant="link" 
                    className="text-decoration-none"
                    onClick={() => setShowInfoModal(true)}
                  >
                    <FontAwesomeIcon icon={faQuestionCircle} className="me-2" />
                    En savoir plus
                  </Button>
                  <Button 
                    variant="link" 
                    className="text-decoration-none"
                    onClick={() => setShowContactModal(true)}
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                    Nous contacter
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section FAQ */}
        <Row className="justify-content-center mb-5">
          <Col md={10} lg={8}>
            <h3 className="fw-bold mb-4">Questions fréquentes</h3>
            <Accordion defaultActiveKey="0" className="shadow-sm">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Comment fonctionne le processus d'inscription ?</Accordion.Header>
                <Accordion.Body>
                  L'inscription se déroule en 3 étapes : (1) Création de votre compte avec vos informations personnelles,
                  (2) Validation de votre statut de professionnel de santé via votre numéro RPPS ou ADELI, 
                  (3) Configuration de votre profil et de vos disponibilités. 
                  Le processus complet prend généralement moins de 10 minutes.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Quels documents dois-je fournir pour valider mon compte ?</Accordion.Header>
                <Accordion.Body>
                  Pour valider votre compte, vous devrez fournir : votre numéro RPPS ou ADELI, 
                  une copie de votre carte professionnelle, et selon votre spécialité, 
                  potentiellement une attestation d'inscription à l'Ordre. Tous les documents sont 
                  traités de manière sécurisée et confidentielle.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>Quel est le coût d'utilisation de la plateforme ?</Accordion.Header>
                <Accordion.Body>
                  Notre plateforme propose plusieurs formules adaptées à votre pratique :
                  <ul className="mt-2">
                    <li><strong>Formule Essential</strong> : Gratuite avec des fonctionnalités de base</li>
                  </ul>
                  Vous pouvez essayer la formule Pro gratuitement pendant 30 jours.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>La plateforme est-elle conforme aux réglementations sanitaires ?</Accordion.Header>
                <Accordion.Body>
                  Absolument. i-health est entièrement conforme au RGPD et aux réglementations en matière de santé numérique. 
                  Notre plateforme est certifiée HDS (Hébergeur de Données de Santé) et respecte toutes les directives 
                  de l'ANSM et du Conseil National de l'Ordre des Médecins concernant la télémédecine.
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>

        {/* Section Spécialités */}
        <Row className="justify-content-center">
          <Col md={10} lg={8} className="text-center mb-4">
            <h3 className="fw-bold mb-4">Adapté à toutes les spécialités médicales</h3>
            <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
              {['Médecine générale', 'Cardiologie', 'Dermatologie', 'Pédiatrie', 
                'Gynécologie', 'Psychiatrie', 'Ophtalmologie', 'Radiologie',
                'Kinésithérapie', 'Orthophonie', 'Sage-femme', 'Infirmerie'].map((specialty, index) => (
                <Badge bg="light" text="dark" key={index} className="py-2 px-3 fs-6 mb-2">
                  {specialty}
                </Badge>
              ))}
            </div>
            <Button 
              variant="primary" 
              onClick={() => navigate('/register', { state: { role: 'doctor' } })}
              className="mt-2"
            >
              Rejoindre la communauté i-health <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Modal En savoir plus */}
      <Modal show={showInfoModal} onHide={() => setShowInfoModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>À propos de i-health pour les professionnels</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4 className="mb-3">Notre mission</h4>
          <p>
            i-health a été fondé par une équipe de médecins et d'ingénieurs avec un objectif clair : 
            transformer l'expérience de la santé numérique pour les professionnels de santé et leurs patients.
          </p>
          
          <h4 className="mb-3 mt-4">Une solution complète</h4>
          <p>
            Notre plateforme offre un écosystème complet pour votre pratique quotidienne :
          </p>
          <ul>
            <li>Gestion intelligente des rendez-vous avec rappels automatiques</li>
            <li>Dossier patient électronique conforme aux normes HDS</li>
            <li>Prescription électronique sécurisée</li>
            <li>Facturation et gestion administrative simplifiées</li>
            <li>Messagerie sécurisée avec vos patients et confrères</li>
          </ul>

          <h4 className="mb-3 mt-4">Témoignages</h4>
          <blockquote className="border-start border-primary border-3 ps-3 mb-3">
            <p className="mb-2">"i-health a complètement transformé ma pratique. Je gagne un temps précieux sur les tâches administratives et mes patients apprécient la flexibilité de la téléconsultation."</p>
            <footer className="text-muted">Dr. Aissata SY, Médecin généraliste</footer>
          </blockquote>
          <blockquote className="border-start border-primary border-3 ps-3">
            <p className="mb-2">"La gestion des dossiers patients est intuitive et l'intégration avec mon logiciel existant a été parfaite. Un vrai gain de qualité pour ma pratique."</p>
            <footer className="text-muted">Dr. Sokhna Diarra DIOP, Cardiologue</footer>
          </blockquote>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInfoModal(false)}>
            Fermer
          </Button>
          <Button variant="primary" onClick={() => {
            setShowInfoModal(false);
            navigate('/register', { state: { role: 'doctor' } });
          }}>
            S'inscrire maintenant
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Contact */}
      <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contactez notre équipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-4">
            Vous avez des questions sur nos services ? Notre équipe dédiée aux professionnels de santé vous répondra dans les meilleurs délais.
          </p>
          <Form onSubmit={handleContactSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom complet</Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email professionnel</Form.Label>
              <Form.Control 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Spécialité</Form.Label>
              <Form.Control 
                as="select" 
                name="specialty" 
                value={formData.specialty} 
                onChange={handleChange} 
                required
              >
                <option value="">Sélectionnez votre spécialité</option>
                <option>Médecine générale</option>
                <option>Cardiologie</option>
                <option>Dermatologie</option>
                <option>Pédiatrie</option>
                <option>Gynécologie</option>
                <option>Psychiatrie</option>
                <option>Autre spécialité</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Votre message</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                required 
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Envoyer ma demande
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <Container>
          <Row>
            <Col md={6} className="mb-4 mb-md-0">
              <h5 className="mb-3">i-health pour les professionnels</h5>
              <p className="mb-0">
                Transformez votre pratique médicale grâce à notre suite d'outils numériques sécurisés 
                et conformes aux réglementations en vigueur.
              </p>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <h5 className="mb-3">Liens rapides</h5>
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><a href="/fonctionnalites" className="text-white text-decoration-none">Fonctionnalités</a></li>
                <li className="mb-2"><a href="/tarifs" className="text-white text-decoration-none">Tarifs</a></li>
                <li className="mb-2"><a href="/faq" className="text-white text-decoration-none">FAQ</a></li>
                <li><a href="/contact" className="text-white text-decoration-none">Contact</a></li>
              </ul>
            </Col>
            <Col md={3}>
              <h5 className="mb-3">Nous contacter</h5>
              <p className="mb-0">
                Email: pro@i-health.com<br />
                Téléphone: 01 23 45 67 89<br />
                Du lundi au vendredi, 9h-18h
              </p>
            </Col>
          </Row>
          <hr className="my-4" />
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="mb-3 mb-md-0">© 2025 i-health. Tous droits réservés.</p>
            <div>
              <a href="/confidentialite" className="text-white text-decoration-none me-3">Politique de confidentialité</a>
              <a href="/conditions" className="text-white text-decoration-none">CGU</a>
            </div>
          </div>
        </Container>
      </footer>

      {/* Styles CSS supplémentaires */}
      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}

export default ProfessionalPage;