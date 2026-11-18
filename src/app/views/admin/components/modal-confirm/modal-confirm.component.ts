import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/button/button.component';

/**
 * Modal genérico de confirmação para exclusões permanentes ou descarte auditável de curadoria.
 */
@Component({
  selector: 'app-modal-confirm',
  standalone: true,
  imports: [ButtonComponent, ReactiveFormsModule],
  templateUrl: './modal-confirm.component.html',
  styleUrl: './modal-confirm.component.scss'
})
export class ModalConfirmComponent {
  itemName = input.required<string>();
  cascadeItems = input<any[]>();
  isLoading = input<boolean>(false);
  title = input<string>('Você tem certeza?');
  message = input<string | null>(null);
  confirmLabel = input<string>('Sim, excluir');
  showReasonInput = input<boolean>(false);

  close = output<void>();
  confirm = output<string | undefined>();

  reasonControl = new FormControl('');

  onClose(): void {
    this.reasonControl.reset('');
    this.close.emit();
  }

  onConfirm(): void {
    const reason = this.reasonControl.value?.trim() || undefined;
    this.confirm.emit(reason);
  }
}
