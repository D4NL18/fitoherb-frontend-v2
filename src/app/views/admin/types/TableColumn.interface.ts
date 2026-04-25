export interface TableColumn {
  label: string;
  key: string;
  type: 'text' | 'image' | 'price' | 'badge' | 'actions' | 'stock';
}
