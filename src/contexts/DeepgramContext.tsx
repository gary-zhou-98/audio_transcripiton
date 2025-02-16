"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { LiveTranscriptionEvents, LiveClient } from "@deepgram/sdk";
import { config } from "../config/env";

type ConnectionState =
  | "disconnecting"
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

interface DeepgramContextType {
  connectionState: ConnectionState;
  transcript: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  // pause: () => void;
  // resume: () => void;
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

  const transcriptListener = (data: {
    channel: { alternatives: { transcript: string }[] };
  }) => {
    console.log("transcript", data);
    const newTranscript = data.channel.alternatives[0].transcript;
    if (newTranscript) {
      setTranscript((prev) => prev + " " + newTranscript);
    }
  };

  const cleanupConnection = useCallback(() => {
    console.log("clean up called");
    if (connection) {
      console.log("cleaning up connection");
      // Remove all event listeners
      connection.removeAllListeners(LiveTranscriptionEvents.Open);
      connection.removeAllListeners(LiveTranscriptionEvents.Close);
      connection.removeAllListeners(LiveTranscriptionEvents.Transcript);
      connection.removeAllListeners(LiveTranscriptionEvents.Error);
      connection.removeAllListeners(LiveTranscriptionEvents.UtteranceEnd);
      connection.removeAllListeners(LiveTranscriptionEvents.SpeechStarted);
      connection.removeAllListeners(LiveTranscriptionEvents.Metadata);

      // Clear states
      setConnection(null);
      setError(null);
      setTranscript("");
      setConnectionState("disconnected");
    }
  }, [connection]);

  const connect = useCallback(async () => {
    console.log("connecting");
    try {
      setConnectionState("connecting");
      setError(null);
      const { createClient } = await import("@deepgram/sdk");
      const deepgram = createClient(config.deepgramApiKey);
      const newConnection = await deepgram.listen.live({
        model: "nova-3",
        language: "en-US",
        smart_format: true,
        no_delay: true,
      });

      console.log("newConnection", newConnection);

      // Set connection first so event listeners have access to it
      setConnection(newConnection);

      newConnection.on(LiveTranscriptionEvents.Open, () => {
        setConnectionState("connected");
        console.log("connection opened");
      });

      newConnection.on(LiveTranscriptionEvents.Close, () => {
        console.log("closing connection");
        setConnectionState("disconnected");
        setConnection(null);
        setTranscript("");
      });

      newConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const newTranscript = data.channel.alternatives[0].transcript;
        if (newTranscript) {
          setTranscript((prev) => prev + " " + newTranscript);
        }
      });

      newConnection.on(LiveTranscriptionEvents.Error, (err) => {
        setError(err.message);
        setConnectionState("error");
      });

      setConnection(newConnection);
    } catch (err) {
      setError((err as Error).message);
      setConnectionState("error");
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log("disconnecting");
    if (connection) {
      connection.requestClose();
      setConnection(null);
      setConnectionState("disconnected");
      setError(null);
    }
  }, [connection]);

  const sendAudio = useCallback(
    (audioBlob: Blob) => {
      if (connection && connectionState === "connected") {
        connection.send(audioBlob);
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
        // pause,
        // resume,
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
