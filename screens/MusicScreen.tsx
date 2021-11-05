import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../components/Header";
import SearchMusic from "../components/SearchMusic";
import { MusicScreenProps } from "../navigation/app-stacks";

export default class MusicScreen extends Component<MusicScreenProps> {
  componentDidMount() {
    this.props.checkNavigation(this.props.navigation, "Music");
  }
  componentDidUpdate() {
    this.props.checkNavigation(this.props.navigation, "Music");
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          roomId={this.props.roomId}
          onClickOnLeaveRoom={this.props.onClickOnLeaveRoom}
        ></Header>
        <View style={styles.page}>
          <Text style={styles.title}>Rechercher une musique</Text>

          <SearchMusic
            onClickOnAddMusic={this.props.onClickOnAddMusic}
          ></SearchMusic>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  page: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    paddingBottom: 5,
  },
});
