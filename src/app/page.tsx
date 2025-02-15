"use client";

import Header from "@/components/Header/Header";
import TranscriptionBox from "@/components/TranscriptionBox/TranscriptionBox";
import Button from "@/components/Button/Button";
import { useMicrophone } from "@/contexts/MicrophoneContext";
import { useEffect } from "react";
import { useDeepgram } from "@/contexts/DeepgramContext";

export default function Home() {
  const { isRecording, startRecording, stopRecording } = useMicrophone();
  const { transcript, connect, disconnect } = useDeepgram();

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

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
      disconnect();
    } else {
      startRecording();
      connect();
    }
  };

  return (
    <div className="page-container relative">
      <Header />
      <main className="main-content">
        <TranscriptionBox transcription={transcript} />
        <Button
          label={isRecording ? "Stop" : "Start"}
          onButtonClick={handleButtonClick}
        />
      </main>
    </div>
  );
}
