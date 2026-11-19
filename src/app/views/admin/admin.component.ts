import {
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { AdminNavComponent, AdminTab } from './components/admin-nav/admin-nav.component';
import { SellerRoutesComponent } from './components/seller-routes/seller-routes.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';
import { QuickCurationPanelComponent } from './components/quick-curation-panel/quick-curation-panel.component';

import { ModalEntityComponent } from './components/modal-entity/modal-entity.component';
import { ModalConfirmComponent } from './components/modal-confirm/modal-confirm.component';
import { ModalResponseComponent } from '../../shared/modal-response/modal-response.component';
import { ToastComponent } from '../../shared/toast/toast.component';

import { ProductsService } from '../../services/products/products.service';
import { ErpProductsService } from '../../services/erp-products/erp-products.service';
import { SuppliersService } from '../../services/suppliers/suppliers.service';
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';
import { UsersService } from '../../services/users/users.service';
import { AuthService } from '../../services/auth/auth.service';

import { TableColumn } from './types/TableColumn.interface';
import { TokenService } from '../../services/token/token.service';
import { environment } from '../../../environments/environment';
import { BannersService } from '../../services/banners/banners.service';
import { RoutesTutorialModalComponent } from './components/routes-tutorial-modal/routes-tutorial-modal.component';
import { CurationPendingItem } from '../../types/erp/erp.interface';
import { ErpMappingStatus } from '../../types/products/ProductSku.interface';

const CATEGORY_PALETTE_SIZE = 8;

const CURATION_FILTER_OPTIONS = [
  { label: 'Completo', value: 'COMPLETE' },
  { label: 'Incompleto', value: 'PENDING_IMAGE' }
];

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    AdminNavComponent,
    SellerRoutesComponent,
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    DynamicTableComponent,
    QuickCurationPanelComponent,
    ModalEntityComponent,
    ModalConfirmComponent,
    ModalResponseComponent,
    ToastComponent,
    RoutesTutorialModalComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);
  private readonly erpProductsService = inject(ErpProductsService);
  private readonly suppliersService = inject(SuppliersService);
  private readonly categoryService = inject(ProductCategoriesService);
  private readonly usersService = inject(UsersService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly tokenService = inject(TokenService);
  private readonly bannersService = inject(BannersService);

  readonly isRoutesTutorialOpen = signal<boolean>(false);

  pageTitle = signal<AdminTab>('Produtos');

  isEntityModalOpen = signal(false);
  isConfirmModalOpen = signal(false);
  confirmMode = signal<'delete' | 'ignore-curation'>('delete');
  cascadeItems = signal<any[] | undefined>(undefined);
  modalMode = signal<'create' | 'edit'>('create');
  selectedItem = signal<any>(null);
  focusImageUpload = signal<boolean>(false);
  currentUserRole = signal<'ADMIN' | 'USER' | 'SELLER' | null>(null);

  curationPendingItems = signal<CurationPendingItem[]>([]);
  isCurationLoading = signal<boolean>(false);
  curationError = signal<string | null>(null);
  curationBusySlug = signal<string | null>(null);

  selectedErpStatuses = signal<ErpMappingStatus[]>([]);

  readonly erpStatusPills: { value: ErpMappingStatus | null; label: string; icon: string }[] = [
    { value: null, label: 'Todos', icon: 'fa-solid fa-layer-group' },
    { value: 'UNMAPPED', label: 'Sem Código', icon: 'fa-solid fa-circle-exclamation' },
    { value: 'COMPLETE', label: 'Completo', icon: 'fa-solid fa-circle-check' },
    { value: 'INACTIVE_ALERT', label: 'Alerta Inativo ERP', icon: 'fa-solid fa-triangle-exclamation' }
  ];

  isSaving = signal(false);

  isResponseModalOpen = signal(false);
  responseStatus = signal<number>(200);
  responseMessage = signal<string>('');

  isToastOpen = signal(false);
  toastMessage = signal<string>('');

  search = new FormControl('');
  orderBy = new FormControl('Nome (A-Z)');

  currentPage = signal<number>(0);
  activeFilters = signal<Record<string, string[]>>({});

  canAccessCuration = computed(() => {
    const role = this.currentUserRole();
    return role === 'ADMIN' || role === 'USER';
  });

  orderOptions = computed(() => {
    const title = this.pageTitle();
    switch (title) {
      case 'Produtos':
        return ['Nome (A-Z)', 'Nome (Z-A)', 'Categoria (A-Z)', 'Categoria (Z-A)', 'Fornecedor (A-Z)', 'Fornecedor (Z-A)'];
      case 'Usuários':
        return ['Nome (A-Z)', 'Nome (Z-A)', 'E-mail (A-Z)', 'E-mail (Z-A)'];
      case 'Categorias de Produtos':
      case 'Fornecedores':
        return ['Nome (A-Z)', 'Nome (Z-A)'];
      case 'Banners':
        return ['Posição (Menor-Maior)', 'Posição (Maior-Menor)', 'Mais recentes'];
      default:
        return [];
    }
  });

  totalElements = computed(() => {
    if (this.pageTitle() === 'Alterar Senha' || this.pageTitle() === 'Rotas') return 0;

    const sourceMap: Record<string, any> = {
      'Produtos': this.productsService.adminProducts(),
      'Fornecedores': this.suppliersService.paginatedSuppliers(),
      'Categorias de Produtos': this.categoryService.paginatedCategories(),
      'Usuários': this.usersService.paginatedUsers(),
      'Banners': this.bannersService.paginatedBanners()
    };

    const data = sourceMap[this.pageTitle()];
    return data?.totalElements || 0;
  });

  /**
   * Cada categoria recebe uma cor da paleta (--cat-1..--cat-8), na ordem alfabética do slug,
   * o que garante cores distintas enquanto houver até 8 categorias.
   */
  private categoryColorIndexBySlug = computed(() => {
    const slugs = this.categoryService
      .productCategories()
      .map((c) => c.slug)
      .sort((a, b) => a.localeCompare(b));
    return new Map(slugs.map((slug, index) => [slug, (index % CATEGORY_PALETTE_SIZE) + 1]));
  });

  /** Indica que a página atual da tabela está sendo buscada na API (exibe skeleton). */
  isTableLoading = computed(() => {
    const loadingMap: Record<string, boolean> = {
      'Produtos': this.productsService.isAdminProductsLoading(),
      'Fornecedores': this.suppliersService.isPaginatedLoading(),
      'Categorias de Produtos': this.categoryService.isPaginatedLoading(),
      'Usuários': this.usersService.isPaginatedLoading(),
      'Banners': this.bannersService.isPaginatedLoading()
    };
    return loadingMap[this.pageTitle()] ?? false;
  });

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ]
      ],
      confirmPassword: ['', Validators.required]
    },
    { validators: this.passwordsMatchValidator }
  );

  constructor() {
    effect(
      () => {
        const title = this.pageTitle();
        untracked(() => {
          this.orderBy.setValue('Nome (A-Z)', { emitEvent: false });
          this.currentPage.set(0);
          this.activeFilters.set({});
          this.selectedErpStatuses.set([]);
          this.loadData();
        });
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const anyModal =
        this.isEntityModalOpen() ||
        this.isConfirmModalOpen() ||
        this.isResponseModalOpen() ||
        this.isRoutesTutorialOpen();
      if (typeof document !== 'undefined') {
        if (anyModal) {
          document.body.classList.add('modal-open-lock');
        } else {
          document.body.classList.remove('modal-open-lock');
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open-lock');
    }
  }

  ngOnInit(): void {
    const cachedRole = this.tokenService.getUserRole();
    if (cachedRole) {
      this.currentUserRole.set(cachedRole);
      if (cachedRole === 'SELLER') {
        this.pageTitle.set('Rotas');
      } else {
        this.categoryService.getAll();
        this.suppliersService.getAll();
        this.bannersService.getActive();
        this.loadCurationPending();
      }
    }

    const email = this.tokenService.getUserEmail();
    if (email) {
      this.usersService.getByEmail(email).subscribe({
        next: (user) => {
          this.currentUserRole.set(user.role);
          if (user.role === 'SELLER') {
            this.pageTitle.set('Rotas');
          } else {
            this.categoryService.getAll();
            this.suppliersService.getAll();
            this.bannersService.getActive();
            this.loadCurationPending();
          }
        },
        error: (err) => console.error('Failed to load user role', err)
      });
    } else if (!cachedRole) {
      this.categoryService.getAll();
      this.suppliersService.getAll();
      this.bannersService.getActive();
      this.loadCurationPending();
    }

    this.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage.set(0);
        this.loadData();
      });

    this.orderBy.valueChanges.subscribe(() => {
      this.currentPage.set(0);
      this.loadData();
    });
  }

  loadCurationPending(): void {
    const role = this.currentUserRole();
    if (role === 'SELLER') {
      return;
    }

    this.isCurationLoading.set(true);
    this.curationError.set(null);

    this.erpProductsService.getCurationPending().subscribe({
      next: (res) => {
        this.curationPendingItems.set(res?.data || []);
        this.isCurationLoading.set(false);
      },
      error: (err) => {
        this.isCurationLoading.set(false);
        this.curationError.set(
          err?.error?.message || 'Falha ao carregar fila de curadoria.'
        );
      }
    });
  }

  onSelectCurationItem(item: CurationPendingItem): void {
    this.modalMode.set('edit');
    this.focusImageUpload.set(true);
    this.selectedItem.set({
      ...item,
      category: { name: item.categoryName, slug: item.categorySlug },
      supplier: { name: item.supplierName, slug: item.supplierSlug }
    });
    this.isEntityModalOpen.set(true);
  }

  onIgnoreCurationItem(item: CurationPendingItem): void {
    this.selectedItem.set(item);
    this.confirmMode.set('ignore-curation');
    this.cascadeItems.set(undefined);
    this.isConfirmModalOpen.set(true);
  }

  onTabChange(tab: AdminTab): void {
    if (this.currentUserRole() === 'SELLER' && tab !== 'Rotas' && tab !== 'Alterar Senha') {
      return;
    }
    if (this.currentUserRole() === 'USER' && (tab === 'Usuários' || tab === 'Rotas')) {
      return;
    }
    this.pageTitle.set(tab);
  }

  loadData(): void {
    if (
      this.currentUserRole() === 'SELLER' &&
      this.pageTitle() !== 'Rotas' &&
      this.pageTitle() !== 'Alterar Senha'
    ) {
      this.pageTitle.set('Rotas');
      return;
    }
    if (
      this.currentUserRole() === 'USER' &&
      (this.pageTitle() === 'Usuários' || this.pageTitle() === 'Rotas')
    ) {
      this.pageTitle.set('Produtos');
      return;
    }
    if (this.pageTitle() === 'Alterar Senha' || this.pageTitle() === 'Rotas') return;

    const term = this.search.value || '';
    const orderValue = this.orderBy.value || 'Nome (A-Z)';

    let sortField = 'name';
    let dir = 'ASC';

    if (orderValue.includes('(Z-A)') || orderValue.includes('(Maior-Menor)')) {
      dir = 'DESC';
    }

    if (orderValue.startsWith('Categoria')) {
      sortField = 'category.name';
    } else if (orderValue.startsWith('Fornecedor')) {
      sortField = 'supplier.name';
    } else if (orderValue.startsWith('E-mail')) {
      sortField = 'email';
    } else if (orderValue.startsWith('Posição')) {
      sortField = 'position';
    } else if (orderValue === 'Mais recentes') {
      sortField = 'createdAt';
      dir = 'DESC';
    } else {
      sortField = 'name';
    }

    const actions: Record<string, () => void> = {
      'Produtos': () => {
        const categories = this.activeFilters()['categoryName'] || [];
        const suppliers = this.activeFilters()['supplierName'] || [];
        // O backend aceita um único curationStatus: com ambas as opções marcadas
        // equivale a "sem filtro", então não enviamos o parâmetro.
        const selectedStatuses = this.activeFilters()['curationStatus'] || [];
        const curationStatuses = (
          selectedStatuses.length >= CURATION_FILTER_OPTIONS.length ? [] : selectedStatuses
        ) as any[];
        this.productsService.getPaginated(
          term,
          this.currentPage(),
          sortField,
          dir,
          categories,
          suppliers,
          [],
          true,
          curationStatuses
        );
      },
      'Fornecedores': () =>
        this.suppliersService.getPaginated(term, this.currentPage(), sortField, dir),
      'Categorias de Produtos': () =>
        this.categoryService.getPaginated(term, this.currentPage(), sortField, dir),
      'Usuários': () =>
        this.usersService.getPaginated(term, this.currentPage(), sortField, dir),
      'Banners': () =>
        this.bannersService.getPaginated(term, this.currentPage(), sortField, dir)
    };

    actions[this.pageTitle()]?.();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadData();
  }

  onFilterApply(event: { key: string; values: string[] }): void {
    this.activeFilters.update((filters) => ({
      ...filters,
      [event.key]: event.values
    }));
    this.currentPage.set(0);
    this.loadData();
  }

  onErpStatusFilterChange(statuses: ErpMappingStatus[]): void {
    this.selectedErpStatuses.set(statuses);
    this.currentPage.set(0);
    this.loadData();
  }

  onErpStatusPillClick(status: ErpMappingStatus | null): void {
    if (status === null) {
      this.onErpStatusFilterChange([]);
    } else {
      this.onErpStatusFilterChange([status]);
    }
  }

  isErpPillActive(status: ErpMappingStatus | null): boolean {
    const current = this.selectedErpStatuses();
    if (status === null) {
      return current.length === 0;
    }
    return current.includes(status);
  }

  searchValue = toSignal(this.search.valueChanges, { initialValue: this.search.value });
  orderValueSignal = toSignal(this.orderBy.valueChanges, { initialValue: this.orderBy.value });

  hasActiveFilters = computed(() => {
    const hasSearch = !!this.searchValue();
    const hasOrder = this.orderValueSignal() !== 'Nome (A-Z)';
    const filters = this.activeFilters();
    const hasTableFilters = Object.values(filters).some((arr) => arr && arr.length > 0);
    const hasErpFilter = this.selectedErpStatuses().length > 0;
    return hasSearch || hasOrder || hasTableFilters || hasErpFilter;
  });

  clearFilters(): void {
    this.search.setValue('', { emitEvent: false });
    this.orderBy.setValue('Nome (A-Z)', { emitEvent: false });
    this.activeFilters.set({});
    this.selectedErpStatuses.set([]);
    this.currentPage.set(0);
    this.loadData();
  }

  disableUserActions = computed(() => {
    return this.pageTitle() === 'Usuários' && this.currentUserRole() !== 'ADMIN';
  });

  columns = computed<TableColumn[]>(() => {
    if (this.pageTitle() === 'Alterar Senha' || this.pageTitle() === 'Rotas') return [];

    const cols: Record<string, TableColumn[]> = {
      'Usuários': [
        { label: 'Nome', key: 'name', type: 'text' },
        { label: 'E-mail', key: 'email', type: 'text' },
        { label: 'Cargo', key: 'role', type: 'badge' },
        { label: 'Ações', key: '', type: 'actions' }
      ],
      'Produtos': [
        { label: 'Imagem', key: 'imageUrl', type: 'image' },
        { label: 'Código', key: 'erpSummary', type: 'erp-code' },
        { label: 'Nome', key: 'name', type: 'text' },
        {
          label: 'Categoria',
          key: 'categoryName',
          type: 'category',
          filterable: true,
          filterOptions: this.categoryService
            .productCategories()
            .map((c) => ({ label: c.name, value: c.slug }))
        },
        {
          label: 'Fornecedor',
          key: 'supplierName',
          type: 'text',
          filterable: true,
          filterOptions: this.suppliersService
            .suppliers()
            .map((s) => ({ label: s.name, value: s.slug }))
        },
        {
          label: 'Status',
          key: 'curationStatus',
          type: 'erp-status',
          filterable: true,
          filterOptions: CURATION_FILTER_OPTIONS
        },
        { label: 'Ações', key: '', type: 'actions' }
      ],
      'Categorias de Produtos': [
        { label: 'Imagem', key: 'imageUrl', type: 'image' },
        { label: 'Nome', key: 'name', type: 'text' },
        { label: 'Ações', key: '', type: 'actions' }
      ],
      'Fornecedores': [
        { label: 'Imagem', key: 'imageUrl', type: 'image' },
        { label: 'Nome', key: 'name', type: 'text' },
        { label: 'Ações', key: '', type: 'actions' }
      ],
      'Banners': [
        { label: 'Imagem', key: 'imageUrl', type: 'image' },
        { label: 'Título', key: 'title', type: 'text' },
        { label: 'Posição', key: 'position', type: 'text' },
        { label: 'Ativo', key: 'active', type: 'badge' },
        { label: 'Ações', key: '', type: 'actions' }
      ]
    };
    return cols[this.pageTitle()] || [];
  });

  tableData = computed(() => {
    if (this.pageTitle() === 'Alterar Senha' || this.pageTitle() === 'Rotas') return [];

    const sourceMap: Record<string, any> = {
      'Produtos': this.productsService.adminProducts(),
      'Fornecedores': this.suppliersService.paginatedSuppliers(),
      'Categorias de Produtos': this.categoryService.paginatedCategories(),
      'Usuários': this.usersService.paginatedUsers(),
      'Banners': this.bannersService.paginatedBanners()
    };

    const data = sourceMap[this.pageTitle()];
    if (!data || !data.content) return [];

    const baseUrl = environment.imagesBaseUrl;

    return data.content.map((item: any) => {
      let formattedImageUrl = item.imageUrl || item.imagePath || null;

      if (formattedImageUrl) {
        formattedImageUrl = formattedImageUrl.replace(/\\/g, '/');

        if (!formattedImageUrl.startsWith('http')) {
          formattedImageUrl = `${baseUrl}${formattedImageUrl.startsWith('/') ? '' : '/'}${formattedImageUrl}`;
        }
      }

      return {
        ...item,
        imageUrl: formattedImageUrl,
        categoryName: item.category?.name ?? item.categoryName,
        categoryColorIndex:
          this.categoryColorIndexBySlug().get(item.category?.slug ?? item.categorySlug) ?? 1,
        supplierName: item.supplier?.name ?? item.supplierName
      };
    });
  });

  openAddModal(): void {
    this.modalMode.set('create');
    this.focusImageUpload.set(false);
    this.selectedItem.set(null);
    this.isEntityModalOpen.set(true);
  }

  onEdit(item: any): void {
    this.modalMode.set('edit');
    this.focusImageUpload.set(false);
    this.selectedItem.set(item);
    this.isEntityModalOpen.set(true);
  }

  onDelete(item: any): void {
    this.selectedItem.set(item);
    this.confirmMode.set('delete');
    this.cascadeItems.set(undefined);
    this.isConfirmModalOpen.set(true);

    if (this.pageTitle() === 'Fornecedores' && item.count > 0) {
      this.productsService.getProductsBySupplier(item.slug).subscribe({
        next: (res) => this.cascadeItems.set(res.content),
        error: (err) => console.error('Erro ao carregar produtos vinculados', err)
      });
    }
  }

  showFeedback(status: number, message: string): void {
    if (status >= 200 && status < 300) {
      this.toastMessage.set(message);
      this.isToastOpen.set(true);
      setTimeout(() => {
        this.isToastOpen.set(false);
      }, 4000);
    } else {
      this.responseStatus.set(status);
      this.responseMessage.set(message);
      this.isResponseModalOpen.set(true);
    }
  }

  handleSave(payload: { form: any; image?: File }): void {
    const type = this.pageTitle();
    const isEdit = this.modalMode() === 'edit';
    const id =
      type === 'Produtos'
        ? this.selectedItem()?.slug || this.selectedItem()?.id
        : this.selectedItem()?.id || this.selectedItem()?.slug || this.selectedItem()?.email;

    let request$;

    switch (type) {
      case 'Produtos': {
        const prodData = { ...payload.form };
        request$ = isEdit
          ? this.productsService.update(id, prodData, payload.image || null)
          : this.productsService.create(prodData, payload.image || null);
        break;
      }

      case 'Fornecedores':
        request$ = isEdit
          ? this.suppliersService.update(id, payload.form, payload.image || null)
          : this.suppliersService.create(payload.form, payload.image!);
        break;

      case 'Categorias de Produtos':
        request$ = isEdit
          ? this.categoryService.update(id, payload.form, payload.image || null)
          : this.categoryService.create(payload.form, payload.image!);
        break;

      case 'Usuários':
        request$ = isEdit
          ? this.usersService.update(id, payload.form)
          : this.authService.register(payload.form);
        break;

      case 'Banners':
        request$ = isEdit
          ? this.bannersService.update(id, payload.form, payload.image || null)
          : this.bannersService.create(payload.form, payload.image!);
        break;
    }

    this.isSaving.set(true);
    request$?.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isEntityModalOpen.set(false);
        this.focusImageUpload.set(false);

        if (type === 'Produtos' && isEdit && id && payload.image) {
          this.curationPendingItems.update((items) =>
            items.filter((item) => item.slug !== id)
          );
        }

        this.loadData();

        if (type === 'Usuários') {
          const email = this.tokenService.getUserEmail();
          if (email) {
            this.usersService.getByEmail(email).subscribe({
              next: (user) => this.currentUserRole.set(user.role),
              error: (err) => console.error('Failed to load user role', err)
            });
          }
        }

        const msgSucesso = isEdit ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!';
        this.showFeedback(200, msgSucesso);
      },
      error: (err) => {
        this.isSaving.set(false);
        const status = err.status;
        if (status === 0) {
          this.showFeedback(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          const msgErro =
            err.error?.message || 'Ocorreu um erro interno. Verifique os dados.';
          this.showFeedback(status || 500, msgErro);
        }
      }
    });
  }

  confirmDelete(reason?: string): void {
    if (this.confirmMode() === 'ignore-curation') {
      const slug = this.selectedItem()?.slug;
      if (!slug) return;
      this.curationBusySlug.set(slug);
      this.isSaving.set(true);

      this.erpProductsService.ignorePending(slug, reason).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.curationBusySlug.set(null);
          this.isConfirmModalOpen.set(false);
          this.curationPendingItems.update((items) =>
            items.filter((item) => item.slug !== slug)
          );
          this.loadData();
          this.showFeedback(200, 'Produto ocultado do catálogo público.');
        },
        error: (err) => {
          this.isSaving.set(false);
          this.curationBusySlug.set(null);
          this.isConfirmModalOpen.set(false);
          const msgErro =
            err?.error?.message || 'Erro ao ocultar produto da curadoria.';
          this.showFeedback(err?.status || 500, msgErro);
        }
      });
      return;
    }

    const id =
      this.selectedItem()?.id || this.selectedItem()?.slug || this.selectedItem()?.email;
    let delete$;

    switch (this.pageTitle()) {
      case 'Produtos':
        delete$ = this.productsService.delete(id);
        break;
      case 'Fornecedores': {
        const shouldCascade = !!(this.cascadeItems() && this.cascadeItems()!.length > 0);
        delete$ = this.suppliersService.delete(id, shouldCascade);
        break;
      }
      case 'Categorias de Produtos':
        delete$ = this.categoryService.delete(id);
        break;
      case 'Usuários':
        delete$ = this.usersService.delete(id);
        break;
      case 'Banners':
        delete$ = this.bannersService.delete(id);
        break;
    }

    this.isSaving.set(true);
    delete$?.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isConfirmModalOpen.set(false);
        this.loadData();
        this.showFeedback(200, 'Excluído permanentemente com sucesso!');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.isConfirmModalOpen.set(false);
        const status = err.status;
        if (status === 0) {
          this.showFeedback(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          const msgErro =
            err.error?.message ||
            'Erro ao tentar excluir. O registro pode estar vinculado a outras tabelas.';
          this.showFeedback(status || 500, msgErro);
        }
      }
    });
  }

  passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const newPassword = this.passwordForm.get('newPassword')?.value;
    const currentUserEmail = this.tokenService.getUserEmail();

    if (!currentUserEmail) {
      this.showFeedback(401, 'Sessão inválida. Por favor, faça login novamente.');
      return;
    }

    this.isSaving.set(true);
    this.usersService.updatePassword(currentUserEmail, { password: newPassword }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showFeedback(200, 'Senha atualizada com sucesso!');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isSaving.set(false);
        const status = err.status;
        if (status === 0) {
          this.showFeedback(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          const msgErro =
            err.error?.message || 'Erro ao atualizar a senha. Verifique seus dados.';
          this.showFeedback(status || 500, msgErro);
        }
      }
    });
  }
}
