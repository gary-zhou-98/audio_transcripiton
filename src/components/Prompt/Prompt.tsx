"use client";

import React, { useState } from "react";
import "./Prompt.css";

interface Prompt {
  title: string;
  text: string;
}

const prompts: Prompt[] = [
  {
    title: "Prompt 1",
    text: "This is the full text of Prompt 1-1. This is the full text of Prompt 1.This is the full text of Prompt 1.This is the full text of Prompt 1.This is the full text of Prompt 1.This is the full text of Prompt 1.",
  },
  { title: "Prompt 2", text: "This is the full text of Prompt 2." },
  { title: "Prompt 3", text: "This is the full text of Prompt 3." },
  // Add more prompts as needed
];

const Prompt = () => {
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
          <p className="prompt-description">{selectedPrompt.text}</p>
        </div>
      )}
    </div>
  );
};

export default Prompt;
