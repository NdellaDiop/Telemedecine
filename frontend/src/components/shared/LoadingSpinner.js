import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Chargement...' }) => (
  <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <Spinner animation="border" variant="primary" className="me-3" />
    <span className="text-secondary">{message}</span>
  </div>
);

export default LoadingSpinner;