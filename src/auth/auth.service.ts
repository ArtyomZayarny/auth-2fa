import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { genSalt, hash } from 'bcrypt';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { USER_NOT_FOUNDED, WRONG_PASSWORD } from './auth.constants';
import { OtpAuthService } from 'src/otp/otp-auth.service';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: ModelType<User>,
    private jwtService: JwtService,
    private readonly otpAuthService: OtpAuthService,
  ) {}

  async vallidateUser(userInput: AuthDto): Promise<Pick<User, 'email'>> {
    const user = await this.findUser(userInput.email);

    if (!user) {
      throw new UnauthorizedException(USER_NOT_FOUNDED);
    }

    const isMatch = await bcrypt.compare(userInput.password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException(WRONG_PASSWORD);
    }
    if (user.isTfaEnabled) {
      const isValid = this.otpAuthService.verifyCode(
        userInput.tfaCode,
        user.tfaSecret,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    return { email: (await user).email };
  }

  async login(email: string) {
    //create jwt token
    const payload = { email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
  async findAll() {
    return this.userModel.find();
  }

  async findUser(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(dto: AuthDto) {
    const salt = await genSalt(10);
    const newUser = new this.userModel({
      email: dto.email,
      passwordHash: await hash(dto.password, salt),
    });
    const newSavedUser = await newUser.save();
    return newSavedUser;
  }
}
