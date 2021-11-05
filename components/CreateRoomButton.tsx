import React, { Component } from "react";
import { StyleSheet, Text, Image, TouchableOpacity } from "react-native";

interface CreateRoomButtonProps {
  onClickOnCreateNewRoom: Function;
}

export default class CreateRoomButton extends Component<CreateRoomButtonProps> {
  render() {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          this.props.onClickOnCreateNewRoom();
        }}
      >
        <Image style={styles.img} source={require("../assets/Spotify.png")} />

        <Text style={styles.buttonText}>Créer une salle</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#151515",
    height: 80,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  img: {
    width: 45,
    height: 45,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#1ED760",

    width: 250,
    minHeight: 140,
    borderRadius: 25,
    padding: 10,
  },
  buttonText: {
    color: "black",
    fontSize: 32,
    fontWeight: "600",
  },
  greenContainer: {
    backgroundColor: "#1ED760",
    padding: 10,
    borderRadius: 20,
  },
});
