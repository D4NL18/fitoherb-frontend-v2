import { Component, input, computed, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRes } from '../../../../types/products/productRes.interface';
import { environment } from '../../../../../environments/environment';

/**
 * Card público de produto na vitrine (/produtos), exibindo variações saneadas sem dados do ERP.
 */
@Component({
  selector: 'app-item-card-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-card-gallery.component.html',
  styleUrl: './item-card-gallery.component.scss'
})
export class ItemCardGalleryComponent {
  product = input.required<ProductRes>();
  backendUrl = environment.imagesBaseUrl;
  productClicked = output<string>();
  hasImageError = signal<boolean>(false);

  /** Verdadeiro quando o produto ativo não possui foto cadastrada (P-412). */
  isPlaceholderImage = computed(() => !this.product()?.imageUrl && !this.hasImageError());

  constructor() {
    effect(() => {
      this.product();
      this.hasImageError.set(false);
    }, { allowSignalWrites: true });
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

  isNew = computed(() => {
    const dateStr = this.product().createdAt;
    if (!dateStr) return false;
    const [datePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('-').map(Number);

    const createdDate = new Date(year, month - 1, day);
    const today = new Date();

    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 30;
  });

  formattedDescription = computed(() => {
    const text = this.product()?.description;
    if (!text) return '';

    return text.replace(/\\n|\n/g, ' ').replace(/\s+/g, ' ').trim();
  });

  onCardClick() {
    this.productClicked.emit(this.product().slug);
  }
}
