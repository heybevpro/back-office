import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CloseTabDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  tab: string;

  constructor(tabId: string) {
    this.tab = tabId;
  }
}
