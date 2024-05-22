import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayloadDto } from './dto/token-payload.dto';

@Injectable()
export class InternalStrategy extends PassportStrategy(Strategy, 'internal') {
  constructor(@Inject('JWT_SECRET') jwtSecret) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenPayloadDto): Promise<string> {
    if (payload.type !== 'internal') {
      throw new UnauthorizedException();
    } else {
      return payload.sub;
    }
  }
}
