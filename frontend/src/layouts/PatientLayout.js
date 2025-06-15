import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown, Offcanvas, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faCalendarCheck, faFileAlt, faPills, 
  faHeartbeat, faMicroscope, faComments, faUserMd,
  faBars, faSignOutAlt, faUser, faBell
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
//import { usePatient } from '../context/PatientContext';

const PatientLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = 0;
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Vue d\'ensemble',
      href: '/patient',
      icon: faChartLine,
      current: location.pathname === '/patient'
    },
    {
      name: 'Rendez-vous',
      href: '/patient/appointments',
      icon: faCalendarCheck,
      current: location.pathname === '/patient/appointments',
      badge: null
    },
    {
      name: 'Dossier médical',
      href: '/patient/medicalrecords',
      icon: faFileAlt,
      current: location.pathname === '/patient/medicalrecords'
    },
    {
      name: 'Prescriptions',
      href: '/patient/prescriptions',
      icon: faPills,
      current: location.pathname === '/patient/prescriptions'
    },
    {
      name: 'Suivi santé',
      href: '/patient/healthtracking',
      icon: faHeartbeat,
      current: location.pathname === '/patient/healthtracking'
    },
    {
      name: 'Imagerie',
      href: '/patient/imagerie',
      icon: faMicroscope,
      current: location.pathname === '/patient/imagerie'
    },
    {
      name: 'Messages',
      href: '/patient/messages',
      icon: faComments,
      current: location.pathname === '/patient/messages',
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      name: 'Mes médecins',
      href: '/patient/doctors',
      icon: faUserMd,
      current: location.pathname === '/patient/doctors'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header Bootstrap */}
      <Navbar bg="white" expand="lg" className="shadow-sm border-bottom sticky-top">
        <Container fluid>
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              className="d-lg-none me-2"
              onClick={() => setShowSidebar(true)}
            >
              <FontAwesomeIcon icon={faBars} />
            </Button>
            
            <Navbar.Brand href="/" className="d-flex align-items-center">
              <img src="/images/logo.png" alt="i-health Logo" height="30" className="me-2" />
              <span className="fw-bold" style={{ color: '#f5a623' }}>i-health</span>
            </Navbar.Brand>
          </div>

          <Nav className="ms-auto">
            {/* Notifications */}
            <Nav.Link className="position-relative me-2">
              <FontAwesomeIcon icon={faBell} size="lg" />
              {unreadCount > 0 && (
                <Badge 
                  bg="danger" 
                  pill 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.7rem' }}
                >
                  {unreadCount}
                </Badge>
              )}
            </Nav.Link>

            <NavDropdown 
              title={
                <span>
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  {user?.firstName || user?.name}
                </span>
              } 
              id="patient-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={() => navigate('/patient/profile')}>
                Mon profil
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Se déconnecter
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>

      <div className="d-flex">
        {/* Sidebar Desktop */}
        <div className="d-none d-lg-block bg-white shadow-sm" style={{ width: '250px', minHeight: '100vh' }}>
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style={{ width: '40px', height: '40px' }}
              >
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <div className="fw-semibold">{user?.firstName} {user?.lastName || user?.name}</div>
                <small className="text-muted">Patient</small>
              </div>
            </div>
          </div>

          <Nav className="flex-column p-3">
            {navigation.map((item) => (
              <Nav.Link
                key={item.name}
                as={Link}
                to={item.href}
                className={`d-flex align-items-center justify-content-between py-2 px-3 rounded mb-1 ${
                  item.current ? 'bg-primary text-white' : 'text-dark'
                }`}
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={item.icon} className="me-3" />
                  {item.name}
                </div>
                {item.badge && (
                  <Badge 
                    bg={item.current ? 'light' : 'primary'} 
                    text={item.current ? 'primary' : 'white'}
                    pill
                  >
                    {item.badge}
                  </Badge>
                )}
              </Nav.Link>
            ))}
          </Nav>
        </div>

        {/* Sidebar Mobile */}
        <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style={{ width: '40px', height: '40px' }}
              >
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <div className="fw-semibold">{user?.firstName} {user?.lastName || user?.name}</div>
                <small className="text-muted">Patient</small>
              </div>
            </div>

            <Nav className="flex-column">
              {navigation.map((item) => (
                <Nav.Link
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={`d-flex align-items-center justify-content-between py-2 px-3 rounded mb-1 ${
                    item.current ? 'bg-primary text-white' : 'text-dark'
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <div className="d-flex align-items-center">
                    <FontAwesomeIcon icon={item.icon} className="me-3" />
                    {item.name}
                  </div>
                  {item.badge && (
                    <Badge 
                      bg={item.current ? 'light' : 'primary'} 
                      text={item.current ? 'primary' : 'white'}
                      pill
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Nav.Link>
              ))}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Contenu principal */}
        <div className="flex-fill">
          <Container fluid className="p-4">
            <Outlet />
          </Container>
        </div>
      </div>
    </div>
  );
};

export default PatientLayout;