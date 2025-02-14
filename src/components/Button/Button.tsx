"use client";

import React from "react";
import "./Button.css";

interface ButtonProps {
  label: string;
  onButtonClick: () => void;
}

const Button = ({ label, onButtonClick }: ButtonProps) => {
  return (
    <button className="custom-button" onClick={onButtonClick} type="button">
      {label}
    </button>
  );
};

export default Button;
