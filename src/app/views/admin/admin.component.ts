import { Component } from '@angular/core';
import { AdminNavComponent } from './components/admin-nav/admin-nav.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AdminNavComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

}
