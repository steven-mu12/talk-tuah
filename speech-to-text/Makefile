# Makefile for talk-tuah project

# Python interpreter
PYTHON = python3

# Main script
SCRIPT = speech-to-text.py

# Run the speech-to-text transcription
transcribe:
	$(PYTHON) $(SCRIPT)

# Make the script executable
chmod:
	chmod +x $(SCRIPT)

# Default target
.DEFAULT_GOAL := transcribe