/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/WorkshopSettings/WorkshopSettingsPreview.jsx

import React from 'react';
import { Card } from 'react-bootstrap';

const WorkshopSettingsPreview = ({ settings }) => {
  return (
    <Card>
      <Card.Header>Configuration Preview</Card.Header>
      <Card.Body>
        <h5>{settings.workshopName || 'Workshop Name'}</h5>
        <p>
          <strong>Address:</strong> {settings.address || 'Workshop Address'}
        </p>
        <p>
          <strong>Primary Phone:</strong> {settings.primaryPhone || 'Primary Phone'}
        </p>
        {settings.secondaryPhone && (
          <p>
            <strong>Secondary Phone:</strong> {settings.secondaryPhone}
          </p>
        )}
        {settings.fax && (
          <p>
            <strong>Fax:</strong> {settings.fax}
          </p>
        )}
        {settings.websiteUrl && (
          <p>
            <strong>Website:</strong>{' '}
            <a href={settings.websiteUrl} target="_blank" rel="noopener noreferrer">
              {settings.websiteUrl}
            </a>
          </p>
        )}
        {settings.email && (
          <p>
            <strong>Email:</strong> {settings.email}
          </p>
        )}
        {settings.disclaimer && (
          <p>
            <strong>Disclaimer:</strong> {settings.disclaimer}
          </p>
        )}
        {settings.lastUpdated && (
          <p>
            <em>Last Updated: {new Date(settings.lastUpdated).toLocaleString()}</em>
          </p>
        )}
      </Card.Body>
    </Card>
  );
};

export default WorkshopSettingsPreview;
