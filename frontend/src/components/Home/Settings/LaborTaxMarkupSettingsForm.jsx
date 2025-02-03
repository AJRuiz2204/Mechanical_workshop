/* eslint-disable no-unused-vars */
// src/components/LaborTaxMarkupSettings/LaborTaxMarkupSettingsForm.jsx

import React, { useState, useEffect } from "react";
import {
  getSettingsById,
  createSettings,
  patchSettings,
} from "../../../services/laborTaxMarkupSettingsService";
import "./LaborTaxMarkupSettingsForm.css";

/**
 * LaborTaxMarkupSettingsForm Component
 *
 * Description:
 * This component manages the Labor, Tax, and Markup settings for the workshop.
 * It allows users to create new settings or edit existing ones. The form includes
 * fields for hourly rates, tax rates, and markup percentages. In addition, it displays
 * the current settings fetched from the backend in a read-only format.
 *
 * Features:
 * - Fetch existing settings on mount.
 * - Create new settings if none exist.
 * - Patch existing settings with updated values.
 * - Display success and error messages based on operations.
 * - Show a loading spinner while fetching data.
 * - Display current settings from the database.
 *
 * Dependencies:
 * - React and React Hooks for state management.
 * - Bootstrap classes for layout and responsiveness.
 * - Custom CSS for additional responsive styling.
 */
const LaborTaxMarkupSettingsForm = () => {
  // State to manage form inputs
  const [formData, setFormData] = useState({
    hourlyRate1: "",
    hourlyRate2: "",
    hourlyRate3: "",
    defaultHourlyRate: "",
    partTaxRate: "",
    partTaxByDefault: false,
    laborTaxRate: "",
    laborTaxByDefault: false,
    partMarkup: "",
  });

  // State to hold settings fetched from the database
  const [dbData, setDbData] = useState(null);
  // State to hold the record ID from the database
  const [recordId, setRecordId] = useState(null);
  // Determines if the form is in edit mode (patch) or create mode
  const [isEditMode, setIsEditMode] = useState(false);
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);
  // Saving state during create or patch operations
  const [saving, setSaving] = useState(false);
  // Error message state
  const [error, setError] = useState(null);
  // Success message state
  const [success, setSuccess] = useState(null);

  // Constant ID used to fetch specific settings (adjust as needed)
  const SETTINGS_ID = 1;

  /**
   * useEffect Hook:
   * Fetches existing settings from the backend when the component mounts.
   * Sets the form into edit mode if settings are found, otherwise remains in create mode.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSettingsById(SETTINGS_ID);
        setDbData(data);
        setRecordId(data.id);
        setIsEditMode(true);
        // Populate formData with fetched data. Convert numeric zeros to empty strings.
        setFormData({
          hourlyRate1: data.hourlyRate1 === 0 ? "" : String(data.hourlyRate1),
          hourlyRate2: data.hourlyRate2 === 0 ? "" : String(data.hourlyRate2),
          hourlyRate3: data.hourlyRate3 === 0 ? "" : String(data.hourlyRate3),
          defaultHourlyRate:
            data.defaultHourlyRate === 0 ? "" : String(data.defaultHourlyRate),
          partTaxRate: data.partTaxRate === 0 ? "" : String(data.partTaxRate),
          partTaxByDefault: data.partTaxByDefault,
          laborTaxRate:
            data.laborTaxRate === 0 ? "" : String(data.laborTaxRate),
          laborTaxByDefault: data.laborTaxByDefault,
          partMarkup: data.partMarkup === 0 ? "" : String(data.partMarkup),
        });
      } catch (err) {
        // If the settings are not found (404), switch to create mode
        if (err?.status === 404 || err?.message?.includes("404")) {
          setIsEditMode(false);
          setDbData(null);
        } else {
          setError(err.message || "Error loading settings.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * handleChange Function:
   * Updates the formData state when the user inputs data.
   * Handles both text/number fields and checkbox inputs.
   *
   * @param {Object} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * safeNumber Function:
   * Safely converts a string input to a float.
   * Returns 0 if the input is empty or not a valid number.
   *
   * @param {string} val - The value to convert.
   * @returns {number} - The parsed float or 0.
   */
  const safeNumber = (val) => {
    if (val === "") return 0;
    const p = parseFloat(val);
    return isNaN(p) ? 0 : p;
  };

  /**
   * handleSubmitCreate Function:
   * Handles the submission of the form when creating new settings.
   * Prepares the payload, sends a create request to the backend, and updates the UI.
   *
   * @param {Object} e - The form submission event.
   */
  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare the data payload for creation
      const createDto = {
        hourlyRate1: safeNumber(formData.hourlyRate1),
        hourlyRate2: safeNumber(formData.hourlyRate2),
        hourlyRate3: safeNumber(formData.hourlyRate3),
        defaultHourlyRate: safeNumber(formData.defaultHourlyRate),
        partTaxRate: safeNumber(formData.partTaxRate),
        partTaxByDefault: formData.partTaxByDefault,
        laborTaxRate: safeNumber(formData.laborTaxRate),
        laborTaxByDefault: formData.laborTaxByDefault,
        partMarkup: safeNumber(formData.partMarkup),
      };
      // Send create request to the backend
      const created = await createSettings(createDto);
      setRecordId(created.id);
      setIsEditMode(true);
      setSuccess("Record created successfully.");

      // Fetch the newly created data for display
      const newDbData = await getSettingsById(created.id);
      setDbData(newDbData);

      // Reset form fields
      setFormData({
        hourlyRate1: "",
        hourlyRate2: "",
        hourlyRate3: "",
        defaultHourlyRate: "",
        partTaxRate: "",
        partTaxByDefault: false,
        laborTaxRate: "",
        laborTaxByDefault: false,
        partMarkup: "",
      });
    } catch (err) {
      setError(err.message || "Error creating settings.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * handleSubmitPatch Function:
   * Handles the submission of the form when patching (updating) existing settings.
   * Prepares a patch document and sends a patch request to the backend.
   *
   * @param {Object} e - The form submission event.
   */
  const handleSubmitPatch = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare a patch document (JSON Patch format)
      const patchDoc = [
        {
          op: "replace",
          path: "/hourlyRate1",
          value: safeNumber(formData.hourlyRate1),
        },
        {
          op: "replace",
          path: "/hourlyRate2",
          value: safeNumber(formData.hourlyRate2),
        },
        {
          op: "replace",
          path: "/hourlyRate3",
          value: safeNumber(formData.hourlyRate3),
        },
        {
          op: "replace",
          path: "/defaultHourlyRate",
          value: safeNumber(formData.defaultHourlyRate),
        },
        {
          op: "replace",
          path: "/partTaxRate",
          value: safeNumber(formData.partTaxRate),
        },
        {
          op: "replace",
          path: "/partTaxByDefault",
          value: formData.partTaxByDefault,
        },
        {
          op: "replace",
          path: "/laborTaxRate",
          value: safeNumber(formData.laborTaxRate),
        },
        {
          op: "replace",
          path: "/laborTaxByDefault",
          value: formData.laborTaxByDefault,
        },
        {
          op: "replace",
          path: "/partMarkup",
          value: safeNumber(formData.partMarkup),
        },
      ];
      // Send patch request to the backend
      await patchSettings(recordId, patchDoc);
      setSuccess("Record patched successfully.");

      // Fetch updated data for display
      const updatedData = await getSettingsById(recordId);
      setDbData(updatedData);

      // Reset form fields
      setFormData({
        hourlyRate1: "",
        hourlyRate2: "",
        hourlyRate3: "",
        defaultHourlyRate: "",
        partTaxRate: "",
        partTaxByDefault: false,
        laborTaxRate: "",
        laborTaxByDefault: false,
        partMarkup: "",
      });
    } catch (err) {
      setError(err.message || "Error patching settings.");
    } finally {
      setSaving(false);
    }
  };

  // Show a full-page spinner while data is loading
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Choose the appropriate submit handler based on edit mode
  const handleSubmit = isEditMode ? handleSubmitPatch : handleSubmitCreate;

  return (
    <div className="container mt-4">
      {/* Display error message */}
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}
      {/* Display success message */}
      {success && (
        <div className="alert alert-success mt-3" role="alert">
          {success}
        </div>
      )}

      <div className="row">
        {/* Form Section */}
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-body">
              <h3 className="card-title">
                Labor & Tax Markup Settings ({isEditMode ? "Patch" : "Create"})
              </h3>
              <form onSubmit={handleSubmit} className="mt-3">
                {/* Hourly Rate 1 */}
                <div className="mb-3">
                  <label htmlFor="hourlyRate1" className="form-label">
                    Hourly Rate 1:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="hourlyRate1"
                    name="hourlyRate1"
                    value={formData.hourlyRate1}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                {/* Hourly Rate 2 */}
                <div className="mb-3">
                  <label htmlFor="hourlyRate2" className="form-label">
                    Hourly Rate 2:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="hourlyRate2"
                    name="hourlyRate2"
                    value={formData.hourlyRate2}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                {/* Hourly Rate 3 */}
                <div className="mb-3">
                  <label htmlFor="hourlyRate3" className="form-label">
                    Hourly Rate 3:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="hourlyRate3"
                    name="hourlyRate3"
                    value={formData.hourlyRate3}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                {/* Default Hourly Rate */}
                <div className="mb-3">
                  <label htmlFor="defaultHourlyRate" className="form-label">
                    Default Hourly Rate:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="defaultHourlyRate"
                    name="defaultHourlyRate"
                    value={formData.defaultHourlyRate}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                {/* Part Tax Rate */}
                <div className="mb-3">
                  <label htmlFor="partTaxRate" className="form-label">
                    Part Tax Rate:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="partTaxRate"
                    name="partTaxRate"
                    value={formData.partTaxRate}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                {/* Part Tax By Default Checkbox */}
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="partTaxByDefault"
                    name="partTaxByDefault"
                    checked={formData.partTaxByDefault}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="partTaxByDefault"
                  >
                    Part Tax by Default
                  </label>
                </div>
                {/* Labor Tax Rate */}
                <div className="mb-3">
                  <label htmlFor="laborTaxRate" className="form-label">
                    Labor Tax Rate:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="laborTaxRate"
                    name="laborTaxRate"
                    value={formData.laborTaxRate}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                {/* Labor Tax By Default Checkbox */}
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="laborTaxByDefault"
                    name="laborTaxByDefault"
                    checked={formData.laborTaxByDefault}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="laborTaxByDefault"
                  >
                    Labor Tax by Default
                  </label>
                </div>
                {/* Part Markup */}
                <div className="mb-3">
                  <label htmlFor="partMarkup" className="form-label">
                    Part Markup:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="partMarkup"
                    name="partMarkup"
                    value={formData.partMarkup}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : isEditMode ? (
                    "Patch Existing Record"
                  ) : (
                    "Create New Record"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Database Read Section */}
        <div className="col-md-6">
          <div className="card mb-3">
            <div className="card-body">
              <h5>Labor & Tax Markup Settings (DB Read)</h5>
              {!dbData ? (
                <div className="alert alert-info mt-3" role="alert">
                  No record in DB yet.
                </div>
              ) : (
                <div className="row">
                  {/* Display settings in read-only inputs */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">DB Hourly Rate 1:</label>
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      value={dbData.hourlyRate1}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">DB Hourly Rate 2:</label>
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      value={dbData.hourlyRate2}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">DB Hourly Rate 3:</label>
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      value={dbData.hourlyRate3}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      DB Default Hourly Rate:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      value={dbData.defaultHourlyRate}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">DB Part Tax Rate:</label>
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      value={dbData.partTaxRate}
                    />
                  </div>
                  <div className="col-md-6 mb-3 d-flex align-items-end">
                    <div className="form-check">
                      <label className="form-check-label me-2">
                        DB Part Tax by Default:
                      </label>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={dbData.partTaxByDefault}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">DB Labor Tax Rate:</label>
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      value={dbData.laborTaxRate}
                    />
                  </div>
                  <div className="col-md-6 mb-3 d-flex align-items-end">
                    <div className="form-check">
                      <label className="form-check-label me-2">
                        DB Labor Tax by Default:
                      </label>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={dbData.laborTaxByDefault}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">DB Part Markup:</label>
                    <input
                      type="text"
                      className="form-control"
                      readOnly
                      value={dbData.partMarkup}
                    />
                  </div>
                  <div className="col-md-6 mb-3" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaborTaxMarkupSettingsForm;
