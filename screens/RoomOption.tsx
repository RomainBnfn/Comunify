import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import { RoomOptionScreenProps } from "../navigation/app-stacks";

export default class RoomOptionScreen extends Component<RoomOptionScreenProps> {
  render() {
    return (
      <View style={styles.container}>
        <Text>RoomOptionScreen Component</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
