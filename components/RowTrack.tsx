import React, { Component } from "react";
import { StyleSheet, Text, Image, View, TouchableOpacity } from "react-native";
import Track from "../models/track.model";

interface RowTrackProps {
  track: Track;
  idSelected: string;
  uriPlaying: string;
  isPlaying: boolean;
  playPauseSound: (uri: string) => void;
  onClickTrack: (id: string) => void;
}

export default class RowTrack extends Component<RowTrackProps, {}> {
  getImageBtn = () => {
    if (
      this.props.uriPlaying === this.props.track.previewUri &&
      this.props.isPlaying
    )
      return require("../assets/pause.png");
    else return require("../assets/play.png");
  };

  render() {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          this.props.idSelected === this.props.track.id
            ? styles.bckSelected
            : styles.bckUnselected,
        ]}
        onPress={() => this.props.onClickTrack(this.props.track.id)}
      >
        <Image style={styles.images} source={{ uri: this.props.track.image }} />
        <View style={styles.textContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
            {this.props.track.title}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.desc}>
            {this.props.track.artist}
          </Text>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.desc}>
            {this.props.track.album}
          </Text>
        </View>
        {this.props.track.previewUri !== null && (
          <TouchableOpacity
            style={styles.playPauseBtn}
            onPress={() =>
              this.props.playPauseSound(this.props.track.previewUri)
            }
          >
            <Image style={styles.playPauseImg} source={this.getImageBtn()} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    marginVertical: 4,
    borderRadius: 35,
  },
  bckSelected: {
    backgroundColor: "#005B1F",
  },
  bckUnselected: {
    backgroundColor: "black",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 8,
    marginBottom: 4,
    alignSelf: "center",
    flex: 1,
    color: "white",
  },
  images: {
    height: 78,
    width: 78,
  },
  title: {
    fontWeight: "400",
    color: "white",
    fontSize: 19,
  },
  desc: {
    fontSize: 14,
    color: "white",
  },

  playPauseImg: {
    height: 35,
    width: 35,
    margin: 5,
  },
  playPauseBtn: {
    justifyContent: "center",
  },
});
