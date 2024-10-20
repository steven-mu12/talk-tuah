import { StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import BottomButton from '@/components/BottomButton';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const voiceRecord = () => {
  const [recording, setRecording] = useState({});
  const [isRecording, setisRecording] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const [uri, setUri] = useState("");
  const [playing, setPlaying] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const startBreathing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (isRecording || playing) {
      startBreathing();
    } else {
      Animated.timing(scaleValue).stop(); // Stop the animation when not recording/playing
    }
  }, [isRecording, playing]);

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setisRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    setisRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const newUri = recording.getURI();
    setUri(newUri);
    console.log('Recording stopped and stored at', newUri);
  }

  const recordButtonPressed = () => {
    if (firstRender) {
      startRecording();
      setTimeout(() => {
        setFirstRender(false);
      }, 1000);
    } else {
      if (!isRecording) {
        setPlaying(false);
        startRecording();
      } else {
        stopRecording();
      }
    }
  };

  async function playSound() {
    console.log('Loading Sound');
    setPlaying(true);

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: uri });
      setSound(sound);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setPlaying(false); // Stop playing when the sound finishes
        }
      });

      console.log('Playing Sound');
      await sound.playAsync();
    } catch (error) {
      console.error('Error loading or playing sound:', error);
      setPlaying(false); // Stop the animation in case of an error
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.titleText}>Upload Your Voice</Text>
        <View style={styles.textContainer}>
          <Text style={styles.subtitleText}>Record Yourself Saying This Phrase</Text>
          <Text style={styles.samplePhrase}>
            "The quick brown fox jumps over the lazy dog. Please call me back tomorrow at noon."
          </Text>
        </View>
      </View>
      <View style={styles.micContainer}>
        <View style={styles.micCircle}>
          {isRecording ? (
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <FontAwesome name="microphone" size={80} color="#202020" />
            </Animated.View>
          ) : firstRender ? (
            <FontAwesome name="microphone" size={80} color="#202020" />
          ) : !playing ? (
            <TouchableOpacity onPress={playSound} style={styles.playIcon}>
              <FontAwesome5 name="play" size={88} color="#202020" />
            </TouchableOpacity>
          ) : (
            <Animated.View style={[{ transform: [{ scale: scaleValue }] }, styles.playIcon]}>
              <FontAwesome5 name="play" size={88} color="#202020" />
            </Animated.View>
          )}
        </View>
      </View>
      <View style={styles.botContainer}>
        <TouchableOpacity style={styles.recordBtn} onPress={recordButtonPressed}>
          <Text style={styles.recordText}>
            {firstRender
              ? 'Start Recording'
              : isRecording
              ? 'Finish Recording'
              : 'Redo Recording'}
          </Text>
        </TouchableOpacity>
        {!isRecording && !firstRender &&
          <>
            <BottomButton text={'Confirm Recording!'} nav={'/home'} passing={{uri: uri}}/>
          </>
        }
      </View>
    </View>
  );
};

export default voiceRecord;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#202020',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  titleText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitleText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  samplePhrase: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    fontStyle: 'italic',
  },
  textContainer: {
    gap: 10,
  },
  micContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  micCircle: {
    backgroundColor: '#fff',
    width: 240,
    height: 240,
    borderRadius: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botContainer: {
    width: '100%',
    gap: 24,
  },
  recordBtn: {
    backgroundColor: '#66d666',
    width: '100%',
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  recordText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  playIcon: {
    marginLeft: 12,
  },
  topContainer: {
    flexDirection: "column",
    gap: 20
  }
});
