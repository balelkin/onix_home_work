import { IsNotEmpty } from 'class-validator';

export class ConfirmAccountDto {
  @IsNotEmpty()
  token: string;
}
