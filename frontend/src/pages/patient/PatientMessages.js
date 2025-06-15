import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Alert, ListGroup, Modal, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, faPaperPlane, faUserMd, faSearch, faPlus,
  faEnvelope, faEnvelopeOpen, faClock, faReply, faTrash
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function PatientMessages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [myDoctors, setMyDoctors] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState({
    receiverId: '',
    content: ''
  });
  const [replyContent, setReplyContent] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.id) {
      loadMessages();
      loadMyDoctors();
    }
  }, [user]);

  const loadMessages = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/messages/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Messages reçus:', response.data);
      setMessages(response.data.messages || []);
      
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      setError('Erreur lors du chargement des messages.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyDoctors = async () => {
    if (!user || !user.id) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer les RDV pour trouver les médecins
      const appointmentsResponse = await axios.get(`${API_BASE_URL}/appointments/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userAppointments = appointmentsResponse.data || [];
      
      // Récupérer tous les médecins
      const doctorsResponse = await axios.get(`${API_BASE_URL}/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allDoctors = doctorsResponse.data.doctors || [];
      
      // Filtrer les médecins avec qui le patient a eu des RDV
      const doctorIds = [...new Set(userAppointments.map(apt => apt.doctor_id))];
      const patientDoctors = allDoctors.filter(doctor => doctorIds.includes(doctor.id));
      
      setMyDoctors(patientDoctors);
      
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
    }
  };

  const handleSendNewMessage = async () => {
    if (!newMessage.receiverId || !newMessage.content.trim()) {
      setError('Veuillez sélectionner un destinataire et saisir un message.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/messages`, {
        receiver_id: parseInt(newMessage.receiverId),
        content: newMessage.content.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Message envoyé:', response.data);
      setMessage('✅ Message envoyé avec succès !');
      setShowNewMessageModal(false);
      setNewMessage({ receiverId: '', content: '' });
      loadMessages(); // Recharger les messages
      
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setError(error.response?.data?.error || 'Erreur lors de l\'envoi du message.');
    }
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyContent.trim()) {
      setError('Veuillez saisir votre réponse.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Déterminer le destinataire (l'autre personne dans la conversation)
      const receiverId = selectedConversation.sender_name === user.name ? 
        selectedConversation.receiver_id : selectedConversation.sender_id;
      
      const response = await axios.post(`${API_BASE_URL}/messages`, {
        receiver_id: receiverId,
        content: replyContent.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Réponse envoyée:', response.data);
      setMessage('✅ Réponse envoyée avec succès !');
      setReplyContent('');
      setSelectedConversation(null);
      loadMessages(); // Recharger les messages
      
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Erreur envoi réponse:', error);
      setError(error.response?.data?.error || 'Erreur lors de l\'envoi de la réponse.');
    }
  };

  // Grouper les messages par conversation
  const groupMessagesByConversation = () => {
    if (!messages.length) return [];
    
    const conversations = {};
    
    messages.forEach(msg => {
      // Créer une clé unique pour la conversation (indépendamment de qui a envoyé)
      const participantIds = [msg.sender_name, msg.receiver_name].sort().join('-');
      
      if (!conversations[participantIds]) {
        conversations[participantIds] = {
          id: participantIds,
          participants: [msg.sender_name, msg.receiver_name],
          otherParticipant: msg.sender_name === user.name ? msg.receiver_name : msg.sender_name,
          lastMessage: msg,
          messages: []
        };
      }
      
      conversations[participantIds].messages.push(msg);
      
      // Garder le message le plus récent comme dernier message
      if (new Date(msg.sent_at) > new Date(conversations[participantIds].lastMessage.sent_at)) {
        conversations[participantIds].lastMessage = msg;
      }
    });
    
    // Trier par dernier message le plus récent
    return Object.values(conversations).sort((a, b) => 
      new Date(b.lastMessage.sent_at) - new Date(a.lastMessage.sent_at)
    );
  };

  const conversations = groupMessagesByConversation();

  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status"></div>
          <p>Chargement de vos messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-messages">
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <FontAwesomeIcon icon={faComments} className="me-2 text-primary" />
            Mes messages
          </h2>
          <p className="text-muted mb-0">
            Communiquez avec vos médecins
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => navigate('/patient')}>
            Retour au tableau de bord
          </Button>
          <Button variant="primary" onClick={() => setShowNewMessageModal(true)}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Nouveau message
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

      {/* Statistiques rapides */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">
                <FontAwesomeIcon icon={faComments} />
              </div>
              <h3 className="fw-bold">{conversations.length}</h3>
              <p className="text-muted mb-0">Conversations</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">
                <FontAwesomeIcon icon={faUserMd} />
              </div>
              <h3 className="fw-bold">{myDoctors.length}</h3>
              <p className="text-muted mb-0">Médecins disponibles</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <h3 className="fw-bold">{messages.length}</h3>
              <p className="text-muted mb-0">Messages total</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-warning mb-2">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3 className="fw-bold">
                {conversations.length > 0 ? 
                  Math.floor((new Date() - new Date(conversations[0].lastMessage.sent_at)) / (1000 * 60 * 60 * 24)) : 0
                }j
              </h3>
              <p className="text-muted mb-0">Dernier message</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {conversations.length === 0 ? (
        /* État vide */
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FontAwesomeIcon icon={faComments} size="3x" className="text-muted mb-4" />
            <h4 className="text-muted mb-3">Aucune conversation</h4>
            <p className="text-muted mb-4">
              Vous n'avez pas encore de messages avec vos médecins.
              <br />
              Commencez par envoyer un message à l'un de vos médecins.
            </p>
            {myDoctors.length > 0 ? (
              <Button variant="primary" size="lg" onClick={() => setShowNewMessageModal(true)}>
                <FontAwesomeIcon icon={faPlus} className="me-2" />
                Envoyer mon premier message
              </Button>
            ) : (
              <div>
                <p className="text-muted mb-3">
                  Vous devez d'abord prendre rendez-vous avec un médecin.
                </p>
                <Button variant="primary" onClick={() => navigate('/patient/rendez-vous')}>
                  Prendre un rendez-vous
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      ) : (
        /* Liste des conversations */
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0 py-3">
            <h5 className="fw-bold mb-0">Conversations</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <ListGroup variant="flush">
              {conversations.map((conversation) => (
                <ListGroup.Item 
                  key={conversation.id} 
                  className="d-flex align-items-start py-3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedConversation(conversation.lastMessage)}
                >
                  <div className="me-3">
                    <div 
                      className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                      style={{ width: '50px', height: '50px' }}
                    >
                      <FontAwesomeIcon icon={faUserMd} />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="fw-bold mb-0">{conversation.otherParticipant}</h6>
                      <small className="text-muted">
                        {new Date(conversation.lastMessage.sent_at).toLocaleDateString('fr-FR')}
                      </small>
                    </div>
                    <p className="text-muted mb-0">
                      {conversation.lastMessage.content.length > 100 ? 
                        `${conversation.lastMessage.content.substring(0, 100)}...` : 
                        conversation.lastMessage.content
                      }
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <small className="text-muted">
                        {conversation.messages.length} message(s)
                      </small>
                      <Button variant="outline-primary" size="sm">
                        <FontAwesomeIcon icon={faReply} className="me-1" />
                        Répondre
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card.Body>
        </Card>
      )}

      {/* Modal nouveau message */}
      <Modal show={showNewMessageModal} onHide={() => setShowNewMessageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faPlus} className="me-2 text-primary" />
            Nouveau message
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Destinataire *</Form.Label>
              <Form.Select
                value={newMessage.receiverId}
                onChange={(e) => setNewMessage({...newMessage, receiverId: e.target.value})}
              >
                <option value="">Sélectionner un médecin</option>
                {myDoctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name} - {doctor.speciality}
                  </option>
                ))}
              </Form.Select>
              {myDoctors.length === 0 && (
                <Form.Text className="text-muted">
                  Vous devez d'abord prendre rendez-vous avec un médecin pour pouvoir lui envoyer des messages.
                </Form.Text>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Tapez votre message ici..."
                value={newMessage.content}
                onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewMessageModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendNewMessage}
            disabled={!newMessage.receiverId || !newMessage.content.trim()}
          >
            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
            Envoyer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal réponse */}
      <Modal show={!!selectedConversation} onHide={() => setSelectedConversation(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faReply} className="me-2 text-primary" />
            Répondre à {selectedConversation?.sender_name === user.name ? 
              selectedConversation?.receiver_name : selectedConversation?.sender_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConversation && (
            <div>
              {/* Message original */}
              <Card className="border-0 bg-light mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <small className="fw-bold">
                      {selectedConversation.sender_name === user.name ? 'Vous' : selectedConversation.sender_name}
                    </small>
                    <small className="text-muted">
                      {new Date(selectedConversation.sent_at).toLocaleDateString('fr-FR')} à {' '}
                      {new Date(selectedConversation.sent_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                  <p className="mb-0">{selectedConversation.content}</p>
                </Card.Body>
              </Card>

              {/* Zone de réponse */}
              <Form>
                <Form.Group>
                  <Form.Label>Votre réponse</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Tapez votre réponse ici..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedConversation(null)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendReply}
            disabled={!replyContent.trim()}
          >
            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
            Envoyer la réponse
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PatientMessages;