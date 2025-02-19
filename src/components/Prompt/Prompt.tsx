"use client";

import React, { useState } from "react";
import "./Prompt.css";
import promptStore, { Prompt } from "@/Store/promptStore";
import ReactMarkdown from "react-markdown";

const prompts = promptStore;

const PromptText = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTitle = event.target.value;
    const prompt = prompts.find((p) => p.title === selectedTitle);
    setSelectedPrompt(prompt || null);
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
          {prompts.map((prompt) => (
            <option key={prompt.title} value={prompt.title}>
              {prompt.title}
            </option>
          ))}
        </select>
      </div>
      {selectedPrompt && (
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
