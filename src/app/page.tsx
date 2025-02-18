"use client";

import Header from "@/components/Header/Header";
import TranscriptionBox from "@/components/TranscriptionBox/TranscriptionBox";
import Button from "@/components/Button/Button";
import { useMicrophone } from "@/contexts/MicrophoneContext";
import { useEffect, useRef } from "react";
import { useDeepgram } from "@/contexts/DeepgramContext";
import AudioDownloader from "@/components/AudioDownloader/AudioDownloader";

export default function Home() {
  const {
    error: microphoneError,
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
  } = useMicrophone();
  const {
    error: deepgamError,
    transcript,
    connect,
    disconnect,
    sendAudio,
    connection,
    connectionState,
  } = useDeepgram();

  // Add refs for keeping track of intervals
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add effect to handle connection state changes
  useEffect(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
    }

    // Only set up interval if we have a connection
    if (connection) {
      keepAliveIntervalRef.current = setInterval(() => {
        try {
          connection.keepAlive();
          console.log("Sent keepalive message");
        } catch (err) {
          console.warn("Failed to send keepalive:", err);
        }
      }, 3000);

      // Cleanup function
      return () => {
        if (keepAliveIntervalRef.current) {
          clearInterval(keepAliveIntervalRef.current);
          keepAliveIntervalRef.current = null;
        }
      };
    }
  }, [connection]);

  // Initial setup effect
  useEffect(() => {
    if (!isRecording && !(connectionState === "connected")) {
      startRecording();
      connect();
    }

    // Cleanup: stop recording when component unmounts
    return () => {
      stopRecording();
      disconnect();
    };
  }, []); // Only run on mount and unmount

  useEffect(() => {
    if (audioBlob && connectionState === "connected") {
      sendAudio(audioBlob);
    }
  }, [audioBlob, connectionState, sendAudio]);

  const handleButtonClick = () => {
    if (connectionState === "connected" && isRecording) {
      disconnect();
      stopRecording();
    } else {
      connect();
      startRecording();
    }
  };

  const error = microphoneError
    ? microphoneError
    : deepgamError
    ? deepgamError
    : null;

  return (
    <div className="page-container relative">
      <Header />
      <main className="main-content">
        <AudioDownloader
          downloadUrl={audioBlob ? URL.createObjectURL(audioBlob) : ""}
        />
        <TranscriptionBox transcription={error ? error : transcript} />
        <Button
          label={
            connectionState === "connected" && isRecording ? "Stop" : "Start"
          }
          onButtonClick={handleButtonClick}
        />
      </main>
    </div>
  );
}
