/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/WorkshopSettings/WorkshopSettingsPreview.jsx

import React from "react";
import { Card } from "react-bootstrap";
import dayjs from "dayjs";

/**
 * WorkshopSettingsPreview Component
 *
 * Description:
 * This component displays a preview of the saved workshop settings.
 * It shows information such as workshop name, address, phones, fax, website, email,
 * disclaimers and the last settings update.
 *
 * Props:
 * - settings: An object containing workshop settings. May include the following properties:
 *   - workshopName: Workshop name.
 *   - address: Workshop address.
 *   - primaryPhone: Main workshop phone.
 *   - secondaryPhone: Secondary workshop phone (optional).
 *   - fax: Workshop fax number (optional).
 *   - websiteUrl: Workshop website URL (optional).
 *   - email: Workshop email address (optional).
 *   - disclaimer: Legal notice or additional note (optional).
 *   - lastUpdated: Date and time of last settings update (optional).
 */
const WorkshopSettingsPreview = ({ settings }) => {
  /**
   * Formats the date string for "Last Updated".
   * Adjusts the time by subtracting 6 hours according to timezone.
   *
   * @param {string} dateString - The date string to format.
   * @returns {string} - The formatted date string.
   */
  const formatLastUpdated = (dateString) => {
    if (!dateString) return "";

    return dayjs(dateString).subtract(6, "hour").format("YYYY-MM-DD HH:mm:ss");
  };

  // If no settings are saved, display an informational message
  if (!settings) {
    return (
      <Card>
        <Card.Header>Settings Preview</Card.Header>
        <Card.Body>
          <p>No settings saved to display.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>Settings Preview</Card.Header>
      <Card.Body>
        {/* Workshop Name */}
        <h5>{settings.workshopName || "Workshop Name"}</h5>

        {/* Workshop Address */}
        <p>
          <strong>Address:</strong>{" "}
          {settings.address || "Workshop Address"}
        </p>

        {/* Main Phone */}
        <p>
          <strong>Main Phone:</strong>{" "}
          {settings.primaryPhone || "Main Phone"}
        </p>

        {/* Secondary Phone (if exists) */}
        {settings.secondaryPhone && (
          <p>
            <strong>Secondary Phone:</strong> {settings.secondaryPhone}
          </p>
        )}

        {/* Fax (if exists) */}
        {settings.fax && (
          <p>
            <strong>Fax:</strong> {settings.fax}
          </p>
        )}

        {/* Website (if exists) */}
        {settings.websiteUrl && (
          <p>
            <strong>Website:</strong>{" "}
            <a
              href={settings.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {settings.websiteUrl}
            </a>
          </p>
        )}

        {/* Email Address (if exists) */}
        {settings.email && (
          <p>
            <strong>Email:</strong> {settings.email}
          </p>
        )}

        {/* Disclaimer (if exists) */}
        {settings.disclaimer && (
          <p>
            <strong>Disclaimer:</strong> {settings.disclaimer}
          </p>
        )}

        {/* Last Updated (if exists) */}
        {settings.lastUpdated && (
          <p>
            <em>
              Last Updated: {formatLastUpdated(settings.lastUpdated)}
            </em>
          </p>
        )}
      </Card.Body>
    </Card>
  );
};

export default WorkshopSettingsPreview;
