#include <stdio.h>
#include <stdlib.h>
#include <portaudio.h>
#include <lame/lame.h>
#include <pthread.h>
#include <unistd.h>
#include <signal.h>

#define SAMPLE_RATE 48100
#define FRAMES_PER_BUFFER 512
#define NUM_CHANNELS 2
#define RAW_FILE_NAME "../../output/audio.raw"
#define MP3_FILE_NAME "../../output/audio.mp3"


// audio data structure
typedef struct {
    FILE *rawFile;
    lame_t lame;
    int finished;
} AudioData;


// catching signals from python
volatile sig_atomic_t stop = 0;

void handle_signal(int signal) {
    stop = 1;
}

// writeCallback for raw audio
static int paCallback(const void *inputBuffer, void *outputBuffer, unsigned long framesPerBuffer,
                      const PaStreamCallbackTimeInfo *timeInfo, PaStreamCallbackFlags statusFlags,
                      void *userData) {
    AudioData *data = (AudioData *)userData;
    if (inputBuffer != NULL) {
        fwrite(inputBuffer, sizeof(short), framesPerBuffer * NUM_CHANNELS, data->rawFile);
    }
    return paContinue;
}

// mp3 encoding on a seperate thread
void *mp3EncodingThread(void *arg) {
    AudioData *data = (AudioData *)arg;
    FILE *mp3File;
    short pcmBuffer[FRAMES_PER_BUFFER * NUM_CHANNELS];
    unsigned char mp3Buffer[FRAMES_PER_BUFFER * NUM_CHANNELS * 5 / 4 + 7200];
    size_t read;

    while (!data->finished) {

        // open mp3 & raw files
        FILE *rawFile = fopen(RAW_FILE_NAME, "rb");
        if (rawFile == NULL) {
            perror("Failed to open raw file");
            continue;
        }

        mp3File = fopen(MP3_FILE_NAME, "wb");
        if (mp3File == NULL) {
            perror("Failed to open MP3 file");
            fclose(rawFile);
            continue;
        }
        rewind(rawFile);

        // encode
        while ((read = fread(pcmBuffer, sizeof(short), FRAMES_PER_BUFFER * NUM_CHANNELS, rawFile)) > 0) {
            int write = lame_encode_buffer_interleaved(data->lame, pcmBuffer, read / NUM_CHANNELS, mp3Buffer, sizeof(mp3Buffer));
            fwrite(mp3Buffer, sizeof(unsigned char), write, mp3File);
        }

        fclose(rawFile);
        fclose(mp3File);

        // we update the mp3 10x a second
        usleep(100000);
    }

    return NULL;
}

int main() {
    PaError err;
    PaStream *stream;
    AudioData data;
    pthread_t encodingThread;

    // raw data file
    data.rawFile = fopen(RAW_FILE_NAME, "wb");
    if (data.rawFile == NULL) {
        perror("Failed to open raw file");
        return 1;
    }

    // LAME encoding settings (can change here)
    data.lame = lame_init();
    lame_set_num_channels(data.lame, NUM_CHANNELS);
    lame_set_in_samplerate(data.lame, SAMPLE_RATE);
    lame_set_brate(data.lame, 128);
    lame_set_mode(data.lame, JOINT_STEREO);
    lame_set_quality(data.lame, 3); 
    lame_init_params(data.lame);

    // PORTAUDIO
    err = Pa_Initialize();
    if (err != paNoError) {
        fprintf(stderr, "PortAudio error: %s\n", Pa_GetErrorText(err));
        return 1;
    }

    // portaudio stream for recording
    err = Pa_OpenDefaultStream(&stream,
                               NUM_CHANNELS,  // Input channels
                               0,             // Output channels (not needed)
                               paInt16,       // 16-bit PCM format
                               SAMPLE_RATE,
                               FRAMES_PER_BUFFER,
                               paCallback,
                               &data);
    if (err != paNoError) {
        fprintf(stderr, "PortAudio error: %s\n", Pa_GetErrorText(err));
        return 1;
    }

    err = Pa_StartStream(stream);
    if (err != paNoError) {
        fprintf(stderr, "PortAudio error: %s\n", Pa_GetErrorText(err));
        return 1;
    }

    // ---- MAIN RUN ----

    // encoding thread
    data.finished = 0;
    pthread_create(&encodingThread, NULL, mp3EncodingThread, &data);

    printf("[ CAPTURE.C ]: LIVE RECORDING\n");
    getchar(); // MANUAL TRIGGER (FOR TESTING)

    // // wait for stop signal. Check this 10x a second
    // while (!stop) {
    //     usleep(100000);
    // }

    // stop recording and encoding
    data.finished = 1;
    pthread_join(encodingThread, NULL);

    // cleanup
    fclose(data.rawFile);
    Pa_StopStream(stream);
    Pa_CloseStream(stream);
    Pa_Terminate();
    lame_close(data.lame);

    printf("[ CAPTURE.C ]: RECORDING STOPPED \n");
    return 0;
}