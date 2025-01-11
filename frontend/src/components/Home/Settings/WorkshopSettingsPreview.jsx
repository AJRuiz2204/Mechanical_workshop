/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/WorkshopSettings/WorkshopSettingsPreview.jsx

import React from "react";
import { Card } from "react-bootstrap";
import dayjs from "dayjs";

const WorkshopSettingsPreview = ({ settings }) => {
  if (!settings) {
    return (
      <Card>
        <Card.Header>Vista Previa de Configuración</Card.Header>
        <Card.Body>
          <p>No hay ajustes guardados para mostrar.</p>
        </Card.Body>
      </Card>
    );
  }

  // Función para convertir y formatear la fecha/hora restando 6 horas
  const formatLastUpdated = (dateString) => {
    // Verifica que exista el valor antes de formatear
    if (!dateString) return "";

    // dayjs(dateString) parsea la fecha/hora original
    // .subtract(6, 'hour') le resta 6 horas
    // .format('YYYY-MM-DD HH:mm:ss') la presenta en el formato deseado
    return dayjs(dateString).subtract(6, "hour").format("YYYY-MM-DD HH:mm:ss");
  };

  return (
    <Card>
      <Card.Header>Vista Previa de Configuración</Card.Header>
      <Card.Body>
        <h5>{settings.workshopName || "Nombre del Taller"}</h5>
        <p>
          <strong>Dirección:</strong>{" "}
          {settings.address || "Dirección del Taller"}
        </p>
        <p>
          <strong>Teléfono Principal:</strong>{" "}
          {settings.primaryPhone || "Teléfono Principal"}
        </p>
        {settings.secondaryPhone && (
          <p>
            <strong>Teléfono Secundario:</strong> {settings.secondaryPhone}
          </p>
        )}
        {settings.fax && (
          <p>
            <strong>Fax:</strong> {settings.fax}
          </p>
        )}
        {settings.websiteUrl && (
          <p>
            <strong>Sitio Web:</strong>{" "}
            <a
              href={settings.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
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
            <em>
              Última Actualización: {formatLastUpdated(settings.lastUpdated)}
            </em>
          </p>
        )}
      </Card.Body>
    </Card>
  );
};

export default WorkshopSettingsPreview;
