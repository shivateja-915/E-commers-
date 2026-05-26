import React, { useState, useEffect, useRef } from 'react';
import './IntroVideo.css';

const IntroVideo = () => {
  const [show, setShow] = useState(() => {
    return !sessionStorage.getItem('introPlayed');
  });
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Speed up the video to complete in 2-3 seconds
    if (videoRef.current) {
      videoRef.current.playbackRate = 2.5; 
    }
  }, []);

  const handleVideoEnd = () => {
    sessionStorage.setItem('introPlayed', 'true');
    setFadeOut(true);
    setTimeout(() => {
      setShow(false);
    }, 1200); 
  };

  if (!show) return null;

  return (
    <div className={`intro-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <video
        ref={videoRef}
        src="/videos/logo.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="intro-video"
      />
    </div>
  );
};

export default IntroVideo;
