import React, { Component } from "react";
import { FlatList } from "react-native";
import Track from "../models/track.model";
import RowTrack from "./RowTrack";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";

interface ListTracksProps {
  tracks: Array<Track>;
  selectedTrackId: string;
  onSelectTrack: (selectedTrackId: string) => void;
  onEndReached: () => void; // event d'atteinte de fin de flatlist
}

interface ListTrackState {
  uriPlaying: string;
  isPlaying: boolean;
  sound: Sound;
}

export default class ListTracks extends Component<
  ListTracksProps,
  ListTrackState
> {
  constructor(props: ListTracksProps) {
    super(props);
    this.state = {
      uriPlaying: "", // uri vers l'aperçu en cours de lecture
      isPlaying: false, // uri en cours de lecture ?
      sound: new Sound(), // lecteur de l'uri
    };
  }

  onChangeIsPlayingSound = (status: boolean) => {
    this.setState({ isPlaying: status });
  };

  playPauseSound = async (uriPlaying: string) => {
    if (uriPlaying === this.state.uriPlaying) {
      //piste déjà dans le player
      this.state.sound.getStatusAsync().then((avd) => {
        if (avd.isLoaded) {
          if (avd.isPlaying) {
            this.state.sound.pauseAsync();
            this.onChangeIsPlayingSound(false);
          } else {
            this.state.sound.playAsync();
            this.onChangeIsPlayingSound(true);
          }
        } else {
          console.log("not load");
        }
      });
    } else {
      //piste du player différent ou vide
      if (this.state.uriPlaying === "") {
        // vide
        const { sound } = await Audio.Sound.createAsync(
          {
            uri: uriPlaying,
          },
          { shouldPlay: true },
          undefined
        );
        this.setState({ sound });
      } else {
        // differente
        this.state.sound.unloadAsync();
        this.state.sound.loadAsync(
          {
            uri: uriPlaying,
          },
          { shouldPlay: true },
          undefined
        );
      }
      this.onChangeIsPlayingSound(true);
      this.setState({ uriPlaying });
    }
  };

  // trie des musiques par pertinence
  // popularité est un nombre entre 0 et 100 attribué par un
  // algorithme de Spotify à chaque morceau
  compareTracks = (a: Track, b: Track) => {
    if (a.popularity > b.popularity) return -1;
    else return 1;
  };

  render() {
    return (
      <FlatList
        data={this.props.tracks.sort(this.compareTracks)}
        renderItem={({ item }) => (
          <RowTrack
            track={item}
            onClickTrack={this.props.onSelectTrack}
            idSelected={this.props.selectedTrackId}
            playPauseSound={this.playPauseSound}
            uriPlaying={this.state.uriPlaying}
            isPlaying={this.state.isPlaying}
          />
        )}
        keyExtractor={(item) => "" + item.id}
        extraData={this.props.selectedTrackId}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          this.props.onEndReached();
        }}
      />
    );
  }
}
