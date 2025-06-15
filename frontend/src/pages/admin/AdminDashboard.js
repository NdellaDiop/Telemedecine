// pages/admin/AdminDashboard.js - Dashboard admin simple
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faUserMd, faCalendarCheck, faChartLine 
} from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = () => {
  return (
    <div>
      <div className="mb-4">
        <h2 className="h4 mb-1">
          <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
          Administration i-health
        </h2>
        <p className="text-muted mb-0">
          Vue d'ensemble de la plateforme
        </p>
      </div>

      {/* Statistiques générales */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="mb-2">
                <FontAwesomeIcon icon={faUsers} size="2x" className="text-primary" />
              </div>
              <h4 className="mb-1">125</h4>
              <small className="text-muted">Patients inscrits</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="mb-2">
                <FontAwesomeIcon icon={faUserMd} size="2x" className="text-success" />
              </div>
              <h4 className="mb-1">23</h4>
              <small className="text-muted">Médecins partenaires</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="mb-2">
                <FontAwesomeIcon icon={faCalendarCheck} size="2x" className="text-info" />
              </div>
              <h4 className="mb-1">89</h4>
              <small className="text-muted">RDV ce mois</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="mb-2">
                <FontAwesomeIcon icon={faChartLine} size="2x" className="text-warning" />
              </div>
              <h4 className="mb-1">95%</h4>
              <small className="text-muted">Taux satisfaction</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Tableau de bord administrateur</h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-0">
                Interface d'administration pour gérer la plateforme i-health.
                <br />
                Fonctionnalités à développer : gestion des utilisateurs, statistiques détaillées, configuration système.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;