// select.component.ts
import { Component, input, forwardRef } from '@angular/core';
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

  value: any = '';
  disabled = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(val: any): void { this.value = val; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; }

  onChangeSelect(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.value = val;
    this.onChange(val);
  }
}
