import React from 'react';
import { Card, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faCalendarCheck, 
  faUserMd, 
  faFileMedical, 
  faPills, 
  faHeart, 
  faUpload, 
  faComments, 
  faSignOutAlt, 
  faStethoscope 
} from '@fortawesome/free-solid-svg-icons';

const NavigationSidebar = ({ activeTab, setActiveTab, onLogout }) => {
const navItems = [
  { key: 'overview', icon: faChartLine, label: 'Vue d\'ensemble', color: 'primary' },
  { key: 'appointments', icon: faCalendarCheck, label: 'Rendez-vous', color: 'info' },
  { key: 'doctors', icon: faUserMd, label: 'Mes médecins', color: 'success' },
  { key: 'records', icon: faFileMedical, label: 'Dossier médical', color: 'warning' },
  { key: 'prescriptions', icon: faPills, label: 'Ordonnances', color: 'danger' },
  { key: 'health', icon: faHeart, label: 'Suivi santé', color: 'pink' },
  { key: 'dicom', icon: faUpload, label: 'Imagerie DICOM', color: 'purple' },
  { key: 'messages', icon: faComments, label: 'Messages', color: 'secondary' },
  { key: 'assistance', icon: faStethoscope, label: 'Assistance Médicale', color: 'success' }
];
return (
    <Card className="border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
      <Card.Body className="p-0">
        <Nav className="flex-column dash-nav">
          {navItems.map(({ key, icon, label, color }) => (
            <Nav.Link 
              key={key}
              className={`px-3 py-3 d-flex align-items-center ${activeTab === key ? `active text-${color}` : 'text-muted'}`}
              onClick={() => setActiveTab(key)}
              style={{ cursor: 'pointer', borderRadius: '8px', margin: '2px 8px' }}
            >
              <FontAwesomeIcon icon={icon} className="me-3" size="lg" />
              <span className="fw-medium">{label}</span>
            </Nav.Link>
          ))}
          <hr className="mx-3" />
          <Nav.Link 
            className="px-3 py-3 text-danger d-flex align-items-center"
            onClick={onLogout}
            style={{ cursor: 'pointer', borderRadius: '8px', margin: '2px 8px' }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="me-3" size="lg" />
            <span className="fw-medium">Déconnexion</span>
          </Nav.Link>
        </Nav>
      </Card.Body>
    </Card>
  );
};

export default NavigationSidebar;