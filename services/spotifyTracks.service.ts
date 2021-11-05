import { encode as btoa } from "base-64";
import Track from "../models/track.model";

class SpotifyTracksService {
  private token = "";
  private tokenExpiration = 0;

  // identifiant de notre application chez Spotify
  private clientId = "9964dec0f948404eb6b0285252a65f1d";
  private clientSecret = "a0c98b0ef7f84369a72495e627e5fb50";

  // récupération du token à partire des identifiants d'application
  private async getToken(): Promise<boolean | void> {
    const auth = btoa(`${this.clientId}:${this.clientSecret}`);
    return fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          return false;
        } else {
          this.token = json.access_token;
          this.tokenExpiration = new Date().getTime() + json.expires_in * 1000;
          return true;
        }
      })
      .catch((err) => console.log(err));
  }

  // Requete l'api pour recherhe de musique par mot clé: track
  // L'offset permet de récupérer les résultats à partir du nième élément non compris (n=batch*offset)
  // Permet de limiter le nombre de requête, on charge les titres que si l'utilisateur les demande
  private async search(track: string, offset: number): Promise<Object> {
    const batchSize = 10; // nombre d'élément récupérer par requete
    return fetch(
      `https://api.spotify.com/v1/search?q=${track}&type=track&limit=${batchSize}${
        offset ? `&offset=${offset * batchSize}` : ""
      }`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.tracks.items !== undefined) return json.tracks.items;
        else return { err: "Error query" };
      })
      .catch((err) => console.log(err));
  }

  // Converti les objets représentant les musiques reçu de l'api en objets structurés contenant
  // les informations dont nous avons besoin pour notre application
  private extractTracks(raw: any): Array<Track> {
    let tracks: Array<Track> = [];
    raw.forEach((element: any) => {
      tracks.push({
        title: element.name,
        id: element.id,
        artist: element.artists[0].name,
        album: element.album.name,
        image: element.album.images[2].url,
        popularity: element.popularity,
        previewUri: element.preview_url,
      });
    });
    return tracks;
  }

  // Unique fonction public de la classe SpotifyTracksService qui recupère un
  // token s'il n'est pas à jour puis fait lance la recherche de titre
  public async searchTrack(
    track: string,
    offset: number
  ): Promise<Array<Track>> {
    if (this.tokenExpiration < new Date().getTime()) {
      if (await this.getToken())
        return this.extractTracks(await this.search(track, offset));
      else return [];
    } else {
      return this.extractTracks(await this.search(track, offset));
    }
  }
}

export default new SpotifyTracksService();
