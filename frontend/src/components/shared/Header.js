import React from 'react';
import { Container, Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSignOutAlt, faAmbulance } from '@fortawesome/free-solid-svg-icons';

const DashboardHeader = ({ user, notifications, onLogout, onShowEmergency }) => (
  <header className="bg-white shadow-sm py-3 mb-4 sticky-top">
    <Container>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <img src="/images/logo.png" alt="i-health Logo" height="50" className="me-2" />
          <span className="fw-bold fs-4" style={{ color: '#f5a623' }}>i-health</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Button 
            variant="danger" 
            size="sm"
            onClick={onShowEmergency}
            className="d-flex align-items-center"
          >
            <FontAwesomeIcon icon={faAmbulance} className="me-1" />
            <span className="d-none d-md-inline">URGENCE</span>
          </Button>
          <div className="position-relative">
            <FontAwesomeIcon icon={faBell} className="fs-5 text-secondary" style={{ cursor: 'pointer' }} />
            <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle badge-sm">
              {notifications.filter(n => n.isNew).length}
            </Badge>
          </div>
          <div className="d-flex align-items-center">
            <div className="user-avatar me-2">
              <img
                src={user?.profile_image_url || '/images/default-profile.png'}
                alt="Photo de profil"
                className="rounded-circle"
                width="40"
                height="40"
              />
            </div>
            <div className="d-none d-md-block">
              <p className="mb-0 fw-bold">{user?.name}</p>
              <small className="text-muted">Patient</small>
            </div>
          </div>
          <Button variant="outline-warning" size="sm" onClick={onLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
            <span className="d-none d-lg-inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </Container>
  </header>
);

export default DashboardHeader;