import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Form, Input, Button, Alert, Spin, List, Modal } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import {
  getNotesByDiagnostic,
  createNote,
  deleteNote,
  getNotesByTechDiag,
} from "../../services/NotesService";
import "./NotesSection.css";

/**
 * NotesSection Component
 *
 * This component handles the creation, display, and deletion of notes
 * related to either a diagnostic or a technician diagnostic.
 *
 * Features:
 *  - If a "techDiagId" is provided, it loads and manages notes for the TechnicianDiagnostic.
 *  - If a "diagId" is provided, it loads and manages notes for the Diagnostic.
 *  - Allows adding new notes and deleting them.
 *
 * @component
 * @param {number} diagId - The diagnostic ID to which notes are associated.
 * @param {number} techDiagId - The technician diagnostic ID to which notes are associated.
 * @returns {JSX.Element}
 */
const NotesSection = ({ diagId, techDiagId }) => {
  // State variables for notes, form text, loading status, and messages
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  /**
   * useEffect - Loads notes depending on whether techDiagId or diagId exists.
   */
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

    if (techDiagId || diagId) {
      fetchNotes();
    }
  }, [diagId, techDiagId]);

  /**
   * handleAddNote - Handles the creation of a new note.
   * Assigns both DiagnosticId and TechnicianDiagnosticId if available.
   *
   * @param {Object} e - The form submission event.
   */
  const handleAddNote = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!noteText.trim()) {
      setErrorMessage("Note cannot be empty.");
      return;
    }

    try {
      // include both IDs so backend can validate DiagnosticId
      const payload = {
        diagnosticId: diagId,
        ...(techDiagId && { technicianDiagnosticId: techDiagId }),
        content: noteText.trim(),
      };
      const newNote = await createNote(payload);
      setNotes((prev) => [...prev, newNote]);
      setSuccessMessage("Note added successfully.");
      setNoteText("");
    } catch (error) {
      setErrorMessage("Error adding note: " + error.message);
    }
  };

  /**
   * handleDeleteNote - Handles deleting a specific note.
   */
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
    <div className="notes-section-container">
      <h5>Notes</h5>

      {errorMessage && <Alert type="error" message={errorMessage} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      <Form layout="vertical" onFinish={handleAddNote}>
        <Form.Item rules={[{ required: true, message: "Please enter a note" }]}>
          <Input.TextArea
            rows={3}
            placeholder="Enter your note here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Note
          </Button>
        </Form.Item>
      </Form>

      <Spin spinning={loading}>
        <List
          dataSource={notes}
          bordered
          locale={{ emptyText: "No notes available." }}
          renderItem={(note) => (
            <List.Item
              key={note.id}
              actions={[
                <Button
                  key={`delete-${note.id}`}
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setNoteToDelete(note);
                    setShowDeleteModal(true);
                  }}
                />,
              ]}
            >
              <List.Item.Meta
                description={new Date(note.createdAt).toLocaleString()}
              />
              <div>{note.content}</div>
            </List.Item>
          )}
        />
      </Spin>

      <Modal
        title="Delete Note"
        open={showDeleteModal}
        onOk={handleDeleteNote}
        onCancel={() => setShowDeleteModal(false)}
        okType="danger"
        okText="Delete"
      >
        Are you sure you want to delete this note?
      </Modal>
    </div>
  );
};

// add prop validation
NotesSection.propTypes = {
  diagId: PropTypes.number,
  techDiagId: PropTypes.number,
};

export default NotesSection;
