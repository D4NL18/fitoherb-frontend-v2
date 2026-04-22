import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-response',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-response.component.html',
  styleUrl: './modal-response.component.scss'
})
export class ModalResponseComponent {
  status = input.required<number>();
  message = input.required<string>();

  close = output<void>();

  isSuccess = computed(() => this.status() >= 200 && this.status() < 300);

  onClose() {
    this.close.emit();
  }
}
