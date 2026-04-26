import { Component, input, forwardRef, signal, effect } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true }
  ],
  templateUrl: 'input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent implements ControlValueAccessor {
  label = input<string>();
  id = input.required<string>();
  placeholder = input<string>('');
  type = input<'text' | 'email' | 'tel' | 'number' | 'password'>('text');
  required = input<boolean>(false);
  icon = input<string | null>(null);
  errorMsg = input<string | null>(null);
  showError = input<boolean>(false);

  isPasswordVisible = signal(false);
  currentType = signal(this.type());

  value: any = '';
  disabled = false;

  onChange: any = () => { };
  onTouched: any = () => { };

  constructor() {
    effect(() => {
      this.currentType.set(this.type());
    }, { allowSignalWrites: true });
  }

  writeValue(val: any): void { this.value = val; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.disabled = disabled; }

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  togglePasswordVisibility() {
    this.isPasswordVisible.update(v => !v);
    this.currentType.set(this.isPasswordVisible() ? 'text' : 'password');
  }
}