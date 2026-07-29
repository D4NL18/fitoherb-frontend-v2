import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalResponseComponent } from './modal-response.component';

describe('ModalResponseComponent', () => {
  let component: ModalResponseComponent;
  let fixture: ComponentFixture<ModalResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ 
      imports: [ModalResponseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalResponseComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('status', 200);
    fixture.componentRef.setInput('message', 'Success message');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute isSuccess correctly', () => {
    expect(component.isSuccess()).toBeTrue();

    fixture.componentRef.setInput('status', 400);
    fixture.detectChanges();
    expect(component.isSuccess()).toBeFalse();
  });

  it('should emit close on close', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
