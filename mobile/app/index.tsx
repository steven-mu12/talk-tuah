import { StyleSheet, Text, View, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState, useEffect } from 'react'
import BottomButton from '@/components/BottomButton';

const ProfileDetails = () => {
    const [name, setName] = useState("");
    const [topics, setTopics] = useState("");

    return (
        <TouchableWithoutFeedback style={styles.container} onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container} >
                <View style={styles.topContainer}>
                <Text style={styles.titleText}>Profile Details</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.subtitleText}>Full Name</Text>
                    <TextInput
                        style={styles.nameInput}
                        placeholder="Enter your name"
                        placeholderTextColor="#000"
                        onChangeText={setName}
                        value={name}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.subtitleText}>Convo Topics</Text>
                    <TextInput
                        editable
                        multiline
                        numberOfLines={3}
                        style={styles.topicInput}
                        placeholder="Enter your name"
                        placeholderTextColor="#000"
                        autoCapitalize="none"
                        onChangeText={setTopics}
                        value={topics}
                    />
                </View>
                </View>
                <BottomButton text={"Confirm Details!"} nav={"/voiceRecord"}/>
            </View>
        </TouchableWithoutFeedback>
    )
}

export default ProfileDetails

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
    }
  });
  
