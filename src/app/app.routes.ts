import { SuppliersComponent } from './views/suppliers/suppliers.component';
import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { AboutComponent } from './views/about/about.component';
import { GalleryComponent } from './views/gallery/gallery.component';
import { ContactComponent } from './views/contact/contact.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Home - Fitoherb',
  },
  {
    path: 'quem-somos',
    component: AboutComponent,
    title: 'Quem Somos - Fitoherb',
  },
  {
    path: 'produtos',
    component: GalleryComponent,
    title: 'Produtos - Fitoherb',
  },
  {
    path: 'produtos/:category',
    component: GalleryComponent,
    title: 'Produtos - Fitoherb',
  },
  {
    path: 'fornecedores',
    component: SuppliersComponent,
    title: 'Fornecedores - Fitoherb',
  },
  {
    path: 'contato',
    component: ContactComponent,
    title: 'Contato - Fitoherb',
  },
];
