import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Upload, Loader2, Volume2, AudioWaveform as Waveform, Copy, Check, Download } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface TranscriptionResult {
  text: string;
  isLoading: boolean;
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Retry configuration - Adjusted for better handling of API overload
const MAX_RETRIES = 5;
const INITIAL_DELAY = 2000; // 2 seconds

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  attempt = 1
): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('503') && attempt <= MAX_RETRIES) {
      const delay = INITIAL_DELAY * Math.pow(2, attempt - 1);
      console.log(`Attempt ${attempt} failed, retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithExponentialBackoff(operation, attempt + 1);
    }
    throw error;
  }
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult>({
    text: '',
    isLoading: false,
  });
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number | null>(null);
  const recordingInterval = useRef<number | null>(null);

  // Clean up resources when component unmounts
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      // Set up audio context and analyser for waveform visualization
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256;
      
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      
      // Start recording timer
      setRecordingTime(0);
      recordingInterval.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      mediaRecorder.current.ondataavailable = (event: BlobEvent) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
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
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
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
      mediaRecorder.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      
      // Stop waveform visualization
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioURL(url);
    }
  };

  const transcribeAudio = async () => {
    if (!audioURL) return;

    setTranscription({ text: '', isLoading: true });
    
    try {
      // Get the audio blob from the URL
      const response = await fetch(audioURL);
      const audioBlob = await response.blob();

      // Create a base64 representation of the audio
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string;
          const audioData = base64Audio.split(',')[1]; // Remove the data URL prefix

          // Initialize the model with gemini-1.5-flash
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          // Generate content with retry mechanism
          const result = await retryWithExponentialBackoff(async () => {
            return await model.generateContent([
              {
                inlineData: {
                  data: audioData,
                  mimeType: "audio/wav"
                }
              }
            ]);
          });

          const response = await result.response;
          const text = response.text();

          setTranscription({
            text,
            isLoading: false
          });
        } catch (error) {
          console.error('Transcription error:', error);
          
          // Provide a user-friendly message for service overload
          if (error instanceof Error && error.message.includes('503')) {
            setTranscription({
              text: 'The service is currently experiencing high demand. Please wait a moment and try again.',
              isLoading: false
            });
          } else {
            setTranscription({
              text: 'An error occurred during transcription. Please try again.',
              isLoading: false
            });
          }
        }
      };
    } catch (error) {
      console.error('Audio processing error:', error);
      setTranscription({
        text: 'Error processing audio. Please try again.',
        isLoading: false
      });
    }
  };

  const copyToClipboard = () => {
    if (transcription.text) {
      navigator.clipboard.writeText(transcription.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadTranscription = () => {
    if (transcription.text) {
      const blob = new Blob([transcription.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transcription.txt';
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <Waveform className="w-12 h-12 text-white relative z-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">SPOKIFY</h1>
          </div>
          <p className="text-purple-100 text-lg md:text-xl">Transform your voice into text, instantly.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-white/10">
          <div className="space-y-8">
            {/* Recording Controls */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                }`}
              >
                {isRecording ? (
                  <>
                    <div className="absolute -inset-1 bg-red-500 rounded-full blur opacity-75 animate-ping"></div>
                    <Square className="w-6 h-6 relative z-10" /> 
                    <span className="relative z-10">Stop Recording</span>
                    <span className="ml-2 text-sm font-mono relative z-10">{formatTime(recordingTime)}</span>
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
                    // Only render a subset of the data points for performance
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
                  {transcription.isLoading ? (
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
            {(transcription.isLoading || transcription.text) && (
              <div className="bg-white/5 backdrop-blur p-6 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Transcription</h2>
                  {transcription.text && (
                    <div className="flex gap-2">
                      <button 
                        onClick={copyToClipboard}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={downloadTranscription}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        title="Download transcription"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                {transcription.isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-300" />
                    <p className="text-purple-200">Processing your audio...</p>
                  </div>
                ) : (
                  <div className="bg-black/20 rounded-lg p-4">
                    <p className="text-purple-100 whitespace-pre-wrap leading-relaxed">{transcription.text}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-purple-200 text-sm">
          <p>Powered by Google Gemini AI • SPOKIFY © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

export default App; 