import { StyleSheet, Text, View, ScrollView, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import BottomButton from '@/components/BottomButton';
import ConvoBox from '@/components/ConvoBox';
import { useLocalSearchParams } from 'expo-router';
import { Link } from 'expo-router';

const home = () => {
    const [uploadStatus, setUploadStatus] = useState('');
    const { uri } = useLocalSearchParams();
    useEffect(() => {
        const uploadAudioFile = async () => {
            const formData = new FormData();
            formData.append('file', {
              uri: uri, 
              name: 'audio.m4a', 
              type: 'audio/m4a', 
            });
          
            try {
              const response = await fetch('https://9e44-199-115-241-221.ngrok-free.app/uploadaudio', {
                method: 'POST',
                body: formData,
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });
          
              const responseText = await response.text();  // Get raw response
              console.log('Response Text:', responseText);  // Log the raw response
              
              try {
                const data = JSON.parse(responseText);  // Attempt to parse it as JSON
                if (response.ok) {
                  setUploadStatus(data.message);
                } else {
                  setUploadStatus('Upload failed: ' + data.error);
                }
              } catch (parseError) {
                console.error('Error parsing response:', parseError);
                setUploadStatus('Error: Unable to parse server response');
              }
          
            } catch (error) {
              console.error('Error uploading file:', error);
              setUploadStatus('Error uploading file');
            }
          };
        
          uploadAudioFile();
    }, [])
    return (
        <View style={styles.container} >
            <View style={styles.topContainer}>
                <View style={styles.header}>
                    <Text style={styles.titleText}>Your Convos</Text>
                    <Link href="/settings">
                        <Image
                            source={require('../assets/images/memoji.png')} // Correct path to the image
                            style={styles.image} // Style to control the size of the image
                        />
                    </Link>
                </View>
            </View>
            <ScrollView style={styles.convosContainer}>
                <View style={styles.convosContainer}>
                    <ConvoBox />
                    <ConvoBox />
                    <ConvoBox />
                    <ConvoBox />
                    <ConvoBox />
                    <ConvoBox />
                    <ConvoBox />
                </View>
            </ScrollView>
            <BottomButton text={"New Convo +"} nav={"/emotions"} passing={{}}/>
        </View>
    )
}

export default home

const styles = StyleSheet.create({
    container: {
      backgroundColor: "#202020",
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingTop: 80, 
      paddingHorizontal: 24,
      gap: 20,
      paddingBottom: 40
    },
    titleText: {
      color: '#fff',
      fontSize: 32,
      fontWeight: "800"
    },
    nameInput: {
        backgroundColor: "#fff",
        shadowColor: "#66d666",
        width: "100%",
        height: 56,
        borderRadius: 10,
        padding: 16,
        shadowOpacity: 1,
        shadowOffset: {width: 4, height: 4},
        shadowRadius: 0,
        fontSize: 16
    },
    topicInput: {
        backgroundColor: "#fff",
        shadowColor: "#66d666",
        width: "100%",
        height: 160,
        borderRadius: 10,
        padding: 16,
        shadowOpacity: 1,
        shadowOffset: {width: 4, height: 4},
        shadowRadius: 0,
        fontSize: 16
    },
    inputContainer: {
        width: "100%",
        gap: 10
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
    convosContainer: {
        flexDirection: "column",
        gap: 24,
        paddingBottom: 20
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