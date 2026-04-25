export interface ProductReq {
  name: string;
  description: string;
  categorySlug: string;
  supplierSlug: string;
  flavours?: string[];
}
