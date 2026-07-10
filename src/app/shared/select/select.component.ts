import { Component, input, forwardRef, HostListener, computed, signal, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }
  ],
  templateUrl: 'select.component.html',
  styleUrl: './select.component.scss'
})
export class SelectComponent implements ControlValueAccessor {
  label = input<string>();
  id = input.required<string>();
  placeholder = input<string>('Selecione uma opção');
  options = input.required<string[]>();
  required = input<boolean>(false);
  errorMsg = input<string | null>(null);
  showError = input<boolean>(false);
  searchable = input<boolean>(false);

  value: any = '';
  disabled = false;
  isOpen = false;
  searchTerm = signal('');

  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.options().filter(opt => opt.toLowerCase().includes(term));
  });

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.el.nativeElement.contains(event.target) && this.isOpen) {
      this.isOpen = false;
      this.onTouched();
    }
  }

  writeValue(val: any): void { this.value = val; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; }

  toggleOpen(event: Event) {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchTerm.set(''); // reset search when opening
    } else {
      this.onTouched();
    }
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  selectOption(opt: string, event: Event) {
    event.stopPropagation();
    this.value = opt;
    this.onChange(opt);
    this.isOpen = false;
    this.onTouched();
  }
}
