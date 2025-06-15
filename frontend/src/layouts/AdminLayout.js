// layouts/AdminLayout.js - Layout simple pour admin
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-vh-100 bg-light">
      {/* Header Admin */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <img src="/images/logo.png" alt="i-health Logo" height="30" className="me-2" />
            <span className="fw-bold" style={{ color: '#f5a623' }}>i-health Admin</span>
          </Navbar.Brand>

          <Nav className="ms-auto">
            <Nav.Item className="d-flex align-items-center me-3">
              <FontAwesomeIcon icon={faUserShield} className="me-2" />
              <span className="text-light">Admin: {user?.name}</span>
            </Nav.Item>
            <Button 
              variant="outline-light" 
              size="sm"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
              Déconnexion
            </Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Contenu principal */}
      <Container fluid className="p-4">
        <Outlet />
      </Container>
    </div>
  );
};

export default AdminLayout;