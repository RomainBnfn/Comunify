import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { RootStackParamList } from "./app-stacks";

import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";

import MusicScreen from "../screens/MusicScreen";
import RoomOptionScreen from "../screens/RoomOption";
import { View, Text } from "react-native";

interface StackNavigatorProps {
  roomId: string;
  onClickOnCreateNewRoom: Function;
  onClickOnJoinRoom: Function;
  onClickOnLeaveRoom: Function;
  onClickOnAddMusic: Function;
}

// Define main tab navigator
const Stack = createStackNavigator<RootStackParamList>();

export default class StackNavigator extends Component<StackNavigatorProps> {
  private checkNavigation = (navigation: any, actualPage: string) => {
    if (
      this.props.roomId &&
      actualPage != "Music" &&
      actualPage != "RoomOption"
    ) {
      navigation.navigate("Music");
      return;
    } else if (!this.props.roomId && actualPage != "Home") {
      navigation.navigate("Home");
    }
  };

  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={"Home"}
          screenOptions={{ headerShown: false }}
        >
          {/* Home */}
          <Stack.Screen name="Home">
            {(props: any) => (
              <HomeScreen
                {...props}
                checkNavigation={this.checkNavigation}
                onClickOnCreateNewRoom={this.props.onClickOnCreateNewRoom}
                onClickOnJoinRoom={this.props.onClickOnJoinRoom}
                onClickOnLeaveRoom={this.props.onClickOnLeaveRoom}
              />
            )}
          </Stack.Screen>

          {/* Music */}
          <Stack.Screen name="Music">
            {(props: any) => (
              <MusicScreen
                {...props}
                roomId={this.props.roomId}
                checkNavigation={this.checkNavigation}
                onClickOnLeaveRoom={this.props.onClickOnLeaveRoom}
                onClickOnAddMusic={this.props.onClickOnAddMusic}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="RoomOption" component={RoomOptionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
