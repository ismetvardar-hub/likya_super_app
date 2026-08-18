import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/** Global hata sözleşmesi: { error, message, statusCode, path, ts } */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Beklenmeyen sunucu hatası';
    if (typeof body === 'string') message = body;
    else if (body && typeof body === 'object') {
      const m = (body as { message?: unknown }).message;
      if (Array.isArray(m)) message = m.join('; ');
      else if (typeof m === 'string') message = m;
    }

    if (status >= 500) this.logger.error(`${req.method} ${req.originalUrl} → ${status}: ${message}`);

    res.status(status).json({
      error: HttpStatus[status] ?? 'ERROR',
      message,
      statusCode: status,
      path: req.originalUrl,
      ts: new Date().toISOString(),
    });
  }
}
