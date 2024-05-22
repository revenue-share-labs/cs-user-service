import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { UserService } from '../../../api/user/user.service';
import { UserDto } from '../../../api/generic/dto';

@Injectable()
export class ExternalStrategy extends PassportStrategy(Strategy, 'external') {
  constructor(
    private readonly userService: UserService,
    @Inject('JWT_SECRET') jwtSecret,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenPayloadDto): Promise<UserDto> {
    if (payload.type !== 'external') {
      throw new UnauthorizedException();
    } else {
      try {
        return await this.userService.getUser(payload.sub);
      } catch (err) {
        this.logger.error(err);
      }
    }
  }
}
