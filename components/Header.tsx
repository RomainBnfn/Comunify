import React, { Component } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";

interface HeaderProps {
  roomId: string;
  onClickOnLeaveRoom: Function;
}

export default class Header extends Component<HeaderProps> {
  private getRoomItem() {
    if (this.props.roomId) {
      return (
        <View style={styles.greenContainer}>
          <Text style={styles.roboto}>N° {this.props.roomId}</Text>
        </View>
      );
    } else {
      return <View></View>;
    }
  }

  private getLeaveRoomButton() {
    if (this.props.roomId) {
      return (
        <TouchableOpacity
          onPress={() => {
            this.props.onClickOnLeaveRoom();
          }}
        >
          <View style={styles.greenContainer}>
            <Text style={[styles.roboto]}>Quitter la salle</Text>
          </View>
        </TouchableOpacity>
      );
    } else {
      return <View></View>;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        {this.getRoomItem()}
        <Image
          style={styles.img}
          source={require("../assets/ComunifyLogo.png")}
        />
        {this.getLeaveRoomButton()}
      </View>
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
  roboto: {
    fontWeight: "600",
    color: "black",
  },
  greenContainer: {
    backgroundColor: "#1ED760",
    padding: 10,
    borderRadius: 20,
  },
});
