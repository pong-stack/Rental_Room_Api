import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Your access token has expired. Please login again.');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(
          'Invalid access token. Please provide a valid authentication token.'
        );
      }
      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Access token is not active yet.');
      }
      throw new UnauthorizedException(
        'Authentication required. Please provide a valid access token in the Authorization header.'
      );
    }
    return user;
  }
}
