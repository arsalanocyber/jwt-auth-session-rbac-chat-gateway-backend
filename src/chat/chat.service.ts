// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRoom } from './schemas/chat-room.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
  ) {}

  async createRoom(roomId: string, sender: string, receiver: string) {
    // Check if a room already exists with the same sender and receiver
    const existingRoom = await this.chatRoomModel
      .findOne({
        $or: [
          { sender: sender, receiver: receiver },
          { sender: receiver, receiver: sender },
        ],
      })
      .exec();
    if (existingRoom) {
      const existingRoomId = existingRoom.roomId;
      // Room already exists
      return { message: 'Room already exists', existingRoomId };
    }

    // Create a new room if no existing room was found
    const chatRoom = new this.chatRoomModel({
      roomId,
      sender,
      receiver,
      messages: [],
    });
    return chatRoom.save();
  }

  async addMessage(
    roomId: string,
    sender: string,
    message: string,
    readBy: string[],
  ) {
    const chatRoom = await this.chatRoomModel.findOne({ roomId });
    if (!chatRoom) {
      throw new Error('Chat room not found');
    }
    console.log({ readBy });
    chatRoom.messages.push({
      sender,
      message,
      timestamp: new Date(),
      readBy,
    });
    return chatRoom.save();
  }

  async getMessages(roomId: string) {
    const chatRoom = await this.chatRoomModel.findOne({ roomId });
    if (!chatRoom) {
      throw new Error('Chat room not found');
    }
    return chatRoom.messages;
  }
  async getUserRooms(userId: string) {
    const userRooms = await this.chatRoomModel
      .find({
        $or: [{ sender: userId }, { receiver: userId }],
      })
      .exec();

    return userRooms;
  }

  async updateReadBy(roomId: string, userId: string) {
    const chatRoom = await this.chatRoomModel.findOne({ roomId });
    if (!chatRoom) {
      throw new Error('Chat room not found');
    }
    console.log({ roomId, userId });
    // Update readBy array for each message
    chatRoom.messages = chatRoom.messages.map((message) => {
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
      }
      return message;
    });

    return chatRoom.save();
  }
}
