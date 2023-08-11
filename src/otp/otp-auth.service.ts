import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { InjectModel } from 'nestjs-typegoose';
import { authenticator } from 'otplib';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OtpAuthService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User) private readonly userModel: ModelType<User>,
  ) {}
  async generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const appName = this.configService.getOrThrow('TFA_APP_NAME');
    const uri = authenticator.keyuri(email, appName, secret);
    return {
      uri,
      secret,
    };
  }
  verifyCode(code: string, secret: string) {
    return authenticator.verify({
      token: code,
      secret,
    });
  }

  async enableTfaForUser(email: string, secret: string) {
    const { _id } = await this.userModel.findOne({ email }).exec();

    await this.userModel
      .findByIdAndUpdate(
        { _id },
        { tfaSecret: secret, isTfaEnabled: true },
        { new: true },
      )
      .exec();
  }
}
