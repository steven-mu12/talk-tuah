import { StyleSheet, Text, TouchableOpacity, View, Animated, Image } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import BottomButton from '@/components/BottomButton';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from 'expo-router';

const settings = () => {
    const router = useRouter();

    const goToRoot = (): void => {
        router.dismissAll()
    };
  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
      <View style={styles.header}>
            <Text style={styles.titleText}>Sign Out</Text>
            <Image
                source={require('../assets/images/memoji.png')} // Correct path to the image
                style={styles.image} // Style to control the size of the image
            />
        </View>
      </View>
      <View style={styles.botContainer}>
        <BottomButton text={'Sign Out'} nav={'/inputs'}/>
      </View>
    </View>
  );
};

export default settings;

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "97%"
},
    image:{
        width: 48,
        height: 48
    }
});
