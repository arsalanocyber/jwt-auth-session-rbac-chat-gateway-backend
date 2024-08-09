import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust according to your needs
  },
})
export class OnlineGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private onlineUsers = new Map<string, { userId: string; name: string }>(); // Map of socket ID to user info

  constructor(private readonly authService: AuthService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token;
    if (typeof token === 'string') {
      try {
        const decoded = await this.authService.verifyToken(token);
        this.onlineUsers.set(client.id, {
          userId: decoded.userId,
          name: decoded.name,
        });
        this.emitOnlineUsers(); // Ensure all users are notified
      } catch (err) {
        client.disconnect();
      }
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.onlineUsers.delete(client.id);
    this.emitOnlineUsers();
  }

  emitOnlineUsers() {
    const onlineUserInfos = Array.from(this.onlineUsers.values());
    this.server.emit('onlineUsers', onlineUserInfos);
  }
}
