import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  status(): { message: string; status: HttpStatus } {
    return { message: 'Ok', status: HttpStatus.OK };
  }
}
