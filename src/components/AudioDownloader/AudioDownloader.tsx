"use client";

import React from "react";
import "./AudioDownloader.css";

interface AudioDownloaderProps {
  downloadUrl: string;
}

const AudioDownloader = ({ downloadUrl }: AudioDownloaderProps) => {
  return (
    <div className="audio-downloader">
      <a href={downloadUrl} download="recording.webm">
        Download Recording
      </a>
      <br />
      <audio src={downloadUrl} controls />
    </div>
  );
};

export default AudioDownloader;
