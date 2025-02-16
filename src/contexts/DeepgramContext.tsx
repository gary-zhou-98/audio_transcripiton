"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { LiveTranscriptionEvents, LiveClient } from "@deepgram/sdk";
import { config } from "../config/env";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

interface DeepgramContextType {
  connectionState: ConnectionState;
  transcript: string;
  connect: () => Promise<void>;
  disconnect: () => void;
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

  const connect = useCallback(async () => {
    if (connectionState === "connected" || connectionState === "connecting") {
      console.log("connection already exists");
      return;
    }

    setConnectionState("connecting");
    try {
      setError(null);

      // Dynamically import the SDK only on the client side
      const { createClient } = await import("@deepgram/sdk");
      const deepgram = createClient(config.deepgramApiKey);
      const newConnection = await deepgram.listen.live({
        model: "nova-3",
        language: "en-US",
        smart_format: true,
        no_delay: true,
      });

      console.log("newConnection", newConnection);

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
        console.log("error", err);
        setError(err.message);
        setConnectionState("error");
      });

      newConnection.on(LiveTranscriptionEvents.UtteranceEnd, (utteranceEnd) => {
        console.log("UtteranceEnd", utteranceEnd);
      });

      newConnection.on(
        LiveTranscriptionEvents.SpeechStarted,
        (speechStarted) => {
          console.log("SpeechStarted", speechStarted);
        }
      );
      setConnection(newConnection);
    } catch (err) {
      setError((err as Error).message);
      setConnectionState("error");
    }
  }, [connectionState]);

  const disconnect = useCallback(() => {
    console.log("disconnect triggered");
    if (connection) {
      console.log("disconnecting");
      connection.requestClose();
      setConnection(null);
      setConnectionState("disconnected");
      setError(null);
      setTranscript("");
    }
  }, []);

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
