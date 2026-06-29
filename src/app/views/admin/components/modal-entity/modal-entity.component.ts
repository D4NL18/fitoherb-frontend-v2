import {
  Component,
  inject,
  input,
  output,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ProductCategoriesService } from '../../../../services/product-categories/product-categories.service';
import { SuppliersService } from '../../../../services/suppliers/suppliers.service';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/input/input.component';
import { SelectComponent } from '../../../../shared/select/select.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-modal-entity',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ButtonComponent,
  ],
  templateUrl: './modal-entity.component.html',
  styleUrl: './modal-entity.component.scss',
})
export class ModalEntityComponent implements OnInit {
  type = input.required<
    'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores' | 'Banners'
  >();
  mode = input<'create' | 'edit'>('create');
  data = input<any>(null);

  close = output<void>();
  save = output<{ form: any; image?: File }>();

  private fb = inject(FormBuilder);
  entityForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  submitAttempted = false;

  categories = inject(ProductCategoriesService).productCategories;
  suppliers = inject(SuppliersService).suppliers;

  categoryNames = computed(() => this.categories().map((c) => c.name));
  supplierNames = computed(() => this.suppliers().map((s) => s.name));

  missingDependenciesMessage = computed(() => {
    if (this.type() !== 'Produtos' || this.mode() === 'edit') return '';

    const noCat = this.categories().length === 0;
    const noSup = this.suppliers().length === 0;

    if (noCat && noSup) return 'Você precisa cadastrar Categorias e Fornecedores antes de criar um produto.';
    if (noCat) return 'Você precisa cadastrar pelo menos uma Categoria antes de criar um produto.';
    if (noSup) return 'Você precisa cadastrar pelo menos um Fornecedor antes de criar um produto.';

    return '';
  });

  roleOptions = ['USER', 'ADMIN'];

  ngOnInit() {
    this.buildForm();

    if (this.mode() === 'edit' && this.data()) {
      const initialData = { ...this.data() };

      if (this.type() === 'Produtos') {
        initialData.categoryName =
          this.data().category?.name || this.data().categoryName;
        initialData.supplierName =
          this.data().supplier?.name || this.data().supplierName;
        initialData.flavours = this.data().flavours?.join(', ');
      }

      this.entityForm.patchValue(initialData);

      if (this.data().imageUrl || this.data().imagePath) {
        const url = this.data().imageUrl || this.data().imagePath;
        const baseUrl = environment.apiUrl.replace('/api', '');
        this.imagePreview = url.startsWith('http')
          ? url
          : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
      }
    }
  }

  private buildForm() {
    const common = {
      name: ['', [Validators.required, Validators.minLength(3)]],
    };

    switch (this.type()) {
      case 'Produtos':
        this.entityForm = this.fb.group({
          ...common,
          description: ['', [Validators.required, Validators.minLength(10)]],
          categoryName: ['', Validators.required],
          supplierName: ['', Validators.required],
          flavours: [''],
        });
        break;

      case 'Usuários':
        this.entityForm = this.fb.group({
          ...common,
          email: [
            { value: '', disabled: this.mode() === 'edit' },
            [Validators.required, Validators.email],
          ],
          role: ['USER', Validators.required],
          birthDate: ['', Validators.required],
        });
        break;

      case 'Fornecedores':
        this.entityForm = this.fb.group({
          ...common,
          isHighlighted: [false],
        });
        break;

      case 'Categorias de Produtos':
        this.entityForm = this.fb.group(common);
        break;

      case 'Banners':
        this.entityForm = this.fb.group({
          title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
          position: [1, [Validators.required, Validators.min(1)]],
          isActive: [true],
        });
        break;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  get isImageValid(): boolean {
    if (this.type() === 'Usuários') return true;

    if (this.mode() === 'create') {
      return this.selectedFile !== null;
    } else {
      return this.selectedFile !== null || this.imagePreview !== null;
    }
  }

  onSubmit() {
    this.submitAttempted = true;

    if (this.entityForm.valid && this.isImageValid) {
      const rawValue = this.entityForm.getRawValue();

      if (this.type() === 'Produtos') {
        const selectedCategory = this.categories().find(
          (c) => c.name === rawValue.categoryName,
        );
        const selectedSupplier = this.suppliers().find(
          (s) => s.name === rawValue.supplierName,
        );

        const finalPayload = {
          ...rawValue,
          categorySlug: selectedCategory?.slug,
          supplierSlug: selectedSupplier?.slug,
        };

        delete finalPayload.categoryName;
        delete finalPayload.supplierName;

        this.save.emit({
          form: finalPayload,
          image: this.selectedFile || undefined,
        });
      } else {
        this.save.emit({
          form: rawValue,
          image: this.selectedFile || undefined,
        });
      }
    } else {
      this.entityForm.markAllAsTouched();
    }
  }
}
