import { TableColumn } from './../../types/TableColumn.interface';
import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFilterComponent } from '../table-filter/table-filter.component';

const FALLBACK_PRODUCT_IMAGE = 'assets/images/fitoherb-leaf-icon.png';

/**
 * Tabela administrativa reutilizável com colunas ERP, popover Multi-SKU anti-clipping e paginação.
 */
@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, TableFilterComponent],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  columns = input.required<TableColumn[]>();
  data = input.required<any[]>();

  currentPage = input<number>(0);
  pageSize = input<number>(10);
  totalElements = input<number>(0);
  activeFilters = input<Record<string, string[]>>({});
  disableActions = input<boolean>(false);
  isLoading = input<boolean>(false);

  edit = output<any>();
  delete = output<any>();
  pageChange = output<number>();
  filterApply = output<{ key: string; values: string[] }>();

  activePopoverRow = signal<any | null>(null);
  popoverPosition = signal<{ top: number; left: number; openUpward: boolean }>({
    top: 0,
    left: 0,
    openUpward: false
  });
  readonly skeletonRows = computed(() =>
    Array.from({ length: Math.max(this.pageSize(), 1) }, (_, index) => index)
  );

  startItem = computed(() => {
    if (this.totalElements() === 0) return 0;
    return this.currentPage() * this.pageSize() + 1;
  });

  endItem = computed(() => {
    const end = (this.currentPage() + 1) * this.pageSize();
    return end > this.totalElements() ? this.totalElements() : end;
  });

  totalPages = computed(() => {
    return Math.ceil(this.totalElements() / this.pageSize());
  });

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeSkuPopover();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.activePopoverRow()) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const insidePopover = target.closest('.erp-sku-popover');
    const insideTrigger = target.closest('.erp-sku-trigger');
    if (!insidePopover && !insideTrigger) {
      this.closeSkuPopover();
    }
  }

  getRowImageUrl(imageUrl: string | null | undefined): string {
    return imageUrl ? imageUrl : FALLBACK_PRODUCT_IMAGE;
  }

  onRowImageError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img && !img.src.includes(FALLBACK_PRODUCT_IMAGE)) {
      img.src = FALLBACK_PRODUCT_IMAGE;
    }
  }

  isMultiSku(row: any): boolean {
    const count = row?.skuCount ?? row?.skus?.length ?? 0;
    return count > 1 || (Array.isArray(row?.skus) && row.skus.length > 1);
  }

  getSimpleErpCode(row: any): number | null {
    return row?.primaryErpCode ?? row?.skus?.[0]?.erpCode ?? null;
  }

  getSkuCount(row: any): number {
    return row?.skuCount ?? row?.skus?.length ?? 0;
  }

  formatSkuVariant(sku: any): string {
    const parts = [sku?.presentation, sku?.flavour].filter((part) => !!part && String(part).trim() !== '');
    return parts.length > 0 ? parts.join(' · ') : 'SKU Padrão';
  }

  toggleSkuPopover(row: any, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activePopoverRow() === row) {
      this.closeSkuPopover();
      return;
    }

    const triggerEl = event.currentTarget as HTMLElement | null;
    if (triggerEl && typeof window !== 'undefined') {
      const rect = triggerEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 768;
      const viewportWidth = window.innerWidth || 1024;
      const openUpward = viewportHeight - rect.bottom < 220;
      const popoverWidth = 320;
      const left = Math.max(12, Math.min(rect.left, viewportWidth - popoverWidth - 12));
      const top = openUpward ? Math.max(12, rect.top - 220) : rect.bottom + 6;
      this.popoverPosition.set({ top, left, openUpward });
    }

    this.activePopoverRow.set(row);
  }

  closeSkuPopover(): void {
    this.activePopoverRow.set(null);
  }

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.closeSkuPopover();
      this.pageChange.emit(newPage);
    }
  }

  onFilterApply(key: string, values: string[]) {
    this.filterApply.emit({ key, values });
  }
}
