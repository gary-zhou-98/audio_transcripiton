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
  const [lastWordIndex, setLastWordIndex] = useState<number>(0);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt>({
    title: "",
    text: "",
  });

  const selectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
  };

  const comparePromptWithTranscription = (transcription: string) => {
    const promptText = selectedPrompt.text;
    if (!selectedPrompt || promptText === "") {
      return true;
    }

    // Extract all words within quotation marks from the prompt text
    const quotedWordsRegex = /"([^"]*)"/g;
    const matches = [...selectedPrompt.text.matchAll(quotedWordsRegex)];
    const expectedWordsArray = matches.map((match) => {
      // Remove all punctuation and convert to lowercase
      return match[1]
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"\"\'\']/g, "");
    });
    // Join the expected words array into a string and split it into an array of words
    const expectedWords = expectedWordsArray.join(" ").split(" ");

    if (expectedWords.length === 0) {
      return true;
    }

    // Remove punctuation from transcription and convert to lowercase
    let transcriptionLower = transcription.split(" ").map((word) => {
      return word
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\"\"\'\']/g, "");
    });
    transcriptionLower = transcriptionLower.filter((word) => word !== "");

    for (let i = lastWordIndex; i < transcriptionLower.length; i++) {
      console.log(
        "Expected word: ",
        expectedWords[i],
        " Transcription word: ",
        transcriptionLower[i]
      );
      if (expectedWords[i] !== transcriptionLower[i]) {
        setLastWordIndex(transcriptionLower.length);
        return false;
      }
    }
    setLastWordIndex(transcriptionLower.length);
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
