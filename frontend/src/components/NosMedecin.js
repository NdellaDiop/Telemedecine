import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faCalendarCheck, 
  faUserMd, 
  faVideo, 
  faPills, 
  faBell, 
  faPhone, 
  faEnvelope, 
  faMapMarkerAlt,
  faStar,
  faStethoscope
} from '@fortawesome/free-solid-svg-icons';
import './HomePage.css';

function NosMedecin() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specialties, setSpecialties] = useState([]);

  // Données fictives pour démonstration
  const dummyDoctors = [
    {
      id: 1,
      name: 'Dr. Sokhna Diarra DIOP',
      specialty: 'Cardiologie',
      experience: '12 ans',
      rating: 4.8,
      availableSlots: 5,
      description: 'Spécialiste des maladies cardiovasculaires avec une approche holistique du traitement.'
    },
    {
      id: 2,
      name: 'Dr. Abdou Aziz SY',
      specialty: 'Dermatologie',
      experience: '8 ans',
      rating: 4.6,
      availableSlots: 3,
      description: 'Expert en dermatologie clinique et esthétique avec spécialisation en traitement de l\'acné.'
    },
    {
      id: 3,
      name: 'Dr. Aissatou SECK',
      specialty: 'Pédiatrie',
      experience: '15 ans',
      rating: 4.9,
      availableSlots: 2,
      description: 'Pédiatre expérimentée avec une attention particulière au développement de l\'enfant.'
    },
    {
      id: 4,
      name: 'Dr. Abdoulaye SOW',
      specialty: 'Neurologie',
      experience: '10 ans',
      rating: 4.7,
      availableSlots: 4,
      description: 'Neurologue spécialisé dans le traitement des troubles du sommeil et des migraines.'
    },
    {
      id: 5,
      name: 'Dr. Salif SY',
      specialty: 'Ophtalmologie',
      experience: '9 ans',
      rating: 4.5,
      availableSlots: 6,
      description: 'Spécialiste en chirurgie oculaire et traitement des troubles de la vision.'
    },
    {
      id: 6,
      name: 'Dr. Maguatte DIAWARA',
      specialty: 'Psychiatrie',
      experience: '14 ans',
      rating: 4.8,
      availableSlots: 3,
      description: 'Psychiatre spécialisé dans la thérapie cognitive comportementale et les troubles anxieux.'
    },
    {
      id: 7,
      name: 'Dr. Aissatou KONE',
      specialty: 'Cardiologie',
      experience: '11 ans',
      rating: 4.7,
      availableSlots: 4,
      description: 'Cardiologue interventionnelle avec expertise en insuffisance cardiaque.'
    },
    {
      id: 8,
      name: 'Dr. Ouleymatou Sadiya Cisse',
      specialty: 'Endocrinologie',
      experience: '13 ans',
      rating: 4.6,
      availableSlots: 5,
      description: 'Spécialiste du diabète et des troubles hormonaux avec approche personnalisée.'
    }
  ];
  
  // Extraction des spécialités uniques à partir des données
  const extractSpecialties = (doctors) => {
    const specialtiesSet = new Set(doctors.map(doctor => doctor.specialty));
    return Array.from(specialtiesSet);
  };

  useEffect(() => {
    // Simulation d'un appel API avec setTimeout
    const fetchDoctors = async () => {
      try {
        // Simuler un délai de chargement
        setTimeout(() => {
          setDoctors(dummyDoctors);
          setFilteredDoctors(dummyDoctors);
          setSpecialties(extractSpecialties(dummyDoctors));
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Erreur lors du chargement des médecins');
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filtrer les médecins à chaque changement de recherche ou de spécialité
  useEffect(() => {
    const results = doctors.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           doctor.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === '' || doctor.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
    
    setFilteredDoctors(results);
  }, [searchTerm, selectedSpecialty, doctors]);

  // Fonction pour afficher les étoiles de notation
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < Math.floor(rating)) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: '#f5a623' }} />);
      } else if (i === Math.floor(rating) && rating % 1 !== 0) {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: '#f5a623', opacity: 0.5 }} />);
      } else {
        stars.push(<FontAwesomeIcon key={i} icon={faStar} style={{ color: '#f5a623', opacity: 0.2 }} />);
      }
    }
    return stars;
  };

  return (
    <div className="nosmedecin-page">
      {/* Header - même que HomePage */}
      <header className="bg-white shadow-sm py-3">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <a href="/" className="text-decoration-none d-flex align-items-center">
              <img src="/images/logo.png" alt="i-health Logo" height="40" className="me-2" />
              <span className="fw-bold fs-4" style={{ color: '#f5a623' }}>i-health</span>
            </a>

            <div className="d-flex gap-2">
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
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <section className="position-relative">
        <div
          className="position-absolute w-100 h-100"
          style={{
            backgroundImage: "url('/images/doctors-bg.jpg')",
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
            <h1 className="display-4 mb-3">Nos Médecins Spécialistes</h1>
            <p className="lead mb-4">
              Découvrez les meilleurs professionnels de santé à votre service
            </p>

            <Row className="justify-content-center">
              <Col md={10} lg={8}>
                <Row>
                  <Col md={6} className="mb-3 mb-md-0">
                    <InputGroup className="mb-md-0 shadow">
                      <InputGroup.Text className="bg-white border-end-0">
                        <FontAwesomeIcon icon={faSearch} className="text-primary" />
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Rechercher un médecin..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-start-0 py-3"
                      />
                    </InputGroup>
                  </Col>
                  <Col md={6}>
                    <InputGroup className="shadow">
                      <InputGroup.Text className="bg-white border-end-0">
                        <FontAwesomeIcon icon={faStethoscope} className="text-primary" />
                      </InputGroup.Text>
                      <Form.Select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="border-start-0 py-3"
                      >
                        <option value="">Toutes les spécialités</option>
                        {specialties.map((specialty, index) => (
                          <option key={index} value={specialty}>{specialty}</option>
                        ))}
                      </Form.Select>
                    </InputGroup>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Liste des médecins */}
      <section className="py-5 bg-light">
        <Container>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <h3 className="mt-3 text-muted">Chargement de la liste des médecins...</h3>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <Card className="text-center p-5 shadow-sm">
              <h4>Aucun médecin ne correspond à votre recherche</h4>
              <p>Veuillez essayer avec d'autres critères de recherche</p>
            </Card>
          ) : (
            <Row>
              {filteredDoctors.map((doctor) => (
                <Col key={doctor.id} lg={4} md={6} className="mb-4">
                  <Card className="h-100 shadow-sm border-0 transition-hover">
                    <Card.Body className="p-4">
                      <div className="d-flex mb-3">
                        <div className="me-3">
                          <img 
                            src={doctor.image} 
                            alt={doctor.name} 
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f8f9fa' }} 
                          />
                        </div>
                        <div>
                          <h4 style={{ color: '#0d6efd', marginBottom: '5px' }}>{doctor.name}</h4>
                          <div className="badge bg-primary mb-1">
                            {doctor.specialty}
                          </div>
                          <div className="small text-muted">{doctor.experience} d'expérience</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <div className="me-2">
                            {renderStars(doctor.rating)}
                          </div>
                          <span className="text-muted">({doctor.rating})</span>
                        </div>
                        <p className="mb-3" style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                          {doctor.description}
                        </p>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-success fw-bold">
                          {doctor.availableSlots} créneaux disponibles
                        </span>
                        <Button variant="primary" className="rounded-pill px-4">
                          <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                          Prendre RDV
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* Footer - même que HomePage */}
      <footer className="bg-dark text-white py-4 mt-5">
        <Container className="text-center">
          <p className="mb-0">© 2025 i-health. Tous droits réservés.</p>
        </Container>
      </footer>

      {/* CSS pour les transitions et effets */}
      <style jsx="true">{`
        .transition-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .transition-hover:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

export default NosMedecin;