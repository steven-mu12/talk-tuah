import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ConvoBox = () => {
  return (
    <View style={styles.container}>
        <View style={styles.leftContainer}>
            <View style={styles.headingsContainer}>
                <Text style={styles.titleText}>ConvoBox</Text>
                <Text style={styles.subText}>Oct 19, 2024</Text>
                <Text style={styles.subText}>Professional</Text>
            </View>
            <Text style={styles.transcriptText}>View Transcript</Text>
        </View>
        <Text style={styles.timeText}>11mins</Text>

    </View>
  )
}

export default ConvoBox

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "98%",
        height: 144,
        shadowColor: "#66d666",
        shadowOpacity: 1,
        shadowRadius: 0,
        shadowOffset: {width: 6, height: 6},
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16
    },
    titleText: {
        fontSize: 24,
        fontWeight: "800"
    },
    subText: {
        fontSize: 16,
        fontWeight: "500"
    },
    transcriptText: {
        fontSize: 16,
        fontWeight: "500",
        textDecorationLine: 'underline'
    },
    timeText: {
        fontSize: 16,
        fontWeight: "500"
    },
    leftContainer: {
        height: "100%",
        flexDirection: "column",
        justifyContent: "space-between"
    },
    headingsContainer: {
        gap: 2
    }


})