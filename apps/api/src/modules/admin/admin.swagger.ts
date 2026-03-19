import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export function ApiAdminStats() {
  return applyDecorators(
    ApiOperation({ summary: 'Get admin dashboard stats' }),
    ApiResponse({
      status: 200,
      description: 'User statistics',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin only' }),
  );
}

export function ApiAdminUsers() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all users (admin)' }),
    ApiResponse({
      status: 200,
      description: 'List of all users',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Admin only' }),
  );
}

export function ApiAdminUpdateUserStatus() {
  return applyDecorators(
    ApiOperation({ summary: 'Activate or deactivate a user account' }),
    ApiParam({ name: 'id', description: 'User ID', type: 'string' }),
    ApiResponse({
      status: 200,
      description: 'User status updated',
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'Forbidden - Admin only or cannot deactivate self',
    }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
}
