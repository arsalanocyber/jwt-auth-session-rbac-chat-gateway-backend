import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersModule } from './users/users.module';
// import { DatabaseModule } from './database/database.module';
// import { EmployeesModule } from './employees/employees.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import config from './config/config';
import { GatewayModule } from './gateway/gateway.module';
import { OnlineGateway } from './gateway/online.gateway';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    // GatewayModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    ChatModule,
    AuthModule,
    ProductsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, OnlineGateway],
})
export class AppModule {}
