import React from 'react';
import { Leaf, Sparkles, Fan } from 'lucide-react';
import './BackgroundOrnaments.css';

const BackgroundOrnaments = () => {
  return (
    <div className="bg-ornaments">
      <div className="bg-ornament bg-ornament-1">
        <Leaf strokeWidth={1} />
      </div>
      <div className="bg-ornament bg-ornament-2">
        <Sparkles strokeWidth={1} />
      </div>
      <div className="bg-ornament bg-ornament-3">
        <Fan strokeWidth={1} />
      </div>
      <div className="bg-ornament bg-ornament-4">
        <Leaf strokeWidth={1} />
      </div>
    </div>
  );
};

export default BackgroundOrnaments;
