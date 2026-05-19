export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export class ApiErrorHandler extends Error implements ApiError {
  status: number;
  code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export function createErrorResponse(error: unknown) {
  if (error instanceof ApiErrorHandler) {
    return {
      status: error.status,
      body: {
        error: error.message,
        code: error.code,
      },
    };
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error.message);
    return {
      status: 500,
      body: {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    };
  }

  console.error('Unknown error:', error);
  return {
    status: 500,
    body: {
      error: 'Internal server error',
    },
  };
}

export function createSuccessResponse<T>(data: T, status: number = 200) {
  return {
    status,
    body: data,
  };
}
