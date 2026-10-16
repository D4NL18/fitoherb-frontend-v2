import { Component, ElementRef, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatService } from '../../services/chat/chat.service';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.scss'
})
export class ChatWidgetComponent {
  chatService = inject(ChatService);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('scrollBody') scrollBody?: ElementRef<HTMLDivElement>;

  inputText = signal<string>('');

  constructor() {
    // Rola automaticamente para o fim quando novas mensagens chegam
    effect(() => {
      const _ = this.chatService.messages();
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  onInputChange(val: string) {
    if (val.length <= 255) {
      this.inputText.set(val);
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessageInternal();
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    this.sendMessageInternal();
  }

  private sendMessageInternal() {
    const txt = this.inputText().trim();
    if (txt && !this.chatService.isLoading()) {
      this.chatService.sendMessage(txt);
      this.inputText.set('');
    }
  }

  sendPreset(text: string) {
    this.inputText.set(text);
    this.chatService.sendMessage(text);
    this.inputText.set('');
  }

  private scrollToBottom() {
    if (this.scrollBody) {
      const el = this.scrollBody.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  formatMessage(content: string): SafeHtml {
    if (!content) return '';

    // 1. Sanitizar contra XSS escapando caracteres HTML
    let escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // 2. URLs (http/https): converter em links clicáveis sem engolir pontuação no final
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    escaped = escaped.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
    });

    // 3. E-mails: converter em mailto:
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    escaped = escaped.replace(emailRegex, (email) => {
      return `<a href="mailto:${email}" target="_blank" rel="noopener noreferrer" class="chat-link">${email}</a>`;
    });

    // 4. Quebras de linha (\n) para <br>
    escaped = escaped.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(escaped);
  }
}
