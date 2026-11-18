import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurationPendingItem } from '../../../../types/erp/erp.interface';

const INITIAL_VISIBLE_LIMIT = 5;

/**
 * Painel de Curadoria Rápida exibido na entrada do /admin para completar fotos ou descartar itens do ERP (P-413).
 */
@Component({
  selector: 'app-quick-curation-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-curation-panel.component.html',
  styleUrl: './quick-curation-panel.component.scss'
})
export class QuickCurationPanelComponent {
  items = input<CurationPendingItem[]>([]);
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  busySlug = input<string | null>(null);

  selectItem = output<CurationPendingItem>();
  ignoreItem = output<CurationPendingItem>();
  retry = output<void>();

  isExpanded = signal<boolean>(false);
  readonly skeletonRows = [0, 1];

  shouldRender = computed(() => this.isLoading() || !!this.error() || this.items().length > 0);
  hasMoreThanLimit = computed(() => this.items().length > INITIAL_VISIBLE_LIMIT);
  visibleItems = computed(() =>
    this.isExpanded() ? this.items() : this.items().slice(0, INITIAL_VISIBLE_LIMIT)
  );

  getPrimaryErpCode(item: CurationPendingItem): number | string {
    return item.skus?.[0]?.erpCode ?? '—';
  }

  onSelect(item: CurationPendingItem): void {
    if (this.busySlug() === item.slug) return;
    this.selectItem.emit(item);
  }

  onIgnore(item: CurationPendingItem): void {
    if (this.busySlug() === item.slug) return;
    this.ignoreItem.emit(item);
  }

  toggleExpand(): void {
    this.isExpanded.update((prev) => !prev);
  }
}
