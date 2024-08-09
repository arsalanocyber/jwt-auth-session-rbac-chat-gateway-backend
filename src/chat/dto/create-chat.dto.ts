import { IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  roomId: string;

  @IsNotEmpty()
  sender: string;

  @IsNotEmpty()
  receiver: string;
}
