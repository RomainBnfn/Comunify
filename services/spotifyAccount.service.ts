import { encode as btoa } from "base-64";
import Track from "../models/track.model";
import User from "../models/user.model";
import Token from "../models/token.model";
import { Linking } from "react-native";

export class SpotifyAccountService {
  // permission demandé sur le compte de l'utilisateur
  // toutes ne nous sont pas utiles
  private scopesArr = [
    "user-modify-playback-state",
    "user-read-playback-state",
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-top-read",
    "user-library-modify",
    "user-library-read",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
  ];
  private scopes = "";

  // identifiant de cette aplication par Spotify
  private clientId = "XXXXXXXXXXXXXXX";
  private clientSecret = "XXXXXXXXXXXXXXX";

  // url d'écoute du server
  private redirectUri = "http://beta.projectheberg.fr:20268/callback";

  private tokens: Token = {
    token: "",
    refreshToken: "", // token permettant de récupérer un nouveau token lorqu'il est expiré
    tokenExpiration: 0,
  };

  constructor() {
    this.scopes = this.scopesArr.join(" ");
  }

  // Lance la demande d'authentification de l'utilisateur
  // Ouvre un navigateur web
  public async connection(socketId: string) {
    try {
      const url =
        "https://accounts.spotify.com/authorize" +
        "?response_type=code" +
        "&client_id=" +
        this.clientId +
        (this.scopes ? "&scope=" + encodeURIComponent(this.scopes) : "") +
        "&state=" +
        socketId +
        "&redirect_uri=" +
        encodeURIComponent(this.redirectUri);
      Linking.openURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  // Stock les tokens reçu puis transmis par le serveur
  // après authentification de l'utilisateur
  public async tokenReceived(tokens: Token) {
    this.tokens = tokens;
    return await this.getUserInfos();
  }

  // récupére un nouveau token quand le principal est expiré
  public async getNewToken(
    refreshToken: string
  ): Promise<void | { token: any; tokenExpiration: number }> {
    const auth = btoa(`${this.clientId}:${this.clientSecret}`);

    return fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
    })
      .then((res) => res.json())
      .then((json) => {
        const tokens = {
          token: json.access_token,
          tokenExpiration: new Date().getTime() + json.expires_in * 1000,
        };
        return tokens;
      })
      .catch((err) => console.log(err));
  }

  // lance un requete get à l'url spécifié et transmet le résultat
  private async getRequest(url: string): Promise<any> {
    return fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.tokens.token}`,
      },
    })
      .then((res) => {
        if (res.status === 200) return res.json();
      })
      .then((json) => {
        return json;
      })
      .catch((err) => console.log(err));
  }

  // requete l'api pour obtenir le nom, l'id et la photo de profil de
  // l'utilisateur connecté
  async getUserInfos(): Promise<User | void> {
    return this.getRequest("https://api.spotify.com/v1/me")
      .then((userJson) => {
        let image = "";
        if (userJson.images[0]) {
          image = userJson.images[0].url;
        }
        return {
          name: userJson.display_name,
          id: userJson.id,
          image: image,
        };
      })
      .catch((err) => console.log(err));
  }

  // requete l'api pour obtenir le morceau au cours de lecture
  async getUserPlayback(): Promise<Track | void> {
    return this.getRequest("https://api.spotify.com/v1/me/player").then(
      (player) => {
        if (player)
          return {
            title: player.item.name,
            id: player.item.id,
            artist: player.item.artists[0].name,
            album: player.item.album.name,
            image: player.item.album.images[2].url,
            popularity: player.item.popularity,
            previewUri: player.item.preview_url,
          };
      }
    );
  }

  // requete l'api pour ajouter un morceau à la file d'attente
  async addTracksToQueue(musicId: string): Promise<Boolean> {
    fetch(
      `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(
        `https://open.spotify.com/track/${musicId}`
      )}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.tokens.token}`,
        },
      }
    )
      .then((res) => {
        return res.status === 204;
      })
      .catch((err) => console.log(err));
    return true;
  }
}
