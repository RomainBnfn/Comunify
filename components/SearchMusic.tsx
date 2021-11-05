import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import SpotifyTracksService from "../services/spotifyTracks.service";
import ListTrack from "./ListTracks";
import Track from "../models/track.model";

interface SearchMusicState {
  searchTrack: string;
  tracks: Array<Track>;
  selectedTrackId: string;
  timeout: NodeJS.Timeout;
  batch: number;
}

interface SearchMusicProps {
  onClickOnAddMusic: Function;
}

export default class SearchMusic extends Component<
  SearchMusicProps,
  SearchMusicState
> {
  constructor(props: SearchMusicProps) {
    super(props);
    this.state = {
      searchTrack: "", // chaine de caratère de recherche
      tracks: [], // résultat de recherche
      selectedTrackId: "", // morceau selectionné
      timeout: setTimeout(() => {}), // timer avant de faire une nouvelle requete
      batch: 0, // nombre de batch de musique récupéré
    };
  }

  onChangeTimeout = (timeout: NodeJS.Timeout) => {
    this.setState({ timeout });
  };

  onChangeBatch = (batch: number) => {
    this.setState({ batch: batch });
  };

  // l'utilisateur fait une recherche
  onChangeSearchTrack = (searchTrack: string) => {
    this.setState({ searchTrack });
    this.onChangeBatch(0);

    //on ne fait des recherche qu'à partir de 2 caractères
    if (searchTrack.length >= 2) {
      //tempo de 200 ms pour limiter un minimum le nombre de requête
      clearTimeout(this.state.timeout);
      this.onChangeTimeout(
        setTimeout(() => {
          SpotifyTracksService.searchTrack(this.state.searchTrack, 0).then(
            (tracks) => {
              this.onChangeTracks(tracks);
            }
          );
        }, 200)
      );
    } else if (searchTrack.length === 0) {
      this.onChangeTracks([]);
    }
  };

  onChangeTracks = (tracks: Array<Track>) => {
    // suppression d'eventuels doublons
    let tracksU = Array.from(new Set(tracks.map((t) => t.id)))
      .map((id) => {
        return tracks.find((t) => t.id === id);
      })
      .filter((t): t is Track => {
        // et suppression des undefined (pour que Typescript soit content)
        return !!t;
      });

    this.setState({ tracks: tracksU });
  };

  onSelectTrack = (selectedTrackId: string) => {
    if (this.state.selectedTrackId !== selectedTrackId)
      this.setState({ selectedTrackId });
    else this.setState({ selectedTrackId: "" });
  };

  // requete de nouveau résultat de recherche
  // si on arrive en bas de la flatlist
  loadNewTrack = () => {
    SpotifyTracksService.searchTrack(
      this.state.searchTrack,
      this.state.batch + 1
    ).then((tracks) => {
      this.onChangeTracks(this.state.tracks.concat(tracks));
    });
    this.onChangeBatch(this.state.batch + 1);
  };

  // Pour ajouter le morceau la file d'attente du compte
  // propriétaire de la salle
  onClickOnAddMusic = () => {
    this.props.onClickOnAddMusic(this.state.selectedTrackId);
  };

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          onChangeText={this.onChangeSearchTrack}
          placeholder="Recherche d'un titre"
        />
        <ListTrack
          tracks={this.state.tracks}
          selectedTrackId={this.state.selectedTrackId}
          onSelectTrack={this.onSelectTrack}
          onEndReached={() => this.loadNewTrack()}
        />
        <TouchableOpacity
          disabled={this.state.selectedTrackId === ""}
          style={[
            styles.btnAdd,
            this.state.selectedTrackId !== ""
              ? styles.btnAddEnable
              : styles.btnAddDisable,
          ]}
          onPress={this.onClickOnAddMusic}
        >
          <Text style={styles.btnAddText}>Ajouter</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  txtHead: {
    paddingVertical: 5,
  },
  btnAdd: {
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  btnAddEnable: {
    backgroundColor: "#1FD760",
  },
  btnAddDisable: {
    backgroundColor: "#dddddd",
  },
  btnAddText: {
    textAlign: "center",
    color: "black",
    fontWeight: "bold",
    fontSize: 22,
  },
  textInput: {
    fontSize: 17,
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: "#E8E8E8",
  },
});
