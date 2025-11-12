import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';

let checkJwtInstance: any;

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor() {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req: Request = ctx.getRequest();
    const res: Response = ctx.getResponse();

    if (!checkJwtInstance) {
      const audience =
        process.env.NODE_ENV === 'development'
          ? process.env.AUTH0_LOCAL_URL
          : process.env.AUTH0_REMOTE_URL;

      const issuer = process.env.AUTH0_ISSUER_BASE_URL;

      checkJwtInstance = auth({
        audience,
        issuerBaseURL: issuer,
      });
    }

    try {
      await new Promise<void>((resolve, reject) => {
        checkJwtInstance(req, res, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      return true;
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'Invalid token');
    }
  }
}
