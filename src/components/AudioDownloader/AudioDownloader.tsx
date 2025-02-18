"use client";

import React, { useState, useEffect, useRef } from "react";
import "./AudioDownloader.css";
import { useMicrophone } from "@/contexts/MicrophoneContext";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const AudioDownloader = () => {
  const { isRecording, audioBlob } = useMicrophone();
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    const load = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd";
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on("log", ({ message }) => {
        console.log(message);
      });
      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      setLoaded(true);
    };

    const transcode = async () => {
      if (!audioBlob) {
        return;
      }
      const ffmpeg = ffmpegRef.current;
      const inputFileName = "input.webm";
      const outputFileName = "output.mp3";
      const blob = new Blob(audioBlob, { type: "audio/webm" });
      await ffmpeg.writeFile(inputFileName, await fetchFile(blob));
      await ffmpeg.exec([
        "-i",
        inputFileName,
        "-vn", // Disable video
        "-ar",
        "44100", // Set audio sample rate to 44.1kHz
        "-ac",
        "2", // Set number of audio channels to 2
        "-b:a",
        "192k", // Set audio bitrate
        outputFileName,
      ]);
      const data = await ffmpeg.readFile(outputFileName);
      setDownloadUrl(
        URL.createObjectURL(new Blob([data], { type: "video/mp4" }))
      );
    };

    if (audioBlob) {
      if (!loaded) {
        load();
        return;
      }
      transcode();
    }
  }, [audioBlob, loaded]);

  if (isRecording) {
    return null;
  }
  return (
    <div className="audio-downloader">
      <a href={downloadUrl} download="recording.webm">
        Download Recording
      </a>
      <br />
      <audio src={downloadUrl} controls />
    </div>
  );
};

export default AudioDownloader;
