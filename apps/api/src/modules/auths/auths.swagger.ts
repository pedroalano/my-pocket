import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

export function ApiRegister() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiBody({ type: RegisterDto }),
    ApiResponse({
      status: 201,
      description: 'User successfully registered — verification email sent',
      schema: { properties: { message: { type: 'string' } } },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request - validation error',
    }),
    ApiResponse({
      status: 409,
      description: 'Email already exists',
    }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'Login with email and password' }),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: 200,
      description: 'Successfully authenticated',
      type: AuthResponseDto,
    }),
    ApiResponse({ status: 401, description: 'Invalid credentials' }),
  );
}

export function ApiRefresh() {
  return applyDecorators(
    ApiOperation({ summary: 'Exchange a refresh token for new tokens' }),
    ApiBody({ type: RefreshDto }),
    ApiResponse({
      status: 200,
      description: 'Tokens refreshed successfully',
      type: AuthResponseDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Invalid or expired refresh token',
    }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({ summary: 'Logout and invalidate the refresh token' }),
    ApiResponse({ status: 200, description: 'Logged out successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}

export function ApiForgotPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Request a password reset email' }),
    ApiBody({ type: ForgotPasswordDto }),
    ApiResponse({
      status: 200,
      description: 'Password reset email sent (if account exists)',
    }),
    ApiResponse({ status: 400, description: 'Validation error' }),
  );
}

export function ApiResetPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Reset password using a reset token' }),
    ApiBody({ type: ResetPasswordDto }),
    ApiResponse({
      status: 200,
      description: 'Password reset successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid or expired reset token',
    }),
  );
}

export function ApiVerifyEmail() {
  return applyDecorators(
    ApiOperation({ summary: 'Verify email address with a verification token' }),
    ApiBody({ type: VerifyEmailDto }),
    ApiResponse({
      status: 200,
      description: 'Email verified — returns JWT tokens',
      type: AuthResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid or expired verification token',
    }),
  );
}

export function ApiResendVerification() {
  return applyDecorators(
    ApiOperation({ summary: 'Resend email verification link' }),
    ApiBody({ type: ResendVerificationDto }),
    ApiResponse({
      status: 200,
      description:
        'Verification email sent (enumeration-safe: always returns success)',
      schema: { properties: { message: { type: 'string' } } },
    }),
    ApiResponse({ status: 400, description: 'Validation error' }),
  );
}
