import { Component, inject, OnInit, ElementRef, ViewChild, AfterViewInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuppliersService } from '../../services/suppliers/suppliers.service';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.scss'
})
export class SuppliersComponent implements OnInit, AfterViewInit {
  private supplierService = inject(SuppliersService);
  private router = inject(Router);

  @ViewChild('suppliersGrid') suppliersGrid!: ElementRef;

  public suppliers = this.supplierService.suppliers;
  public backendUrl = environment.apiUrl;

  public sortedSuppliers = computed(() => {
    return [...this.supplierService.suppliers()].sort((a, b) => {
      if (a.isHighlighted && !b.isHighlighted) return -1;
      if (!a.isHighlighted && b.isHighlighted) return 1;
      return 0;
    });
  });

  ngOnInit(): void {
    this.supplierService.getAll();
  }

  ngAfterViewInit(): void {
    this.initScrollObserver();
  }

  private initScrollObserver(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    if (this.suppliersGrid) {
      observer.observe(this.suppliersGrid.nativeElement);
    }
  }

  goToGallery(slug: string) {
    this.router.navigate(['/produtos'], { queryParams: { supplier: slug } });
  }
}
