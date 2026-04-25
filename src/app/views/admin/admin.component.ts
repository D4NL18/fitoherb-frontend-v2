import {
  Component,
  computed,
  inject,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';

import { ModalEntityComponent } from './components/modal-entity/modal-entity.component';
import { ModalConfirmComponent } from './components/modal-confirm/modal-confirm.component';

import { ProductsService } from '../../services/products/products.service';
import { SuppliersService } from '../../services/suppliers/suppliers.service';
import { ProductCategoriesService } from '../../services/product-categories/product-categories.service';
import { UsersService } from '../../services/users/users.service';
import { AuthService } from '../../services/auth/auth.service';

import { TableColumn } from './types/TableColumn.interface';
import { ModalResponseComponent } from '../../shared/modal-response/modal-response.component';

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
    ModalResponseComponent,
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

  pageTitle = signal<
    'Usuários' | 'Produtos' | 'Categorias de Produtos' | 'Fornecedores'
  >('Produtos');

  isEntityModalOpen = signal(false);
  isConfirmModalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedItem = signal<any>(null);

  isResponseModalOpen = signal(false);
  responseStatus = signal<number>(200);
  responseMessage = signal<string>('');

  search = new FormControl('');
  orderBy = new FormControl('A-Z');
  orderOptions = ['A-Z', 'Z-A'];

  constructor() {
    effect(
      () => {
        this.loadData();
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit() {
    this.categoryService.getAll();
    this.suppliersService.getAll();

    this.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.loadData());
  }

  loadData() {
    const term = this.search.value || '';
    const dir = this.orderBy.value === 'A-Z' ? 'ASC' : 'DESC';

    const actions: Record<string, () => void> = {
      Produtos: () => this.productsService.getPaginated(term, 0, 'name', dir),
      Fornecedores: () =>
        this.suppliersService.getPaginated(term, 0, 'name', dir),
      'Categorias de Produtos': () =>
        this.categoryService.getPaginated(term, 0, 'name', dir),
      Usuários: () => this.usersService.getPaginated(term, 0, 'name', dir),
    };
    actions[this.pageTitle()]?.();
  }

  columns = computed<TableColumn[]>(() => {
    const cols: Record<string, TableColumn[]> = {
      Usuários: [
        { label: 'Nome', key: 'name', type: 'text' },
        { label: 'E-mail', key: 'email', type: 'text' },
        { label: 'Cargo', key: 'role', type: 'badge' },
        { label: 'Ações', key: '', type: 'actions' },
      ],
      Produtos: [
        { label: 'Imagem', key: 'imageUrl', type: 'image' },
        { label: 'Nome', key: 'name', type: 'text' },
        { label: 'Categoria', key: 'categoryName', type: 'badge' },
        { label: 'Fornecedor', key: 'supplierName', type: 'text' },
        { label: 'Ações', key: '', type: 'actions' },
      ],
      'Categorias de Produtos': [
        { label: 'Imagem', key: 'imageUrl', type: 'image' },
        { label: 'Nome', key: 'name', type: 'text' },
        { label: 'Ações', key: '', type: 'actions' },
      ],
      Fornecedores: [
        { label: 'Imagem', key: 'imageUrl', type: 'image' },
        { label: 'Nome', key: 'name', type: 'text' },
        { label: 'Destaque', key: 'isHighlighted', type: 'badge' },
        { label: 'Ações', key: '', type: 'actions' },
      ],
    };
    return cols[this.pageTitle()];
  });

  tableData = computed(() => {
    const sourceMap: Record<string, any> = {
      Produtos: this.productsService.adminProducts(),
      Fornecedores: this.suppliersService.paginatedSuppliers(),
      'Categorias de Produtos': this.categoryService.paginatedCategories(),
      Usuários: this.usersService.paginatedUsers(),
    };

    const data = sourceMap[this.pageTitle()];
    if (!data || !data.content) return [];

    return data.content.map((item: any) => ({
      ...item,
      categoryName: item.category?.name,
      supplierName: item.supplier?.name,
    }));
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
        if (
          typeof prodData.flavours === 'string' &&
          prodData.flavours.trim() !== ''
        ) {
          prodData.flavours = prodData.flavours
            .split(',')
            .map((s: string) => s.trim());
        } else if (!prodData.flavours) {
          prodData.flavours = [];
        }
        request$ = isEdit
          ? this.productsService.update(id, prodData, payload.image || null)
          : this.productsService.create(prodData, payload.image!);
        break;

      case 'Fornecedores':
        request$ = isEdit
          ? this.suppliersService.update(id, payload.form, payload.image!)
          : this.suppliersService.create(payload.form, payload.image!);
        break;

      case 'Categorias de Produtos':
        request$ = isEdit
          ? this.categoryService.update(id, payload.form, payload.image!)
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
        const msgSucesso = isEdit
          ? 'Atualizado com sucesso!'
          : 'Cadastrado com sucesso!';
        this.showFeedback(200, msgSucesso);
      },
      error: (err) => {
        console.error('Erro na requisição', err);
        const status = err.status || 500;
        const msgErro =
          err.error?.message || 'Ocorreu um erro interno. Verifique os dados.';
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
        const msgErro =
          err.error?.message ||
          'Erro ao tentar excluir. O registro pode estar vinculado a outras tabelas.';
        this.showFeedback(status, msgErro);
      },
    });
  }
}
