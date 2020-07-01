import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import SelectionPopup from './SelectionPopup';

const SelectionPopupArea = ({ children }) => {
  const [selectionPopupState, setSelectionPopupState] = useState({
    visible: false,
    position: null,
    text: '',
  });

  const handleTextSelect = ({ x, y, width, text }) => {
    setSelectionPopupState({
      visible: true,
      position: { x: x + width / 2, y },
      text,
    });
  };
  const handleSelectionPopupClose = () => {
    setSelectionPopupState((prevState) => ({
      visible: false,
      position: prevState.position,
      text: prevState.text,
    }));
  };

  const getSelectionPopup = () => (
    <SelectionPopup
      position={selectionPopupState.position}
      text={selectionPopupState.text}
      onClose={handleSelectionPopupClose}
    />
  );

  const checkSelection = () => {
    const selection = (
      (window.getSelection && window.getSelection())
      || (document.getSelection && document.getSelection())
    );
    if (selection.toString().length === 0) {
      handleSelectionPopupClose();
    } else {
      const {
        x,
        y,
        width,
        height
      } = selection.getRangeAt(0).getBoundingClientRect();
      handleTextSelect({
        x,
        y,
        width,
        height,
        text: selection.toString(),
      });
    }
  };

  const selectionPopupAreaRef = useRef();
  useEffect(() => {
    const selectionPopupArea = selectionPopupAreaRef.current;
    const stopPropagation = (event) => event.stopPropagation();

    selectionPopupArea.addEventListener('click', stopPropagation);
    // If this event fires then the user clicked outside of selection
    // popup, which means we have to close it
    window.addEventListener('click', handleSelectionPopupClose);

    return () => {
      selectionPopupArea.removeEventListener('click', stopPropagation);
      window.removeEventListener('click', handleSelectionPopupClose);
    };
  }, [children]);

  return (
    <div
      className="selectionPopupArea"
      ref={selectionPopupAreaRef}
      onMouseUp={checkSelection}
    >
      {children}
      {selectionPopupState.visible ? getSelectionPopup() : null}
    </div>
  );
};

SelectionPopupArea.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SelectionPopupArea;
