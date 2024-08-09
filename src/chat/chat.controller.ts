// src/chat/chat.controller.ts
import { Body, Controller, Param, Post, Get } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create-room/:roomId')
  async createRoom(
    @Param('roomId') roomId: string,
    @Body('sender') sender: string,
    @Body('receiver') receiver: string,
  ) {
    console.log({ roomId, sender, receiver });
    return this.chatService.createRoom(roomId, sender, receiver);
  }

  @Post('send-message/:roomId')
  async sendMessage(
    @Param('roomId') roomId: string,
    @Body('sender') sender: string,
    @Body('message') message: string,
    @Body('readBy') readBy: string[],
  ) {
    return this.chatService.addMessage(roomId, sender, message, readBy);
  }

  @Get('messages/:roomId')
  async getMessages(@Param('roomId') roomId: string) {
    return this.chatService.getMessages(roomId);
  }

  @Get('user/:userId/rooms')
  async getUserRooms(@Param('userId') userId: string) {
    return this.chatService.getUserRooms(userId);
  }

  @Post('update-read-by/:roomId')
  async updateReadBy(
    @Param('roomId') roomId: string,
    @Body('userId') userId: string,
  ) {
    console.log({ roomId, userId });
    try {
      const updatedChatRoom = await this.chatService.updateReadBy(
        roomId,
        userId,
      );
      return {
        message: 'Read by array updated successfully',
        chatRoom: updatedChatRoom,
      };
    } catch (error) {
      return { message: error.message };
    }
  }
}
