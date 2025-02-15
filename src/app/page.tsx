"use client";

import Header from "@/components/Header/Header";
import TranscriptionBox from "@/components/TranscriptionBox/TranscriptionBox";
import Button from "@/components/Button/Button";
import { useMicrophone } from "@/contexts/MicrophoneContext";
import { useEffect } from "react";
import { useDeepgram } from "@/contexts/DeepgramContext";

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
    connectionState,
  } = useDeepgram();

  useEffect(() => {
    // Only initialize microphone if not already recording
    if (!isRecording) {
      const initializeMicrophone = async () => {
        try {
          await startRecording();
        } catch (err) {
          console.error("Failed to initialize microphone:", err);
        }
      };
      initializeMicrophone();
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
    if (isRecording) {
      stopRecording();
      disconnect();
    } else {
      startRecording();
      connect();
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
        <TranscriptionBox transcription={error ? error : transcript} />
        <Button
          label={isRecording ? "Stop" : "Start"}
          onButtonClick={handleButtonClick}
        />
      </main>
    </div>
  );
}
