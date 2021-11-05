import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from "react-native";

interface JoinRoomButtonProps {
  onClickOnJoinRoom: Function;
}

interface JoinRoomButtonState {
  code: string;
}

export default class JoinRoomButton extends Component<
  JoinRoomButtonProps,
  JoinRoomButtonState
> {
  constructor(props: JoinRoomButtonProps) {
    super(props);
    this.state = {
      code: "",
    };
  }

  render() {
    return (
      <View style={styles.button}>
        <View style={styles.buttonContainer}></View>
        <TextInput
          style={styles.textInput}
          onChangeText={(text: string) => {
            text = text.toUpperCase();
            if (text.length > 6) {
              text = text.substring(0, 6);
            }
            this.setState({ code: text });
          }}
          placeholder="XXXXXX"
          value={this.state.code}
        ></TextInput>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => {
            if (this.state.code) {
              this.props.onClickOnJoinRoom(this.state.code);
            }
          }}
        >
          <Text style={styles.buttonText}>Rejoindre</Text>
        </TouchableOpacity>
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
  textInput: {
    backgroundColor: "white",
    borderRadius: 15,
    width: 170,
    height: 40,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 2,
  },
  buttonContainer: {
    flex: 1,
  },
  joinButton: {
    flex: 1,
  },
});
