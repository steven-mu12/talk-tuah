import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import BottomButton from '@/components/BottomButton';

const Emotions = () => {
    const [selected, setSelected] = useState('Neutral 🙂');
    
    const emotions = ['Neutral 🙂', 'Extra Friendly 😆', 'Professional 💼', 'Flirty 😘'];

    const sendEmotionToServer = async () => {
        if (selected) {
            try {
                const response = await fetch('http://9e44-199-115-241-221.ngrok-free.app/uploademotion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ emotion: selected }), // Sending the selected emotion
                });

                const result = await response.json();
                if (response.ok) {
                    console.log('Success:', result.message);
                } else {
                    console.log('Error:', result.error);
                }
            } catch (error) {
                console.error('Error sending emotion:', error);
            }
        } else {
            console.log('No emotion selected.');
        }
    };

    useEffect(() => {
        sendEmotionToServer();
    }, [selected])

    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <Text style={styles.titleText}>Choose Your Emotion</Text>
                <View style={styles.inputContainer}>
                    {/* Map through emotions and display each */}
                    {emotions.map((emotion, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelected(emotion)}
                            style={[
                                styles.emotionButton,
                                selected === emotion ? styles.selectedEmotion : null, // Apply selected style if emotion is selected
                            ]}
                        >
                            <Text style={styles.emotionText}>{emotion}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Sending selected emotion to the Flask server when the button is pressed */}
            <BottomButton text={"Confirm Selection!"} nav={"/listening"}/>
        </View>
    );
};

export default Emotions;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#202020",
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 80, 
        paddingHorizontal: 32,
        gap: 20,
        paddingBottom: 40
      },
      titleText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: "800"
      },
      inputContainer:{
        width: "100%",
        gap: 16
      },
      emotionButton: {
          width: "100%",
          height: 52,
          backgroundColor: "#fff",
          borderRadius: 10,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20
      },
      selectedEmotion: {
        width: "100%",
        height: 52,
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#66d666",
        shadowOpacity: 1,
        shadowRadius: 0,
        shadowOffset: {width: 4, height: 6},
    },
      subtitleText: {
          color: '#fff',
          fontSize: 24,
          fontWeight: "800"
      },
      topContainer: {
          width: "100%",
          gap: 24
      },
      emotionText:{
        fontSize: 16,
        fontWeight: '600'
      }
    
})      
