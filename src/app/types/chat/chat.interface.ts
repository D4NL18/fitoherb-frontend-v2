export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isError?: boolean;
}

export interface CatalogFilters {
  category: string[];
  supplier: string[];
  search: string;
}

export interface ChatAction {
  type: 'NAVIGATE_CATALOG' | 'NONE';
  auto_redirect: boolean;
  filters: CatalogFilters;
}

export interface ProductSnippet {
  name: string;
  slug: string;
  image_url?: string;
  category?: string;
  supplier?: string;
}

export interface ChatResponseData {
  reply: string;
  intent: string;
  action: ChatAction;
  products: ProductSnippet[];
  suggestions: string[];
}

export interface ChatResponsePayload {
  data: ChatResponseData;
  meta: Record<string, any>;
}
