import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ 
      imports: [SelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'test-select');
    fixture.componentRef.setInput('options', ['Op1', 'Op2', 'Op3']);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write value', () => {
    component.writeValue('Op1');
    expect(component.value).toBe('Op1');
  });

  it('should register on change and on touched', () => {
    const fn = () => {};
    component.registerOnChange(fn);
    component.registerOnTouched(fn);
    expect(component.onChange).toBe(fn);
    expect(component.onTouched).toBe(fn);
  });

  it('should toggle open', () => {
    const event = new Event('click');
    expect(component.isOpen).toBeFalse();
    component.toggleOpen(event);
    expect(component.isOpen).toBeTrue();
    component.toggleOpen(event);
    expect(component.isOpen).toBeFalse();
  });

  it('should filter options on search', () => {
    const event = { target: { value: 'Op2' } } as unknown as Event;
    component.onSearch(event);
    expect(component.searchTerm()).toBe('Op2');
    expect(component.filteredOptions()).toEqual(['Op2']);
  });

  it('should select option', () => {
    const event = new Event('click');
    spyOn(event, 'stopPropagation');
    let emittedValue = '';
    component.registerOnChange((val: string) => emittedValue = val);

    component.selectOption('Op2', event);
    
    expect(component.value).toBe('Op2');
    expect(emittedValue).toBe('Op2');
    expect(component.isOpen).toBeFalse();
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});
