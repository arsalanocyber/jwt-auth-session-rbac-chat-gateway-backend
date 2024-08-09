import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173'],
  },
})
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      console.log('Connected');
    });
  }
  @SubscribeMessage('message')
  handleMessage(@MessageBody() body: any) {
    console.log('received message', body);
    this.server.emit('onMessage', {
      msg: 'new Message',
      content: body,
    });
  }
}
