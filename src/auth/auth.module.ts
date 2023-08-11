import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { TypegooseModule } from 'nestjs-typegoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from 'src/configs/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { UserService } from 'src/users/user.service';
import { OtpAuthService } from 'src/otp/otp-auth.service';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: User,
        schemaOptions: {
          collection: 'users',
        },
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    ConfigModule,
    PassportModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    UserService,
    OtpAuthService,
  ],
})
export class AuthModule {}
