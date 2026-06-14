import { z } from "zod";
import { NextResponse } from "next/server";

type ValidationResult<T> =
  | { data: T; error: undefined }
  | { data: undefined; error: NextResponse };

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  sku: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  stock: z.coerce.number().int().min(0).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  externalId: z.string().optional(),
});

const orderStatusEnum = z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const);
const paymentStatusEnum = z.enum(["UNPAID", "PARTIAL", "PAID", "REFUNDED"] as const);
const orderSourceEnum = z.enum(["WHATSAPP", "MANUAL", "WEB_CHECKOUT", "API"] as const);
const leadStatusEnum = z.enum(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const);
const leadSourceEnum = z.enum(["WEBSITE_FORM", "WHATSAPP", "CALENDLY", "MANUAL"] as const);

export const orderCreateSchema = z.object({
  orderNumber: z.string().optional(),
  customerId: z.string().optional(),
  source: orderSourceEnum.optional(),
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
  totalAmount: z.coerce.number().positive("Total amount must be positive"),
  items: z.array(z.object({
    productName: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).optional(),
});

export const orderUpdateSchema = z.object({
  status: orderStatusEnum.optional(),
  paymentStatus: paymentStatusEnum.optional(),
});

export const leadCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: leadSourceEnum.optional(),
  status: leadStatusEnum.optional(),
  message: z.string().optional(),
  products: z.array(z.string()).optional(),
});

export const customerCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export const preferencesUpdateSchema = z.record(z.string(), z.boolean());

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) return { data: result.data, error: undefined };
  return {
    data: undefined,
    error: NextResponse.json(
      { error: "Validation failed", details: result.error.flatten().fieldErrors },
      { status: 400 },
    ),
  };
}
