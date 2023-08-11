import { Injectable } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { User } from './entities/user.entity';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private readonly userModel: ModelType<User>) {}
  async updatePassword(email: string, newPassword: string) {
    const salt = await genSalt(10);
    const passwordHash = await hash(newPassword, salt);
    const user = await this.userModel.findOne({ email }).exec();
    return this.userModel
      .findByIdAndUpdate(user._id, { passwordHash }, { new: true })
      .exec();
  }
}
