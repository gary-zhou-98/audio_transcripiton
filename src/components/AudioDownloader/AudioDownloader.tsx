"use client";

import React, { useState, useEffect } from "react";
import "./AudioDownloader.css";
import { useMicrophone } from "@/contexts/MicrophoneContext";

const AudioDownloader = () => {
  const { isRecording, audioBlob } = useMicrophone();
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    if (audioBlob) {
      setDownloadUrl(
        URL.createObjectURL(new Blob(audioBlob, { type: "audio/webm" }))
      );
    }
  }, [audioBlob]);

  if (isRecording) {
    return null;
  }
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
