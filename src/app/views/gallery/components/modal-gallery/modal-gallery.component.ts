import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRes } from '../../../../types/products/productRes.interface';
import { environment } from '../../../../../environments/environment.development';

@Component({
  selector: 'app-modal-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-gallery.component.html',
  styleUrl: './modal-gallery.component.scss',
})
export class ModalGalleryComponent {
  product = input.required<ProductRes | null>();
  isOpen = input.required<boolean>();

  close = output();

  backendUrl = environment.apiUrl;

  formattedDescription = computed(() => {
    const text = this.product()?.description;
    if (!text) return '';
    return text.replace(/\\n/g, '\n').trim();
  });

  onClose() {
    this.close.emit();
  }
}
