// index.js

import openai from './config/openai.js';
import colors from 'colors';
import path from 'path';
import {
    appendFileSync,
    readFileSync,
    writeFileSync,
    existsSync,
    mkdirSync,
} from 'fs';

const LOG_DIRECTORY = './ConvoLogs'; // Directory for chat logs
const DATA_DIRECTORY = './data'; // Directory for personal data
const INPUT_JSON_FILE = './inputData/input.json'; // Path to the JSON file with the chatter's input
let chatterName = 'Chatter'; // Default name
let lastTranscript = ''; // To store the last processed transcript

// Define the conversation modes (professional, friendly, neutral, flirtatious)
const styleSettings = {
    p: "Respond as if you are the user speaking in a professional and respectful manner.",
    fr: "Respond as if you are the user speaking in a casual and friendly manner.",
    n: "Respond as if you are the user speaking in a neutral and straightforward manner.",
    fl: "Respond as if you are the user speaking in a flirtatious manner. Do not use language that is sexual."
};

// Ensure the log and data directories exist
[LOG_DIRECTORY, DATA_DIRECTORY].forEach(dir => {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        console.log(colors.yellow(`Created directory: ${dir}`));
    }
});

// Function to append both input and output to the JSON log
function appendToFile(inputData, outputData) {
    const jsonFileName = 'message.json'; // Static name for JSON log
    const jsonFilePath = path.join(LOG_DIRECTORY, jsonFileName);

    // Create a log entry with 'in' and 'out' sections
    const logEntry = { in: {
            transcript: inputData.transcript,
            timestamp: inputData.timestamp
        },
        out: {
            transcript: outputData.transcript,
            timestamp: outputData.timestamp
        }
    };

    // Read the current contents of message.json (or initialize an empty array if file doesn't exist)
    let logData = [];
    if (existsSync(jsonFilePath)) {
        const jsonData = readFileSync(jsonFilePath, 'utf8');
        if (jsonData) {
            try {
                logData = JSON.parse(jsonData);
            } catch (parseError) {
                console.error(colors.red('Error parsing message.json. Overwriting with new log entry.'));
                logData = [];
            }
        }
    }

    logData.push(logEntry);

    writeFileSync(jsonFilePath, JSON.stringify(logData, null, 2), { flag: 'w' });

    // Continue appending only the output transcript to message.txt
    const textFileName = 'message.txt'; // Static name for text log
    const textFilePath = path.join(LOG_DIRECTORY, textFileName);

    const textLogEntry = `${outputData.transcript}\n`;
    appendFileSync(textFilePath, textLogEntry, { flag: 'a' });
}

// Function to determine or update the name of the chatter based on input
async function extractName(inputText, currentName) {
    const systemMessage = `
        Determine if the person has introduced or changed their name from "${currentName}" in the following input. 
        Detect if there is a name update or introduction in any form, for example, saying "Actually my name is" or something like that.
        If you detect such a name introduction, extract the new name.
        If no new name is introduced or detected, return "${currentName}".
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: inputText }
            ]
        });

        const Name = completion.choices[0].message.content.trim();
        return Name;
    } catch (error) {
        console.error(colors.red('Error extracting name'), error.message);
    }
}

// Function to read the JSON file containing the input data
function readInputFromJson(jsonFilePath) {
    try {
        if (!existsSync(jsonFilePath)) {
            console.error(colors.red(`Input file not found: ${jsonFilePath}`));
            return null;
        }

        const data = readFileSync(jsonFilePath, 'utf8');
        const jsonData = JSON.parse(data);

        // Validate required fields
        if (!jsonData.transcript || !jsonData.sentiments || !jsonData.sentiments.average) {
            console.error(colors.red('Input JSON is missing required fields.'));
            return null;
        }

        // Extract the required fields: transcript, sentiment, sentiment_score, timestamp (optional)
        const transcript = jsonData.transcript;
        const sentiment = jsonData.sentiments.average.sentiment;
        const sentimentScore = jsonData.sentiments.average.sentiment_score;
        const timestamp = jsonData.timestamp || new Date().toISOString();

        return { transcript, sentiment, sentimentScore, timestamp };
    } catch (error) {
        console.error(colors.red('Error reading or parsing the input JSON file:'), error.message);
        return null;
    }
}

// Function to determine response setting based on sentiment
function determineResponseSetting(sentiment, sentimentScore) {
    // Define thresholds based on sentiment and sentiment_score
    let responseSetting = '';

    switch (sentiment.toLowerCase()) {
        case 'positive':
            if (sentimentScore > 0.7) {
                responseSetting = 'fl'; // Flirtatious
            } else {
                responseSetting = 'fr'; // Friendly
            }
            break;
        case 'neutral':
            responseSetting = 'n'; // Neutral
            break;
        case 'negative':
            responseSetting = 'p'; // Professional
            break;
        default:
            responseSetting = 'n'; // Default to Neutral if unknown sentiment
    }

    // Log the sentiment and decision
    console.log(`Sentiment: ${sentiment} (Score: ${sentimentScore})`);
    console.log(`Response Setting: ${responseSetting}`);

    return responseSetting;
}

// Function to extract personal data from user input using GPT-4
async function extractPersonalData(inputText) {
    const systemMessage = `
        Extract personal information from the following user input. 
        Identify interests, preferences, hobbies, and other personal details mentioned.
        Return the information in a JSON array format with each item representing a distinct piece of personal data.
        
        Example Output:
        [
            { "type": "interest", "value": "yoga" },
            { "type": "hobby", "value": "painting" }
        ]
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: inputText }
            ]
        });

        const extractedData = completion.choices[0].message.content.trim();
        return JSON.parse(extractedData);
    } catch (error) {
        console.error(colors.red('Failed to extract personal data:'), error.message);
        return [];
    }
}

// Function to create the system prompt
function createSystemPrompt(styleSettings, mode, chatterName, personalData) {
    let personalDataNotes = '';

    if (personalData && personalData.length > 0) {
        personalData.forEach(data => {
            personalDataNotes += `You remember that ${chatterName} is interested in ${data.value}. `;
        });
    }

    const systemPrompt = `
        ${styleSettings[mode]} You are having a conversation with ${chatterName}. 
        ${personalDataNotes}
        You are NEVER to admit to being an AI in any sort of way. 
        Your response should always be formatted as text, which means no lists. 
        Your response should always be meant to bring positivity to the conversation. 
        If you ever sense any negativity coming from the input, you are not allowed to respond with any vulgar, discriminatory, or evil response.
    `;

    return systemPrompt;
}

// Main
async function main() {
    console.log(colors.bold.green('Welcome to the conversation helper chatbot!'));

    lastTranscript = '';

    // Clear the contents of message.txt and message.json when the program starts
    const textFileName = 'message.txt';
    const jsonFileName = 'message.json';

    const textFilePath = path.join(LOG_DIRECTORY, textFileName);
    const jsonFilePath = path.join(LOG_DIRECTORY, jsonFileName);

    // Truncate the contents of message files
    writeFileSync(textFilePath, '', { flag: 'w' });
    writeFileSync(jsonFilePath, '[]', { flag: 'w' });

    // Function to check and process the input JSON file
    async function checkAndProcessFile() {
        try {
            const inputData = readInputFromJson(INPUT_JSON_FILE);
            if (!inputData) {
                // Either file not found or invalid JSON
                return;
            }

            const { transcript, sentiment, sentimentScore, timestamp: inputTimestamp } = inputData;

            // Check if the transcript is different from the last processed one
            if (transcript === lastTranscript) {
                console.log(colors.yellow('No new transcript detected. Waiting for updates...'));
                return;
            }

            // Update lastTranscript
            lastTranscript = transcript;

            // Determine the appropriate response setting based on the extracted values
            const responseSetting = determineResponseSetting(sentiment, sentimentScore);

            // Set the mode according to the response setting
            const mode = responseSetting; // Now 'p', 'fr', 'n', 'fl'

            // Check if the input contains a name change using GPT
            const detectedName = await extractName(transcript, chatterName);
            if (detectedName && detectedName !== chatterName) {
                console.log(colors.magenta(`Name change detected! Updated user's name to ${detectedName}`));
                chatterName = detectedName;
            }

            // Extract personal data from the user input
            const personalData = await extractPersonalData(transcript);

            // Create system prompt with extracted personal data
            const systemPrompt = createSystemPrompt(styleSettings, mode, chatterName, personalData);

            // Call the OpenAI API to generate a response
            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: systemPrompt }, // System message to instruct GPT
                    { role: 'user', content: transcript } // Input from the JSON file
                ]
            });

            // Access the message content directly from completion
            const completionText = completion.choices[0].message.content.trim();
            console.log(colors.green('You: ') + completionText);

            // Prepare output data
            const outputTimestamp = new Date().toISOString();
            const outputData = {
                transcript: completionText,
                timestamp: outputTimestamp
            };

            // Prepare input data for logging
            const inputDataForLog = {
                transcript: transcript,
                timestamp: inputTimestamp
            };

            // Save the chatbot response to both .txt and .json files, using the current name
            appendToFile(inputDataForLog, outputData);

        } catch (error) {
            // Error Handling
            if (error.response && error.response.data && error.response.data.error) {
                console.error(colors.red(`Error Code: ${error.response.data.error.code}`));
                console.error(colors.red(`Error Message: ${error.response.data.error.message}`));
            } else {
                console.error(colors.red('An unexpected error occurred.'));
                console.error(colors.red(error.message));
            }
        }
    }

    // Set up an interval to check the JSON file every 3 seconds
    setInterval(checkAndProcessFile, 3000);
}

// Start the chatbot
main();