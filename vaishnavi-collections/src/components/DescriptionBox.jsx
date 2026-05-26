import React, { useState, useRef } from 'react';
import { AiOutlineDown } from 'react-icons/ai';
import ReactMarkdown from 'react-markdown';
import './DescriptionBox.css';

const DescriptionBox = ({ description }) => {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef(null);

  if (!description) return null;

  return (
    <div className="desc-box">
      <div
        className={`desc-box__content ${expanded ? 'expanded' : ''}`}
        ref={contentRef}
      >
        <div className="desc-box__text">
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
      </div>
      <button
        className="desc-box__toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Show less' : 'Read more'}
        <AiOutlineDown
          className={`desc-box__arrow ${expanded ? 'rotated' : ''}`}
          size={14}
        />
      </button>
    </div>
  );
};

export default DescriptionBox;
