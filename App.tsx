import React, { Component } from "react";
import { StyleSheet } from "react-native";
import User from "./models/user.model";
import { ComunifyService } from "./services/comunify.service";
import { SpotifyAccountService } from "./services/spotifyAccount.service";
import StackNavigator from "./navigation/stack-navigation";

interface AppStates {
  roomId: string;
  isOwner: boolean;
  spotifyUser: User;
}

export default class App extends Component<{}, AppStates> {
  private _comunifyService: ComunifyService;
  private _spotifyAccountService: SpotifyAccountService;

  constructor(props: {}) {
    super(props);
    this._comunifyService = new ComunifyService(
      this.onRoomCreated,
      this.onRoomDoesNotExist,
      this.onRoomJoined,
      this.onRoomLeave,
      this.onMusicAdded,
      this.onSpotifyConnexionReceived
    );
    this._spotifyAccountService = new SpotifyAccountService();

    this.state = {
      roomId: "",
      isOwner: false,
      spotifyUser: { id: 0, image: "", name: "" },
    };
  }

  //#region App-Event
  private onClickOnCreateNewRoom = async (navigation: any) => {
    //IF SPOTIFY
    if (this.state.spotifyUser.id && true) {
      //AND TOCKEN ENCORE VALABLE
      this._comunifyService.createNewRoom();
    } else {
      // Need to conect to spotify
      await this._spotifyAccountService.connection(
        this._comunifyService.getSocketId()
      );
      // .then((user) => {
      //   if (user) {
      //     this.setState({ spotifyUser: user });
      //     this._comunifyService.createNewRoom();
      //   } else {
      //     alert("Erreur de connexion...");
      //   }
      // });
    }
  };

  private onClickOnJoinRoom = (roomId: string) => {
    this._comunifyService.joinRoom(roomId);
  };

  private onClickOnLeaveRoom = () => {
    this._comunifyService.leaveRoom();
  };

  private onClickOnAddMusic = (musicId: string) => {
    this._comunifyService.addMusic(musicId);
  };
  //#endregion

  //#region On event happend
  private onRoomCreated = (roomId: string) => {
    this.setState({
      roomId: roomId,
      isOwner: true,
    });
  };

  private onRoomJoined = (roomId: string) => {
    this.setState({
      roomId: roomId,
      isOwner: false,
    });
  };

  private onRoomLeave = () => {
    this.setState({
      roomId: "",
    });
  };

  private onRoomDoesNotExist = () => {
    alert("La salle n'existe pas, avez vous saisi le bon code ?");
  };

  private onMusicAdded = (musicId: string, isOwner: boolean) => {
    if (isOwner) {
      this._spotifyAccountService.addTracksToQueue(musicId).then((res) => {
        if (res) {
        } else {
          alert("Erreur dans l'ajout d'une musique...");
        }
      });
    }
  };

  private onSpotifyConnexionReceived = (tokens: any) => {
    this._spotifyAccountService
      .tokenReceived(tokens)
      .then((user: User | void) => {
        if (user) {
          this.setState({ spotifyUser: user });
          this._comunifyService.createNewRoom();
        } else {
          alert("Erreur de connexion...");
        }
      });
  };
  //#endregion

  render() {
    return (
      <StackNavigator
        roomId={this.state.roomId}
        onClickOnCreateNewRoom={this.onClickOnCreateNewRoom}
        onClickOnJoinRoom={this.onClickOnJoinRoom}
        onClickOnLeaveRoom={this.onClickOnLeaveRoom}
        onClickOnAddMusic={this.onClickOnAddMusic}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
