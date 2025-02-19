import React, { useEffect, useRef } from "react";
import "./TranscriptionBox.css";

interface TranscriptionBoxProps {
  transcription: string;
}

const TranscriptionBox = ({ transcription = "" }: TranscriptionBoxProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [transcription]);

  if (!transcription || transcription.trim() === "") {
    return (
      <div className="transcription-box">
        <div className="transcription-content" ref={contentRef}>
          Your transcription will appear here...
        </div>
      </div>
    );
  }

  return (
    <div className="transcription-box">
      <div className="transcription-content" ref={contentRef}>
        {transcription}
      </div>
    </div>
  );
};

export default TranscriptionBox;
