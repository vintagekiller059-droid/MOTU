import { useRef, useCallback, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { speechToText, textToSpeech } from '../services/api';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
}

export default function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { setVoiceState } = useChatStore();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        try {
          setVoiceState({ isRecording: false, transcript: 'Transcribing...' });
          const text = await speechToText(audioBlob);
          setVoiceState({ transcript: text });
          onTranscript(text);
        } catch (err) {
          console.error('STT failed:', err);
          setVoiceState({ transcript: '' });
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setVoiceState({ isRecording: true });
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Microphone access denied or not available');
    }
  }, [onTranscript, setVoiceState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <button
      onClick={toggleRecording}
      className={`
        shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all
        ${isRecording 
          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
          : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
        }
      `}
      title={isRecording ? 'Stop recording' : 'Push to talk'}
    >
      {isRecording ? (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}

export async function playTTS(text: string) {
  try {
    const blob = await textToSpeech(text);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    useChatStore.getState().setVoiceState({ isPlaying: true });

    audio.onended = () => {
      useChatStore.getState().setVoiceState({ isPlaying: false });
      URL.revokeObjectURL(url);
    };

    audio.onerror = () => {
      useChatStore.getState().setVoiceState({ isPlaying: false });
      URL.revokeObjectURL(url);
    };

    await audio.play();
  } catch (err) {
    console.error('TTS playback failed:', err);
    useChatStore.getState().setVoiceState({ isPlaying: false });
  }
}
