import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';

import { RepeatListContext } from './RepeatListProvider';

import Translation from './Translation';

const SelectionPopup = ({
  visible,
  position,
  text: inputText,
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

  const [text, setText] = useState(inputText);
  useEffect(() => setText(inputText), [inputText]);

  const { onWordAdd } = useContext(RepeatListContext);
  const inputRef = useRef();
  const handleWordAdd = () => {
    const wordText = inputRef.current.value;
    onWordAdd(wordText);

    window.postMessage({
      type: 'repeatio__addWordToRepeatList',
      value: wordText,
    }, '*');

    onClose();
  };

  const [fixingOffsets, setFixingOffsets] = useState({
    top: 0,
    left: 0,
  });

  const popupRef = useRef();

  useLayoutEffect(() => {
    // No need to fix position of invisible popup
    if (!visible) {
      return;
    }

    const popupDimensions = popupRef.current.getBoundingClientRect();
    const isOutOfTopBound = popupDimensions.top < 0;
    const isOutOfLeftBound = popupDimensions.left < 0;
    const isOutOfRightBound = popupDimensions.right > window.innerWidth;

    const getLeftOffset = () => {
      if (isOutOfLeftBound) {
        return -popupDimensions.left;
      }
      if (isOutOfRightBound) {
        return -(popupDimensions.right - window.innerWidth);
      }
      return 0;
    };

    setFixingOffsets({
      top: isOutOfTopBound ? popupDimensions.height + 40 : 0,
      left: getLeftOffset(),
    });
  }, [text]);

  const popupStyle = {
    display: visible ? '' : 'none',
    left: `${position.x + fixingOffsets.left}px`,
    top: `${position.y + fixingOffsets.top}px`,
  };

  useEffect(() => {
    const selectionPopup = popupRef.current;

    const isInsidePopup = (mouseX, mouseY) => {
      const {
        x: selectionPopupX,
        y: selectionPopupY,
        width: selectionPopupWidth,
        height: selectionPopupHeight,
      } = selectionPopup.getBoundingClientRect();

      return (
        mouseX >= selectionPopupX
        && mouseX <= selectionPopupX + selectionPopupWidth
        && mouseY >= selectionPopupY
        && mouseY <= selectionPopupY + selectionPopupHeight
      );
    };

    const hidePopupIfClickedOutside = (event) => {
      const {
        clientX: mouseX,
        clientY: mouseY
      } = event;

      console.log(isInsidePopup(mouseX, mouseY));

      if (!isInsidePopup(mouseX, mouseY)) {
        onClose();
      }
    };

    window.addEventListener('mouseup', hidePopupIfClickedOutside, {
      capture: true
    });

    return () => (
      window.removeEventListener('mouseup', hidePopupIfClickedOutside, {
        capture: true
      })
    );
  });

  return (
    <div
      className="selectionPopup"
      style={popupStyle}
      ref={popupRef}
    >
      <div className="word">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          ref={inputRef}
        />
      </div>
      <Translation text={text} />
      <div className="buttons">
        <div className="button okButton" onClick={handleWordAdd}>Add</div>
        <div className="button cancelButton" onClick={onClose}>Cancel</div>
      </div>
    </div>
  );
};

SelectionPopup.propTypes = {
  visible: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  position: PropTypes.exact({
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
};

export default SelectionPopup;
