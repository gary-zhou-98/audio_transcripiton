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
  audioBlob: ArrayBuffer | null;
}

const MicrophoneContext = createContext<MicrophoneContextType | undefined>(
  undefined
);

// Define the worklet processor code as a string
const workletCode = `
class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputChannel = input[0];
      // Convert Float32Array to Int16Array
      const int16Data = new Int16Array(inputChannel.length);
      for (let i = 0; i < inputChannel.length; i++) {
        int16Data[i] = Math.max(-1, Math.min(1, inputChannel[i])) * 0x7fff;
      }
      this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
    }
    return true;
  }
}
registerProcessor('audio-processor', AudioProcessor);
`;

// Create a Blob URL for the worklet code
const workletBlobURL = URL.createObjectURL(
  new Blob([workletCode], { type: "text/javascript" })
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
  const [audioBlob, setAudioBlob] = useState<ArrayBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  const startRecording = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("user media is not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Create and initialize AudioContext with worklet
      const audioContext = new AudioContext({ sampleRate: 48000 });
      await audioContext.audioWorklet.addModule(workletBlobURL);

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, "audio-processor");

      // Handle audio data from the worklet
      workletNode.port.onmessage = (event) => {
        setAudioBlob(event.data);
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      // Store refs for cleanup
      audioContextRef.current = audioContext;
      workletNodeRef.current = workletNode;

      setAudioStream(stream);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Error accessing microphone: " + (err as Error).message);
      console.error("Error accessing microphone:", err);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    setIsRecording(false);
    setAudioStream(null);
    setAudioBlob(null);
  }, [audioStream]);

  useEffect(() => {
    return () => {
      stopRecording();
      URL.revokeObjectURL(workletBlobURL);
    };
  }, [stopRecording]);

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
