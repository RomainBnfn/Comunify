import SocketIoService from "./socket.io.service";

export class ComunifyService {
  private _socketIoService: SocketIoService;

  constructor(
    private _onRoomCreated: Function,
    private _onRoomDoesNotExist: Function,
    private _onRoomJoined: Function,
    private _onRoomLeaved: Function,
    private _onMusicAdded: Function,
    private _onSpotifyResponseReceived: Function
  ) {
    this._socketIoService = new SocketIoService();

    // Different messages wich can be received
    this._socketIoService.listen("roomCreated").subscribe((data: any) => {
      let roomId = data.roomId;
      this._onRoomCreated(roomId);
    });

    this._socketIoService.listen("roomDoesNotExist").subscribe((data: any) => {
      this._onRoomDoesNotExist();
    });

    this._socketIoService.listen("roomJoined").subscribe((data: any) => {
      let roomId = data.roomId;
      this._onRoomJoined(roomId);
    });

    this._socketIoService.listen("leaveRoom").subscribe((data: any) => {
      let reason = data.reason;
      this._onRoomLeaved();
    });

    this._socketIoService.listen("addMusic").subscribe((data: any) => {
      let musicId = data.musicId;
      let isOwner = data.isOwner;
      this._onMusicAdded(musicId, isOwner);
    });

    this._socketIoService
      .listen("spotifyConnexionResponse")
      .subscribe((data: any) => {
        this._onSpotifyResponseReceived(data);
      });
  }

  public createNewRoom() {
    this._socketIoService.emit("createNewRoom", {});
  }

  public joinRoom(roomId: string) {
    this._socketIoService.emit("joinRoom", { roomId: roomId });
  }

  public leaveRoom() {
    this._socketIoService.emit("leaveRoom", {});
  }

  public addMusic(musicId: string) {
    this._socketIoService.emit("addMusic", { musicId: musicId });
  }

  public getSocketId() {
    return this._socketIoService.getSocketId();
  }
}
