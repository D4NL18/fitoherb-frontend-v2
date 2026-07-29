import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ 
      imports: [InputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'test-id');
    fixture.componentRef.setInput('type', 'password');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write value', () => {
    component.writeValue('new value');
    expect(component.value).toBe('new value');
  });

  it('should register on change and on touched', () => {
    const fn = () => {};
    component.registerOnChange(fn);
    component.registerOnTouched(fn);
    expect(component.onChange).toBe(fn);
    expect(component.onTouched).toBe(fn);
  });

  it('should set disabled state', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBeTrue();
  });

  it('should toggle password visibility', () => {
    expect(component.isPasswordVisible()).toBeFalse();
    expect(component.currentType()).toBe('password');

    component.togglePasswordVisibility();
    expect(component.isPasswordVisible()).toBeTrue();
    expect(component.currentType()).toBe('text');

    component.togglePasswordVisibility();
    expect(component.isPasswordVisible()).toBeFalse();
    expect(component.currentType()).toBe('password');
  });
});
