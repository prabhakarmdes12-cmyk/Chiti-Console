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

const vendorCategoryEnum = z.enum(["HOTEL", "CAB", "RESTAURANT", "TOUR_GUIDE", "EXPERIENCE"] as const);
const vendorStatusEnum = z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"] as const);
const enquiryTypeEnum = z.enum(["HOTEL", "CAB", "PACKAGE", "RESTAURANT", "CONTACT", "AI_PLAN"] as const);
const enquiryStatusEnum = z.enum(["NEW", "ASSIGNED", "IN_DISCUSSION", "CONFIRMED", "COMPLETED", "CANCELLED"] as const);

export const vendorCreateSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  ownerName: z.string().min(1, "Owner name is required").max(200),
  category: vendorCategoryEnum,
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  gst: z.string().optional(),
  district: z.string().min(1, "District is required"),
  address: z.string().optional(),
  documents: z.array(z.object({
    name: z.string(),
    status: z.enum(["verified", "pending", "not_uploaded"]),
  })).optional(),
});

export const vendorUpdateSchema = z.object({
  businessName: z.string().min(1).max(200).optional(),
  ownerName: z.string().min(1).max(200).optional(),
  category: vendorCategoryEnum.optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  gst: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  status: vendorStatusEnum.optional(),
  rejectionReason: z.string().optional(),
  suspensionReason: z.string().optional(),
  documents: z.array(z.object({
    name: z.string(),
    status: z.enum(["verified", "pending", "not_uploaded"]),
  })).optional(),
});

export const enquiryCreateSchema = z.object({
  type: enquiryTypeEnum,
  customerName: z.string().min(1, "Customer name is required").max(200),
  customerPhone: z.string().min(1, "Phone is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerCity: z.string().optional(),
  listingName: z.string().optional(),
  vendorId: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  source: z.string().optional(),
  language: z.string().optional(),
});

export const enquiryUpdateSchema = z.object({
  status: enquiryStatusEnum.optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

const listingTypeEnum = z.enum(["HOTEL", "CAB", "RESTAURANT", "TOUR_GUIDE", "EXPERIENCE", "PACKAGE"] as const);
const listingStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"] as const);
const discountTypeEnum = z.enum(["PERCENTAGE", "FLAT"] as const);

export const listingCreateSchema = z.object({
  vendorId: z.string().optional(),
  type: listingTypeEnum,
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  pricing: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
    qty: z.number().int().positive().optional(),
    unit: z.string().optional(),
  })).optional(),
  location: z.object({
    district: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  amenities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: listingStatusEnum.optional(),
});

export const listingUpdateSchema = listingCreateSchema.partial();

export const promotionCreateSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  type: discountTypeEnum,
  value: z.number().int().positive("Value must be positive"),
  minCartValue: z.number().int().min(0).optional(),
  maxDiscount: z.number().int().min(0).optional(),
  applicableTypes: z.array(z.string()).optional(),
  usageLimit: z.number().int().min(0).optional(),
  perUserLimit: z.number().int().min(1).optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
});

export const promotionUpdateSchema = promotionCreateSchema.partial();

export const destinationCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
  district: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional(),
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
