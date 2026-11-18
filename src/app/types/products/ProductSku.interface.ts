/**
 * Estruturas e DTOs compartilhados para SKUs, topologias e status ERP de produtos.
 */
export type ProductTopology = 'SIMPLE' | 'FLAVOUR_ONLY' | 'PRESENTATION_ONLY' | 'MATRIX';

export type ErpMappingStatus = 'UNMAPPED' | 'COMPLETE' | 'INACTIVE_ALERT';

export type ProductCurationStatus = 'PENDING_IMAGE' | 'COMPLETED' | 'IGNORED';

export interface ProductSkuReq {
  erpCode: number;
  flavour: string | null;
  presentation: string | null;
}

export interface ProductSkuRes {
  id: string;
  flavour: string | null;
  presentation: string | null;
  erpCode: number | null;
  erpInactive: boolean;
  erpInactiveConfirmed: boolean;
  erpDescription?: string | null;
}
