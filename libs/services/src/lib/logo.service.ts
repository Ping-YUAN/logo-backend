import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Subject, catchError, tap } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

const ws_path = 'ws://localhost:8124';

@Injectable({
  providedIn: 'root',
})
export class LogoService {
  connectionStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private socket$: WebSocketSubject<any> | undefined;

  constructor() {}

  setupLogoSocket() {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket(ws_path);
      this.connectionStatus.next(true);
    }
  }

  connect() {
    return this.socket$;
  }

  sendMessage(msg: any) {
    const payload = {
      event: 'logo',
      data: msg,
    };
    this.socket$?.next(payload);
  }

  close() {
    this.socket$?.complete();
    this.connectionStatus.next(false);
  }
}
