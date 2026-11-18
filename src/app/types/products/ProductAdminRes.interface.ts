import { ProductRes } from './productRes.interface';
import {
  ErpMappingStatus,
  ProductCurationStatus,
  ProductSkuRes,
  ProductTopology
} from './ProductSku.interface';

export type {
  ErpMappingStatus,
  ProductCurationStatus,
  ProductSkuRes,
  ProductTopology
} from './ProductSku.interface';

/**
 * DTO administrativo de produto (/products e /products/{slug}) com governança ERP e curadoria.
 */
export interface ProductAdminRes extends ProductRes {
  topology: ProductTopology;
  erpStatus: ErpMappingStatus;
  skuCount: number;
  primaryErpCode: number | null;
  skus: ProductSkuRes[];
  active?: boolean;
  curationStatus?: ProductCurationStatus;
}
