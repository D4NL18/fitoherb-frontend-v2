import { Component, input, output, computed, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-table-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-filter.component.html',
  styleUrl: './table-filter.component.scss'
})
export class TableFilterComponent {
  options = input.required<FilterOption[]>();
  selectedValues = input<string[]>([]);
  
  applyFilter = output<string[]>();
  
  isOpen = signal(false);
  searchTerm = signal('');
  
  // Local state for checkboxes before applying
  pendingSelected = signal<Set<string>>(new Set());

  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.options().filter(opt => opt.label.toLowerCase().includes(term));
  });

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.el.nativeElement.contains(event.target) && this.isOpen()) {
      this.close();
    }
  }

  toggleOpen(event: Event) {
    event.stopPropagation();
    if (!this.isOpen()) {
      // Initialize pending selections with current selected values
      this.pendingSelected.set(new Set(this.selectedValues()));
      this.searchTerm.set('');
      this.isOpen.set(true);
    } else {
      this.close();
    }
  }

  close() {
    this.isOpen.set(false);
  }

  toggleSelection(value: string, event: Event) {
    event.stopPropagation();
    const current = new Set(this.pendingSelected());
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    this.pendingSelected.set(current);
  }

  onApply(event: Event) {
    event.stopPropagation();
    this.applyFilter.emit(Array.from(this.pendingSelected()));
    this.close();
  }

  onClear(event: Event) {
    event.stopPropagation();
    this.pendingSelected.set(new Set());
    this.applyFilter.emit([]);
    this.close();
  }
}
