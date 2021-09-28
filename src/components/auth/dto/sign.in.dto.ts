import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export default class SignInDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
