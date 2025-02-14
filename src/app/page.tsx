"use client";

import Header from "@/components/Header/Header";
import TranscriptionBox from "@/components/TranscriptionBox/TranscriptionBox";
import Button from "@/components/Button/Button";
import { useMicrophone } from "@/contexts/MicrophoneContext";
import { useEffect } from "react";

export default function Home() {
  const { startRecording, stopRecording } = useMicrophone();

  useEffect(() => {
    // Request microphone permissions when component mounts
    const initializeMicrophone = async () => {
      try {
        await startRecording();
      } catch (err) {
        console.error("Failed to initialize microphone:", err);
      }
    };

    initializeMicrophone();

    // Cleanup: stop recording when component unmounts
    return () => {
      stopRecording();
    };
  }, [startRecording, stopRecording]);

  return (
    <div className="page-container relative">
      <Header />
      <main className="main-content">
        <TranscriptionBox />
        <Button label="Start" onButtonClick={() => {}} />
      </main>
    </div>
  );
}
