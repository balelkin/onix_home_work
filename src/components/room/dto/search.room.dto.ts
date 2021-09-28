import { IsNotEmpty, IsString } from 'class-validator';

export class SearchRoomDto {
  @IsNotEmpty()
  @IsString()
  readonly searchText: string;
}
