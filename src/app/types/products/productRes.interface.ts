import { ProductCategoryRes } from "../product-categories/productCategoriesRes.interface";
import { SupplierRes } from "../suppliers/SupplierRes.interface";

/**
 * DTO público da vitrine (/products/gallery) — estritamente sem dados internos do ERP.
 */
export interface ProductRes {
  name: string;
  imageUrl: string | null;
  description?: string;
  flavours: string[];
  presentation?: string[];
  slug: string;
  category: ProductCategoryRes;
  supplier: SupplierRes;
  createdAt: string;
}
