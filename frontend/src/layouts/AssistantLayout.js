import React from 'react';
import { Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faCalendarAlt, faUsers, faUser,
  faSignOutAlt, faBell, faCog, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

function AssistantLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
        <div className="p-3 border-bottom border-secondary">
          <h5 className="mb-0">i-Health</h5>
          <small className="text-muted">Assistant</small>
        </div>
        
        <Nav className="flex-column p-3">
          <Nav.Link 
            href="/assistant" 
            className={`text-white mb-2 ${isActive('/assistant') ? 'active bg-primary' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate('/assistant');
            }}
          >
            <FontAwesomeIcon icon={faHome} className="me-2" />
            Tableau de bord
          </Nav.Link>
          
          <Nav.Link 
            href="/assistant/appointments" 
            className={`text-white mb-2 ${isActive('/assistant/appointments') ? 'active bg-primary' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate('/assistant/appointments');
            }}
          >
            <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
            Rendez-vous
          </Nav.Link>
          
          <Nav.Link 
            href="/assistant/patients" 
            className={`text-white mb-2 ${isActive('/assistant/patients') ? 'active bg-primary' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate('/assistant/patients');
            }}
          >
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Patients
          </Nav.Link>
          
          <Nav.Link 
            href="/assistant/profile" 
            className={`text-white mb-2 ${isActive('/assistant/profile') ? 'active bg-primary' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate('/assistant/profile');
            }}
          >
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Profil
          </Nav.Link>
        </Nav>
        
        <div className="mt-auto p-3 border-top border-secondary">
          <Nav.Link 
            href="#" 
            className="text-white"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
            Déconnexion
          </Nav.Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow-1">
        {/* Top navbar */}
        <Navbar bg="white" className="border-bottom shadow-sm">
          <Container fluid>
            <Navbar.Brand href="#home">
              <FontAwesomeIcon icon={faChartLine} className="text-primary me-2" />
              i-Health Assistant
            </Navbar.Brand>
            
            <Nav className="ms-auto">
              <Nav.Link href="#" className="position-relative">
                <FontAwesomeIcon icon={faBell} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </Nav.Link>
              
              <Nav.Link href="/assistant/profile">
                <FontAwesomeIcon icon={faUser} className="me-2" />
                {user?.name || 'Assistant'}
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        {/* Page content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AssistantLayout; 