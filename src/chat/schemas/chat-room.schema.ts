import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ChatRoom extends Document {
  @Prop({ required: true })
  roomId: string;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  receiver: string;

  @Prop({
    type: [
      {
        sender: String,
        message: String,
        timestamp: Date,
        readBy: [String],
      },
    ],
  })
  messages: {
    sender: string;
    message: string;
    timestamp: Date;
    readBy: string[];
  }[];
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
