"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getProjectId } from "@/lib/db/queries";

export async function createProduct(formData: FormData) {
  const projectId = await getProjectId();
  if (!projectId) throw new Error("Project not found");

  try {
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
  } catch (e) {
    console.error("createProduct failed:", e);
    throw new Error("Failed to create product");
  }

  revalidatePath("/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const sku = formData.get("sku") as string;
  const category = formData.get("category") as string;
  const price = formData.get("price") as string;
  const lowStockThreshold = formData.get("lowStockThreshold") as string;

  try {
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
  } catch (e) {
    console.error("updateProduct failed:", e);
    throw new Error("Failed to update product");
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}

export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({ where: { id: productId } });
  } catch (e) {
    console.error("deleteProduct failed:", e);
    throw new Error("Failed to delete product");
  }
  revalidatePath("/products");
}

export async function adjustStock(productId: string, quantity: number, type: "IN" | "OUT" | "ADJUSTMENT") {
  let product;
  try {
    product = await prisma.product.findUnique({ where: { id: productId } });
  } catch (e) {
    console.error("adjustStock find failed:", e);
    throw new Error("Failed to find product");
  }
  if (!product) throw new Error("Product not found");

  const newStock =
    type === "IN" ? (product.stock ?? 0) + quantity
    : type === "OUT" ? Math.max(0, (product.stock ?? 0) - quantity)
    : quantity;

  try {
    await prisma.product.update({ where: { id: productId }, data: { stock: newStock } });
  } catch (e) {
    console.error("adjustStock update failed:", e);
    throw new Error("Failed to adjust stock");
  }

  try {
    await prisma.stockMovement.create({
      data: { productId, type: type as "IN" | "OUT" | "ADJUSTMENT", quantity, reason: "Manual adjustment via Console" },
    });
  } catch (e) {
    console.error("adjustStock movement failed:", e);
    throw new Error("Failed to record stock movement");
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}
