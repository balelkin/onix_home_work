import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { constants } from '../../../constants/jwt.constants';
import { IStrategyValidate } from '../interfaces/IStrategyValidate.Interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: constants.jwt.secret,
    });
  }

  async validate(payload): Promise<IStrategyValidate> {
    console.log('test');
    return {
      email: payload.email,

      //  password: payload.password
    };
  }
}
