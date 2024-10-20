import subprocess
import os
import time
import sys
from pydub import AudioSegment
import signal

def verify_speaker_parallel(you_speaking, parent_pid):
    while True:
        # Grab the last second of the latest audio file 
        audio = AudioSegment.from_mp3("/output/audio.mp3")
        audio_len = len(audio)
        if audio_len > 1000:
            last_second = audio[-1000:]
        else:
            last_second = audio
        last_second.export("/output/last_second.mp3", format="mp3")

        # Run voice detection on that
        voice_detection_process = subprocess.Popen(
            ["python3", "verify_speaker.py"],
            cwd="/../speech-to-text/",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = voice_detection_process.communicate()
        temp = voice_detection_process.returncode

        # If `you_speaking` changes, signal the parent process
        if you_speaking != temp:
            os.kill(parent_pid, signal.SIGUSR1)  # Send signal to parent
            you_speaking = temp  # Update the local variable to the new state
            break  # End the process after notifying

        # Wait for 1 second before checking again (or adjust based on needs)
        time.sleep(1)

if __name__ == "__main__":
    parent_pid = int(sys.argv[2])  # Second argument is the parent PID
    you_speaking = int(sys.argv[1])  # First argument is `you_speaking`

    # Call the main function
    verify_speaker_parallel(you_speaking, parent_pid)
