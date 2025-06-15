import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const EmptyState = ({ message, icon, actionButton }) => (
  <div className="text-center py-5">
    {icon && <FontAwesomeIcon icon={icon} size="4x" className="text-muted mb-3" />}
    <h5 className="text-muted">{message}</h5>
    {actionButton}
  </div>
);

export default EmptyState;