import { ProductCategoryRes } from "../product-categories/productCategoriesRes.interface";
import { SupplierRes } from "../suppliers/SupplierRes.interface";

export interface ProductRes {
  name: string;
  imageUrl: string;
  description: string;
  flavours: string[];
  presentation?: string[];
  slug: string;
  category: ProductCategoryRes;
  supplier: SupplierRes;
  createdAt: string;
}
