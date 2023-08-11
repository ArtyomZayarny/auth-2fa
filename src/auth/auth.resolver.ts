import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { writeFileSync } from 'fs';
import { AuthDto } from './dto/auth.dto';
import { User } from 'src/users/entities/user.entity';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/jwt-auth.guard';
import { GenerateQrCodeResult, MutationResult } from 'src/graphql/mutaion.dto';
import { ActiveUser } from 'src/users/decorators/active-user.decorator';
import { UserService } from 'src/users/user.service';
import { OtpAuthService } from 'src/otp/otp-auth.service';
import { toDataURL } from 'qrcode';
import { USER_ALREADY_REGISTERED_ERROR } from './auth.constants';
import { join } from 'path';
import { LoginResult } from 'src/graphql/login.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly otpAuthService: OtpAuthService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => [User], { name: 'users' })
  async getAllUsers() {
    return this.authService.findAll();
  }

  @Mutation(() => User, { name: 'createUser' })
  async create(@Args('userInput') userInput: AuthDto) {
    const user = await this.authService.findUser(userInput.email);

    if (!user) {
      return this.authService.createUser(userInput);
    } else {
      throw new UnauthorizedException(USER_ALREADY_REGISTERED_ERROR);
    }
  }

  @Query(() => LoginResult, { name: 'login' })
  async login(@Args('loginInput') loginInput: AuthDto) {
    const user = await this.authService.vallidateUser(loginInput);
    return this.authService.login(user.email);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => MutationResult, { name: 'changePassword' })
  async changePassword(
    @Args('newPassword') newPassword: string,
    @ActiveUser() email,
  ) {
    await this.userService.updatePassword(email, newPassword);
    return { success: true };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => GenerateQrCodeResult, { name: 'generateQrCode' })
  async generateQrCode(@ActiveUser() email) {
    const { secret } = await this.otpAuthService.generateSecret(email);
    await this.otpAuthService.enableTfaForUser(email, secret);
    const qrCodeDataUrl = await toDataURL(secret);
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');

    // Generating a unique filename
    const fileName = `qrcode-${Date.now()}.png`;
    const filePath = join(__dirname, '..', fileName);

    // Writing the PNG file
    writeFileSync(filePath, base64Data, 'base64');

    return { qrCodePath: filePath };
  }
}
