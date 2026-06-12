"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";

export async function createProduct(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  await prisma.product.create({
    data: {
      projectId,
      name: formData.get("name") as string,
      sku: (formData.get("sku") as string) || undefined,
      category: (formData.get("category") as string) || undefined,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string) || 0,
      lowStockThreshold: parseInt(formData.get("lowStockThreshold") as string) || 5,
    },
  });

  revalidatePath("/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const category = formData.get("category") as string;
  const price = formData.get("price") as string;
  const lowStockThreshold = formData.get("lowStockThreshold") as string;

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...(name ? { name } : {}),
      ...(sku ? { sku } : {}),
      ...(category ? { category } : {}),
      ...(price ? { price: parseFloat(price) } : {}),
      ...(lowStockThreshold ? { lowStockThreshold: parseInt(lowStockThreshold) } : {}),
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/products");
}

export async function adjustStock(productId: string, quantity: number, type: "IN" | "OUT" | "ADJUSTMENT") {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const newStock =
    type === "IN" ? (product.stock ?? 0) + quantity
    : type === "OUT" ? Math.max(0, (product.stock ?? 0) - quantity)
    : quantity;

  await prisma.product.update({ where: { id: productId }, data: { stock: newStock } });

  await prisma.stockMovement.create({
    data: { productId, type: type as "IN" | "OUT" | "ADJUSTMENT", quantity, reason: "Manual adjustment via Console" },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}
