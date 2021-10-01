import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status === 403 || status === 401) {
      response.render('forbidden-exeption', {
        message: 'Unauthorized ',
        status: status,
      });
    } else if (status === 400) {
      return response.render('page-error', {
        message: 'Not found',
        status: status,
      });
    } else if (exception.code === 11000) {
      return response.render('page-error', { status: status });
    } else if (status === 404) {
      return response.render('page-error', {
        message: 'Not found',
        status: status,
      });
    } else if (status === 500) {
      return response.render('page-error', {
        message: 'Internal Server Error, sorry, it`s me, not you.',
        status: status,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.response.message,
      });
    }
  }
}
