import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserData = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.cookies;
   // console.log('wiwiwiwi', user.userAvatar);
    
    return  data ? user && user[data] : user;
  },
);