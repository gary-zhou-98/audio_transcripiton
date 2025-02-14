import Header from "@/components/Header/Header";
import TranscriptionBox from "@/components/TranscriptionBox/TranscriptionBox";

export default function Home() {
  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <TranscriptionBox />
      </main>
    </div>
  );
}
