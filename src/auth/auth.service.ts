import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './schemas/refresh-token.schema';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(RefreshToken.name)
    private RefreshTokenModel: Model<RefreshToken>,
    private jwtService: JwtService,
  ) {}
  async signup(signupData: SignupDto) {
    const { email, password, name } = signupData;
    const emailInUse = await this.UserModel.findOne({
      email,
    });
    if (emailInUse) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await this.UserModel.create({
      name,
      email,
      password: hashedPassword,
    });
    return { message: 'Signup successful' };
  }

  async login(credentials: LoginDto) {
    const { email, password } = credentials;
    const user = await this.UserModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Email or Password is incorrect');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Email or Password is incorrect');
    }
    const tokens = await this.generateUserToken(user._id, user.role, user.name);

    return {
      ...tokens,
      userId: user._id,
      role: user.role,
    };
  }

  async generateUserToken(userId, role, name?) {
    const accessToken = await this.jwtService.sign(
      { userId, role, name },
      { expiresIn: '1h' },
    );
    const refreshToken = uuidv4();

    await this.storeRefreshToken(refreshToken, userId);
    return {
      accessToken,
      refreshToken,
    };
  }

  async getAllUsers() {
    const users = await this.UserModel.find();
    return users;
  }

  async getUser(id: string) {
    let user;
    try {
      user = await this.UserModel.findById(new Types.ObjectId(id)).exec();
    } catch (err) {
      throw new NotFoundException('User not found');
    }
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async refreshTokens(refreshtoken: string) {
    const token = await this.RefreshTokenModel.findOne({
      token: refreshtoken,
      expiryDate: { $gt: new Date() },
    });

    if (!token) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    return this.generateUserToken(token.userId, token.role);
  }

  async verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async storeRefreshToken(token: string, userId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    await this.RefreshTokenModel.updateOne(
      { userId },
      {
        $set: { expiryDate, token },
      },
      {
        upsert: true,
      },
    );
  }
}
