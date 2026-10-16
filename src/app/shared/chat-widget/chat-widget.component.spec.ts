import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ChatWidgetComponent } from './chat-widget.component';

describe('ChatWidgetComponent', () => {
  let component: ChatWidgetComponent;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatWidgetComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ChatWidgetComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create the chat widget component', () => {
    expect(component).toBeTruthy();
  });

  it('should convert URLs in text to clickable <a> links with target=_blank and rel=noopener', () => {
    const raw = 'Fale conosco no WhatsApp https://wa.me/5571992419709 ou veja o site https://fitoherb.com.br';
    const result = component.formatMessage(raw) as any;
    const html = result.changingThisBreaksApplicationSecurity || '';

    expect(html).toContain('<a href="https://wa.me/5571992419709" target="_blank" rel="noopener noreferrer" class="chat-link">https://wa.me/5571992419709</a>');
    expect(html).toContain('<a href="https://fitoherb.com.br" target="_blank" rel="noopener noreferrer" class="chat-link">https://fitoherb.com.br</a>');
  });

  it('should correctly parse URLs enclosed in parentheses without including the closing parenthesis', () => {
    const raw = 'Acesse nosso WhatsApp (https://wa.me/5571992419709) e Instagram (https://www.instagram.com/fitoherb).';
    const result = component.formatMessage(raw) as any;
    const html = result.changingThisBreaksApplicationSecurity || '';

    expect(html).toContain('(<a href="https://wa.me/5571992419709" target="_blank" rel="noopener noreferrer" class="chat-link">https://wa.me/5571992419709</a>)');
    expect(html).toContain('(<a href="https://www.instagram.com/fitoherb" target="_blank" rel="noopener noreferrer" class="chat-link">https://www.instagram.com/fitoherb</a>).');
  });

  it('should convert email addresses to clickable mailto: links', () => {
    const raw = 'Envie um e-mail para comercial@fitoherb.com.br para orçamentos.';
    const result = component.formatMessage(raw) as any;
    const html = result.changingThisBreaksApplicationSecurity || '';

    expect(html).toContain('<a href="mailto:comercial@fitoherb.com.br" target="_blank" rel="noopener noreferrer" class="chat-link">comercial@fitoherb.com.br</a>');
  });

  it('should escape malicious HTML to prevent XSS attacks while still parsing links', () => {
    const raw = '<script>alert("xss")</script>Visite https://wa.me/5571992419709 <img src=x onerror=alert(1)>';
    const result = component.formatMessage(raw) as any;
    const html = result.changingThisBreaksApplicationSecurity || '';

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(html).toContain('<a href="https://wa.me/5571992419709" target="_blank" rel="noopener noreferrer" class="chat-link">https://wa.me/5571992419709</a>');
  });
});
