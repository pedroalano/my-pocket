import {
  AuthResponse,
  ForgotPasswordDto,
  MessageResponse,
  ResendVerificationDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '@/types';
import { api } from './api';

export const authsApi = {
  forgotPassword: (data: ForgotPasswordDto) =>
    api.post<MessageResponse>('/auths/forgot-password', data),

  resetPassword: (data: ResetPasswordDto) =>
    api.post<MessageResponse>('/auths/reset-password', data),

  verifyEmail: (data: VerifyEmailDto) =>
    api.post<AuthResponse>('/auths/verify-email', data),

  resendVerification: (data: ResendVerificationDto) =>
    api.post<MessageResponse>('/auths/resend-verification', data),
};
