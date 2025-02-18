"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { LiveTranscriptionEvents, LiveClient } from "@deepgram/sdk";
import { config } from "../config/env";

type ConnectionState =
  | "disconnecting"
  | "disconnected"
  | "connecting"
  | "connected"
  | "paused"
  | "resumed"
  | "error";

interface DeepgramContextType {
  connectionState: ConnectionState;
  transcript: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  resumeTranscription: () => void;
  pauseTranscription: () => void;
  error: string | null;
  sendAudio: (audioBlob: Blob) => void;
  connection: LiveClient | null;
}

const DeepgramContext = createContext<DeepgramContextType | undefined>(
  undefined
);

export const DeepgramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<LiveClient | null>(null);

  const handleTranscript = (data: any) => {
    console.log("transcript", data);
    const newTranscript = data.channel.alternatives[0].transcript;
    if (newTranscript) {
      setTranscript((prev) => prev + " " + newTranscript);
    }
  };

  const cleanupConnection = useCallback(() => {
    if (connection) {
      console.log("Cleaning up connection");
      connection.requestClose();
      // Clear all states
      setConnection(null);
      setError(null);
      setTranscript("");
      setConnectionState("disconnected");
    }
  }, [connection]);

  const resumeTranscription = useCallback(() => {
    if (connection) {
      console.log("Resuming transcription");
      setConnectionState("resumed");
      connection.addListener(
        LiveTranscriptionEvents.Transcript,
        handleTranscript
      );
    }
  }, [connection]);

  const pauseTranscription = useCallback(() => {
    if (connection) {
      console.log("Pausing transcription");
      setConnectionState("paused");
      setTranscript("");
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        handleTranscript
      );
    }
  }, [connection]);

  const connect = useCallback(async () => {
    if (connectionState === "connected" || connectionState === "connecting") {
      console.log("connection already exists");
      return;
    }

    try {
      setConnectionState("connecting");
      setError(null);
      const { createClient } = await import("@deepgram/sdk");
      const deepgram = createClient(config.deepgramApiKey);
      const newConnection = await deepgram.listen.live({
        model: "nova-3",
        language: "en-US",
        channels: 1,
        smart_format: true,
      });

      // Set up event listeners before setting the connection
      newConnection.on(LiveTranscriptionEvents.Open, () => {
        setConnectionState("connected");
        console.log("Connection opened");

        newConnection.on(LiveTranscriptionEvents.Close, () => {
          console.log("Connection closed by server");
          cleanupConnection();
        });

        newConnection.on(LiveTranscriptionEvents.Transcript, handleTranscript);

        newConnection.on(LiveTranscriptionEvents.Error, (err) => {
          setError(err.message);
          setConnectionState("error");
        });

        newConnection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
          console.log("utterance ended");
        });

        newConnection.on(LiveTranscriptionEvents.SpeechStarted, () => {
          console.log("speech started");
        });

        newConnection.on(LiveTranscriptionEvents.Metadata, (metadata) => {
          console.log("metadata", metadata);
        });
      });

      setConnection(newConnection);
    } catch (err) {
      cleanupConnection();
      setError((err as Error).message);
      setConnectionState("error");
      console.error("Error connecting:", err);
    }
  }, [connectionState, cleanupConnection]);

  const disconnect = useCallback(() => {
    if (connection) {
      cleanupConnection();
    }
  }, [connection, cleanupConnection]);

  const sendAudio = useCallback(
    (audioBlob: Blob) => {
      try {
        if (connection && connectionState === "connected") {
          connection.send(audioBlob);
        }
      } catch (err) {
        console.error("Error sending audio:", err);
      }
    },
    [connection, connectionState]
  );

  return (
    <DeepgramContext.Provider
      value={{
        connectionState,
        transcript,
        connect,
        disconnect,
        pauseTranscription,
        resumeTranscription,
        error,
        sendAudio,
        connection,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

export const useDeepgram = () => {
  const context = useContext(DeepgramContext);
  if (context === undefined) {
    throw new Error("useDeepgram must be used within a DeepgramProvider");
  }
  return context;
};
