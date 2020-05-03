import React, { useRef, useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';

import { getTranslation } from '../util';
import { RepeatListContext } from './RepeatListProvider';

const SelectionPopup = ({
  position,
  text,
  onClose,
}) => {
  useEffect(() => {
    const handleWindowKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  });

  const { onWordAdd } = useContext(RepeatListContext);
  const inputRef = useRef();
  const handleWordAdd = () => {
    const wordText = inputRef.current.value;
    onWordAdd(wordText);
    onClose();
  };

  const [translation, setTranslation] = useState(null);
  const updateTranslation = (textToTranslate) => {
    getTranslation(textToTranslate)
      .then((response) => response.json())
      .then((json) => setTranslation(json.text[0]));
  };

  useEffect(() => {
    inputRef.current.value = text;
    updateTranslation(text);
  }, [text]);

  const positionStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };
  return (
    <div className="selectionPopup" style={positionStyle}>
      <div className="word">
        <input
          type="text"
          onChange={(event) => updateTranslation(event.target.value)}
          defaultValue={text}
          ref={inputRef}
        />
      </div>
      <div className="translation">
        {translation === null ? <span className="placeholder" /> : translation}
      </div>
      <div className="buttons">
        <div className="button okButton" onClick={handleWordAdd}>Add</div>
        <div className="button cancelButton" onClick={onClose}>Cancel</div>
      </div>
    </div>
  );
};

SelectionPopup.propTypes = {
  text: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  position: PropTypes.exact({
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
};

export default SelectionPopup;
