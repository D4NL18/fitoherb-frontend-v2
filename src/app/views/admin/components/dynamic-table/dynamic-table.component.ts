import { TableColumn } from './../../types/TableColumn.interface';
import { Component, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, LowerCasePipe } from '@angular/common';

@Component({
  selector: 'app-dynamic-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent {
  columns = input.required<TableColumn[]>();
  data = input.required<any[]>();

  edit = output<any>();
  delete = output<any>();

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }
}
