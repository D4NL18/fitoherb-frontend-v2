import { Component, ElementRef, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  onSubmit(event: Event) {
    event.preventDefault();
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
}
