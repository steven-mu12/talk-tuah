import webrtcvad
import collections
import sys
import pyaudio
import time
from array import array
from struct import pack
import subprocess

# --- audio and VAD settings ---
FORMAT = pyaudio.paInt16         # audio format (16-bit)
CHANNELS = 1                     # mono audio
RATE = 16000                     # sampling rate (16 kHz)
CHUNK_DURATION_MS = 30           # chunk duration in milliseconds
CHUNK_SIZE = int(RATE * CHUNK_DURATION_MS / 1000)  # number of frames per chunk
CHUNK_BYTES = CHUNK_SIZE * 2     # number of bytes per chunk (16-bit audio, so 2 bytes per frame)
PADDING_DURATION_MS = 500        # padding duration (in ms) to keep surrounding audio
NUM_PADDING_CHUNKS = int(PADDING_DURATION_MS / CHUNK_DURATION_MS)

# VAD settings (aggressiveness: 0-3, higher values = more aggressive)
vad = webrtcvad.Vad(3)

# --- PyAudio setup ---
pa = pyaudio.PyAudio()
stream = pa.open(format=FORMAT,
                 channels=CHANNELS,
                 rate=RATE,
                 input=True,
                 start=False,
                 frames_per_buffer=CHUNK_SIZE)

got_a_sentence = False

# --- audio normalization setup ---
def normalize(snd_data):
    MAXIMUM = 32767  # max value for 16-bit audio
    times = float(MAXIMUM) / max(abs(i) for i in snd_data)
    r = array('h')
    for i in snd_data:
        r.append(int(i * times))
    return r


# ---------------------
# --- MAIN FUNCTION ---
# ---------------------

if __name__ == "__main__":

    # clear everything

    # main run 
    while True:
        ring_buffer = collections.deque(maxlen=NUM_PADDING_CHUNKS)  # buffer for holding audio chunks
        triggered = False                                           # tracks if speech has started
        voiced_frames = []                                          # list to store voiced audio
        raw_data = array('h')                                       # array for raw audio data
        start_point = 0                                             # start point for voice recording
        StartTime = time.time()                                     # start time for tracking duration
        stream.start_stream()

        # buffers for tracking voice activity within chunks
        ring_buffer_flags = [0] * int(240 / CHUNK_DURATION_MS)
        ring_buffer_flags_end = [0] * int(480 / CHUNK_DURATION_MS)
        ring_buffer_index = 0
        ring_buffer_index_end = 0

        # calibration sequence
        print("[ VAD.PY ]: WAIT - CALIBRATION SEQUENCE")
        time.sleep(3)
        print("[ VAD.PY ]: VAD DETECTION ACTIVE")

        while not got_a_sentence:
            # read a chunk of audio from the stream
            chunk = stream.read(CHUNK_SIZE)
            raw_data.extend(array('h', chunk))  # add chunk to raw data

            # check for voice activity in this chunk
            active = vad.is_speech(chunk, RATE)
            sys.stdout.write('1' if active else '_')

            # update ring buffer for detecting start of speech
            ring_buffer_flags[ring_buffer_index] = 1 if active else 0
            ring_buffer_index = (ring_buffer_index + 1) % len(ring_buffer_flags)

            # start point detection (when speech starts)
            if not triggered:
                ring_buffer.append(chunk)
                num_voiced = sum(ring_buffer_flags)
                if num_voiced > 0.9 * len(ring_buffer_flags):
                    print("\n[ VAD.PY ]: Voice detected")

                    # RUN THE MAIN FUNCTION and just exit without waiting
                    subprocess.Popen(['python3', 'main.py'], cwd='../../..')

                    # Continue main process, don't wait for the subprocess to finish
                    triggered = True
                    ring_buffer.clear()

                    break  # Exit the current loop after starting subprocess

            sys.stdout.flush()

        # normalize the audio data if needed
        raw_data = normalize(raw_data)

        # Clean up the PyAudio stream if needed
        stream.stop_stream()
        stream.close()
        pa.terminate()

        print("[ VAD.PY ]: Process finished, exiting.")
        break  # End the outer loop, terminate the program
