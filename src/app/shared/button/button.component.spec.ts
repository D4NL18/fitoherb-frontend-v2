import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Button');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit btnClick when clicked', () => {
    spyOn(component.btnClick, 'emit');
    component.onClick();
    expect(component.btnClick.emit).toHaveBeenCalled();
  });

  it('should not emit btnClick when disabled', () => {
    spyOn(component.btnClick, 'emit');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    component.onClick();
    expect(component.btnClick.emit).not.toHaveBeenCalled();
  });

  it('should not emit btnClick when loading', () => {
    spyOn(component.btnClick, 'emit');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    component.onClick();
    expect(component.btnClick.emit).not.toHaveBeenCalled();
  });

  // TDD Red — Hardening Modal / P-405: default type='button' prevents accidental form submission
  it('should default type input and native button type attribute to "button"', () => {
    // Arrange
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    // Act
    const currentType = component.type();

    // Assert
    expect(currentType).toBe('button');
    expect(buttonEl.getAttribute('type')).toBe('button');
  });

  it('should bind "submit" and "reset" to native button type attribute when provided', () => {
    // Arrange
    const buttonEl: HTMLButtonElement = fixture.nativeElement.querySelector('button');

    // Act
    fixture.componentRef.setInput('type', 'submit');
    fixture.detectChanges();

    // Assert
    expect(buttonEl.getAttribute('type')).toBe('submit');

    // Act
    fixture.componentRef.setInput('type', 'reset');
    fixture.detectChanges();

    // Assert
    expect(buttonEl.getAttribute('type')).toBe('reset');
  });
});
