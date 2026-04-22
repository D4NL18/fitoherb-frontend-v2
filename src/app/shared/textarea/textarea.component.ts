// textarea.component.ts
import { Component, input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextareaComponent), multi: true }
  ],
  templateUrl: 'textarea.component.html',
  styleUrl: './textarea.component.scss'
})
export class TextareaComponent implements ControlValueAccessor {
  label = input<string>();
  id = input.required<string>();
  placeholder = input<string>('');
  rows = input<number>(4);
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

  onInput(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.onChange(val);
  }
}
