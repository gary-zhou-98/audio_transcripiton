"use client";

import React from "react";
import "./Prompt.css";
import ReactMarkdown from "react-markdown";
import { Prompt } from "@/Store/promptStore";
import { usePrompt } from "@/contexts/PromptContext";

const PromptText = () => {
  const { promptStore, selectedPrompt, selectPrompt } = usePrompt();

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = event.target.value;
    const prompt = promptStore.find((p: Prompt) => p.title === selectedTitle);
    if (prompt) {
      selectPrompt(prompt);
    } else {
      // If user selects default option "Choose a Prompt"
      selectPrompt({ title: "", text: "" });
    }
  };

  return (
    <div className="prompt-container">
      <div className="selector-container">
        <label htmlFor="prompt-select" className="prompt-label">
          Select a Prompt:
        </label>
        <select
          id="prompt-select"
          onChange={handleSelectChange}
          className="prompt-select"
        >
          <option value="">--Choose a Prompt--</option>
          {promptStore.map((prompt) => (
            <option key={prompt.title} value={prompt.title}>
              {prompt.title}
            </option>
          ))}
        </select>
      </div>

      {selectedPrompt && selectedPrompt.title !== "" && (
        <div className="prompt-text">
          <h3 className="prompt-title">{selectedPrompt.title}</h3>
          <ReactMarkdown className="prompt-description">
            {selectedPrompt.text}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default PromptText;
