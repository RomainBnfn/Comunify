import io, { Socket } from "socket.io-client";
import { Observable } from "rxjs";

export default class SocketIoService {
  private _portServer = "20268";
  //beta.projectheberg.fr
  private _ipServer = "beta.projectheberg.fr";

  private socket: Socket;

  constructor() {
    this.socket = io(`http://${this._ipServer}:${this._portServer}`);

    this.listen("forceClose").subscribe((_: any) => {
      this.disconnect();
    });
  }

  listen(eventName: string) {
    return new Observable((observer: any) => {
      this.socket.on(eventName, (data: any) => {
        observer.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  disconnect() {
    this.socket.disconnect();
  }

  getSocketId() {
    return this.socket.id;
  }
}
