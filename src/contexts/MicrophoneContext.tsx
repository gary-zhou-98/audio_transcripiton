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
  audioBlob: Blob[] | null;
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
  const [audioBlob, setAudioBlob] = useState<Blob[] | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const onDataAvailable = useCallback(
    (event: BlobEvent) => {
      if (event.data) {
        setAudioBlob((prev) => (prev ? [...prev, event.data] : [event.data]));
      } else {
        console.log("Skipping empty or invalid audio chunk");
      }
    },
    [setAudioBlob]
  );

  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioStream]);

  const startRecording = useCallback(async () => {
    if (mediaRecorderRef.current) {
      console.log("already recording");
      return;
    }
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("user media is not supported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.addEventListener("dataavailable", onDataAvailable);

      recorder.start(100);
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
      mediaRecorder.removeEventListener("dataavailable", onDataAvailable);
      setIsRecording(false);
      setAudioStream(null);
      setAudioBlob(null);
      mediaRecorderRef.current = null;
    }
  }, [mediaRecorder, onDataAvailable]);

  return (
    <MicrophoneContext.Provider
      value={{
        isRecording,
        startRecording,
        stopRecording,
        error,
        audioStream,
        audioBlob,
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
