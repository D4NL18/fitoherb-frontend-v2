import { ProductSkuReq } from './ProductSku.interface';

export type { ProductSkuReq } from './ProductSku.interface';

/**
 * Payload de criação e edição de produtos com lista estruturada de SKUs ERP.
 */
export interface ProductReq {
  name: string;
  description?: string;
  categorySlug: string;
  supplierSlug: string;
  allowInactiveErp?: boolean;
  skus: ProductSkuReq[];
}
