"use client";

import React, { createContext, useState, useContext } from "react";
import promptStore, { Prompt } from "@/Store/promptStore";

interface PromptContextType {
  promptStore: Prompt[];
  selectedPrompt: Prompt;
  selectPrompt: (prompt: Prompt) => void;
  comparePromptWithTranscription: (transcription: string) => boolean;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const PromptProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt>({
    title: "",
    text: "",
  });

  const selectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const comparePromptWithTranscription = (transcription: string) => {
    const promptText = selectedPrompt.text;
    const transcriptionText = transcription;
    const promptTextArray = promptText.split("\n");
    const transcriptionTextArray = transcriptionText.split("\n");
    const promptTextArrayLength = promptTextArray.length;
    const transcriptionTextArrayLength = transcriptionTextArray.length;
    if (promptTextArrayLength !== transcriptionTextArrayLength) {
      return false;
    }
    const currentWordIndex = promptTextArray.length - 1;
    if (
      promptTextArray[currentWordIndex] !==
      transcriptionTextArray[currentWordIndex]
    ) {
      return false;
    }
    return true;
  };

  return (
    <PromptContext.Provider
      value={{
        promptStore,
        selectedPrompt,
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
