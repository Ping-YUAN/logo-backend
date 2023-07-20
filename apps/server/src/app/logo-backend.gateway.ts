import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { randomUUID } from 'node:crypto';
import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';
import { DIRECTION_TOP, LogoInstance, LogoInstances } from './model';
import { LogoBackendService } from './logo-backend.service';

const LOGO_BACKEND_PORT = process.env.PORT ? Number(process.env.PORT) : 8124;
const LOGO_BACKEND_API_PATH = process.env.SOCKT_PATH
  ? process.env.SOCKT_PATH
  : '';
const LOGO_BACKEND_HEIGHT = process.env.HEIGHT
  ? Number(process.env.HEIGHT)
  : 30;
const LOGO_BACKEND_WIDTH = process.env.WIDTH ? Number(process.env.WIDTH) : 30;

@WebSocketGateway(LOGO_BACKEND_PORT, {
  path: `/${LOGO_BACKEND_API_PATH}`,
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class LogoBackendGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private connections: { [key: string]: Socket } = {};
  private readonly clients: WebSocket[] = [];
  private logoInstances: LogoInstances = {};

  constructor(private logoBackendService: LogoBackendService) {
    this.logoBackendService.quitSubject.subscribe((client) => {
      this.handleDisconnect(client);
    });
  }

  //used to handle all messages for the nodejs test script
  listenForMessages() {
    this.server.on('connection', (ws) => {
      ws.on('message', (e) => {
        try {
          //if the command comes without event then it can't be pasered by json
          const data = JSON.parse(e);
        } catch (err) {
          //convert to string directly as it's the command string;
          this.logoInstances[ws.id].isRawSocket = true;
          this.handleMessage(this.connections[ws.id], e.toString());
        }
      });
    });
  }

  afterInit(server: Server) {
    Logger.log(
      `🚀 Logo websocket server monitor initialized! WebSocket is listening on: http://localhost:${LOGO_BACKEND_PORT}`
    );
    this.listenForMessages();
  }

  // prepared for the angular application which specify the event name with logo;
  @SubscribeMessage('logo')
  handleMessage(client: Socket, payload: any) {
    try {
      const validCommands = this.logoBackendService.parseCommand(payload);
      this.logoBackendService.executeCommands(
        validCommands,
        this.logoInstances[client.id],
        client
      );
    } catch (error) {
      client.send('');
    }
  }

  handleConnection(client: any, ...args: any[]) {
    if (!client.id) {
      client.id = randomUUID();
    }
    if (!this.logoInstances[client.id]) {
      this.logoInstances[client.id] =
        this.logoBackendService.getNewLogoInstance(
          LOGO_BACKEND_HEIGHT,
          LOGO_BACKEND_WIDTH
        );
    }
    this.connections[client.id] = client;
    // client.send('')
  }

  handleDisconnect(client: any) {
    if (this.connections[client.id]) {
      if (!this.logoInstances[client.id].isRawSocket) {
        this.connections[client.id].send(
          JSON.stringify(
            'Connection reset. Refresh current page to establish new socket'
          )
        );
      }
      delete this.connections[client.id];
    }
    if (this.logoInstances[client.id]) {
      delete this.logoInstances[client.id];
    }
  }
}
