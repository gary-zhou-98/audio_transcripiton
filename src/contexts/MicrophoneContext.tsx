"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

interface MicrophoneContextType {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
  audioStream: MediaStream | null;
  audioChunks: Blob[] | null;
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
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioStream]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);
          console.log("audioChunks: ", audioChunks);
        }
      });

      recorder.start();
      setMediaRecorder(recorder);
      setAudioStream(stream);
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
      setAudioStream(null);
      setAudioChunks([]);
    }
  }, [mediaRecorder]);

  return (
    <MicrophoneContext.Provider
      value={{
        isRecording,
        startRecording,
        stopRecording,
        error,
        audioStream,
        audioChunks,
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
