import { IsNotEmpty } from 'class-validator';

export default class RefreshTokenDto {
  @IsNotEmpty()
  refreshToken: string;
}
