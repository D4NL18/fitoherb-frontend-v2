import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRes } from '../../../../types/products/productRes.interface';
import { environment } from '../../../../../environments/environment';

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

  backendUrl = environment.imagesBaseUrl;

  formattedImageUrl = computed(() => {
    let url = this.product()?.imageUrl;
    if (url && !url.startsWith('http') && !url.startsWith('assets/')) {
      url = this.backendUrl + (url.startsWith('/') ? '' : '/') + url;
    }
    return url;
  });

  formattedDescription = computed(() => {
    const text = this.product()?.description;
    if (!text) return '';
    return text.replace(/\\n/g, '\n').trim();
  });

  onClose() {
    this.close.emit();
  }
}
