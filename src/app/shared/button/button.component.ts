import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  label = input.required<string>();
  variant = input<'primary' | 'outline' | 'white'>('primary');
  size = input<'small' | 'medium' | 'large'>('medium');
  icon = input<string | null>(null);
  fullWidth = input<boolean>(false);
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  btnClick = output<void>();

  onClick() {
    if (!this.disabled() && !this.loading()) {
      this.btnClick.emit();
    }
  }
}
