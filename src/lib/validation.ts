import { z } from 'zod';

// Validation schemas
export const CreateOrderSchema = z.object({
  customerId: z.string().optional(),
  email: z.string().email('Email must be valid'),
  phone: z.string().min(1, 'Phone is required').max(20),
  address: z.string().min(1, 'Address is required'),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1, 'Quantity must be at least 1'),
        price: z.number().positive('Price must be positive'),
      })
    )
    .min(1, 'At least one item is required'),
  total: z.number().positive('Total must be positive'),
});

export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;

// Simple validation function (fallback if Zod not available)
export function validateOrder(data: unknown): { valid: boolean; errors?: string[] } {
  try {
    CreateOrderSchema.parse(data);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`);
      return { valid: false, errors };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

export const AdminAuthSchema = z.object({
  token: z.string(),
});

export function validateAdminAuth(token: string): boolean {
  try {
    AdminAuthSchema.parse({ token });
    return token === process.env.ADMIN_AUTH_TOKEN;
  } catch {
    return false;
  }
}
