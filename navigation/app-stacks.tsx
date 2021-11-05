import React from "react";
import { StackNavigationProp } from "@react-navigation/stack";

// Define view names and associated params
// undefined = no params passed to view
export type RootStackParamList = {
  Home: undefined;
  Music: undefined;
  RoomOption: undefined;
};

//#region PROPS

export interface HomeScreenProps {
  navigation: StackNavigationProp<RootStackParamList, "Home">;
  checkNavigation: Function;

  onClickOnCreateNewRoom: Function;
  onClickOnJoinRoom: Function;
  onClickOnLeaveRoom: Function;
}

export interface MusicScreenProps {
  navigation: StackNavigationProp<RootStackParamList, "Music">;
  checkNavigation: Function;

  roomId: string;
  onClickOnLeaveRoom: Function;
  onClickOnAddMusic: Function;
}

export interface RoomOptionScreenProps {
  navigation: StackNavigationProp<RootStackParamList, "RoomOption">;
}

//#endregion
