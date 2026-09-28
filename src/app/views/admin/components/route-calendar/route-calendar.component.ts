import { Component, OnInit, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CalendarDay {
  day: number;
  month: number;
  year: number;
  dateStr: string; // yyyy-MM-dd
  isCurrentMonth: boolean;
  isEnabled: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasRoute: boolean;
}

@Component({
  selector: 'app-route-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-calendar.component.html',
  styleUrl: './route-calendar.component.scss'
})
export class RouteCalendarComponent implements OnInit {
  // Inputs
  readonly isOpen = input<boolean>(false);
  readonly selectedDate = input<string>('');
  readonly routeDates = input<string[]>([]);
  
  // Outputs
  readonly dateSelected = output<string>();
  readonly closed = output<void>();
  
  // State
  readonly currentMonth = signal<number>(new Date().getMonth());
  readonly currentYear = signal<number>(new Date().getFullYear());
  readonly isLoading = signal<boolean>(false);
  
  // Computed
  readonly monthName = computed(() => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[this.currentMonth()]} ${this.currentYear()}`;
  });
  
  readonly calendarDays = computed(() => {
    const year = this.currentYear();
    const month = this.currentMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days: CalendarDay[] = [];
    
    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = this.formatDateStr(prevYear, prevMonth, day);
      const date = new Date(prevYear, prevMonth, day);
      
      days.push({
        day,
        month: prevMonth,
        year: prevYear,
        dateStr,
        isCurrentMonth: false,
        isEnabled: this.isDateEnabled(date),
        isToday: this.isToday(dateStr),
        isSelected: this.isSelected(dateStr),
        hasRoute: this.hasRoute(dateStr)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = this.formatDateStr(year, month, day);
      const date = new Date(year, month, day);
      
      days.push({
        day,
        month,
        year,
        dateStr,
        isCurrentMonth: true,
        isEnabled: this.isDateEnabled(date),
        isToday: this.isToday(dateStr),
        isSelected: this.isSelected(dateStr),
        hasRoute: this.hasRoute(dateStr)
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = this.formatDateStr(nextYear, nextMonth, day);
      const date = new Date(nextYear, nextMonth, day);
      
      days.push({
        day,
        month: nextMonth,
        year: nextYear,
        dateStr,
        isCurrentMonth: false,
        isEnabled: this.isDateEnabled(date),
        isToday: this.isToday(dateStr),
        isSelected: this.isSelected(dateStr),
        hasRoute: this.hasRoute(dateStr)
      });
    }
    
    return days;
  });
  
  readonly weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  readonly today = new Date();
  readonly todayStr: string;
  readonly minDate: Date;
  readonly maxDate: Date;
  
  constructor() {
    this.todayStr = this.formatDateStr(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    
    this.minDate = new Date(this.today);
    this.minDate.setDate(this.today.getDate() - 7);
    this.minDate.setHours(0,0,0,0);
    
    this.maxDate = new Date(this.today);
    this.maxDate.setDate(this.today.getDate() + 30);
    this.maxDate.setHours(23,59,59,999);
  }
  
  ngOnInit(): void {}
  
  previousMonth(): void {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.update(y => y - 1);
    } else {
      this.currentMonth.update(m => m - 1);
    }
  }
  
  nextMonth(): void {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.update(y => y + 1);
    } else {
      this.currentMonth.update(m => m + 1);
    }
  }
  
  goToToday(): void {
    this.currentMonth.set(this.today.getMonth());
    this.currentYear.set(this.today.getFullYear());
    
    if (this.isDateEnabled(this.today)) {
      this.dateSelected.emit(this.todayStr);
    }
  }
  
  selectDay(day: CalendarDay): void {
    if (day.isEnabled && day.isCurrentMonth) {
      this.dateSelected.emit(day.dateStr);
    }
  }
  
  closeModal(): void {
    this.closed.emit();
  }
  
  isDateEnabled(date: Date): boolean {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    const min = new Date(this.minDate);
    min.setHours(0,0,0,0);
    const max = new Date(this.maxDate);
    max.setHours(0,0,0,0);
    
    return d >= min && d <= max;
  }
  
  hasRoute(dateStr: string): boolean {
    return this.routeDates().includes(dateStr);
  }
  
  isToday(dateStr: string): boolean {
    return dateStr === this.todayStr;
  }
  
  isSelected(dateStr: string): boolean {
    return dateStr === this.selectedDate();
  }
  
  formatDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}
