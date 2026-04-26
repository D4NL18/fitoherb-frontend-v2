import { Component, computed, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';

import { ModalEntityComponent } from './components/modal-entity/modal-entity.component';
import { ModalConfirmComponent } from './components/modal-confirm/modal-confirm.component';
import { ModalResponseComponent } from '../../shared/modal-response/modal-response.component';

import { ProductsService } from '../../services/products/products.service';
import { SuppliersService } from '../../services/suppliers/suppliers.service';
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';
import { UsersService } from '../../services/users/users.service';
import { AuthService } from '../../services/auth/auth.service';

import { TableColumn } from './types/TableColumn.interface';
import { TokenService } from '../../services/token/token.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    AdminNavComponent,
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    SelectComponent,
    ButtonComponent,
    DynamicTableComponent,
    ModalEntityComponent,
    ModalConfirmComponent,
    ModalResponseComponent
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private productsService = inject(ProductsService);
  private suppliersService = inject(SuppliersService);
  private categoryService = inject(ProductCategoriesService);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private tokenService = inject(TokenService);

  pageTitle = signal<'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores' | 'Alterar Senha'>('Produtos');

  isEntityModalOpen = signal(false);
  isConfirmModalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedItem = signal<any>(null);

  isResponseModalOpen = signal(false);
  responseStatus = signal<number>(200);
  responseMessage = signal<string>('');

  search = new FormControl('');
  orderBy = new FormControl('Nome (A-Z)');

  currentPage = signal<number>(0);

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
      default:
        return [];
    }
  });

  totalElements = computed(() => {
    if (this.pageTitle() === 'Alterar Senha') return 0;

    const sourceMap: Record<string, any> = {
      'Produtos': this.productsService.adminProducts(),
      'Fornecedores': this.suppliersService.paginatedSuppliers(),
      'Categorias de Produtos': this.categoryService.paginatedCategories(),
      'Usuários': this.usersService.paginatedUsers()
    };

    const data = sourceMap[this.pageTitle()];
    return data?.totalElements || 0;
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordsMatchValidator });

  constructor() {
    effect(() => {
      this.orderBy.setValue('Nome (A-Z)', { emitEvent: false });
      this.currentPage.set(0);
      this.loadData();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.categoryService.getAll();
    this.suppliersService.getAll();

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

  loadData() {
    if (this.pageTitle() === 'Alterar Senha') return;

    const term = this.search.value || '';
    const orderValue = this.orderBy.value || 'Nome (A-Z)';

    let sortField = 'name';
    let dir = 'ASC';

    if (orderValue.includes('(Z-A)')) {
      dir = 'DESC';
    }

    if (orderValue.startsWith('Categoria')) {
      sortField = 'category.name';
    } else if (orderValue.startsWith('Fornecedor')) {
      sortField = 'supplier.name';
    } else if (orderValue.startsWith('E-mail')) {
      sortField = 'email';
    } else {
      sortField = 'name';
    }

    const actions: Record<string, () => void> = {
      'Produtos': () => this.productsService.getPaginated(term, this.currentPage(), sortField, dir),
      'Fornecedores': () => this.suppliersService.getPaginated(term, this.currentPage(), sortField, dir),
      'Categorias de Produtos': () => this.categoryService.getPaginated(term, this.currentPage(), sortField, dir),
      'Usuários': () => this.usersService.getPaginated(term, this.currentPage(), sortField, dir)
    };

    actions[this.pageTitle()]?.();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadData();
  }

  columns = computed<TableColumn[]>(() => {
    if (this.pageTitle() === 'Alterar Senha') return [];

    const cols: Record<string, TableColumn[]> = {
      'Usuários': [
        { label: 'Nome', key: 'name', type: 'text' },
        { label: 'E-mail', key: 'email', type: 'text' },
        { label: 'Cargo', key: 'role', type: 'badge' },
        { label: 'Ações', key: '', type: 'actions' }
      ],
      'Produtos': [
        { label: 'Imagem', key: 'imageUrl', type: 'image' },
        { label: 'Nome', key: 'name', type: 'text' },
        { label: 'Categoria', key: 'categoryName', type: 'badge' },
        { label: 'Fornecedor', key: 'supplierName', type: 'text' },
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
        { label: 'Destaque', key: 'isHighlighted', type: 'badge' },
        { label: 'Ações', key: '', type: 'actions' }
      ]
    };
    return cols[this.pageTitle()] || [];
  });

  tableData = computed(() => {
    if (this.pageTitle() === 'Alterar Senha') return [];

    const sourceMap: Record<string, any> = {
      'Produtos': this.productsService.adminProducts(),
      'Fornecedores': this.suppliersService.paginatedSuppliers(),
      'Categorias de Produtos': this.categoryService.paginatedCategories(),
      'Usuários': this.usersService.paginatedUsers()
    };

    const data = sourceMap[this.pageTitle()];
    if (!data || !data.content) return [];

    const baseUrl = environment.apiUrl.replace('/api', '');

    return data.content.map((item: any) => {
      let formattedImageUrl = item.imageUrl;
      if (formattedImageUrl && !formattedImageUrl.startsWith('http')) {
        formattedImageUrl = `${baseUrl}${formattedImageUrl.startsWith('/') ? '' : '/'}${formattedImageUrl}`;
      }

      return {
        ...item,
        imageUrl: formattedImageUrl,
        categoryName: item.category?.name,
        supplierName: item.supplier?.name
      };
    });
  });

  openAddModal() {
    this.modalMode.set('create');
    this.selectedItem.set(null);
    this.isEntityModalOpen.set(true);
  }

  onEdit(item: any) {
    this.modalMode.set('edit');
    this.selectedItem.set(item);
    this.isEntityModalOpen.set(true);
  }

  onDelete(item: any) {
    this.selectedItem.set(item);
    this.isConfirmModalOpen.set(true);
  }

  showFeedback(status: number, message: string) {
    this.responseStatus.set(status);
    this.responseMessage.set(message);
    this.isResponseModalOpen.set(true);
  }

  handleSave(payload: { form: any; image?: File }) {
    const type = this.pageTitle();
    const isEdit = this.modalMode() === 'edit';
    const id = this.selectedItem()?.slug || this.selectedItem()?.email;

    let request$;

    switch (type) {
      case 'Produtos':
        const prodData = { ...payload.form };
        if (typeof prodData.flavours === 'string' && prodData.flavours.trim() !== '') {
          prodData.flavours = prodData.flavours.split(',').map((s: string) => s.trim());
        } else if (!prodData.flavours) {
          prodData.flavours = [];
        }
        request$ = isEdit
          ? this.productsService.update(id, prodData, payload.image || null)
          : this.productsService.create(prodData, payload.image!);
        break;

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
    }

    request$?.subscribe({
      next: () => {
        this.isEntityModalOpen.set(false);
        this.loadData();
        const msgSucesso = isEdit ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!';
        this.showFeedback(200, msgSucesso);
      },
      error: (err) => {
        const status = err.status || 500;
        const msgErro = err.error?.message || 'Ocorreu um erro interno. Verifique os dados.';
        this.showFeedback(status, msgErro);
      },
    });
  }

  confirmDelete() {
    const id = this.selectedItem()?.slug || this.selectedItem()?.email;
    let delete$;

    switch (this.pageTitle()) {
      case 'Produtos':
        delete$ = this.productsService.delete(id);
        break;
      case 'Fornecedores':
        delete$ = this.suppliersService.delete(id);
        break;
      case 'Categorias de Produtos':
        delete$ = this.categoryService.delete(id);
        break;
      case 'Usuários':
        delete$ = this.usersService.delete(id);
        break;
    }

    delete$?.subscribe({
      next: () => {
        this.isConfirmModalOpen.set(false);
        this.loadData();
        this.showFeedback(200, 'Excluído permanentemente com sucesso!');
      },
      error: (err) => {
        this.isConfirmModalOpen.set(false);
        const status = err.status || 500;
        const msgErro = err.error?.message || 'Erro ao tentar excluir. O registro pode estar vinculado a outras tabelas.';
        this.showFeedback(status, msgErro);
      },
    });
  }

  passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('newPassword')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  changePassword() {
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

    this.usersService.updatePassword(currentUserEmail, { password: newPassword }).subscribe({
      next: () => {
        this.showFeedback(200, 'Senha atualizada com sucesso!');
        this.passwordForm.reset();
      },
      error: (err) => {
        const status = err.status || 500;
        const msg = err.error?.message || 'Erro ao atualizar a senha. Verifique seus dados.';
        this.showFeedback(status, msg);
      }
    });
  }
}