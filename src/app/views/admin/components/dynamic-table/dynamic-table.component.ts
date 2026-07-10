import { TableColumn } from './../../types/TableColumn.interface';
import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableFilterComponent } from '../table-filter/table-filter.component';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule, TableFilterComponent],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent {
  columns = input.required<TableColumn[]>();
  data = input.required<any[]>();

  currentPage = input<number>(0);
  pageSize = input<number>(10);
  totalElements = input<number>(0);
  activeFilters = input<Record<string, string[]>>({});

  edit = output<any>();
  delete = output<any>();
  pageChange = output<number>();
  filterApply = output<{key: string, values: string[]}>();

  startItem = computed(() => {
    if (this.totalElements() === 0) return 0;
    return (this.currentPage() * this.pageSize()) + 1;
  });

  endItem = computed(() => {
    const end = (this.currentPage() + 1) * this.pageSize();
    return end > this.totalElements() ? this.totalElements() : end;
  });

  totalPages = computed(() => {
    return Math.ceil(this.totalElements() / this.pageSize());
  });

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

  changePage(newPage: number) {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.pageChange.emit(newPage);
    }
  }

  onFilterApply(key: string, values: string[]) {
    this.filterApply.emit({ key, values });
  }
}
