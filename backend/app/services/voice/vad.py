"""Voice Activity Detection using WebRTC VAD."""
try:
    import webrtcvad
except ImportError:
    from webrtcvad import Vad as webrtcvad_Vad
    class webrtcvad:
        Vad = webrtcvad_Vad
import wave
import io
from typing import List, Tuple


class VADProcessor:
    def __init__(self, aggressiveness: int = 2, frame_duration_ms: int = 30):
        self.vad = webrtcvad.Vad(aggressiveness)
        self.frame_duration_ms = frame_duration_ms
        self.frame_bytes = int(16000 * 2 * frame_duration_ms / 1000)

    def is_speech(self, audio_frame: bytes) -> bool:
        return self.vad.is_speech(audio_frame, 16000)

    def detect_speech_segments(self, audio_bytes: bytes) -> List[Tuple[int, int]]:
        segments = []
        in_speech = False
        segment_start = 0

        for i in range(0, len(audio_bytes), self.frame_bytes):
            frame = audio_bytes[i:i + self.frame_bytes]
            if len(frame) < self.frame_bytes:
                break

            is_speech = self.is_speech(frame)

            if is_speech and not in_speech:
                segment_start = i
                in_speech = True
            elif not is_speech and in_speech:
                segments.append((segment_start, i))
                in_speech = False

        if in_speech:
            segments.append((segment_start, len(audio_bytes)))

        return segments


def read_wave_from_bytes(audio_bytes: bytes) -> Tuple[bytes, int]:
    with io.BytesIO(audio_bytes) as wav_file:
        with wave.open(wav_file, 'rb') as wf:
            num_channels = wf.getnchannels()
            assert num_channels == 1, "Must be mono audio"
            sample_width = wf.getsampwidth()
            assert sample_width == 2, "Must be 16-bit audio"
            sample_rate = wf.getframerate()
            assert sample_rate in (8000, 16000, 32000, 48000), "Invalid sample rate"
            pcm_data = wf.readframes(wf.getnframes())
            return pcm_data, sample_rate
