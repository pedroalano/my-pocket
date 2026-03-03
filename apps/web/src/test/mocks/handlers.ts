import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3001';

// Mock data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
};

export const mockCategories = [
  {
    id: 'cat-1',
    name: 'Salary',
    type: 'INCOME',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Groceries',
    type: 'EXPENSE',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
];

// Generate a valid-looking JWT for testing
export const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwiaWF0IjoxNzA0MDY3MjAwfQ.fake-signature';

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auths/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({ access_token: mockToken });
    }
    return HttpResponse.json(
      { message: 'Invalid credentials', statusCode: 401 },
      { status: 401 },
    );
  }),

  http.post(`${API_URL}/auths/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { message: 'Email already exists', statusCode: 409 },
        { status: 409 },
      );
    }
    return HttpResponse.json({ access_token: mockToken });
  }),

  // Categories endpoints
  http.get(`${API_URL}/categories`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockCategories);
  }),

  http.get(`${API_URL}/categories/:id`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const category = mockCategories.find((c) => c.id === params.id);
    if (!category) {
      return HttpResponse.json(
        { message: 'Category not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return HttpResponse.json(category);
  }),

  http.post(`${API_URL}/categories`, async ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const body = (await request.json()) as { name: string; type: string };
    return HttpResponse.json({
      id: 'new-cat-id',
      name: body.name,
      type: body.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.put(`${API_URL}/categories/:id`, async ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const category = mockCategories.find((c) => c.id === params.id);
    if (!category) {
      return HttpResponse.json(
        { message: 'Category not found', statusCode: 404 },
        { status: 404 },
      );
    }
    const body = (await request.json()) as { name?: string; type?: string };
    return HttpResponse.json({
      ...category,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/categories/:id`, ({ params, request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized', statusCode: 401 },
        { status: 401 },
      );
    }
    const category = mockCategories.find((c) => c.id === params.id);
    if (!category) {
      return HttpResponse.json(
        { message: 'Category not found', statusCode: 404 },
        { status: 404 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),
];
