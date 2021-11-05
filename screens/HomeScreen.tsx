import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import CreateRoomButton from "../components/CreateRoomButton";
import Header from "../components/Header";
import JoinRoomButton from "../components/JoinRoomButton";
import { HomeScreenProps } from "../navigation/app-stacks";

export default class HomeScreen extends Component<HomeScreenProps> {
  componentDidMount() {
    this.props.checkNavigation(this.props.navigation, "Home");
  }

  componentDidUpdate() {
    this.props.checkNavigation(this.props.navigation, "Home");
  }

  _onClickOnCreateNewRoom = () => {
    this.props.onClickOnCreateNewRoom(this.props.navigation);
  };
  render() {
    return (
      <View style={styles.container}>
        <Header
          roomId=""
          onClickOnLeaveRoom={this.props.onClickOnLeaveRoom}
        ></Header>

        <View style={styles.page}>
          <CreateRoomButton
            onClickOnCreateNewRoom={this._onClickOnCreateNewRoom}
          />

          <JoinRoomButton onClickOnJoinRoom={this.props.onClickOnJoinRoom} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  img: {
    height: 60,
    width: 60,
  },
});
