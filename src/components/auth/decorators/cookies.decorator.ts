import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const cookie = JSON.parse(request.cookies)
   console.log("request", request);
   
    console.log('Test:', cookie);
    
    return data ? request.cookies?.[data] : request.cookies;
  },
);
