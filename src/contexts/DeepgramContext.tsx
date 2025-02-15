"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { LiveTranscriptionEvents, LiveClient } from "@deepgram/sdk";
import { config } from "../config/env";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

interface DeepgramContextType {
  connectionState: ConnectionState;
  transcript: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
  sendAudio: (audioChunks: Blob[]) => void;
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

  const connect = useCallback(async () => {
    console.log("connecting");
    try {
      setConnectionState("connecting");
      setError(null);

      // Dynamically import the SDK only on the client side
      const { createClient } = await import("@deepgram/sdk");
      const deepgram = createClient(config.deepgramApiKey);
      const newConnection = deepgram.listen.live({
        model: "nova-3",
        language: "en-US",
        smart_format: true,
      });

      newConnection.on(LiveTranscriptionEvents.Open, () => {
        setConnectionState("connected");

        newConnection.on(LiveTranscriptionEvents.Close, () => {
          setConnectionState("disconnected");
          setConnection(null);
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
    (audioChunks: Blob[]) => {
      if (connection && connectionState === "connected") {
        audioChunks.forEach((chunk) => {
          const response = connection.send(chunk);
          console.log("response: ", response);
        });
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
        error,
        sendAudio,
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
