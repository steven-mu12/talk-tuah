#!/usr/bin/env python3
import asyncio
from deepgram import DeepgramClient, FileSource, PrerecordedOptions
import json

# Replace with your Deepgram API key
DEEPGRAM_API_KEY = 'your-api-key'

async def transcribe_audio():
    # Initialize the Deepgram client
    deepgram = DeepgramClient(DEEPGRAM_API_KEY)

    # Open the audio file
    with open('../output/audio.mp3', 'rb') as audio:
        buffer_data = audio.read()
        payload: FileSource = {
            "buffer": buffer_data,
        }
       
        options = PrerecordedOptions(
            smart_format=True,
            summarize="v2",
            detect_topics=True,
            sentiment=True
        )
        
        response = deepgram.listen.rest.v("1").transcribe_file(payload, options)

        response_json = json.loads(response.to_json())

        extracted_data = {
            "transcript": response_json['results']['channels'][0]['alternatives'][0]['transcript'],
            "sentiments": response_json['results']['sentiments']
        }

        # Write the extracted data to a JSON file
        with open('./output/transcription_result.json', 'w') as json_file:
            json.dump(extracted_data, json_file, indent=4)

        # Optionally, you can save the transcript to a file
        #with open('./output/transcript.txt', 'w') as f:
        #    f.write(j['results']['channels'][0]['alternatives'][0]['transcript'])

# Run the async function
asyncio.run(transcribe_audio())
