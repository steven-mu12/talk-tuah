import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { Link } from 'expo-router';

type Props = {
  text: string;
  nav: string;
  passing: Object;
};


export default function BottomButton({ text, nav, passing }: Props) {
  return (
    <View style={styles.container}>
      <Link href={nav} style={styles.link} params={{passing}}>
        <Text style={styles.text}>{text}</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#66d666",
    width: "100%",
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  link: {
    width: "100%", // Ensures the link takes up the entire container
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center", // Centers the text horizontally
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000", // Ensures that the text is visible
  }
});
