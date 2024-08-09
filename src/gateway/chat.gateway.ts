import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/chat/chat.service';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({ cors: { origin: '*' } }) // Adjust CORS as needed
@Injectable()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  // Map to track users in each room
  private roomUsers: Map<string, Set<string>> = new Map(); // roomId -> Set<userId>
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;
    if (token) {
      try {
        const decoded = await this.authService.verifyToken(token);
        this.userSockets.set(decoded.userId, client.id);
        console.log('Client connected:', client.id, 'User ID:', decoded.userId);
      } catch (err) {
        client.disconnect();
      }
    } else {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    this.removeFromAllRooms(client);
    this.removeUser(client);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      return; // User not found
    }

    client.join(data.roomId);

    // Add user to the room's user list
    if (!this.roomUsers.has(data.roomId)) {
      this.roomUsers.set(data.roomId, new Set());
    }
    this.roomUsers.get(data.roomId).add(userId);

    // Notify the room about the updated user list
    this.server
      .to(data.roomId)
      .emit('roomUsers', Array.from(this.roomUsers.get(data.roomId)));

    console.log(`Client ${userId} joined room ${data.roomId}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      sender: string;
      message: string;
      readBy: string[];
    },
  ) {
    // Save message to the database
    await this.chatService.addMessage(
      data.roomId,
      data.sender,
      data.message,
      data.readBy,
    );

    // Emit the message to the room
    this.server.to(data.roomId).emit('message', {
      sender: data.sender,
      message: data.message,
      timestamp: new Date(),
    });
  }

  private removeFromAllRooms(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (!userId) {
      return; // User not found
    }

    for (const [roomId, userIds] of this.roomUsers.entries()) {
      if (userIds.has(userId)) {
        userIds.delete(userId);
        if (userIds.size === 0) {
          this.roomUsers.delete(roomId);
        } else {
          this.roomUsers.set(roomId, userIds);
        }
        // Notify the room about the updated user list
        this.server.to(roomId).emit('roomUsers', Array.from(userIds));
        console.log(`Client ${userId} left room ${roomId}`);
      }
    }
    console.log('Room users:', this.roomUsers);
  }

  private removeUser(client: Socket) {
    const userId = this.getUserIdFromSocket(client);
    if (userId) {
      this.userSockets.delete(userId);
    }
  }

  private getUserIdFromSocket(client: Socket): string | undefined {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        return userId;
      }
    }
    return undefined; // No user ID found for this socket
  }
}
