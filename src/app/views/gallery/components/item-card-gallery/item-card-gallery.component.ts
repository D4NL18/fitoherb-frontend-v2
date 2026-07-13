import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRes } from '../../../../types/products/productRes.interface';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-item-card-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-card-gallery.component.html',
  styleUrl: './item-card-gallery.component.scss'
})
export class ItemCardGalleryComponent{
  product = input.required<ProductRes>();
  backendUrl = environment.imagesBaseUrl;
  productClicked = output<string>();

  formattedImageUrl = computed(() => {
    let url = this.product().imageUrl;
    if (url && !url.startsWith('http') && !url.startsWith('assets/')) {
      url = this.backendUrl + (url.startsWith('/') ? '' : '/') + url;
    }
    return url;
  });

  isNew = computed(() => {
    const dateStr = this.product().createdAt;
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
