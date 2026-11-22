import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

import { ProductCategoriesService } from '../../../../services/product-categories/product-categories.service';
import { SuppliersService } from '../../../../services/suppliers/suppliers.service';
import { ErpProductsService } from '../../../../services/erp-products/erp-products.service';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { InputComponent } from '../../../../shared/input/input.component';
import { SelectComponent } from '../../../../shared/select/select.component';
import { TextareaComponent } from '../../../../shared/textarea/textarea.component';
import { environment } from '../../../../../environments/environment';
import {
  ProductSkuReq,
  ProductTopology
} from '../../../../types/products/ProductSku.interface';
import { ErpCatalogItemRes } from '../../../../types/erp/erp.interface';

export interface SkuRowValue {
  erpCode: number | null;
  flavour: string | null;
  presentation: string | null;
  erpInactive?: boolean;
  erpDescription?: string | null;
  packageWarning?: string | null;
}

/**
 * Modal de criação e edição de entidades administrativas, incluindo estação de trabalho Multi-SKU (P-405, P-407, P-413).
 */
@Component({
  selector: 'app-modal-entity',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    TextareaComponent
  ],
  templateUrl: './modal-entity.component.html',
  styleUrl: './modal-entity.component.scss'
})
export class ModalEntityComponent implements OnInit, OnDestroy {
  type = input.required<
    'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores' | 'Banners'
  >();
  mode = input<'create' | 'edit'>('create');
  data = input<any>(null);
  isLoading = input<boolean>(false);
  focusImageUpload = input<boolean>(false);

  close = output<void>();
  save = output<{ form: any; image?: File }>();

  private readonly fb = inject(FormBuilder);
  private readonly erpProductsService = inject(ErpProductsService);
  private searchSub?: Subscription;
  private skuChangesSub?: Subscription;

  entityForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  submitAttempted = false;
  formError = signal<string>('');

  categories = inject(ProductCategoriesService).productCategories;
  suppliers = inject(SuppliersService).suppliers;

  categoryNames = computed(() => this.categories().map((c) => c.name));
  supplierNames = computed(() => this.suppliers().map((s) => s.name));

  topology = signal<ProductTopology>('SIMPLE');
  isErpDrawerOpen = signal<boolean>(true);
  erpSearchControl = new FormControl<string>('', { nonNullable: true });
  erpSearchResults = signal<ErpCatalogItemRes[]>([]);
  isErpSearching = signal<boolean>(false);
  erpSearchError = signal<string | null>(null);
  selectedErpCodes = signal<number[]>([]);
  isSuggestingVariants = signal<boolean>(false);
  allowInactiveErp = signal<boolean>(false);
  skuRowsSnapshot = signal<SkuRowValue[]>([]);

  readonly erpSkeletonRows = [0, 1, 2, 3];
  readonly topologyOptions: { value: ProductTopology; label: string; hint: string }[] = [
    { value: 'SIMPLE', label: 'Produto Simples', hint: '1 código ERP único' },
    { value: 'FLAVOUR_ONLY', label: 'Apenas Sabores', hint: '1 código por sabor' },
    { value: 'PRESENTATION_ONLY', label: 'Apenas Apresentações', hint: '1 código por volume/peso' },
    { value: 'MATRIX', label: 'Sabor × Apresentação', hint: 'Matriz tamanho e sabor' }
  ];

  hasInactiveSkus = computed(() =>
    this.skuRowsSnapshot().some((row) => !!row?.erpInactive)
  );

  inactiveSkuCodes = computed(() =>
    this.skuRowsSnapshot()
      .filter((row) => !!row?.erpInactive && row?.erpCode)
      .map((row) => Number(row.erpCode))
  );

  previewFlavours = computed(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const row of this.skuRowsSnapshot()) {
      const val = this.sanitizeVariantText(row?.flavour);
      if (val && !seen.has(val.toLowerCase())) {
        seen.add(val.toLowerCase());
        result.push(val);
      }
    }
    return result;
  });

  previewPresentations = computed(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const row of this.skuRowsSnapshot()) {
      const val = this.sanitizeVariantText(row?.presentation);
      if (val && !seen.has(val.toLowerCase())) {
        seen.add(val.toLowerCase());
        result.push(val);
      }
    }
    return result;
  });

  missingDependenciesMessage = computed(() => {
    if (this.type() !== 'Produtos' || this.mode() === 'edit') return '';

    const noCat = this.categories().length === 0;
    const noSup = this.suppliers().length === 0;

    if (noCat && noSup) return 'Você precisa cadastrar Categorias e Fornecedores antes de criar um produto.';
    if (noCat) return 'Você precisa cadastrar pelo menos uma Categoria antes de criar um produto.';
    if (noSup) return 'Você precisa cadastrar pelo menos um Fornecedor antes de criar um produto.';

    return '';
  });

  roleOptions = ['USER', 'ADMIN', 'SELLER'];

  constructor() {
    effect(() => {
      const currentType = this.type();
      const currentMode = this.mode();
      const currentData = this.data();
      if (this.entityForm) {
        this.initializeFormState(currentType, currentMode, currentData);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.initializeFormState(this.type(), this.mode(), this.data());
    this.setupErpSearchSubscription();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.skuChangesSub?.unsubscribe();
  }

  get skusFormArray(): FormArray {
    return this.entityForm.get('skus') as FormArray;
  }

  get isImageValid(): boolean {
    if (this.type() === 'Usuários' || this.type() === 'Produtos') {
      return true;
    }

    if (this.mode() === 'create') {
      return this.selectedFile !== null;
    }
    return this.selectedFile !== null || this.imagePreview !== null;
  }

  private initializeFormState(
    entityType: 'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores' | 'Banners',
    mode: 'create' | 'edit',
    data: any
  ): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.submitAttempted = false;
    this.formError.set('');
    this.buildForm(entityType, mode);

    if (mode === 'edit' && data) {
      const initialData = { ...data };

      if (entityType === 'Produtos') {
        initialData.categoryName = data.category?.name || data.categoryName || '';
        initialData.supplierName = data.supplier?.name || data.supplierName || '';
        const detectedTopology: ProductTopology = data.topology || this.inferTopologyFromData(data);
        this.topology.set(detectedTopology);
        this.populateSkusFromData(data, detectedTopology);
      }

      if (entityType === 'Fornecedores') {
        initialData.isHighlighted = false;
      }

      this.entityForm.patchValue(initialData);

      const rawImg = data.imageUrl || data.imagePath || null;
      if (rawImg) {
        const baseUrl = environment.apiUrl.replace('/api', '');
        this.imagePreview = rawImg.startsWith('http')
          ? rawImg
          : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
      } else {
        this.imagePreview = null;
      }
    } else if (entityType === 'Produtos') {
      this.topology.set('SIMPLE');
      this.syncSkuSnapshot();
    }
  }

  private setupErpSearchSubscription(): void {
    this.searchSub?.unsubscribe();
    this.searchSub = this.erpSearchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((term) => {
        const q = (term || '').trim();
        if (q.length >= 2 || /^\d+$/.test(q)) {
          this.executeErpSearch(q);
        } else if (q.length === 0) {
          this.erpSearchResults.set([]);
          this.erpSearchError.set(null);
        }
      });
  }

  private buildForm(
    entityType: 'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores' | 'Banners',
    mode: 'create' | 'edit'
  ): void {
    this.skuChangesSub?.unsubscribe();

    const common = {
      name: ['', [Validators.required, Validators.minLength(3)]]
    };

    switch (entityType) {
      case 'Produtos': {
        const skusArray = this.fb.array([this.createSkuGroup()]);
        this.entityForm = this.fb.group({
          ...common,
          description: ['', [Validators.maxLength(5000)]],
          categoryName: ['', Validators.required],
          supplierName: ['', Validators.required],
          skus: skusArray
        });
        this.skuChangesSub = skusArray.valueChanges.subscribe(() => {
          this.syncSkuSnapshot();
        });
        this.syncSkuSnapshot();
        break;
      }

      case 'Usuários':
        this.entityForm = this.fb.group({
          ...common,
          email: [
            { value: '', disabled: mode === 'edit' },
            [Validators.required, Validators.email]
          ],
          role: ['USER', Validators.required]
        });
        break;

      case 'Fornecedores':
        this.entityForm = this.fb.group({
          ...common,
          isHighlighted: [false]
        });
        break;

      case 'Categorias de Produtos':
        this.entityForm = this.fb.group(common);
        break;

      case 'Banners':
        this.entityForm = this.fb.group({
          title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
          position: [1, [Validators.required, Validators.min(1)]],
          active: [true]
        });
        break;
    }
  }

  private createSkuGroup(initial?: Partial<SkuRowValue>): FormGroup {
    return this.fb.group({
      erpCode: [initial?.erpCode ?? null, [Validators.required, Validators.min(1)]],
      flavour: [initial?.flavour ?? null],
      presentation: [initial?.presentation ?? null],
      erpInactive: [initial?.erpInactive ?? false],
      erpDescription: [initial?.erpDescription ?? null],
      packageWarning: [initial?.packageWarning ?? null]
    });
  }

  private inferTopologyFromData(data: any): ProductTopology {
    const skus: any[] = Array.isArray(data?.skus) ? data.skus : [];
    if (skus.length > 0) {
      const hasFlavour = skus.some((s) => !!s.flavour);
      const hasPresentation = skus.some((s) => !!s.presentation);
      if (hasFlavour && hasPresentation) return 'MATRIX';
      if (hasFlavour) return 'FLAVOUR_ONLY';
      if (hasPresentation) return 'PRESENTATION_ONLY';
    }
    return 'SIMPLE';
  }

  private populateSkusFromData(data: any, topology: ProductTopology): void {
    const skusArray = this.skusFormArray;
    if (!skusArray) return;
    skusArray.clear();

    const incomingSkus: any[] = Array.isArray(data?.skus) ? data.skus : [];
    if (incomingSkus.length > 0) {
      for (const sku of incomingSkus) {
        skusArray.push(
          this.createSkuGroup({
            erpCode: sku.erpCode ?? null,
            flavour: sku.flavour ?? null,
            presentation: sku.presentation ?? null,
            erpInactive: !!sku.erpInactive,
            erpDescription: sku.erpDescription ?? null
          })
        );
      }
      if (incomingSkus.some((s) => !!s.erpInactiveConfirmed)) {
        this.allowInactiveErp.set(true);
      }
    } else {
      skusArray.push(
        this.createSkuGroup({
          erpCode: data?.primaryErpCode ?? null,
          flavour: topology === 'SIMPLE' ? null : (data?.flavours?.[0] ?? null),
          presentation: topology === 'SIMPLE' ? null : (data?.presentation?.[0] ?? null)
        })
      );
    }
    this.syncSkuSnapshot();
  }

  private syncSkuSnapshot(): void {
    if (this.type() !== 'Produtos' || !this.entityForm?.get('skus')) {
      this.skuRowsSnapshot.set([]);
      return;
    }
    const raw = (this.entityForm.get('skus') as FormArray).getRawValue() as SkuRowValue[];
    this.skuRowsSnapshot.set(raw || []);
  }

  setTopology(newTopology: ProductTopology): void {
    this.topology.set(newTopology);
    const skus = this.skusFormArray;
    if (!skus) return;

    if (skus.length === 0) {
      skus.push(this.createSkuGroup());
    }

    if (newTopology === 'SIMPLE') {
      while (skus.length > 1) {
        skus.removeAt(skus.length - 1);
      }
      skus.at(0).patchValue({ flavour: null, presentation: null });
    } else if (newTopology === 'FLAVOUR_ONLY') {
      for (let i = 0; i < skus.length; i++) {
        skus.at(i).patchValue({ presentation: null });
      }
    } else if (newTopology === 'PRESENTATION_ONLY') {
      for (let i = 0; i < skus.length; i++) {
        skus.at(i).patchValue({ flavour: null });
      }
    }
    this.syncSkuSnapshot();
  }

  addSkuRow(initial?: Partial<SkuRowValue>): void {
    const skus = this.skusFormArray;
    if (!skus) return;
    skus.push(this.createSkuGroup(initial));
    this.syncSkuSnapshot();
  }

  addFlavourRow(): void {
    const skus = this.skusFormArray;
    if (!skus) return;
    const current = this.topology();
    const next: ProductTopology =
      current === 'PRESENTATION_ONLY' || current === 'MATRIX' ? 'MATRIX' : 'FLAVOUR_ONLY';
    this.topology.set(next);

    if (skus.length === 1 && skus.at(0).get('flavour')?.value == null && skus.at(0).get('presentation')?.value == null) {
      skus.at(0).patchValue({ flavour: '', presentation: null });
      this.syncSkuSnapshot();
      return;
    }
    skus.push(this.createSkuGroup({ flavour: '', presentation: null, erpCode: null }));
    this.syncSkuSnapshot();
  }

  addPresentationRow(): void {
    const skus = this.skusFormArray;
    if (!skus) return;
    const current = this.topology();
    const next: ProductTopology =
      current === 'FLAVOUR_ONLY' || current === 'MATRIX' ? 'MATRIX' : 'PRESENTATION_ONLY';
    this.topology.set(next);

    if (skus.length === 1 && skus.at(0).get('flavour')?.value == null && skus.at(0).get('presentation')?.value == null) {
      skus.at(0).patchValue({ presentation: '', flavour: null });
      this.syncSkuSnapshot();
      return;
    }
    skus.push(this.createSkuGroup({ presentation: '', flavour: null, erpCode: null }));
    this.syncSkuSnapshot();
  }

  isFlavourRow(index: number): boolean {
    const ctrl = this.skusFormArray?.at(index);
    if (!ctrl) return false;
    const flav = ctrl.get('flavour')?.value;
    const pres = ctrl.get('presentation')?.value;
    if (flav !== null && flav !== undefined && pres === null) return true;
    if (this.topology() === 'MATRIX' && flav !== null && pres !== null) return true;
    return this.topology() === 'FLAVOUR_ONLY';
  }

  isPresentationRow(index: number): boolean {
    const ctrl = this.skusFormArray?.at(index);
    if (!ctrl) return false;
    const pres = ctrl.get('presentation')?.value;
    const flav = ctrl.get('flavour')?.value;
    if (pres !== null && pres !== undefined && flav === null) return true;
    if (this.topology() === 'MATRIX' && flav !== null && pres !== null) return true;
    return this.topology() === 'PRESENTATION_ONLY';
  }

  removeSkuRow(index: number): void {
    const skus = this.skusFormArray;
    if (!skus || skus.length <= 1) return;
    skus.removeAt(index);
    this.syncSkuSnapshot();
  }

  duplicateSkuRow(index: number): void {
    const skus = this.skusFormArray;
    if (!skus || index < 0 || index >= skus.length) return;
    const source = skus.at(index).getRawValue();
    skus.insert(
      index + 1,
      this.createSkuGroup({
        presentation: source.presentation ?? null,
        flavour: null,
        erpCode: null
      })
    );
    this.syncSkuSnapshot();
  }

  onSkuErpCodeBlur(index: number): void {
    const skus = this.skusFormArray;
    if (!skus || index < 0 || index >= skus.length) return;
    const rowGroup = skus.at(index) as FormGroup;
    const code = Number(rowGroup.get('erpCode')?.value);
    if (!Number.isInteger(code) || code <= 0) return;

    this.erpProductsService.getByErpCode(code, this.data()?.slug).subscribe({
      next: (res) => {
        if (res?.data) {
          rowGroup.patchValue({
            erpDescription: res.data.erpDescription,
            erpInactive: !!res.data.inativoPro
          });
          this.syncSkuSnapshot();
        }
      },
      error: () => {
        // Validação completa ocorre na submissão ou via busca ERP
      }
    });
  }

  toggleErpDrawer(): void {
    this.isErpDrawerOpen.update((open) => !open);
  }

  triggerManualErpSearch(): void {
    const q = this.erpSearchControl.value.trim();
    if (q.length >= 2 || /^\d+$/.test(q)) {
      this.executeErpSearch(q);
    }
  }

  clearErpSearch(): void {
    this.erpSearchControl.setValue('');
    this.erpSearchResults.set([]);
    this.erpSearchError.set(null);
  }

  private executeErpSearch(q: string): void {
    this.isErpSearching.set(true);
    this.erpSearchError.set(null);
    this.isErpDrawerOpen.set(true);

    const supplierName = this.entityForm?.get('supplierName')?.value;
    const supplierSlug = this.suppliers().find((s) => s.name === supplierName)?.slug;

    this.erpProductsService
      .search(q, {
        supplierSlug,
        includeInactive: true,
        excludeProductSlug: this.data()?.slug,
        page: 0,
        size: 20
      })
      .subscribe({
        next: (res) => {
          this.erpSearchResults.set(res?.data || []);
          this.isErpSearching.set(false);
        },
        error: (err) => {
          this.isErpSearching.set(false);
          this.erpSearchError.set(
            err?.error?.message || 'Não foi possível consultar o catálogo do ERP Atrio.'
          );
        }
      });
  }

  isErpItemBlocked(item: ErpCatalogItemRes): boolean {
    if (!item.alreadyMapped) return false;
    const currentSlug = this.data()?.slug;
    return !currentSlug || item.mappedProductSlug !== currentSlug;
  }

  isErpSelected(erpCode: number): boolean {
    return this.selectedErpCodes().includes(erpCode);
  }

  toggleErpSelection(erpCode: number): void {
    const found = this.erpSearchResults().find((item) => item.erpCode === erpCode);
    if (found && this.isErpItemBlocked(found)) {
      return;
    }

    this.selectedErpCodes.update((prev) =>
      prev.includes(erpCode) ? prev.filter((c) => c !== erpCode) : [...prev, erpCode]
    );
  }

  clearErpSelection(): void {
    this.selectedErpCodes.set([]);
  }

  importSelectedErpItems(): void {
    const codes = this.selectedErpCodes();
    if (codes.length === 0) return;

    this.isSuggestingVariants.set(true);
    this.erpProductsService
      .suggestVariants({
        erpCodes: codes,
        excludeProductSlug: this.data()?.slug
      })
      .subscribe({
        next: (res) => {
          this.isSuggestingVariants.set(false);
          const payload = res?.data;
          if (!payload) return;

          this.topology.set(payload.suggestedTopology || 'SIMPLE');
          const skus = this.skusFormArray;
          skus.clear();

          for (const item of payload.items || []) {
            skus.push(
              this.createSkuGroup({
                erpCode: item.erpCode,
                flavour: item.suggestedFlavour ?? null,
                presentation: item.suggestedPresentation ?? null,
                erpInactive: !!item.inativoPro,
                erpDescription: item.erpDescription ?? null,
                packageWarning: item.packageWarning ?? null
              })
            );
          }

          if (skus.length === 0) {
            skus.push(this.createSkuGroup());
          }

          this.selectedErpCodes.set([]);
          this.syncSkuSnapshot();
        },
        error: (err) => {
          this.isSuggestingVariants.set(false);
          this.formError.set(
            err?.error?.message || 'Erro ao importar sugestões de variações do ERP Atrio.'
          );
        }
      });
  }

  onFileSelected(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  private sanitizeVariantText(value: string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const cleaned = String(value).trim().replace(/\.+$/, '').trim();
    return cleaned.length > 0 ? cleaned : null;
  }

  onSubmit(): void {
    this.submitAttempted = true;
    this.formError.set('');

    if (!this.entityForm.valid || !this.isImageValid) {
      this.entityForm.markAllAsTouched();
      this.formError.set('Por favor, verifique os campos destacados em vermelho e tente novamente.');
      return;
    }

    const rawValue = this.entityForm.getRawValue();

    if (this.type() === 'Produtos') {
      const currentTopology = this.topology();
      const rawSkus: SkuRowValue[] = Array.isArray(rawValue.skus) ? rawValue.skus : [];

      if (rawSkus.length === 0) {
        this.formError.set('Informe pelo menos um item com código válido.');
        return;
      }

      const normalizedSkus: ProductSkuReq[] = [];
      const seenCodes = new Set<number>();
      const seenCombos = new Set<string>();

      for (let i = 0; i < rawSkus.length; i++) {
        const row = rawSkus[i];
        const erpCode = Number(row.erpCode);
        if (!Number.isInteger(erpCode) || erpCode <= 0) {
          this.formError.set(`O código na linha ${i + 1} deve ser um número inteiro positivo.`);
          return;
        }

        if (seenCodes.has(erpCode)) {
          this.formError.set(`O código '${erpCode}' foi informado mais de uma vez neste produto.`);
          return;
        }
        seenCodes.add(erpCode);

        const rowIsFlavour = this.isFlavourRow(i);
        const rowIsPres = this.isPresentationRow(i);

        const flavour = rowIsFlavour ? this.sanitizeVariantText(row.flavour) : null;
        const presentation = rowIsPres ? this.sanitizeVariantText(row.presentation) : null;

        if (rowIsFlavour && !flavour) {
          this.formError.set(`Informe o sabor na linha ${i + 1}.`);
          return;
        }

        if (rowIsPres && !presentation) {
          this.formError.set(`Informe a apresentação na linha ${i + 1}.`);
          return;
        }

        if (currentTopology !== 'SIMPLE') {
          const comboKey = `${(flavour || '').toLowerCase()}::${(presentation || '').toLowerCase()}`;
          if (seenCombos.has(comboKey)) {
            this.formError.set('Existem variações com a mesma combinação de sabor e apresentação neste produto.');
            return;
          }
          seenCombos.add(comboKey);
        }

        normalizedSkus.push({
          erpCode,
          flavour,
          presentation
        });
      }

      const selectedCategory = this.categories().find((c) => c.name === rawValue.categoryName);
      const selectedSupplier = this.suppliers().find((s) => s.name === rawValue.supplierName);

      const categorySlug =
        selectedCategory?.slug || this.data()?.category?.slug || this.data()?.categorySlug;
      const supplierSlug =
        selectedSupplier?.slug || this.data()?.supplier?.slug || this.data()?.supplierSlug;

      const finalPayload: Record<string, any> = {
        name: rawValue.name,
        description: rawValue.description,
        categorySlug,
        supplierSlug,
        skus: normalizedSkus
      };

      if (this.hasInactiveSkus() || this.allowInactiveErp()) {
        finalPayload['allowInactiveErp'] = this.allowInactiveErp();
      }

      this.save.emit({
        form: finalPayload,
        image: this.selectedFile || undefined
      });
      return;
    }

    const finalPayload = { ...rawValue };
    if (this.type() === 'Banners') {
      finalPayload.position = Number(finalPayload.position);
    }

    this.save.emit({
      form: finalPayload,
      image: this.selectedFile || undefined
    });
  }
}
