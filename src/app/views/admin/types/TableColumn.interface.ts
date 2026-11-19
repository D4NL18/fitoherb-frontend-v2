export interface TableColumn {
  label: string;
  key: string;
  type: 'text' | 'image' | 'price' | 'badge' | 'category' | 'actions' | 'stock' | 'erp-code' | 'erp-status';
  filterable?: boolean;
  filterOptions?: {label: string, value: string}[];
}
