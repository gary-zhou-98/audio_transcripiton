"use client";

import React, { useState, useEffect } from "react";
import "./AudioDownloader.css";
import { useMicrophone } from "@/contexts/MicrophoneContext";

const AudioDownloader = () => {
  const { isRecording, audioBlob } = useMicrophone();
  const [downloadUrl, setDownloadUrl] = useState("");
  const [didDownload, setDidDownload] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (audioBlob) {
      setDownloadUrl(
        URL.createObjectURL(new Blob(audioBlob, { type: "audio/webm" }))
      );
    }
  }, [audioBlob]);

  useEffect(() => {
    if (didDownload) {
      setFileName("");
      setDidDownload(false);
    }
  }, [didDownload]);

  if (isRecording) {
    return null;
  }
  return (
    <div className="audio-downloader">
      <audio src={downloadUrl} controls />
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        placeholder="[Optional] File name"
      />
      <a
        href={downloadUrl}
        download={fileName}
        onClick={() => setDidDownload(true)}
      >
        Download Recording
      </a>
      <br />
    </div>
  );
};

export default AudioDownloader;
