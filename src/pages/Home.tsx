import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Upload,
  Loader2,
  Volume2,
  AudioWaveform as Waveform,
  Copy,
  Check,
  Download,
  LogOut,
} from "lucide-react";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuthStore } from "../store/aurhStore";
import { User } from "../libs/typs";
import { Link } from "react-router-dom";
import {
  getEnhancedText,
  getSummary,
  getTasks,
  getTopics,
  transcribeAudioToText,
} from "../libs/Api";
import { Summary } from "../Components/Summary";
import { ExtractTask } from "../Components/ExtractTask";
import { Detect_topics } from "../Components/Detect_topics";
import { TrelloModal } from "../Components/Trello";
import { saveTranscriptionToDB } from "../libs/Api"; // استدعاء الدالة
import { SidebarTranscriptions } from "../Components/SidebarTranscriptions";

interface TranscriptionResult {
  text: string;
  isLoading: boolean;
}

interface SummaryResult {
  text: string;
  isLoading: boolean;
  hidden: boolean;
}

export const Home = () => {
  const { logout } = useAuthStore();

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const [transcriptions, setTranscription] = useState<TranscriptionResult>({
    text: "",
    isLoading: false,
  });
  const [transcriptionsAdd, setTranscriptionAdd] = useState({
    text: "",
  });
  interface Transcript {
    enhanced?: string;
    summary?: string;
    tasks?: string;
    topics?: string;
    audio?: {
      downloadUrl?: string;
    };
  }
  const [selectedTranscript, setSelectedTranscript] =
    useState<Transcript | null>(null);

  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<SummaryResult>({
    text: "",
    isLoading: false,
    hidden: true,
  });
  const [extractTask, setExtractTask] = useState<SummaryResult>({
    text: "",
    isLoading: false,
    hidden: true,
  });
  const [detect_topics, setDetect_topics] = useState<SummaryResult>({
    text: "",
    isLoading: false,
    hidden: true,
  });

  const [openTrello, setOpenTrello] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number | null>(null);
  const recordingInterval = useRef<number | null>(null);
  const sidebarRef = useRef<any>(null);

  const { user } = useAuthStore() as { user: User };

  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);
  console.log(selectedTranscript);

  const prepareFileFromURL = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const name = url.split("/").pop() || "audio.wav";
    return new File([blob], name, { type: blob.type });
  };

  useEffect(() => {
    (async () => {
      const downloadUrl = selectedTranscript?.audio?.downloadUrl;
      if (!downloadUrl) {
        setAudioURL(null);
        setFile(null);
        return;
      }

      const audioUrl = `http://localhost:4000/audio/${downloadUrl}`;
      setAudioURL(audioUrl);

      try {
        const file = await prepareFileFromURL(audioUrl);
        setFile(file); // معاك File جاهز للرفع
      } catch (err) {
        console.error(err);
        setFile(null);
      }
    })();
  }, [selectedTranscript]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;

      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);

      setRecordingTime(0);
      recordingInterval.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        audioChunks.current.push(event.data);
      };

      console.log("audioChunks.current", audioChunks.current);

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        console.log(audioBlob);
        setFile(new File([audioBlob], "recording.wav", { type: "audio/wav" }));

        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);

        // Clear recording timer
        if (recordingInterval.current) {
          clearInterval(recordingInterval.current);
          recordingInterval.current = null;
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      // Start waveform visualization
      visualizeAudio();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert(
        "Error accessing microphone. Please ensure you have granted microphone permissions."
      );
    }
  };

  const visualizeAudio = () => {
    if (!analyser.current) return;

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const draw = () => {
      if (!analyser.current) return;

      animationFrame.current = requestAnimationFrame(draw);
      analyser.current.getFloatTimeDomainData(dataArray);
      setAudioData(dataArray);
    };

    draw();
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());

      // Stop waveform visualization
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file);

    if (file) {
      const url = URL.createObjectURL(file);
      console.log(url);
      setFile(file);
      setAudioURL(url);
    }
  };

  const transcribeAudio = async () => {
    if (!audioURL) return;
    setTranscription({ text: "", isLoading: true });

    try {
      const data = await transcribeAudioToText(file as File);
      console.log("🔊 Transcription result:", data);

      const originalText = data?.transcription;

      // استخدم المتغير بدل setState
      const res = await getEnhancedText();

      setTranscription({
        text: res.enhanced_text || "Transcription completed successfully.",
        isLoading: false,
      });

      const processed = await processFullPipeline(file as File, user.id);
      if (processed) {
        processed.transcription = originalText; // ضفها يدويًا لو مش موجودة في result

        console.log("🧠 Full Processed Object:", processed);
        await saveTranscriptionToDB(processed, file as File);
        sidebarRef.current?.refresh();
      }
    } catch (error) {
      setTranscription({ text: "", isLoading: false });
      console.error("❌ Transcription Error:", error);
    }
  };

  const copyToClipboard = () => {
    if (transcriptions.text) {
      navigator.clipboard.writeText(transcriptions.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadTranscription = () => {
    if (transcriptions.text) {
      const blob = new Blob([transcriptions.text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transcriptions.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Format recording time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // handle summury
  const handleSummury = async () => {
    setSummary({ text: "", isLoading: true, hidden: false });
    setExtractTask({ text: "", isLoading: false, hidden: true });
    setDetect_topics({ text: "", isLoading: true, hidden: true });
    try {
      const res = await getSummary();
      console.log(res);
      setSummary({
        text: res?.summary || "No summary available.",
        isLoading: false,
        hidden: false,
      });
    } catch (error) {
      console.log(error);
      setSummary({ text: "", isLoading: false, hidden: true });
    }
  };
  const processFullPipeline = async (file: File, userId: number) => {
    try {
      const result = {
        transcription: "", // enhanced text
        enhanced: "", // لو عندك فرق
        summary: "",
        tasks: "",
        topics: "",
        User: String(userId),
      };
      const test = transcriptionsAdd.text;
      console.log("📂 Processing file:", test);
      result.transcription = test || "No transcription available.";
      const enhanced = await getEnhancedText();
      result.enhanced = enhanced?.enhanced_text || "";

      const summary = await getSummary();
      result.summary = summary?.summary || "";

      const topics = await getTopics();
      result.topics = topics?.topics || "";

      const tasks = await getTasks();
      result.tasks = tasks?.tasks || "";

      return result;
    } catch (error) {
      console.error("❌ Pipeline error:", error);
      return null;
    }
  };

  // handle extract tasks
  const handleExtract = async () => {
    setExtractTask({ text: "", isLoading: true, hidden: false });
    setSummary({ text: "", isLoading: false, hidden: true });
    setDetect_topics({ text: "", isLoading: true, hidden: true });
    try {
      const res = await getTasks();
      console.log(res);
      setExtractTask({
        text: res?.tasks || "No tasks available.",
        isLoading: false,
        hidden: false,
      });
    } catch (error) {
      console.log(error);
      setExtractTask({ text: "", isLoading: false, hidden: true });
    }
  };

  const handleDetect_topics = async () => {
    setDetect_topics({ text: "", isLoading: true, hidden: false });
    setExtractTask({ text: "", isLoading: true, hidden: true });
    setSummary({ text: "", isLoading: false, hidden: true });
    try {
      const res = await getTopics();
      console.log(res);
      setDetect_topics({
        text: res?.topics || "No topics available.",
        isLoading: false,
        hidden: false,
      });
    } catch (error) {
      console.log(error);
      setDetect_topics({ text: "", isLoading: false, hidden: true });
    }
  };
  console.log(
    `E:\\freeLance\\backend${selectedTranscript?.audio?.downloadUrl}`
  );

  console.log(selectedTranscript);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="flex-1 overflow-y-auto min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-4 md:px-8">
        <div className="w-full flex justify-between items-start">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                ) : (
                  user?.userName?.charAt(0).toUpperCase()
                )}
              </div>
              <Link to="/profile" className="text-white text-xl font-semibold">
                {user?.userName}
              </Link>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex gap-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white 
    font-bold p-3 rounded-xl shadow-lg shadow-purple-800/30 transition-all duration-200 hover:scale-105"
          >
            <LogOut /> log out
          </button>
        </div>

        <div  className="flex  flex-col-reverse lg:flex-row lg:space-x-6 mt-3">
          <SidebarTranscriptions
            ref={sidebarRef}
            userId={user.id}
            onSelect={setSelectedTranscript}
          />
          <div className=" mx-auto w-full flex-col items-center justify-between">
            {/* Hero Section */}
            <div className="text-center mb-8 md:mb-12 mt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 animate-pulse"></div>
                  <Waveform className="w-12 h-12 text-white relative z-10" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                  SPOKIFY
                </h1>
              </div>
              <p className="text-purple-100 text-lg md:text-xl">
                Transform your voice into text, instantly.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-white/10">
              <div className="space-y-8">
                {/* Recording Controls */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`relative flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
                        : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-75 animate-ping"></div>
                        <Square className="w-6 h-6 relative z-10" />
                        <span className="relative z-10">Stop Recording</span>
                        <span className="ml-2 text-sm font-mono relative z-10">
                          {formatTime(recordingTime)}
                        </span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6" /> Start Recording
                      </>
                    )}
                  </button>

                  <label className="flex items-center justify-center gap-2 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl cursor-pointer font-semibold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30">
                    <Upload className="w-6 h-6" />
                    Upload Audio
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Waveform Visualization */}
                {isRecording && audioData && (
                  <div className="h-24 bg-black/20 rounded-xl p-4 overflow-hidden">
                    <div className="flex items-center justify-between h-full">
                      {Array.from(audioData).map((value, index) => {
                        if (index % 4 !== 0) return null;
                        const height = Math.abs(value) * 100;
                        return (
                          <div
                            key={index}
                            className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full mx-0.5"
                            style={{ height: `${Math.max(2, height)}px` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Audio Player */}
                {audioURL && (
                  <div className="bg-white/5 backdrop-blur p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-6 h-6 text-purple-300" />
                      <audio src={audioURL} controls className="w-full h-10" />
                    </div>
                    <button
                      onClick={transcribeAudio}
                      className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                    >
                      {transcriptions.isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Transcribing...</span>
                        </>
                      ) : (
                        <>
                          <Waveform className="w-5 h-5" />
                          <span>Transcribe Audio</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Transcription Result */}
                {(transcriptions.isLoading || transcriptions.text) && (
                  <div className="bg-white/5 backdrop-blur p-6 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white">
                        Transcriptions
                      </h2>
                      {transcriptions.text && (
                        <div className="flex gap-2">
                          <button
                            onClick={copyToClipboard}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Copy to clipboard"
                          >
                            {copied ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={downloadTranscription}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Download transcriptions"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {transcriptions.isLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-300" />
                        <p className="text-purple-200">
                          Processing your audio...
                        </p>
                      </div>
                    ) : (
                      <div className="bg-black/20 rounded-lg p-4">
                        <p className="text-purple-100 whitespace-pre-wrap leading-relaxed">
                          {transcriptions.text}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {transcriptions.text && (
              <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full mt-4">
                <span
                  onClick={handleExtract}
                  className="w-1/2 m-auto text-center rounded-lg mt-5 text-white bg-white/5 backdrop-blur-lg shadow-2xl p-4 md:p-6 border cursor-pointer border-white/10 hover:bg-white/10 duration-75"
                >
                  <h4>Extracted Tasks</h4>
                </span>
                <span
                  onClick={handleSummury}
                  className="w-1/2 m-auto text-center rounded-lg mt-5 text-white bg-white/5 backdrop-blur-lg shadow-2xl p-4 md:p-6 border cursor-pointer border-white/10 hover:bg-white/10 duration-75"
                >
                  <h4>Summarization</h4>
                </span>
                <span
                  onClick={() => setOpenTrello(true)}
                  className="w-1/2 m-auto text-center rounded-lg mt-5 text-white bg-white/5 backdrop-blur-lg shadow-2xl p-4 md:p-6 border cursor-pointer border-white/10 hover:bg-white/10 duration-75"
                >
                  <h4>Add to Trello</h4>
                </span>
                <span
                  onClick={handleDetect_topics}
                  className="w-1/2 m-auto text-center rounded-lg mt-5 text-white bg-white/5 backdrop-blur-lg shadow-2xl p-4 md:p-6 border cursor-pointer border-white/10 hover:bg-white/10 duration-75"
                >
                  <h4>Detected Topics</h4>
                </span>
              </div>
            )}

            {!summary?.hidden && <Summary summary={summary} />}
            {!extractTask?.hidden && <ExtractTask task={extractTask} />}
            {!detect_topics?.hidden && <Detect_topics topic={detect_topics} />}
            <TrelloModal
              open={openTrello}
              onClose={() => setOpenTrello(false)}
            />

            {/* Transcript Details Section from Sidebar */}
            {/* {selectedTranscript && (
            <div className="mt-10 bg-white/5 backdrop-blur p-6 rounded-xl border border-white/10">
              <h3 className="text-white text-xl font-bold mb-4">
                Transcript Details
              </h3>
              <p className="text-purple-200 whitespace-pre-wrap mb-2">
                <strong>Enhanced:</strong> {selectedTranscript?.enhanced}
              </p>
              <p className="text-purple-200 whitespace-pre-wrap mb-2">
                <strong>Summary:</strong> {selectedTranscript.summary}
              </p>
              <p className="text-purple-200 whitespace-pre-wrap mb-2">
                <strong>Tasks:</strong> {selectedTranscript.tasks}
              </p>
              <p className="text-purple-200 whitespace-pre-wrap mb-2">
                <strong>Topics:</strong> {selectedTranscript.topics}
              </p>
              {selectedTranscript?.audio?.downloadUrl && (
                <div className="mt-4">
                  <h4 className="text-white font-semibold mb-2">
                    Audio Playback
                  </h4>
                  <audio
                    controls
                    src={`http://localhost:4000/audio/${selectedTranscript?.audio?.downloadUrl}`}
                  />
                </div>
              )}
            </div>
          )} */}

            {/* Footer */}
            <div className="mt-8 text-center text-purple-200 text-sm">
              <p>
                Powered by Google Gemini AI • SPOKIFY ©{" "}
                {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
