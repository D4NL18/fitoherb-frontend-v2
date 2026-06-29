import { Component, inject, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MailService } from '../../services/mail/mail.service';
import { environment } from '../../../environments/environment';
import { MailReq } from '../../types/mail/MailReq.interface';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { TextareaComponent } from '../../shared/textarea/textarea.component';
import { ModalResponseComponent } from '../../shared/modal-response/modal-response.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    ModalResponseComponent
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  public mailService = inject(MailService);

  @ViewChild('contactSection') contactSection!: ElementRef;

  contactForm!: FormGroup;
  formSubmitted = false;
  modalData: { status: number, message: string } | null = null;

  phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  assuntos = [
    'Parceria Comercial',
    'Dúvidas sobre Produtos',
    'Trabalhe Conosco',
    'Sugestões ou Reclamações',
    'Outros Assuntos',
  ];

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      empresa: [''],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(this.phoneRegex)]],
      assunto: ['', [Validators.required]],
      mensagem: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (this.contactSection) observer.observe(this.contactSection.nativeElement);
  }

  onSubmit() {
    this.formSubmitted = true;

    if (this.contactForm.valid) {
      const rawData = this.contactForm.value;
      const formattedMessage = `[${rawData.empresa || 'N/A'}] ${rawData.nomeCompleto} - ${rawData.email}\n${rawData.telefone}\n\n${rawData.mensagem}`;

      const mailPayload: MailReq = {
        email: environment.contactRecipient,
        subject: rawData.assunto,
        message: formattedMessage,
      };

      this.mailService.sendEmail(mailPayload).subscribe({
        next: () => {
          this.modalData = { status: 200, message: 'Sua mensagem foi enviada com sucesso!' };
          this.contactForm.reset();
          this.formSubmitted = false;
        },
        error: (err) => {
          this.modalData = {
            status: err.status || 503,
            message: err.status === 0 ? 'Servidor offline. Tente mais tarde.' : 'Erro ao processar envio.'
          };
        },
      });
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  get f() { return this.contactForm.controls; }
}
