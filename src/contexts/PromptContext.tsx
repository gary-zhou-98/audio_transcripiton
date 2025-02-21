"use client";

import React, { createContext, useState, useContext } from "react";
import promptStore, { Prompt } from "@/Store/promptStore";

interface PromptContextType {
  promptStore: Prompt[];
  selectedPrompt: Prompt;
  isTranscriptionCorrect: boolean;
  selectPrompt: (prompt: Prompt) => void;
  comparePromptWithTranscription: (
    transcription: string,
    isFinal: boolean
  ) => boolean;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const PromptProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastWordIndex, setLastWordIndex] = useState<number>(0);
  const [isTranscriptionCorrect, setIsTranscriptionCorrect] =
    useState<boolean>(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt>({
    title: "",
    text: "",
  });

  const selectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const comparePromptWithTranscription = (
    transcription: string,
    isFinal: boolean
  ) => {
    const promptText = selectedPrompt.text;
    let isTranscriptionCorrect = true;
    if (!selectedPrompt || promptText === "") {
      isTranscriptionCorrect = true;
      setIsTranscriptionCorrect(isTranscriptionCorrect);
      return isTranscriptionCorrect;
    }

    // Extract all words within quotation marks from the prompt text
    const quotedWordsRegex = /"([^"]*)"/g;
    const matches = [...selectedPrompt.text.matchAll(quotedWordsRegex)];
    const expectedWordsArray = matches.map((match) => {
      // Remove all punctuation and convert to lowercase
      return match[1]
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"'`]/g, "");
    });
    // Join the expected words array into a string and split it into an array of words
    const expectedWords = expectedWordsArray.join(" ").split(" ");

    if (expectedWords.length === 0) {
      isTranscriptionCorrect = true;
      setIsTranscriptionCorrect(isTranscriptionCorrect);
      return isTranscriptionCorrect;
    }

    // Remove punctuation from transcription and convert to lowercase
    let transcriptionLower = transcription.split(" ").map((word) => {
      return word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"'`]/g, "");
    });
    transcriptionLower = transcriptionLower.filter((word) => word !== "");

    // Check if whole prompt is transcribed if user is done recording
    if (isFinal) {
      isTranscriptionCorrect =
        transcriptionLower.length === expectedWords.length;
      setIsTranscriptionCorrect(isTranscriptionCorrect);
      return isTranscriptionCorrect;
    }

    for (let i = lastWordIndex; i < transcriptionLower.length; i++) {
      if (expectedWords[i] !== transcriptionLower[i]) {
        setLastWordIndex(0);
        isTranscriptionCorrect = false;
      }
    }
    setLastWordIndex(transcriptionLower.length);
    setIsTranscriptionCorrect(isTranscriptionCorrect);
    return isTranscriptionCorrect;
  };

  return (
    <PromptContext.Provider
      value={{
        promptStore,
        selectedPrompt,
        isTranscriptionCorrect,
        selectPrompt,
        comparePromptWithTranscription,
      }}
    >
      {children}
    </PromptContext.Provider>
  );
};

export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error("usePrompt must be used within a PromptProvider");
  }
  return context;
};
