import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Container, Row, Col, Card, Button, Table, 
  Modal, Form, Alert, Badge, InputGroup 
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, faEdit, faTrash, faSearch,
  faUserMd, faUser, faUserNurse, faUserShield
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

function UserManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'patient',
    phone: '',
    birthdate: '',
    speciality: '',
    license_number: '',
    work_location: '',
    is_active: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setError('Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        birthdate: user.birthdate || '',
        speciality: user.speciality || '',
        license_number: user.license_number || '',
        work_location: user.work_location || '',
        is_active: user.is_active
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'patient',
        phone: '',
        birthdate: '',
        speciality: '',
        license_number: '',
        work_location: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (selectedUser) {
        // Modification
        await axios.put(
          `${API_BASE_URL}/admin/users/${selectedUser.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('Utilisateur modifié avec succès !');
      } else {
        // Création
        await axios.post(
          `${API_BASE_URL}/admin/users`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage('Utilisateur créé avec succès !');
      }
      setShowModal(false);
      loadUsers();
    } catch (error) {
      console.error('Erreur sauvegarde utilisateur:', error);
      setError(error.response?.data?.error || 'Erreur lors de la sauvegarde.');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Utilisateur supprimé avec succès !');
        loadUsers();
      } catch (error) {
        console.error('Erreur suppression utilisateur:', error);
        setError('Erreur lors de la suppression.');
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor': return faUserMd;
      case 'patient': return faUser;
      case 'assistant': return faUserNurse;
      case 'admin': return faUserShield;
      default: return faUser;
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      doctor: 'primary',
      patient: 'success',
      assistant: 'info',
      admin: 'danger'
    };
    return (
      <Badge bg={variants[role] || 'secondary'}>
        <FontAwesomeIcon icon={getRoleIcon(role)} className="me-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faUserShield} className="me-2 text-danger" />
            Gestion des utilisateurs
          </h2>
          <p className="text-muted mb-0">
            Gérez les utilisateurs de la plateforme
          </p>
        </div>
        <Button variant="success" onClick={() => handleShowModal()}>
          <FontAwesomeIcon icon={faUserPlus} className="me-2" />
          Nouvel utilisateur
        </Button>
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

      {/* Recherche */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>
              <FontAwesomeIcon icon={faSearch} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Liste des utilisateurs */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <Badge bg={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal(user)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal de création/modification */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Modifier un utilisateur' : 'Nouvel utilisateur'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rôle</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Médecin</option>
                    <option value="assistant">Assistant médical</option>
                    <option value="admin">Administrateur</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            {formData.role === 'patient' && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date de naissance</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.birthdate}
                      onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
            {formData.role === 'doctor' && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Spécialité</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.speciality}
                        onChange={(e) => setFormData({...formData, speciality: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Numéro de licence</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.license_number}
                        onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Lieu de travail</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.work_location}
                        onChange={(e) => setFormData({...formData, work_location: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="is-active"
                label="Compte actif"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              {selectedUser ? 'Modifier' : 'Créer'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default UserManagement; 