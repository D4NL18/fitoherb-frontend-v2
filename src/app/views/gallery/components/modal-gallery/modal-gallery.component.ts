import { Component, input, output, computed, signal, effect } from '@angular/core';
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

  hasPrev = input<boolean>(false);
  hasNext = input<boolean>(false);

  close = output();
  prev = output();
  next = output();

  backendUrl = environment.imagesBaseUrl;
  hasImageError = signal<boolean>(false);

  constructor() {
    effect(() => {
      // Whenever product input changes, reset error state
      this.product();
      this.hasImageError.set(false);
    });
  }

  formattedImageUrl = computed(() => {
    if (this.hasImageError()) {
      return 'assets/images/fitoherb-leaf-icon.png';
    }
    let url = this.product()?.imageUrl;
    if (url && !url.startsWith('http') && !url.startsWith('assets/')) {
      url = this.backendUrl + (url.startsWith('/') ? '' : '/') + url;
    }
    return url || 'assets/images/fitoherb-leaf-icon.png';
  });

  onImageError() {
    this.hasImageError.set(true);
  }

  formattedDescription = computed(() => {
    const text = this.product()?.description;
    if (!text) return '';
    return text.replace(/\\n/g, '\n').trim();
  });

  onClose() {
    this.close.emit();
  }
}
