import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatWidgetComponent } from './chat-widget.component';

describe('ChatWidgetComponent', () => {
  let component: ChatWidgetComponent;

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
  });

  it('should create the chat widget component', () => {
    expect(component).toBeTruthy();
  });

  it('should parse URLs in text into link segments', () => {
    const raw = 'Fale conosco no WhatsApp https://wa.me/5571992419709 ou veja o site https://fitoherb.com.br';
    const segments = component.parseMessageSegments(raw);

    const links = segments.filter(s => s.isLink);
    expect(links.length).toBe(2);
    expect(links[0].linkUrl).toBe('https://wa.me/5571992419709');
    expect(links[1].linkUrl).toBe('https://fitoherb.com.br');
  });

  it('should correctly parse URLs enclosed in parentheses without including the closing parenthesis', () => {
    const raw = 'Acesse nosso WhatsApp (https://wa.me/5571992419709) e Instagram (https://www.instagram.com/fitoherb).';
    const segments = component.parseMessageSegments(raw);

    const links = segments.filter(s => s.isLink);
    expect(links.length).toBe(2);
    expect(links[0].linkUrl).toBe('https://wa.me/5571992419709');
    expect(links[0].text).toBe('https://wa.me/5571992419709');

    expect(links[1].linkUrl).toBe('https://www.instagram.com/fitoherb');
    expect(links[1].text).toBe('https://www.instagram.com/fitoherb');

    // Confirm enclosing parentheses are in non-link segments
    expect(segments[0].text).toContain('(');
    expect(segments[2].text).toContain(')');
  });

  it('should convert email addresses to mailto: link segments', () => {
    const raw = 'Envie um e-mail para comercial@fitoherb.com.br para orçamentos.';
    const segments = component.parseMessageSegments(raw);

    const emailSeg = segments.find(s => s.isLink && s.linkUrl?.startsWith('mailto:'));
    expect(emailSeg).toBeTruthy();
    expect(emailSeg?.linkUrl).toBe('mailto:comercial@fitoherb.com.br');
    expect(emailSeg?.text).toBe('comercial@fitoherb.com.br');
  });

  it('should treat malicious HTML tags as plain text segments safely', () => {
    const raw = '<script>alert("xss")</script>Visite https://wa.me/5571992419709';
    const segments = component.parseMessageSegments(raw);

    // The script tag is just part of a plain text segment, not rendered as HTML
    expect(segments[0].text).toBe('<script>alert("xss")</script>Visite ');
    expect(segments[0].isLink).toBeFalse();

    expect(segments[1].linkUrl).toBe('https://wa.me/5571992419709');
    expect(segments[1].isLink).toBeTrue();
  });
});
