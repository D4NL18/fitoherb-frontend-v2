import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ChatMessage, ChatResponsePayload, ChatAction } from '../../types/chat/chat.interface';

const SESSION_STORAGE_KEY = 'fitoherb_chat_history_v1';
const MAX_MSG_LENGTH = 255;

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly aiBaseUrl = (environment as any).aiUrl || 'http://localhost:8000/api/v1';

  // Signals de Estado
  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  messages = signal<ChatMessage[]>([]);
  lastAction = signal<ChatAction | null>(null);

  constructor() {
    this.loadFromSession();
  }

  toggleOpen() {
    this.isOpen.update(v => !v);
  }

  openChat() {
    this.isOpen.set(true);
  }

  closeChat() {
    this.isOpen.set(false);
  }

  clearHistory() {
    this.messages.set([
      {
        role: 'assistant',
        content: 'Histórico limpo. Como posso ajudar você agora?',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }

  sendMessage(userText: string) {
    const text = userText ? userText.trim().slice(0, MAX_MSG_LENGTH) : '';
    if (!text || this.isLoading()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    this.messages.update(msgs => [...msgs, userMsg]);
    this.isLoading.set(true);
    this.saveToSession();

    const historyPayload = this.messages().slice(0, -1).map(m => ({
      role: m.role,
      content: m.content
    }));

    this.http.post<ChatResponsePayload>(`${this.aiBaseUrl}/chat/messages`, {
      message: text,
      history: historyPayload
    }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const data = res.data;

        const botMsg: ChatMessage = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString()
        };

        this.messages.update(msgs => [...msgs, botMsg]);
        this.lastAction.set(data.action);
        this.saveToSession();

        // Auto-redirecionamento com filtros sem fechar o chat
        if (data.action && data.action.type === 'NAVIGATE_CATALOG' && data.action.auto_redirect) {
          const f = data.action.filters;
          this.router.navigate(['/produtos'], {
            queryParams: {
              category: f.category && f.category.length > 0 ? f.category : null,
              supplier: f.supplier && f.supplier.length > 0 ? f.supplier : null,
              search: f.search ? f.search : null
            },
            queryParamsHandling: 'merge'
          });
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg: ChatMessage = {
          role: 'assistant',
          content: 'Desculpe, ocorreu uma instabilidade temporária no serviço do assistente. Por favor, tente novamente em alguns instantes.',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };
        this.messages.update(msgs => [...msgs, errorMsg]);
        this.saveToSession();
      }
    });
  }

  private saveToSession() {
    try {
      const serialized = JSON.stringify(this.messages().slice(-10));
      sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
    } catch (_) {}
  }

  private loadFromSession() {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.messages.set(parsed);
          return;
        }
      }
    } catch (_) {}

    // Mensagem de boas-vindas padrão
    this.messages.set([
      {
        role: 'assistant',
        content: 'Olá! Sou o assistente virtual da Fitoherb. Posso tirar dúvidas sobre nossa distribuidora e buscar produtos em nosso catálogo. Em que posso te ajudar?',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }
}
