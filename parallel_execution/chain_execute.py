import subprocess
import os
import time
import sys

def chain_execute():

    while True:
        # run speech-to-text
        speech_to_text_process = subprocess.Popen(["python3", "speech-to-text.py"],
                                                    cwd="/../speech-to-text/")
        speech_to_text_process.wait()  # Wait for speech-to-text to finish

        # run prompt
        prompting_process = subprocess.Popen(["node", "index.js"],
                                                    cwd="/../chatbot/")
        prompting_process.wait()  # Wait for prompt process to finish

        # run display
        display_process = subprocess.Popen(["python3", "oled.py"],
                                            cwd="/../firmware/drivers/oled/")
        display_process.wait()  # Wait for display process to finish

if __name__ == "__main__":
    chain_execute()
