import { StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import BottomButton from '@/components/BottomButton';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const voiceRecord = () => {

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

    startBreathing();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.titleText}>Recording Conversation</Text>
      </View>
      <View style={styles.micContainer}>
        <View style={styles.micCircle}>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <FontAwesome name="microphone" size={80} color="#202020" />
            </Animated.View>
        </View>
      </View>
      <View style={styles.botContainer}>
        <BottomButton text={'End Conversation'} nav={'/home'}/>
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
