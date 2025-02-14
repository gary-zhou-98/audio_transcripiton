"use client";

import Header from "@/components/Header/Header";
import TranscriptionBox from "@/components/TranscriptionBox/TranscriptionBox";
import Button from "@/components/Button/Button";

export default function Home() {
  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <TranscriptionBox />
        <Button label="Start" onButtonClick={() => {}} />
      </main>
    </div>
  );
}
