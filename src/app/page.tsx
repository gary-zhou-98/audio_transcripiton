"use client";

import Header from "@/components/Header/Header";
import TranscriptionBox from "@/components/TranscriptionBox/TranscriptionBox";
import Button from "@/components/Button/Button";
import { useMicrophone } from "@/contexts/MicrophoneContext";
import { useEffect, useRef, useCallback } from "react";
import { useDeepgram } from "@/contexts/DeepgramContext";
import AudioDownloader from "@/components/AudioDownloader/AudioDownloader";
import PromptText from "@/components/Prompt/Prompt";
import { usePrompt } from "@/contexts/PromptContext";
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
  const { comparePromptWithTranscription } = usePrompt();

  // Add refs for keeping track of intervals
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTranscription = useCallback(() => {
    startRecording();
    connect();
  }, [startRecording, connect]);

  const stopTranscription = useCallback(() => {
    disconnect();
    stopRecording();
  }, [disconnect, stopRecording]);

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
      startTranscription();
    }

    // Cleanup: stop recording when component unmounts
    return () => {
      stopTranscription();
    };
  }, []); // Only run on mount and unmount

  useEffect(() => {
    if (transcript) {
      const isPromptMatch = comparePromptWithTranscription(transcript, false);
      if (!isPromptMatch) {
        alert("You are not following the prompt");
        stopTranscription();
      }
    }
  }, [comparePromptWithTranscription, stopTranscription, transcript]);

  useEffect(() => {
    if (audioBlob && connectionState === "connected") {
      sendAudio(audioBlob[audioBlob.length - 1]);
    }
  }, [audioBlob, connectionState, sendAudio]);

  const handleButtonClick = () => {
    if (connectionState === "connected" && isRecording) {
      stopTranscription();
      const isPromptMatch = comparePromptWithTranscription(transcript, true);
      if (!isPromptMatch) {
        alert("You did not record the full prompt");
      }
    } else {
      startTranscription();
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
        <AudioDownloader />
        <PromptText />
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
