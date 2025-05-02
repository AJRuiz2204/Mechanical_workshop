import { useState, useRef, useEffect } from 'react'
import { Form } from 'react-bootstrap'
import PropTypes from 'prop-types'

const EditableCell = ({
  value,
  onChange,
  type = 'text',
  editable = true,
  size = 'sm'
}) => {
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState(value)
  const ref = useRef(null)

  // cuando entramos en edición, focus automático
  useEffect(() => {
    if (editing && ref.current) ref.current.focus()
  }, [editing])

  return (
    <td
      onDoubleClick={() => editable && setEditing(true)}
      style={{ cursor: editable ? 'pointer' : 'default' }}
    >
      {editing ? (
        <Form.Control
          size={size}
          type={type}
          value={temp}
          ref={ref}
          onChange={e => setTemp(e.target.value)}
          onBlur={() => {
            setEditing(false)
            if (temp !== value) onChange(temp)
          }}
        />
      ) : (
        <span>{value}</span>
      )}
    </td>
  )
}
EditableCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  editable: PropTypes.bool,
  size: PropTypes.string
}

export default EditableCell
