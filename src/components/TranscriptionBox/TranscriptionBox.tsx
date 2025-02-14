import React from "react";
import "./TranscriptionBox.css";

interface TranscriptionBoxProps {
  transcription: string;
}

const TranscriptionBox = ({ transcription = "" }: TranscriptionBoxProps) => {
  if (!transcription || transcription.trim() === "") {
    return (
      <div className="transcription-box">
        <div className="transcription-content">
          Your transcription will appear here...
        </div>
      </div>
    );
  }

  return (
    <div className="transcription-box">
      <div className="transcription-content">{transcription}</div>
    </div>
  );
};

export default TranscriptionBox;
