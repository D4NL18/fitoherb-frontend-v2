import {
  Component,
  inject,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  DestroyRef,
  NgZone,
  PLATFORM_ID,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MailService } from '../../services/mail/mail.service';
import { environment } from '../../../environments/environment';
import { MailReq } from '../../types/mail/MailReq.interface';
import { ButtonComponent } from '../../shared/button/button.component';
import { InputComponent } from '../../shared/input/input.component';
import { SelectComponent } from '../../shared/select/select.component';
import { TextareaComponent } from '../../shared/textarea/textarea.component';
import { ModalResponseComponent } from '../../shared/modal-response/modal-response.component';
import { TitleSectionRevealDirective } from '../../shared/directives/title-section-reveal.directive';
import { ContactGridFieldDirective } from '../../shared/directives/contact-grid-field.directive';
import { SpotlightCardsDirective } from '../../shared/directives/spotlight-cards.directive';

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
    ModalResponseComponent,
    TitleSectionRevealDirective,
    ContactGridFieldDirective,
    SpotlightCardsDirective,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  public mailService = inject(MailService);

  @ViewChild('contactSection') contactSection!: ElementRef<HTMLElement>;
  @ViewChild('contactFormEl') contactFormEl?: ElementRef<HTMLFormElement>;
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLElement>;

  private sectionObserver: IntersectionObserver | null = null;
  private formTween: gsap.core.Tween | null = null;
  private mapTween: gsap.core.Tween | null = null;

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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.sectionObserver?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (this.contactSection) {
      this.sectionObserver.observe(this.contactSection.nativeElement);
    }

    this.destroyRef.onDestroy(() => {
      this.sectionObserver?.disconnect();
      this.sectionObserver = null;
      this.formTween?.scrollTrigger?.kill();
      this.formTween?.kill();
      this.formTween = null;
      this.mapTween?.scrollTrigger?.kill();
      this.mapTween?.kill();
      this.mapTween = null;
    });

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    this.ngZone.runOutsideAngular(() => {
      const formEl = this.contactFormEl?.nativeElement;
      if (formEl) {
        const fields = formEl.querySelectorAll<HTMLElement>(
          ':scope > .form-row, :scope > app-select, :scope > app-textarea, :scope > .btn-group'
        );
        if (fields.length > 0) {
          this.formTween = gsap.fromTo(
            fields,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              stagger: 0.06,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
              scrollTrigger: {
                trigger: formEl,
                start: 'top 85%',
                once: true,
              },
            }
          );
        }
      }

      const mapEl = this.mapContainer?.nativeElement;
      if (mapEl) {
        this.mapTween = gsap.fromTo(
          mapEl,
          { clipPath: 'inset(18% 0 0 0 round 22px)', opacity: 0, y: 20 },
          {
            clipPath: 'inset(0% 0 0 0 round 22px)',
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'clipPath,transform',
            scrollTrigger: {
              trigger: mapEl,
              start: 'top 88%',
              once: true,
            },
          }
        );
      }
    });
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
