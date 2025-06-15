import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Alert, Table, Modal, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeartbeat, faWeight, faThermometerHalf, faRulerVertical, faPlus,
  faArrowUp, faArrowDown, faCalendarAlt, faEdit, faTrash,
  faDownload, faUpload, faChartLine, faSave, faTimes, faCheck
} from '@fortawesome/free-solid-svg-icons';
import { Line, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function PatientHealthTracking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [viewMode, setViewMode] = useState('charts'); // 'charts' ou 'table'
  
  const [newMetric, setNewMetric] = useState({
    metric_type: 'weight',
    value: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    notes: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Types de métriques disponibles
  const metricTypes = [
    { value: 'weight', label: 'Poids (kg)', icon: faWeight, color: '#0d6efd', unit: 'kg' },
    { value: 'temperature', label: 'Température (°C)', icon: faThermometerHalf, color: '#dc3545', unit: '°C' },
    { value: 'blood_pressure_systolic', label: 'Tension systolique', icon: faHeartbeat, color: '#198754', unit: 'mmHg' },
    { value: 'blood_pressure_diastolic', label: 'Tension diastolique', icon: faHeartbeat, color: '#ffc107', unit: 'mmHg' },
    { value: 'heart_rate', label: 'Fréquence cardiaque', icon: faHeartbeat, color: '#fd7e14', unit: 'bpm' },
    { value: 'height', label: 'Taille (cm)', icon: faRulerVertical, color: '#6f42c1', unit: 'cm' }
  ];

  useEffect(() => {
    loadHealthMetrics();
  }, []);

  const loadHealthMetrics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/health-metrics/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Métriques de santé:', response.data);
      setHealthMetrics(response.data || []);
      
    } catch (error) {
      console.error('Erreur chargement métriques:', error);
      setError('Erreur lors du chargement des données de santé.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = () => {
    setNewMetric({
      metric_type: 'weight',
      value: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      notes: ''
    });
    setSelectedMetric(null);
    setShowAddModal(true);
  };

  const handleEditMetric = (metric) => {
    const metricDate = new Date(metric.recorded_at);
    setNewMetric({
      metric_type: metric.metric_type,
      value: metric.value,
      date: metricDate.toISOString().split('T')[0],
      time: metricDate.toTimeString().slice(0, 5),
      notes: metric.notes || ''
    });
    setSelectedMetric(metric);
    setShowAddModal(true);
  };

  const handleSaveMetric = async () => {
    if (!newMetric.value) {
      setError('Veuillez saisir une valeur.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const recordedAt = `${newMetric.date} ${newMetric.time}`;
      
      if (selectedMetric) {
        // Modification (simulée pour l'instant)
        setMessage('⚠️ Modification non implémentée pour l\'instant');
      } else {
        // Ajout
        const response = await axios.post(`${API_BASE_URL}/health-metrics`, {
          user_id: user.id,
          metric_type: newMetric.metric_type,
          value: parseFloat(newMetric.value),
          recorded_at: recordedAt,
          notes: newMetric.notes
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Métrique ajoutée:', response.data);
        setMessage('✅ Mesure ajoutée avec succès !');
      }
      
      setShowAddModal(false);
      loadHealthMetrics(); // Recharger les données
      
      // Masquer le message après 3 secondes
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Erreur sauvegarde métrique:', error);
      setError(error.response?.data?.error || 'Erreur lors de la sauvegarde.');
    }
  };

  const handleDeleteMetric = async (metricId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette mesure ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/health-metrics/${metricId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMessage('✅ Mesure supprimée avec succès !');
        loadHealthMetrics();
        setTimeout(() => setMessage(''), 3000);
        
      } catch (error) {
        console.error('Erreur suppression métrique:', error);
        setError('Erreur lors de la suppression.');
      }
    }
  };

  // Filtrer les métriques par type pour les graphiques
  const getMetricsByType = (type) => {
    return healthMetrics
      .filter(metric => metric.metric_type === type)
      .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));
  };

  // Générer les données pour les graphiques
  const generateChartData = (type) => {
    const metrics = getMetricsByType(type);
    const metricConfig = metricTypes.find(mt => mt.value === type);
    
    return {
      labels: metrics.map(m => new Date(m.recorded_at).toLocaleDateString('fr-FR')),
      datasets: [{
        label: metricConfig?.label || type,
        data: metrics.map(m => m.value),
        borderColor: metricConfig?.color || '#0d6efd',
        backgroundColor: `${metricConfig?.color || '#0d6efd'}20`,
        fill: true,
        tension: 0.4
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { usePointStyle: true }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0,0,0,0.1)' }
      },
      x: {
        grid: { color: 'rgba(0,0,0,0.1)' }
      }
    }
  };

  // Calculer les statistiques
  const getMetricStats = (type) => {
    const metrics = getMetricsByType(type);
    if (metrics.length === 0) return null;
    
    const values = metrics.map(m => m.value);
    const latest = metrics[metrics.length - 1]?.value;
    const previous = metrics.length > 1 ? metrics[metrics.length - 2]?.value : latest;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = latest > previous ? 'up' : latest < previous ? 'down' : 'stable';
    
    return { latest, min, max, avg: avg.toFixed(1), trend, count: metrics.length };
  };

  const getMetricInfo = (type) => {
    return metricTypes.find(mt => mt.value === type);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement de vos données de santé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-health-tracking">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faHeartbeat} className="me-2 text-danger" />
            Suivi de santé
          </h2>
          <p className="text-muted mb-0">
            Suivez et analysez vos données de santé au fil du temps
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate('/patient')}>
            Retour au tableau de bord
          </Button>
          <Button 
            variant="outline-info"
            onClick={() => setViewMode(viewMode === 'charts' ? 'table' : 'charts')}
          >
            <FontAwesomeIcon icon={viewMode === 'charts' ? faCalendarAlt : faChartLine} className="me-2" />
            {viewMode === 'charts' ? 'Vue tableau' : 'Vue graphiques'}
          </Button>
          <Button variant="success" onClick={handleAddMetric}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Ajouter une mesure
          </Button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Cartes de statistiques */}
      <Row className="mb-4">
        {metricTypes.slice(0, 4).map((metricType) => {
          const stats = getMetricStats(metricType.value);
          return (
            <Col md={3} key={metricType.value} className="mb-3">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div className="display-6 mb-2" style={{ color: metricType.color }}>
                    <FontAwesomeIcon icon={metricType.icon} />
                  </div>
                  <h4 className="fw-bold">
                    {stats ? `${stats.latest} ${metricType.unit}` : '--'}
                  </h4>
                  <p className="text-muted mb-0">{metricType.label}</p>
                  {stats && (
                    <small className={`text-${stats.trend === 'up' ? 'success' : stats.trend === 'down' ? 'danger' : 'muted'}`}>
                      <FontAwesomeIcon 
                        icon={stats.trend === 'up' ? faArrowUp : stats.trend === 'down' ? faArrowDown : faCalendarAlt} 
                        className="me-1" 
                      />
                      {stats.count} mesure(s)
                    </small>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {healthMetrics.length === 0 ? (
        /* État vide */
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FontAwesomeIcon icon={faHeartbeat} size="3x" className="text-muted mb-4" />
            <h4 className="text-muted mb-3">Commencez votre suivi de santé</h4>
            <p className="text-muted mb-4">
              Ajoutez vos premières mesures pour suivre l'évolution de votre santé au fil du temps.
              <br />
              Poids, température, tension artérielle - toutes vos données en un seul endroit.
            </p>
            <Button variant="success" size="lg" onClick={handleAddMetric}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Ajouter ma première mesure
            </Button>
          </Card.Body>
        </Card>
      ) : (
        /* Contenu principal */
        <div>
          {viewMode === 'charts' ? (
            /* Vue graphiques */
            <Row>
              {metricTypes.map((metricType) => {
                const metrics = getMetricsByType(metricType.value);
                if (metrics.length === 0) return null;
                
                return (
                  <Col lg={6} key={metricType.value} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                      <Card.Header className="bg-white border-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="fw-bold mb-0" style={{ color: metricType.color }}>
                            <FontAwesomeIcon icon={metricType.icon} className="me-2" />
                            {metricType.label}
                          </h6>
                          <Badge bg="light" text="dark">{metrics.length} mesures</Badge>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div style={{ height: '200px' }}>
                          <Line data={generateChartData(metricType.value)} options={chartOptions} />
                        </div>
                        
                        {/* Statistiques */}
                        <div className="mt-3 pt-3 border-top">
                          <Row className="text-center">
                            <Col xs={3}>
                              <div className="fw-bold" style={{ color: metricType.color }}>
                                {getMetricStats(metricType.value)?.min} {metricType.unit}
                              </div>
                              <small className="text-muted">Min</small>
                            </Col>
                            <Col xs={3}>
                              <div className="fw-bold" style={{ color: metricType.color }}>
                                {getMetricStats(metricType.value)?.avg} {metricType.unit}
                              </div>
                              <small className="text-muted">Moyenne</small>
                            </Col>
                            <Col xs={3}>
                              <div className="fw-bold" style={{ color: metricType.color }}>
                                {getMetricStats(metricType.value)?.max} {metricType.unit}
                              </div>
                              <small className="text-muted">Max</small>
                            </Col>
                            <Col xs={3}>
                              <div className="fw-bold" style={{ color: metricType.color }}>
                                {getMetricStats(metricType.value)?.latest} {metricType.unit}
                              </div>
                              <small className="text-muted">Dernier</small>
                            </Col>
                          </Row>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            /* Vue tableau */
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 py-3">
                <h5 className="fw-bold mb-0">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2 text-primary" />
                  Historique des mesures
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Valeur</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {healthMetrics
                        .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
                        .map((metric) => {
                          const metricInfo = getMetricInfo(metric.metric_type);
                          return (
                            <tr key={metric.id}>
                              <td>
                                <div className="fw-medium">
                                  {new Date(metric.recorded_at).toLocaleDateString('fr-FR')}
                                </div>
                                <small className="text-muted">
                                  {new Date(metric.recorded_at).toLocaleTimeString('fr-FR', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </small>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <FontAwesomeIcon 
                                    icon={metricInfo?.icon || faHeartbeat} 
                                    className="me-2"
                                    style={{ color: metricInfo?.color || '#6c757d' }}
                                  />
                                  {metricInfo?.label || metric.metric_type}
                                </div>
                              </td>
                              <td>
                                <span className="fw-bold">
                                  {metric.value} {metricInfo?.unit || ''}
                                </span>
                              </td>
                              <td>
                                <small className="text-muted">
                                  {metric.notes || 'Aucune note'}
                                </small>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleEditMetric(metric)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleDeleteMetric(metric.id)}
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      )}

      {/* Modal ajout/modification de mesure */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2 text-success" />
            {selectedMetric ? 'Modifier la mesure' : 'Ajouter une mesure'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Type de mesure *</Form.Label>
              <Form.Select
                value={newMetric.metric_type}
                onChange={(e) => setNewMetric({...newMetric, metric_type: e.target.value})}
              >
                {metricTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newMetric.date}
                    onChange={(e) => setNewMetric({...newMetric, date: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Heure *</Form.Label>
                  <Form.Control
                    type="time"
                    value={newMetric.time}
                    onChange={(e) => setNewMetric({...newMetric, time: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                Valeur * 
                <small className="text-muted">
                  ({getMetricInfo(newMetric.metric_type)?.unit})
                </small>
              </Form.Label>
              <Form.Control
                type="number"
                step="0.1"
                placeholder={`Ex: ${newMetric.metric_type === 'weight' ? '70.5' : newMetric.metric_type === 'temperature' ? '36.7' : '120'}`}
                value={newMetric.value}
                onChange={(e) => setNewMetric({...newMetric, value: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (optionnel)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Ajoutez des notes sur cette mesure..."
                value={newMetric.notes}
                onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="success" 
            onClick={handleSaveMetric}
            disabled={!newMetric.value}
          >
            <FontAwesomeIcon icon={faSave} className="me-2" />
            {selectedMetric ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PatientHealthTracking;