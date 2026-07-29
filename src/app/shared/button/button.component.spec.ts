import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ 
      imports: [ButtonComponent]
    })
    .compileComponents();

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
});
