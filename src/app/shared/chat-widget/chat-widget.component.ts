import { Component, ElementRef, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat/chat.service';

export interface MessageSegment {
  text: string;
  isLink: boolean;
  linkUrl?: string;
}

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

  parseMessageSegments(content: string): MessageSegment[] {
    if (!content) return [];

    const regex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const segments: MessageSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: content.substring(lastIndex, match.index),
          isLink: false
        });
      }

      if (match[1]) {
        segments.push({
          text: match[1],
          isLink: true,
          linkUrl: match[1]
        });
      } else if (match[2]) {
        segments.push({
          text: match[2],
          isLink: true,
          linkUrl: `mailto:${match[2]}`
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      segments.push({
        text: content.substring(lastIndex),
        isLink: false
      });
    }

    return segments;
  }
}
