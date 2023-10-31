import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {

  private socket$: WebSocketSubject<any>;

  constructor() {

    const protocol = window.location.protocol.replace('http', 'ws');
    const host = window.location.host;
    const webapp = environment.webSocketApp;

    console.log(`${protocol}//${host}${webapp}`)
    this.socket$ = webSocket(`${protocol}//${host}${webapp}/dc.journalindexer.WebSocket.cls`);
  }



  connect() {
    return this.socket$;
  }

  sendMessage(message: any) {
    this.socket$.next(message);
  }

  close() {
    this.socket$.complete();
  }
}
