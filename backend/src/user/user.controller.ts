import { Controller, Get, Param } from '@nestjs/common';

@Controller()
export class UserController {
  @Get('me')
  getMe() {
    return { action: 'getMe' };
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return { action: 'getUser', id };
  }
}
