"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface MicrophoneContextType {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
}

const MicrophoneContext = createContext<MicrophoneContextType | undefined>(
  undefined
);

export const MicrophoneProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          // Handle the recorded Microphone data here
          console.log("Microphone data:", event.data);
        }
      });

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Error accessing microphone: " + (err as Error).message);
      console.error("Error accessing microphone:", err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  }, [mediaRecorder]);

  return (
    <MicrophoneContext.Provider
      value={{
        isRecording,
        startRecording,
        stopRecording,
        error,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

export const useMicrophone = () => {
  const context = useContext(MicrophoneContext);
  if (context === undefined) {
    throw new Error("useMicrophone must be used within an MicrophoneProvider");
  }
  return context;
};
