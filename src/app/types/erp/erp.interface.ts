import {
  ProductCurationStatus,
  ProductSkuRes,
  ProductTopology
} from '../products/ProductSku.interface';

/**
 * Contratos de integração REST para consulta ERP Atrio, sugestão de variações e curadoria rápida.
 */
export interface ApiEnvelopeMeta {
  timestamp: string;
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  lastSyncedAt?: string;
  syncedAt?: string;
  count?: number;
  pendingCount?: number;
  fallbackItemsCount?: number;
  aiCatalogRefreshed?: boolean;
  durationMs?: number;
  triggerSource?: string;
}

export interface ApiEnvelope<T> {
  data: T;
  meta: ApiEnvelopeMeta;
}

export interface ApiErrorRes {
  status: string;
  message: string;
  code?: string;
  details?: {
    inactiveErpCodes?: number[];
    erpCode?: number;
    conflictingProductName?: string;
    conflictingProductSlug?: string;
    activeRunId?: string;
    lockExpiresAt?: string;
  };
  errors?: Record<string, string>;
}

export interface ErpCatalogItemRes {
  erpCode: number;
  erpDescription: string;
  ean: string | null;
  erpBrand: string | null;
  erpSupplier: string | null;
  inativoPro: boolean;
  inExterno01: boolean;
  alreadyMapped: boolean;
  mappedProductSlug: string | null;
  mappedProductName: string | null;
  mappedFlavour: string | null;
  mappedPresentation: string | null;
}

export type ErpProductSearchItem = ErpCatalogItemRes;

export interface ErpSearchOptions {
  supplierSlug?: string;
  includeInactive?: boolean;
  excludeProductSlug?: string;
  page?: number;
  size?: number;
}

export interface ErpSuggestVariantsReq {
  erpCodes: number[];
  excludeProductSlug?: string;
}

export type SuggestVariantsReq = ErpSuggestVariantsReq;

export interface SuggestedVariantItem {
  erpCode: number;
  erpDescription: string;
  suggestedFlavour: string | null;
  suggestedPresentation: string | null;
  inativoPro: boolean;
  inExterno01: boolean;
  alreadyMappedElsewhere: boolean;
  conflictingProductName: string | null;
  packageWarning: string | null;
}

export interface ErpSuggestVariantsRes {
  suggestedTopology: ProductTopology;
  hasInactiveItems: boolean;
  hasConflictingItems: boolean;
  items: SuggestedVariantItem[];
}

export type SuggestVariantsRes = ErpSuggestVariantsRes;

export interface CurationPendingItem {
  slug: string;
  name: string;
  description: string | null;
  categorySlug: string;
  categoryName: string;
  supplierSlug: string;
  supplierName: string;
  active: boolean;
  curationStatus: ProductCurationStatus | string;
  fallbackCategoryWarning: boolean;
  fallbackSupplierWarning: boolean;
  imageUrl: string | null;
  topology: ProductTopology | string;
  createdAt: string;
  skus: ProductSkuRes[];
}

export type QuickCurationPendingItemRes = CurationPendingItem;

export interface CurationPendingFilterParams {
  page?: number;
  size?: number;
  onlyFallback?: boolean;
  search?: string;
}

export interface IgnoreCurationProductRes {
  slug: string;
  active: boolean;
  curationStatus: ProductCurationStatus;
  ignoredErpCodes: number[];
}

export type DailySyncMode = 'INCREMENTAL' | 'STATUS_ONLY' | 'INITIAL_BASELINE_SEED';

export interface DailySyncReq {
  mode?: DailySyncMode;
  dryRun?: boolean;
}

export interface DailySyncRes {
  runId: string;
  mode: DailySyncMode;
  status: 'COMPLETED' | 'ALREADY_RUNNING';
  dryRun: boolean;
  baselineCutoffAt: string | null;
  checkedMappedSkus: number;
  deactivatedProducts: number;
  partiallyDeactivatedProducts: number;
  reactivatedProducts: number;
  createdPendingProducts: number;
  ignoredCodesSkipped: number;
  aiCatalogRefreshed: boolean;
}
