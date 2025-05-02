import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Input } from "antd";

const EditableCell = ({
  value: initialValue,
  onChange,
  type = "text",
  ...rest
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  const toggleEdit = () => setEditing((e) => !e);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const save = () => {
    setEditing(false);
    onChange(value);
  };

  const inputNode =
    type === "number" ? (
      <Input
        ref={inputRef}
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={save}
        onBlur={save}
        {...rest}
      />
    ) : (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={save}
        onBlur={save}
        {...rest}
      />
    );

  if (editing) {
    return inputNode;
  }
  return <div onClick={toggleEdit}>{value}</div>;
};

EditableCell.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
};

export default EditableCell;
