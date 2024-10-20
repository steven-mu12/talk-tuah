import subprocess
import os
import time
import signal

# -- global variables --
you_speaking = 0  # 0 means you're not speaking, 1 means you're speaking
signal_received = False  # Flag to track when a signal is received

# Signal handler for you_speaking change
def signal_handler(signum, frame):
    global signal_received
    signal_received = True
    print("[ MAIN ]: Signal received, updating you_speaking.")

# Set up signal handling for SIGUSR1
signal.signal(signal.SIGUSR1, signal_handler)

def parallel_execution():
    global you_speaking

    print("Running speech recognition and pipeline concurrently...")

    # -- run the background process to monitor you_speaking
    poll_process = subprocess.Popen(["python3", "verify_speaker_parallel.py", 
                                         str(you_speaking), str(os.getpid())], 
                                         cwd="/parallel_execution/")
    
    # -- run the pipeline process concurrently
    chain_process = subprocess.Popen(["python3", "chain_execute.py"], 
                                         cwd="/parallel_execution/")
    
    # -- check for signal from poll_process
    while True:
        # Wait for the signal that indicates the `you_speaking` state changed
        if signal_received:
            print("[ MAIN ]: Stopping chain_execute process due to you_speaking change.")
            signal_received = False  # Reset the signal flag
            you_speaking = 1

            # Terminate the `chain_execute.py` process
            chain_process.terminate()
            chain_process.wait()  # Wait for the process to finish
            print("[ MAIN ]: chain_execute process terminated.")

            # You could restart the chain_execute or take other actions here
            break

        time.sleep(0.1)  # Sleep briefly to avoid excessive CPU usage

if __name__ == "__main__":

    # -- FIRST RUN --
    # Run capture for one second
    capture_process = subprocess.Popen(["./capture"], cwd="./firmware/build")
    time.sleep(1)

    # Run the voice detection once to get the initial value
    voice_detection_process = subprocess.Popen(
        ["python3", "verify_speaker.py"], 
        cwd="/speech-to-text/",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    stdout, stderr = voice_detection_process.communicate()
    you_speaking = voice_detection_process.returncode


    while True:
        # If the initial detection says you're not speaking, proceed with background
        if you_speaking == 0:
            print("[ MAIN ]: TARGET IS SPEAKING")
            parallel_execution()  # Start your concurrent tasks if needed

        else:
            print("[ MAIN ]: YOU ARE SPEAKING")
            
            # Start the background process to monitor `you_speaking`
            poll_process = subprocess.Popen(["python3", "verify_speaker_parallel.py", 
                                            str(you_speaking), str(os.getpid())], 
                                            cwd="/parallel_execution/")

            # Now, wait for the signal from the background process
            while True:
                # The program will block here until a signal is received
                time.sleep(0.1)
                if signal_received:
                    signal_received = False  # Reset the signal flag
                    you_speaking = 0
                    break

        
        # stop capture and clear audio files
        capture_process.terminate()
        os.remove("output/audio.mp3")
        os.remove("output/audio.raw")

