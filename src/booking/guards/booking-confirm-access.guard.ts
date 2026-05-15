import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';
import { UserRole } from 'src/user/enums/user-role.enum';

/**
 * Cho phép xác nhận booking khi:
 * - Header `x-internal-booking-confirm-secret` khớp `INTERNAL_BOOKING_CONFIRM_SECRET`, hoặc
 * - JWT hợp lệ và role ADMIN / STAFF.
 */
@Injectable()
export class BookingConfirmAccessGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { id?: string; email?: string; role?: UserRole } }>();

    const configuredSecret = this.configService.get<string>('INTERNAL_BOOKING_CONFIRM_SECRET');
    const headerSecret = request.headers['x-internal-booking-confirm-secret'];
    const provided =
      typeof headerSecret === 'string'
        ? headerSecret
        : Array.isArray(headerSecret)
          ? headerSecret[0]
          : undefined;

    if (configuredSecret && provided !== undefined && this.timingSafeEqualStr(configuredSecret, provided)) {
      (request as Request & { internalBookingConfirm?: boolean }).internalBookingConfirm = true;
      return true;
    }

    const token = this.extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        id: string;
        email: string;
        role: UserRole;
      }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      request.user = payload;
      if (payload.role !== UserRole.ADMIN && payload.role !== UserRole.STAFF) {
        throw new ForbiddenException('Chỉ admin hoặc staff được xác nhận booking');
      }
      return true;
    } catch (e) {
      if (e instanceof ForbiddenException) {
        throw e;
      }
      throw new UnauthorizedException();
    }
  }

  private timingSafeEqualStr(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }
    return request.cookies?.['access_token'];
  }
}
