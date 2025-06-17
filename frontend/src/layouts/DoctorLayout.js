import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown, Offcanvas, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, faCalendarCheck, faUsers, faCalendarAlt, 
  faPrescriptionBottleAlt, faBars, faSignOutAlt, faUserMd,
  faFileImage, faCog, faUser
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const DoctorLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Vue d\'ensemble',
      href: '/doctor',
      icon: faChartLine,
      current: location.pathname === '/doctor'
    },
    {
      name: 'Consultations',
      href: '/doctor/appointments',
      icon: faCalendarCheck,
      current: location.pathname === '/doctor/appointments'
    },
    {
      name: 'Patients',
      href: '/doctor/patients',
      icon: faUsers,
      current: location.pathname === '/doctor/patients'
    },
    {
      name: 'Agenda',
      href: '/doctor/agenda',
      icon: faCalendarAlt,
      current: location.pathname === '/doctor/agenda'
    },
    {
      name: 'Prescriptions',
      href: '/doctor/prescriptions',
      icon: faPrescriptionBottleAlt,
      current: location.pathname === '/doctor/prescriptions'
    },
    {
      name: 'Imagerie',
      href: '/doctor/imaging',
      icon: faFileImage,
      current: location.pathname === '/doctor/imaging'
    }
  ];

  const bottomNavigation = [
    {
      name: 'Profil',
      href: '/doctor/profile',
      icon: faUser,
      current: location.pathname === '/doctor/profile'
    },
    {
      name: 'Paramètres',
      href: '/doctor/settings',
      icon: faCog,
      current: location.pathname === '/doctor/settings'
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
            <NavDropdown 
              title={
                <div className="d-flex align-items-center">
                  <div 
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                    style={{ width: '32px', height: '32px' }}
                  >
                    {user?.name?.charAt(0) || 'D'}
                  </div>
                  <span className="d-none d-md-inline">Dr. {user?.name}</span>
                </div>
              } 
              id="doctor-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/doctor/profile">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Profil
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/doctor/settings">
                <FontAwesomeIcon icon={faCog} className="me-2" />
                Paramètres
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Déconnexion
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Container>
      </Navbar>

      <div className="d-flex">
        {/* Sidebar Desktop */}
        <div className="d-none d-lg-block bg-white shadow-sm" style={{ width: '250px', minHeight: 'calc(100vh - 56px)' }}>
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                style={{ width: '40px', height: '40px' }}
              >
                {user?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <div className="fw-semibold">Dr. {user?.name}</div>
                <small className="text-muted">{user?.speciality || 'Médecin'}</small>
              </div>
            </div>
          </div>

          <Nav className="flex-column p-3">
            {navigation.map((item) => (
              <Nav.Link
                key={item.name}
                as={Link}
                to={item.href}
                className={`d-flex align-items-center py-2 px-3 rounded mb-1 ${
                  item.current ? 'bg-primary text-white' : 'text-dark'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="me-3" />
                {item.name}
              </Nav.Link>
            ))}
          </Nav>

          <div className="mt-auto p-3 border-top">
            {bottomNavigation.map((item) => (
              <Nav.Link
                key={item.name}
                as={Link}
                to={item.href}
                className={`d-flex align-items-center py-2 px-3 rounded mb-1 ${
                  item.current ? 'bg-primary text-white' : 'text-dark'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="me-3" />
                {item.name}
              </Nav.Link>
            ))}
          </div>
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
                {user?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <div className="fw-semibold">Dr. {user?.name}</div>
                <small className="text-muted">{user?.speciality || 'Médecin'}</small>
              </div>
            </div>

            <Nav className="flex-column">
              {navigation.map((item) => (
                <Nav.Link
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={`d-flex align-items-center py-2 px-3 rounded mb-1 ${
                    item.current ? 'bg-primary text-white' : 'text-dark'
                  }`}
                  onClick={() => setShowSidebar(false)}
                >
                  <FontAwesomeIcon icon={item.icon} className="me-3" />
                  {item.name}
                </Nav.Link>
              ))}

              <div className="mt-4 pt-3 border-top">
                {bottomNavigation.map((item) => (
                  <Nav.Link
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={`d-flex align-items-center py-2 px-3 rounded mb-1 ${
                      item.current ? 'bg-primary text-white' : 'text-dark'
                    }`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <FontAwesomeIcon icon={item.icon} className="me-3" />
                    {item.name}
                  </Nav.Link>
                ))}
              </div>
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

export default DoctorLayout;