/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// Frontend: src/components/NotesSection/NotesSection.jsx

import React, { useEffect, useState } from "react";
import { Form, Button, Alert, Spinner, ListGroup, Modal } from "react-bootstrap";
import {
  getNotesByDiagnostic,
  createNote,
  deleteNote,
  getNotesByTechDiag,
} from "../../services/NotesService";

const NotesSection = ({ diagId, techDiagId }) => {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        let fetchedNotes = [];
        if (techDiagId) {
          fetchedNotes = await getNotesByTechDiag(techDiagId);
        } else if (diagId) {
          fetchedNotes = await getNotesByDiagnostic(diagId);
        }
        setNotes(fetchedNotes);
      } catch (error) {
        setErrorMessage(error.message || "Error fetching notes.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [diagId, techDiagId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!noteText.trim()) {
      setErrorMessage("Note cannot be empty.");
      return;
    }

    try {
      const newNote = await createNote({
        ...(techDiagId
          ? { TechnicianDiagnosticId: techDiagId }
          : { DiagnosticId: diagId }),
        Content: noteText.trim(),
      });
      setNotes((prev) => [...prev, newNote]);
      setSuccessMessage("Note added successfully.");
      setNoteText("");
    } catch (error) {
      setErrorMessage("Error adding note: " + error.message);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNote(noteToDelete.id);
      setNotes((prev) => prev.filter((note) => note.id !== noteToDelete.id));
      setSuccessMessage("Note deleted successfully.");
    } catch (error) {
      setErrorMessage("Error deleting note: " + error.message);
    } finally {
      setShowDeleteModal(false);
      setNoteToDelete(null);
    }
  };

  return (
    <div className="mt-4">
      <h5>Notes</h5>

      {/* Display error or success messages */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Add Note Form */}
      <Form onSubmit={handleAddNote}>
        <Form.Group controlId="noteText" className="mb-3">
          <Form.Label>Add a Note</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter your note here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Add Note
        </Button>
      </Form>

      {/* Loading Indicator */}
      {loading ? (
        <div className="d-flex justify-content-center my-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading notes...</span>
          </Spinner>
        </div>
      ) : notes.length > 0 ? (
        <ListGroup className="mt-3">
          {notes.map((note) => (
            <ListGroup.Item key={note.id} className="d-flex justify-content-between align-items-start">
              <div>
                <strong>{new Date(note.createdAt).toLocaleString()}</strong>
                <p>{note.content}</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setNoteToDelete(note);
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="mt-3">No notes available.</p>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this note?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteNote}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NotesSection;
