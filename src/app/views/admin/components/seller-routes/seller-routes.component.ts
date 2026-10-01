import { 
  Component, 
  OnInit, 
  AfterViewInit, 
  OnDestroy, 
  signal, 
  inject, 
  ChangeDetectorRef,
  effect,
  HostListener 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { SavedLocationsService } from '../../../../services/saved-locations/saved-locations.service';
import { CommercialRoutingService } from '../../../../services/commercial-routing/commercial-routing.service';
import { SavedLocation } from '../../../../types/saved-locations/saved-location.interface';
import { 
  LocationPointDto, 
  DeliveryStopDto, 
  OptimizeRouteResponse, 
  OrderedStopDto 
} from '../../../../types/routing/routing.interface';
import { ScheduledRoutesService } from '../../../../services/scheduled-routes/scheduled-routes.service';
import { RouteCalendarComponent } from '../route-calendar/route-calendar.component';
import { ScheduledRouteReq } from '../../../../types/scheduled-routes/scheduled-route.interface';

declare let L: any;

@Component({
  selector: 'app-seller-routes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouteCalendarComponent],
  templateUrl: './seller-routes.component.html',
  styleUrl: './seller-routes.component.scss'
})
export class SellerRoutesComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly savedLocationsService = inject(SavedLocationsService);
  private readonly routingService = inject(CommercialRoutingService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Estados Reativos
  readonly isLoading = signal<boolean>(false);
  readonly isOptimizing = signal<boolean>(false);
  readonly isExportingPdf = signal<boolean>(false);
  readonly showExportPdfModal = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly toastMessage = signal<string | null>(null);

  readonly selectedDate = signal<string>(this.getTodayStr()); // yyyy-MM-dd
  readonly isCalendarOpen = signal<boolean>(false);
  readonly routeDates = signal<string[]>([]);
  readonly isSavingRoute = signal<boolean>(false);
  readonly isLoadingRoute = signal<boolean>(false);

  private readonly scheduledRoutesService = inject(ScheduledRoutesService);

  private getTodayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  get formattedSelectedDate(): string {
    const [year, month, day] = this.selectedDate().split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${weekDays[date.getDay()]}, ${day} ${months[date.getMonth()]}`;
  }

  // Aba lateral ativa: 'stops' (gerenciamento) ou 'results' (itinerário da IA)
  readonly activeSidebarTab = signal<'stops' | 'results'>('stops');

  // Ponto de Partida (Base do Vendedor ou Matriz Fitoherb)
  readonly FITOHERB_HQ: LocationPointDto = {
    id: 'fitoherb-hq',
    name: 'Fitoherb Nordeste (Matriz)',
    lat: -12.8992,
    lon: -38.3242,
    address: {
      street: 'Rua Itaeté',
      number: '434',
      neighborhood: 'Pitangueiras',
      city: 'Lauro de Freitas',
      state: 'BA',
      postal_code: '42701-360',
      full_address: 'Rua Itaeté, 434 - Pitangueiras, Lauro de Freitas - BA'
    }
  };

  readonly depot = signal<LocationPointDto>(this.FITOHERB_HQ);
  readonly isUsingCustomBase = signal<boolean>(false);

  // Lista de Paradas para a Rota do Vendedor
  readonly stops = signal<DeliveryStopDto[]>([]);

  // Favoritos salvos no banco
  readonly savedLocations = signal<SavedLocation[]>([]);

  // Resultados da Otimização da IA
  readonly optimizationResult = signal<OptimizeRouteResponse | null>(null);

  // Trecho Ativo / Filtrado para Destaque no Mapa
  readonly selectedLegIndex = signal<number | null>(null);

  // Paleta Harmoniosa de Cores para Identificação Visual dos Trechos (Brand Fitoherb)
  readonly ROUTE_LEG_COLORS: string[] = [
    '#38582f', // Trecho 1: Verde Fitoherb
    '#4d7a42', // Trecho 2: Verde Claro
    '#2e4f24', // Trecho 3: Verde Escuro
    '#5b4636', // Trecho 4: Marrom Terra
    '#7b6247', // Trecho 5: Marrom Claro
    '#827b5e', // Trecho 6: Oliva
    '#4a5c43', // Trecho 7: Floresta
    '#3b4238', // Trecho 8: Floresta Escuro
    '#8a8a7a', // Trecho 9: Cinza Escuro
    '#595950', // Trecho 10: Cinza Médio
    '#1a1a12', // Trecho 11: Preto Fitoherb
    '#729668'  // Trecho Retorno à Base: Verde Suave
  ];

  getLegColor(legIndex: number): string {
    if (legIndex < 0) return '#2e4f24';
    return this.ROUTE_LEG_COLORS[legIndex % this.ROUTE_LEG_COLORS.length];
  }

  // Busca e Autocomplete de Endereços
  searchQuery: string = '';
  readonly searchResults = signal<any[]>([]);
  readonly isSearchingAddress = signal<boolean>(false);
  readonly showSearchDropdown = signal<boolean>(false);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Modal de Adição/Edição de Ponto (ao clicar no mapa ou editar)
  readonly showPointModal = signal<boolean>(false);
  readonly editingStopIndex = signal<number | null>(null);
  modalPointType: 'delivery' | 'base' = 'delivery';
  modalPointTitle: string = '';
  modalPointLat: number = 0;
  modalPointLon: number = 0;
  modalPointPriority: 'REGULAR' | 'HIGH' | 'CRITICAL' = 'REGULAR';
  modalPointFixedOrder: number | null = null;
  modalPointServiceMinutes: number | null = null;
  modalPointTargetArrivalTime: string | null = null;
  readonly modalTimeConflictWarning = signal<string | null>(null);
  modalPointSaveFavorite: boolean = false;
  readonly modalIsReverseGeocoding = signal<boolean>(false);

  // Parâmetros de Partida da Jornada Comercial (Horário Opcional)
  readonly departureTime = signal<string>('08:00');

  // Drag and Drop de Paradas no Roteiro IA
  readonly draggedStopIndex = signal<number | null>(null);
  readonly dragOverIndex = signal<number | null>(null);
  readonly isRecalculating = signal<boolean>(false);

  // Modal de Gerenciamento e Exclusão de Favoritos Salvos
  readonly showManageFavoritesModal = signal<boolean>(false);
  manageFavoritesSearchQuery: string = '';

  // Endereço estruturado obtido da API de mapas
  modalAddress = {
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'BA',
    postalCode: '',
    fullAddress: ''
  };

  // Instâncias Leaflet
  private map: any = null;
  private markersLayer: any = null;
  private routeLayer: any = null;

  constructor() {
    effect(() => {
      const anyOpen = this.showPointModal() || this.showManageFavoritesModal() || this.isCalendarOpen();
      if (typeof document !== 'undefined') {
        if (anyOpen) {
          document.body.classList.add('modal-open-lock');
        } else {
          document.body.classList.remove('modal-open-lock');
        }
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showSearchDropdown()) return;
    const target = event.target as HTMLElement;
    if (target && !target.closest('.search-section')) {
      this.showSearchDropdown.set(false);
    }
  }

  openCalendar(): void {
    this.loadRouteDates();
    this.isCalendarOpen.set(true);
  }

  loadRouteDates(): void {
    this.scheduledRoutesService.getRouteDates().subscribe({
      next: (dates) => this.routeDates.set(dates),
      error: (err) => console.error('Erro ao carregar datas de rotas', err)
    });
  }

  onDateSelected(dateStr: string): void {
    this.selectedDate.set(dateStr);
    this.isCalendarOpen.set(false);
    this.loadRouteForDate(dateStr);
  }

  loadRouteForDate(dateStr: string): void {
    this.isLoadingRoute.set(true);
    this.scheduledRoutesService.getRouteByDate(dateStr).subscribe({
      next: (route) => {
        this.isLoadingRoute.set(false);
        // Restaura o estado completo da rota
        if (route.depot) this.depot.set(route.depot);
        if (route.stops) {
          this.stops.set(route.stops);
        } else {
          this.stops.set([]);
        }
        if (route.optimizationResult) {
          this.optimizationResult.set(route.optimizationResult);
          this.activeSidebarTab.set('results');
          if (route.optimizationResult.geojson_geometry) {
            // @ts-ignore
            this.drawRouteOnMap(route.optimizationResult.geojson_geometry);
          }
        } else {
          this.optimizationResult.set(null);
          this.activeSidebarTab.set('stops');
        }
        if (route.departureTime) this.departureTime.set(route.departureTime);
        // @ts-ignore
        this.renderMarkers();
        this.showToast(`Rota de ${this.formattedSelectedDate} carregada.`);
      },
      error: (err) => {
        this.isLoadingRoute.set(false);
        // 404 = não tem rota para essa data, limpa tudo
        if (err.status === 404) {
          this.stops.set([]);
          this.optimizationResult.set(null);
          this.activeSidebarTab.set('stops');
          this.clearRouteFromMap();
          // @ts-ignore
          this.renderMarkers();
          this.showToast(`Nenhuma rota salva para ${this.formattedSelectedDate}. Crie uma nova!`);
        } else {
          this.showToast('Erro ao carregar rota.');
        }
      }
    });
  }

  saveCurrentRoute(): void {
    if (this.stops().length === 0) {
      this.showToast('Adicione ao menos uma parada antes de salvar.');
      return;
    }
    this.isSavingRoute.set(true);
    const req: ScheduledRouteReq = {
      routeDate: this.selectedDate(),
      departureTime: this.departureTime(),
      returnToDepot: true,
      depot: this.depot(),
      stops: this.stops(),
      optimizationResult: this.optimizationResult() || undefined
    };
    this.scheduledRoutesService.saveRoute(req).subscribe({
      next: () => {
        this.isSavingRoute.set(false);
        this.loadRouteDates(); // atualiza indicadores do calendário
        this.showToast(`Rota salva para ${this.formattedSelectedDate}!`);
      },
      error: (err) => {
        this.isSavingRoute.set(false);
        const msg = err.error?.message || 'Erro ao salvar rota.';
        this.showToast(msg);
      }
    });
  }

  clearRouteFromMap(): void {
    if (this.routeLayer) {
      this.routeLayer.clearLayers();
    }
    // @ts-ignore
    if (this.routeLayersMap) this.routeLayersMap.clear();
    // @ts-ignore
    this.fullGeoJson = null;
  }

  ngOnInit() {
    this.loadSavedLocations();
    this.loadRouteDates();

    // Autocomplete com debounce de 350ms para busca fluida ao digitar
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((query) => {
      this.executeAddressSearch(query);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
    }, 200);
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('modal-open-lock');
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  // Carrega Base e Favoritos do backend Spring Boot (Regra P-101)
  loadSavedLocations() {
    this.savedLocationsService.getAll().subscribe({
      next: (locations) => {
        this.savedLocations.set(locations);
        const base = locations.find(l => l.type === 'BASE');
        if (base) {
          this.isUsingCustomBase.set(true);
          this.depot.set({
            id: base.id || 'my-base',
            name: base.title,
            lat: base.latitude,
            lon: base.longitude,
            address: {
              street: base.street,
              number: base.number,
              neighborhood: base.neighborhood,
              city: base.city,
              state: base.state,
              postal_code: base.postalCode,
              full_address: base.fullAddress
            }
          });
          if (this.map) {
            this.map.setView([base.latitude, base.longitude], 13);
            this.renderMarkers();
          }
        }
      },
      error: (err) => console.error('Erro ao carregar locais salvos', err)
    });
  }

  // Inicialização do Leaflet
  private initMap() {
    const startPoint = this.depot();
    if (!L) return;

    this.map = L.map('sellerRouteMap', {
      center: [startPoint.lat, startPoint.lon],
      zoom: 13,
      zoomControl: true,
      preferCanvas: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      crossOrigin: true,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);

    // Clique no mapa: captura automática e geocodificação reversa transparente (Regra P-102)
    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      this.openPointModalFromMapClick(lat, lon);
    });

    this.renderMarkers();
  }

  // Utilitário para converter 'HH:MM' em minutos desde 00:00
  parseTimeToMinutes(timeStr: string | null | undefined): number | null {
    if (!timeStr) return null;
    const parts = timeStr.trim().split(':');
    if (parts.length < 2) return null;
    const h = Number.parseInt(parts[0], 10);
    const m = Number.parseInt(parts[1], 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  }

  formatMinutesToTime(totalMins: number): string {
    const norm = ((totalMins % 1440) + 1440) % 1440;
    const h = Math.floor(norm / 60);
    const m = norm % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Validação Imediata de Conflito de Horário entre Clientes (Regra P-207)
  checkModalTimeConflict() {
    this.modalTimeConflictWarning.set(null);
    if (!this.modalPointTargetArrivalTime || this.modalPointType === 'base') {
      return;
    }

    const currentTargetMin = this.parseTimeToMinutes(this.modalPointTargetArrivalTime);
    if (currentTargetMin === null) return;

    // Se duration não especificada, assumir 20 min como padrão
    const currentDuration = (this.modalPointServiceMinutes && Number(this.modalPointServiceMinutes) > 0)
      ? Number(this.modalPointServiceMinutes)
      : 20;
    const currentEndMin = currentTargetMin + currentDuration;

    const currentEditIdx = this.editingStopIndex();
    const otherStops = this.stops().filter((_, idx) => idx !== currentEditIdx);

    for (const other of otherStops) {
      if (other.target_arrival_time) {
        const otherTargetMin = this.parseTimeToMinutes(other.target_arrival_time);
        if (otherTargetMin !== null) {
          const otherDuration = other.service_duration_minutes ?? 20;
          const otherEndMin = otherTargetMin + otherDuration;

          // Checa sobreposição temporal: dois intervalos [startA, endA) e [startB, endB) se sobrepõem se startA < endB && otherTargetMin < currentEndMin
          if (currentTargetMin < otherEndMin && otherTargetMin < currentEndMin) {
            this.modalTimeConflictWarning.set(
              `Atenção: Horário conflitante com "${other.name}" (marcado às ${other.target_arrival_time} com ~${otherDuration} min de duração). É impossível estar nos dois pontos no mesmo intervalo.`
            );
            return;
          }
        }
      }
    }
  }

  // Geocodificação reversa automática ao clicar no mapa
  openPointModalFromMapClick(lat: number, lon: number) {
    this.editingStopIndex.set(null);
    this.modalPointLat = lat;
    this.modalPointLon = lon;
    this.modalPointType = 'delivery';
    this.modalPointTitle = '';
    this.modalPointPriority = 'REGULAR';
    this.modalPointFixedOrder = null;
    this.modalPointServiceMinutes = null;
    this.modalPointTargetArrivalTime = null;
    this.modalTimeConflictWarning.set(null);
    this.modalPointSaveFavorite = false;
    this.modalIsReverseGeocoding.set(true);
    this.showPointModal.set(true);

    this.routingService.reverseGeocode(lat, lon).subscribe({
      next: (data) => {
        this.modalIsReverseGeocoding.set(false);
        const addr = data.address || {};
        this.modalAddress = {
          street: addr.road || addr.pedestrian || addr.street || '',
          number: addr.house_number || '',
          neighborhood: addr.suburb || addr.neighbourhood || addr.quarter || '',
          city: addr.city || addr.town || addr.municipality || 'Salvador',
          state: addr.state_code || addr.state || 'BA',
          postalCode: addr.postcode || '',
          fullAddress: data.display_name || ''
        };

        // Sugestão de título baseada no logradouro ou bairro
        const streetPart = this.modalAddress.street ? this.modalAddress.street : 'Visita Comercial';
        const numPart = this.modalAddress.number ? `, ${this.modalAddress.number}` : '';
        this.modalPointTitle = `${streetPart}${numPart}`;
      },
      error: () => {
        this.modalIsReverseGeocoding.set(false);
        this.modalPointTitle = 'Ponto no Mapa';
      }
    });
  }

  // Edição de parada existente do itinerário
  editStop(index: number) {
    const s = this.stops()[index];
    if (!s) return;

    this.editingStopIndex.set(index);
    this.modalPointType = 'delivery';
    this.modalPointTitle = s.name;
    this.modalPointLat = s.lat;
    this.modalPointLon = s.lon;
    this.modalPointPriority = s.priority || 'REGULAR';
    this.modalPointFixedOrder = s.fixed_order || null;
    this.modalPointServiceMinutes = s.service_duration_minutes ?? null;
    this.modalPointTargetArrivalTime = s.target_arrival_time || null;
    this.modalPointSaveFavorite = false;
    this.modalIsReverseGeocoding.set(false);
    this.modalAddress = {
      street: s.address?.street || '',
      number: s.address?.number || '',
      neighborhood: s.address?.neighborhood || '',
      city: s.address?.city || '',
      state: s.address?.state || 'BA',
      postalCode: s.address?.postal_code || '',
      fullAddress: s.address?.full_address || ''
    };
    this.checkModalTimeConflict();
    this.showPointModal.set(true);
  }

  // Confirmação do modal de ponto
  savePointFromModal() {
    if (!this.modalPointTitle.trim()) {
      this.modalPointTitle = 'Visita Comercial';
    }

    const durationVal = (this.modalPointServiceMinutes && Number(this.modalPointServiceMinutes) > 0)
      ? Number(this.modalPointServiceMinutes)
      : null;

    // Se estiver no modo de edição de parada existente
    const editIdx = this.editingStopIndex();
    if (editIdx !== null) {
      this.stops.update(list => list.map((item, idx) => {
        if (idx === editIdx) {
          return {
            ...item,
            name: this.modalPointTitle,
            priority: this.modalPointPriority,
            fixed_order: this.modalPointFixedOrder,
            target_arrival_time: this.modalPointTargetArrivalTime ? this.modalPointTargetArrivalTime.trim() : null,
            service_duration_minutes: durationVal,
            address: {
              ...item.address,
              street: this.modalAddress.street,
              number: this.modalAddress.number,
              neighborhood: this.modalAddress.neighborhood,
              city: this.modalAddress.city,
              state: this.modalAddress.state,
              postal_code: this.modalAddress.postalCode,
              full_address: this.modalAddress.fullAddress
            }
          };
        }
        return item;
      }));
      this.showToast(`Parada "${this.modalPointTitle}" atualizada com sucesso.`);
      this.renderMarkers();
      this.editingStopIndex.set(null);
      this.showPointModal.set(false);
      this.optimizationResult.set(null);
      return;
    }

    if (this.modalPointType === 'base') {
      // Salva como nova Base do Vendedor
      const baseReq = {
        title: this.modalPointTitle,
        type: 'BASE' as const,
        latitude: this.modalPointLat,
        longitude: this.modalPointLon,
        street: this.modalAddress.street,
        number: this.modalAddress.number,
        neighborhood: this.modalAddress.neighborhood,
        city: this.modalAddress.city,
        state: this.modalAddress.state,
        postalCode: this.modalAddress.postalCode,
        fullAddress: this.modalAddress.fullAddress
      };

      this.savedLocationsService.create(baseReq).subscribe({
        next: (saved) => {
          this.isUsingCustomBase.set(true);
          this.depot.set({
            id: saved.id || 'my-base',
            name: saved.title,
            lat: saved.latitude,
            lon: saved.longitude,
            address: {
              street: saved.street,
              number: saved.number,
              neighborhood: saved.neighborhood,
              city: saved.city,
              state: saved.state,
              postal_code: saved.postalCode,
              full_address: saved.fullAddress
            }
          });
          this.showToast('Nova base definida com sucesso!');
          this.renderMarkers();
          this.showPointModal.set(false);
        },
        error: () => this.showToast('Erro ao salvar nova base.')
      });
      return;
    }

    // Se for parada regular nova
    const newStop: DeliveryStopDto = {
      id: `stop-${Date.now()}`,
      name: this.modalPointTitle,
      lat: this.modalPointLat,
      lon: this.modalPointLon,
      priority: this.modalPointPriority,
      fixed_order: this.modalPointFixedOrder,
      target_arrival_time: this.modalPointTargetArrivalTime ? this.modalPointTargetArrivalTime.trim() : null,
      service_duration_minutes: durationVal,
      address: {
        street: this.modalAddress.street,
        number: this.modalAddress.number,
        neighborhood: this.modalAddress.neighborhood,
        city: this.modalAddress.city,
        state: this.modalAddress.state,
        postal_code: this.modalAddress.postalCode,
        full_address: this.modalAddress.fullAddress
      }
    };

    // Salvar como favorito opcional
    if (this.modalPointSaveFavorite) {
      this.savedLocationsService.create({
        title: this.modalPointTitle,
        type: 'FAVORITE',
        latitude: this.modalPointLat,
        longitude: this.modalPointLon,
        street: this.modalAddress.street,
        number: this.modalAddress.number,
        neighborhood: this.modalAddress.neighborhood,
        city: this.modalAddress.city,
        state: this.modalAddress.state,
        postalCode: this.modalAddress.postalCode,
        fullAddress: this.modalAddress.fullAddress
      }).subscribe({
        next: (fav) => this.savedLocations.update(list => [fav, ...list])
      });
    }

    this.stops.update(list => [...list, newStop]);
    this.showToast(`Parada "${newStop.name}" adicionada.`);
    this.renderMarkers();
    this.showPointModal.set(false);

    // Se já havia uma otimização rodando, invalida resultado antigo
    this.optimizationResult.set(null);
  }

  // Digitação com busca em tempo real via Subject/debounce
  onSearchInput(value: string) {
    this.searchQuery = value;
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      this.searchResults.set([]);
      this.showSearchDropdown.set(this.filteredSavedLocations.length > 0 && trimmed.length > 0);
      return;
    }
    this.showSearchDropdown.set(true);
    this.searchSubject.next(trimmed);
  }

  // Normalização de texto removendo acentos e convertendo para minúsculas
  private normalizeText(text?: string | null): string {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // Similaridade de Levenshtein normalizada (0.0 a 1.0) para tolerância a erros tipográficos (Regra P-220)
  private stringSimilarity(a: string, b: string): number {
    if (a === b) return 1.0;
    if (!a || !b) return 0.0;
    if (a.includes(b) || b.includes(a)) {
      return 0.85;
    }
    const lenA = a.length;
    const lenB = b.length;
    const matrix: number[][] = [];
    for (let i = 0; i <= lenA; i++) matrix[i] = [i];
    for (let j = 0; j <= lenB; j++) matrix[0][j] = j;
    for (let i = 1; i <= lenA; i++) {
      for (let j = 1; j <= lenB; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    const dist = matrix[lenA][lenB];
    const maxLen = Math.max(lenA, lenB);
    return Math.max(0, 1.0 - (dist / maxLen));
  }

  // Distância geodésica em KM (Haversine)
  private calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371.0;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Locais salvos com busca tolerante a erros e priorização geográfica por proximidade da base (Regras P-220 e P-221)
  get filteredSavedLocations(): (SavedLocation & { _distanceKm?: number })[] {
    const rawQuery = this.searchQuery.trim();
    const allLocations = this.savedLocations();
    const depot = this.depot();

    if (!rawQuery) {
      return allLocations
        .map(l => ({
          ...l,
          _distanceKm: this.calculateHaversineKm(depot.lat, depot.lon, l.latitude, l.longitude)
        }))
        .sort((a, b) => (a._distanceKm || 0) - (b._distanceKm || 0));
    }

    const normQ = this.normalizeText(rawQuery);
    const queryTokens = normQ.split(/\s+/).filter(t => t.length > 0);

    const scored = allLocations.map(loc => {
      const titleNorm = this.normalizeText(loc.title);
      const streetNorm = this.normalizeText(loc.street);
      const neighNorm = this.normalizeText(loc.neighborhood);
      const cityNorm = this.normalizeText(loc.city);
      const fullAddrNorm = this.normalizeText(loc.fullAddress);
      const combined = `${titleNorm} ${streetNorm} ${neighNorm} ${cityNorm} ${fullAddrNorm}`;
      const locTokens = combined.split(/\s+/).filter(t => t.length > 0);

      let matchScore = 0;
      let matchedTokensCount = 0;

      for (const qToken of queryTokens) {
        if (combined.includes(qToken)) {
          matchScore += 1.0;
          matchedTokensCount++;
          continue;
        }

        // Fuzzy match token a token
        let bestTokenSim = 0;
        for (const lToken of locTokens) {
          const sim = this.stringSimilarity(qToken, lToken);
          if (sim > bestTokenSim) bestTokenSim = sim;
        }

        if (bestTokenSim >= 0.70) {
          matchScore += bestTokenSim * 0.8;
          matchedTokensCount++;
        }
      }

      const distKm = this.calculateHaversineKm(depot.lat, depot.lon, loc.latitude, loc.longitude);

      return {
        location: loc,
        matchScore,
        matchedTokensCount,
        distKm
      };
    });

    const matches = scored.filter(s => s.matchedTokensCount > 0 || s.matchScore > 0);

    // Prioriza relevância textual com desempate rigoroso por proximidade geográfica da base
    matches.sort((a, b) => {
      const scoreDiff = b.matchScore - a.matchScore;
      if (Math.abs(scoreDiff) > 0.4) {
        return scoreDiff;
      }
      return a.distKm - b.distKm;
    });

    return matches.map(m => ({
      ...m.location,
      _distanceKm: m.distKm
    }));
  }

  // Foco no campo de busca: exibe sugestões imediatamente se houver favoritos salvos
  onSearchFocus() {
    if (this.savedLocations().length > 0 || this.searchResults().length > 0) {
      this.showSearchDropdown.set(true);
    }
  }

  // Executa busca via API de mapas com Nominatim / Proxy priorizando arredores da base
  executeAddressSearch(queryOverride?: string) {
    const q = (queryOverride ?? this.searchQuery).trim();
    if (!q) {
      this.searchResults.set([]);
      return;
    }
    this.isSearchingAddress.set(true);
    this.showSearchDropdown.set(true);

    const base = this.depot();
    this.routingService.searchAddress(q, base.lat, base.lon).subscribe({
      next: (res) => {
        this.isSearchingAddress.set(false);
        this.searchResults.set(res || []);
        this.showSearchDropdown.set(true);
      },
      error: () => {
        this.isSearchingAddress.set(false);
        this.showToast('Erro ao buscar endereço.');
      }
    });
  }

  // Seleciona um endereço dos resultados da busca
  selectSearchResult(item: any) {
    const lat = Number.parseFloat(item.lat);
    const lon = Number.parseFloat(item.lon);
    this.showSearchDropdown.set(false);
    this.searchQuery = '';
    this.editingStopIndex.set(null);

    // Extrai componentes estruturados do endereço
    const addr = item.address || {};
    const street = addr.road || addr.pedestrian || addr.street || '';
    const number = addr.house_number || '';
    const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || '';
    const city = addr.city || addr.town || addr.municipality || 'Salvador';
    const state = addr.state_code || addr.state || 'BA';
    const postalCode = addr.postcode || '';
    
    // Título inteligente baseado no nome do estabelecimento ou logradouro
    const itemName = item.name || '';
    const numberSuffix = number ? `, ${number}` : '';
    const streetLabel = street ? `${street}${numberSuffix}` : '';
    const title = itemName || streetLabel || item.display_name.split(',')[0];

    this.modalAddress = {
      street,
      number,
      neighborhood,
      city,
      state,
      postalCode,
      fullAddress: item.display_name || (streetLabel ? `${streetLabel} - ${neighborhood}, ${city}` : '')
    };

    this.modalPointLat = lat;
    this.modalPointLon = lon;
    this.modalPointType = 'delivery';
    this.modalPointTitle = title;
    this.modalPointPriority = 'REGULAR';
    this.modalPointFixedOrder = null;
    this.modalPointSaveFavorite = false;
    this.modalIsReverseGeocoding.set(false);

    if (this.map) {
      this.map.setView([lat, lon], 16);
    }
    this.showPointModal.set(true);
  }

  // Formata o endereço da parada de maneira elegante sem vírgulas órfãs
  getFormattedAddress(stop: DeliveryStopDto): string {
    if (stop.address?.full_address && stop.address.full_address.trim().length > 3) {
      return stop.address.full_address;
    }
    const parts = [
      stop.address?.street,
      stop.address?.number,
      stop.address?.neighborhood,
      stop.address?.city
    ].filter(p => p && p.trim().length > 0);

    if (parts.length > 0) {
      return parts.join(', ');
    }
    return 'Endereço selecionado no mapa';
  }

  // Rótulo amigável de prioridade conforme exigência do usuário
  getPriorityLabel(priority?: string): string {
    switch (priority) {
      case 'CRITICAL': return 'Urgente';
      case 'HIGH': return 'Alta';
      default: return 'Regular';
    }
  }

  // Verifica se um favorito já está incluso na rota atual
  isFavoriteInRoute(fav: SavedLocation): boolean {
    return this.stops().some(s => 
      (Math.abs(s.lat - fav.latitude) < 0.0001 && Math.abs(s.lon - fav.longitude) < 0.0001) ||
      s.name.trim().toLowerCase() === fav.title.trim().toLowerCase()
    );
  }

  // Alterna inclusão/remoção rápida de um favorito na rota
  toggleFavoriteInRoute(fav: SavedLocation) {
    const existingIdx = this.stops().findIndex(s => 
      (Math.abs(s.lat - fav.latitude) < 0.0001 && Math.abs(s.lon - fav.longitude) < 0.0001) ||
      s.name.trim().toLowerCase() === fav.title.trim().toLowerCase()
    );

    if (existingIdx >= 0) {
      this.removeStop(existingIdx);
      this.showToast(`"${fav.title}" removido da rota.`);
    } else {
      this.addFavoriteToRoute(fav);
    }
  }

  // Adiciona parada a partir de um local favorito salvo
  addFavoriteToRoute(fav: SavedLocation) {
    const exists = this.isFavoriteInRoute(fav);
    if (exists) {
      this.showToast('Este local já está na lista de paradas.');
      return;
    }

    const newStop: DeliveryStopDto = {
      id: fav.id || `fav-${Date.now()}`,
      name: fav.title,
      lat: fav.latitude,
      lon: fav.longitude,
      priority: 'REGULAR',
      fixed_order: null,
      address: {
        street: fav.street,
        number: fav.number,
        neighborhood: fav.neighborhood,
        city: fav.city,
        state: fav.state,
        postal_code: fav.postalCode,
        full_address: fav.fullAddress
      }
    };

    this.stops.update(list => [...list, newStop]);
    this.showToast(`Favorito "${fav.title}" adicionado à rota.`);
    this.renderMarkers();
    this.optimizationResult.set(null);
  }

  // Lista de favoritos filtrados para o modal de gerenciamento com suporte fuzzy (Regra P-220)
  get manageFilteredFavorites(): SavedLocation[] {
    const raw = this.manageFavoritesSearchQuery.trim();
    const favs = this.savedLocations().filter(l => l.type === 'FAVORITE');
    if (!raw) return favs;

    const normQ = this.normalizeText(raw);
    const queryTokens = normQ.split(/\s+/).filter(Boolean);

    return favs.filter(fav => {
      const combined = this.normalizeText(`${fav.title} ${fav.neighborhood} ${fav.city} ${fav.street} ${fav.fullAddress}`);
      return queryTokens.every(qTok => {
        if (combined.includes(qTok)) return true;
        const locTokens = combined.split(/\s+/);
        return locTokens.some(lTok => this.stringSimilarity(qTok, lTok) >= 0.70);
      });
    });
  }

  // Exclui um local salvo (favorito) permanentemente do banco de dados (Regra P-101)
  deleteFavorite(fav: SavedLocation, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!fav.id) {
      this.showToast('Identificador do local inválido.');
      return;
    }

    if (confirm(`Deseja realmente remover o favorito "${fav.title}" dos seus locais salvos?`)) {
      this.savedLocationsService.delete(fav.id).subscribe({
        next: () => {
          this.savedLocations.update(list => list.filter(l => l.id !== fav.id));
          this.showToast(`Favorito "${fav.title}" removido com sucesso.`);
        },
        error: (err) => {
          console.error('Erro ao excluir local salvo:', err);
          this.showToast('Erro ao excluir o local salvo.');
        }
      });
    }
  }

  // Remove parada da lista
  removeStop(index: number) {
    this.stops.update(list => list.filter((_, i) => i !== index));
    this.renderMarkers();
    this.optimizationResult.set(null);
  }

  // Alterna ou define trava de ordem fixa (Regra P-104)
  toggleFixedOrder(stop: DeliveryStopDto, order: number | null) {
    this.stops.update(list => list.map(s => {
      if (s.id === stop.id) {
        return { ...s, fixed_order: order };
      }
      return s;
    }));
    this.optimizationResult.set(null);
    this.showToast(order ? `Ordem fixada como #${order}` : 'Ordem liberada para a IA otimizar');
  }

  // Executa a otimização com o Algoritmo Genético do fitoherb-ai
  optimizeRoute() {
    if (this.stops().length === 0) {
      this.showToast('Adicione ao menos uma parada no mapa.');
      return;
    }

    this.isOptimizing.set(true);
    this.errorMessage.set(null);

    const depTime = this.departureTime()?.trim() ? this.departureTime().trim() : undefined;

    const payload = {
      depot: this.depot(),
      stops: this.stops(),
      return_to_depot: true,
      departure_time: depTime
    };

    this.routingService.optimizeRoute(payload).subscribe({
      next: (res) => {
        this.isOptimizing.set(false);
        this.optimizationResult.set(res);
        this.activeSidebarTab.set('results');
        this.drawRouteOnMap(res.geojson_geometry);
        this.renderMarkers();
        this.showToast('Rota otimizada com sucesso pelo Algoritmo Genético!');
      },
      error: (err) => {
        this.isOptimizing.set(false);
        this.errorMessage.set('Erro ao calcular rota otimizada. Verifique se o microserviço fitoherb-ai está ativo.');
        console.error(err);
      }
    });
  }

  // --- ARRASTAR E SOLTAR (DRAG & DROP) NO ROTEIRO DA IA ---
  onTimelineDragStart(event: DragEvent, index: number, stop: OrderedStopDto) {
    if (stop.action !== 'VISIT' || this.isRecalculating()) {
      event.preventDefault();
      return;
    }
    this.draggedStopIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `${index}`);
    }
  }

  onTimelineDragOver(event: DragEvent, index: number, stop: OrderedStopDto) {
    const fromIdx = this.draggedStopIndex();
    if (fromIdx === null || fromIdx === index) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex.set(index);
  }

  onTimelineDragLeave(event: DragEvent, index: number) {
    if (this.dragOverIndex() === index) {
      this.dragOverIndex.set(null);
    }
  }

  onTimelineDrop(event: DragEvent, dropIndex: number, targetStop: OrderedStopDto) {
    event.preventDefault();
    event.stopPropagation();

    const fromIdx = this.draggedStopIndex();
    this.draggedStopIndex.set(null);
    this.dragOverIndex.set(null);

    const currentResult = this.optimizationResult();
    if (fromIdx === null || !currentResult || fromIdx === dropIndex) return;

    const ordered = [...currentResult.ordered_stops];
    if (ordered[fromIdx]?.action !== 'VISIT') return;

    // Se dropIndex for a base de partida (0), posiciona na primeira visita (1)
    let adjustedDropIndex = dropIndex;
    if (adjustedDropIndex <= 0) {
      adjustedDropIndex = 1;
    }

    // Se dropIndex for o retorno ou além, posiciona antes do retorno
    const returnIndex = ordered.findIndex(s => s.action === 'RETURN');
    if (returnIndex !== -1 && adjustedDropIndex >= returnIndex) {
      adjustedDropIndex = returnIndex - 1;
    }
    if (adjustedDropIndex < 1) adjustedDropIndex = 1;

    if (fromIdx === adjustedDropIndex) return;

    // Reordena o array ordered_stops
    const [movedItem] = ordered.splice(fromIdx, 1);
    ordered.splice(adjustedDropIndex, 0, movedItem);

    // Atualiza numeração dos passos (steps) para atualização visual instantânea
    let stepCount = 1;
    for (const st of ordered) {
      if (st.action === 'VISIT') {
        st.step = stepCount++;
      } else if (st.action === 'RETURN') {
        st.step = stepCount;
      }
    }

    this.optimizationResult.set({
      ...currentResult,
      ordered_stops: ordered
    });

    // Recalcula o itinerário viário completo com base na nova sequência
    this.recalculateFromOrderedStops(ordered);
  }

  onTimelineDragEnd() {
    this.draggedStopIndex.set(null);
    this.dragOverIndex.set(null);
  }

  // Recalcula a rota preservando rigorosamente a nova sequência manual
  recalculateFromOrderedStops(orderedStops: OrderedStopDto[]) {
    const visitStops = orderedStops.filter(s => s.action === 'VISIT');
    if (visitStops.length === 0) return;

    this.isRecalculating.set(true);
    this.clearLegFilter();

    const reorderedDeliveryStops: DeliveryStopDto[] = visitStops.map(vs => {
      const orig = this.stops().find(s => s.id === vs.id);
      return {
        id: vs.id,
        name: vs.name,
        lat: vs.lat ?? orig?.lat ?? 0,
        lon: vs.lon ?? orig?.lon ?? 0,
        priority: (vs.priority ?? orig?.priority ?? 'REGULAR') as any,
        service_duration_minutes: vs.service_duration_minutes ?? orig?.service_duration_minutes,
        target_arrival_time: vs.target_arrival_time ?? orig?.target_arrival_time,
        address: vs.address ?? orig?.address,
        fixed_order: orig?.fixed_order
      };
    });

    // Mantém sincronizada a lista de paradas da aba 1
    this.stops.set(reorderedDeliveryStops);

    const depTime = this.departureTime()?.trim() ? this.departureTime().trim() : undefined;
    const payload = {
      depot: this.depot(),
      stops: reorderedDeliveryStops,
      return_to_depot: true,
      departure_time: depTime
    };

    this.routingService.recalculateRoute(payload).subscribe({
      next: (res) => {
        this.isRecalculating.set(false);
        this.optimizationResult.set(res);
        this.drawRouteOnMap(res.geojson_geometry);
        this.renderMarkers();
        this.showToast('Ordem alterada manualmente e rota recalculada!');
      },
      error: (err) => {
        this.isRecalculating.set(false);
        this.showToast('Erro ao recalcular métricas da rota viária.');
        console.error(err);
      }
    });
  }

  // Mapa de referências de marcadores Leaflet
  private stopMarkers: Map<string, any> = new Map();
  private routeLayersMap: Map<number, any> = new Map();
  private fullGeoJson: any = null;

  // Foca e centraliza o mapa em uma parada específica e destaca o trecho correspondente até ela
  focusStopOnMap(step: OrderedStopDto) {
    if (!this.map) return;
    let lat = step.lat;
    let lon = step.lon;
    if (lat === undefined || lon === undefined) {
      if (step.action !== 'VISIT') {
        lat = this.depot().lat;
        lon = this.depot().lon;
      } else {
        const found = this.stops().find(s => s.id === step.id);
        lat = found?.lat;
        lon = found?.lon;
      }
    }
    if (lat && lon) {
      this.map.flyTo([lat, lon], 15, { animate: true, duration: 0.6 });
      const marker = this.stopMarkers.get(step.id) || (step.action !== 'VISIT' ? this.stopMarkers.get('depot') : null);
      if (marker) {
        setTimeout(() => marker.openPopup(), 350);
      }
    }

    // Se for uma parada de visita ou retorno (step > 0), filtra e destaca o trecho até ela
    if (step.step > 0) {
      const legIdx = step.step - 1;
      this.toggleLegFilter(legIdx);
    } else {
      this.clearLegFilter();
    }
  }

  // Alterna o filtro de trecho específico
  toggleLegFilter(legIndex: number) {
    if (this.selectedLegIndex() === legIndex) {
      this.selectedLegIndex.set(null);
    } else {
      this.selectedLegIndex.set(legIndex);
    }
    this.updateRouteStyles();
  }

  // Limpa o filtro de trecho e restaura visualização de todos
  clearLegFilter() {
    this.selectedLegIndex.set(null);
    this.updateRouteStyles();
  }

  // Atualiza as opacidades e espessuras dos trechos viários no Leaflet
  private updateRouteStyles() {
    const selected = this.selectedLegIndex();
    const isAnySelected = selected !== null;

    this.routeLayersMap.forEach((layer, legIdx) => {
      const isSelected = selected === legIdx;
      const color = layer.feature?.properties?.color || this.getLegColor(legIdx);

      let weight = 6;
      let opacity = 0.85;
      if (isSelected) {
        weight = 8;
        opacity = 1.0;
      } else if (isAnySelected) {
        weight = 3.5;
        opacity = 0.20;
      }

      layer.setStyle({
        color: color,
        weight: weight,
        opacity: opacity
      });

      if (isSelected) {
        layer.bringToFront();
      }
    });
  }

  // Helpers para Badges de Trânsito
  getTrafficLabel(cond?: string): string {
    if (!cond || cond === 'LIVRE') return 'Fluxo Livre';
    if (cond === 'PICO_MANHA') return 'Pico da Manhã';
    if (cond === 'PICO_ALMOCO') return 'Pico Almoço';
    if (cond === 'PICO_TARDE') return 'Pico Tarde/Noite';
    if (cond === 'MODERADO_RODOVIA') return 'Rodovia Fluida';
    if (cond === 'MODERADO') return 'Trânsito Moderado';
    return cond;
  }

  getTrafficBadgeClass(cond?: string): string {
    if (!cond || cond === 'LIVRE') return 'traffic--clear';
    if (cond.startsWith('PICO')) return 'traffic--heavy';
    return 'traffic--moderate';
  }

  // Desenha os marcadores no Leaflet com destaque visual para o roteiro IA
  private renderMarkers() {
    if (!this.markersLayer || !L) return;
    this.markersLayer.clearLayers();
    this.stopMarkers.clear();

    const base = this.depot();
    const optRes = this.optimizationResult();
    const isOptimized = !!optRes && optRes.ordered_stops && optRes.ordered_stops.length > 0;

    // 1. Marcador da Base (Ponto de Partida)
    const baseIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div class="custom-pin-wrapper pin--depot">
          <div class="pin-bubble">🏢</div>
          <div class="pin-arrow"></div>
          <div class="pin-label-pill">Partida: ${base.name}</div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48]
    });

    const baseMarker = L.marker([base.lat, base.lon], { icon: baseIcon })
      .bindPopup(`
        <div class="popup-card">
          <div class="popup-card__header">
            <span class="popup-step">Ponto de Partida</span>
            <span class="popup-time"><i class="fa-regular fa-clock"></i> ${optRes?.departure_clock || this.departureTime()}</span>
          </div>
          <div class="popup-card__title">${base.name}</div>
          <div class="popup-card__addr">${base.address?.full_address || ''}</div>
          <div class="popup-card__footer">
            <span class="popup-badge popup-badge--regular">Base Oficial</span>
          </div>
        </div>
      `)
      .addTo(this.markersLayer);
    
    this.stopMarkers.set('depot', baseMarker);

    // 2. Se o roteiro foi otimizado pela IA, desenha os pinos na sequência inteligente (#1, #2...)
    if (isOptimized && optRes) {
      this.renderOptimizedMarkers(optRes);
      return;
    }

    // 3. Modo de Planejamento Inicial (antes de rodar a IA)
    this.renderPlanningMarkers();
  }

  private getPriorityBadgeClass(priority?: string): string {
    if (priority === 'CRITICAL') return 'popup-badge--critical';
    if (priority === 'HIGH') return 'popup-badge--high';
    return 'popup-badge--regular';
  }

  private renderOptimizedMarkers(optRes: OptimizeRouteResponse) {
    optRes.ordered_stops.forEach((s) => {
      if (s.action !== 'VISIT') return;

      const lat = s.lat ?? this.stops().find(x => x.id === s.id)?.lat;
      const lon = s.lon ?? this.stops().find(x => x.id === s.id)?.lon;
      if (lat === undefined || lon === undefined) return;

      let pinClass = 'pin--optimized';
      if (s.priority === 'CRITICAL') pinClass += ' pin--critical';
      else if (s.priority === 'HIGH') pinClass += ' pin--high';
      if (s.is_fixed) pinClass += ' pin--fixed';

      const priorityLabel = this.getPriorityLabel(s.priority);
      const priorityBadgeClass = this.getPriorityBadgeClass(s.priority);
      const timeDisplay = s.estimated_arrival_clock 
        ? `${s.estimated_arrival_clock} - ${s.estimated_departure_clock || ''}` 
        : `+${s.arrival_time_minutes.toFixed(0)} min`;

      const pinIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="custom-pin-wrapper ${pinClass}">
            <div class="pin-bubble">
              ${s.is_fixed ? '🔒' : ''} #${s.step}
            </div>
            <div class="pin-arrow"></div>
            <div class="pin-label-pill">#${s.step} ${s.name}</div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48]
      });

      const stopMarker = L.marker([lat, lon], { icon: pinIcon })
        .bindPopup(`
          <div class="popup-card">
            <div class="popup-card__header">
              <span class="popup-step">Parada #${s.step}</span>
              <span class="popup-time"><i class="fa-regular fa-clock"></i> ${timeDisplay}</span>
            </div>
            <div class="popup-card__title">${s.name}</div>
            <div class="popup-card__addr">${s.address?.full_address || ''}</div>
            <div class="popup-card__footer">
              <span class="popup-badge ${priorityBadgeClass}">${priorityLabel}</span>
              ${s.service_duration_minutes ? `<span class="popup-duration">⏳ ${s.service_duration_minutes} min</span>` : ''}
              ${s.traffic_condition && s.traffic_condition !== 'LIVRE' ? `<span class="popup-traffic">🚗 ${this.getTrafficLabel(s.traffic_condition)}</span>` : ''}
              ${s.is_fixed ? '<span class="popup-fixed">🔒 Ordem Travada</span>' : '<span class="popup-ai">⚡ Otimizado IA</span>'}
            </div>
          </div>
        `)
        .addTo(this.markersLayer);

      this.stopMarkers.set(s.id, stopMarker);
    });
  }

  private renderPlanningMarkers() {
    this.stops().forEach((s, idx) => {
      let pinClass = '';
      if (s.fixed_order) {
        pinClass = 'pin--fixed';
      } else if (s.priority === 'CRITICAL') {
        pinClass = 'pin--critical';
      } else if (s.priority === 'HIGH') {
        pinClass = 'pin--high';
      }

      const pinBadge = s.fixed_order ? `🔒 #${s.fixed_order}` : `#${idx + 1}`;
      const priorityLabel = this.getPriorityLabel(s.priority);
      const priorityBadgeClass = this.getPriorityBadgeClass(s.priority);

      const stopIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="custom-pin-wrapper ${pinClass}">
            <div class="pin-bubble">${pinBadge}</div>
            <div class="pin-arrow"></div>
            <div class="pin-label-pill">${s.name}</div>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 48]
      });

      const stopMarker = L.marker([s.lat, s.lon], { icon: stopIcon })
        .bindPopup(`
          <div class="popup-card">
            <div class="popup-card__header">
              <span class="popup-step">${s.fixed_order ? 'Ordem Fixada' : `Parada #${idx + 1}`}</span>
              ${s.service_duration_minutes ? `<span class="popup-time">⏳ ${s.service_duration_minutes} min</span>` : ''}
            </div>
            <div class="popup-card__title">${s.name}</div>
            <div class="popup-card__addr">${s.address?.full_address || ''}</div>
            <div class="popup-card__footer">
              <span class="popup-badge ${priorityBadgeClass}">${priorityLabel}</span>
              ${s.fixed_order ? `<span class="popup-fixed">🔒 Posição #${s.fixed_order}</span>` : '<span class="popup-badge popup-badge--regular">Ordem Livre</span>'}
            </div>
          </div>
        `)
        .addTo(this.markersLayer);

      this.stopMarkers.set(s.id, stopMarker);
    });
  }

  // Desenha os trechos da rota no Leaflet com cores exclusivas por trecho
  private drawRouteOnMap(geojson: any) {
    if (!this.routeLayer || !L || !geojson) return;
    this.routeLayer.clearLayers();
    this.routeLayersMap.clear();
    this.fullGeoJson = geojson;

    const canvasRenderer = L.canvas({ padding: 0.5 });

    const routePolyline = L.geoJSON(geojson, {
      renderer: canvasRenderer,
      style: (feature: any) => {
        const legIdx = feature?.properties?.leg_index ?? 0;
        const color = feature?.properties?.color || this.getLegColor(legIdx);
        const isSelected = this.selectedLegIndex() === legIdx;
        const isAnySelected = this.selectedLegIndex() !== null;

        let weight = 6;
        let opacity = 0.85;
        if (isSelected) {
          weight = 8;
          opacity = 1.0;
        } else if (isAnySelected) {
          weight = 3.5;
          opacity = 0.20;
        }

        return {
          color: color,
          weight: weight,
          opacity: opacity,
          lineJoin: 'round',
          lineCap: 'round'
        };
      },
      onEachFeature: (feature: any, layer: any) => {
        const legIdx = feature?.properties?.leg_index;
        if (legIdx !== undefined) {
          this.routeLayersMap.set(legIdx, layer);
          layer.on('click', (e: any) => {
            if (L.DomEvent) L.DomEvent.stopPropagation(e);
            this.toggleLegFilter(legIdx);
          });
        }
      }
    }).addTo(this.routeLayer);

    if (this.map && routePolyline.getBounds().isValid()) {
      this.map.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
    }
  }

  // Abre o modal institucional para escolha de exportação de PDF (Regra P-222)
  openExportPdfModal() {
    const res = this.optimizationResult();
    if (!res) {
      this.showToast('Otimize a rota antes de exportar o PDF.');
      return;
    }
    this.showExportPdfModal.set(true);
  }

  // Confirma a opção de exportação do modal (Com Mapa ou Sem Mapa)
  confirmExportPdf(includeMap: boolean) {
    this.showExportPdfModal.set(false);
    this.exportPdf(includeMap);
  }

  // Exportação Oficial em PDF com ou sem Imagem do Mapa (Regras P-105, P-222 e P-223)
  async exportPdf(includeMap: boolean = true) {
    const res = this.optimizationResult();
    if (!res) {
      this.showToast('Otimize a rota antes de exportar o PDF.');
      return;
    }

    this.isExportingPdf.set(true);

    try {
      let mapImgBase64 = '';

      // 1. Captura da imagem do mapa somente se includeMap for verdadeiro
      if (includeMap) {
        const mapElement = document.getElementById('sellerRouteMap');
        if (mapElement && this.map) {
          // Assegura que todos os trechos estão com opacidade total no PDF
          const prevFilter = this.selectedLegIndex();
          this.selectedLegIndex.set(null);
          this.updateRouteStyles();

          // Aguarda estabilização da renderização no canvas do Leaflet
          await new Promise(resolve => setTimeout(resolve, 150));

          const canvas = await html2canvas(mapElement, {
            useCORS: true,
            allowTaint: true,
            scale: 1.5,
            logging: false
          });

          mapImgBase64 = canvas.toDataURL('image/png');

          // Restaura estado prévio de filtro
          if (prevFilter !== null) {
            this.selectedLegIndex.set(prevFilter);
            this.updateRouteStyles();
          }
        }
      }

      // 2. Criação do documento PDF com jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Cores Fitoherb
      const primaryColor = '#1E3A8A';
      const secondaryColor = '#4B5563';

      // Cabeçalho
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(primaryColor);
      doc.text('FITOHERB NORDESTE', 14, 20);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor);
      const today = new Date().toLocaleDateString('pt-BR');
      const docSubtitle = includeMap ? 'Roteiro Oficial de Visitas (com Mapa)' : 'Roteiro Oficial de Visitas (Itinerário)';
      doc.text(`${docSubtitle} - ${today}`, 14, 26);
      doc.text(`Ponto de Partida: ${this.depot().name}`, 14, 31);

      // KPI Box
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(14, 36, 182, 16, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor('#1F2937');
      doc.text(`Distância Total: ${res.total_distance_km.toFixed(1)} km`, 20, 46);
      doc.text(`Tempo Estimado: ${res.total_time_minutes.toFixed(0)} min`, 85, 46);
      doc.text(`Total de Paradas: ${res.stops_count} visitas`, 145, 46);

      // Posição inicial da tabela dependente da inclusão do mapa (Regra P-223)
      let y = 58;

      // Imagem do Mapa (se includeMap estiver ativo)
      if (includeMap && mapImgBase64) {
        doc.addImage(mapImgBase64, 'PNG', 14, 56, 182, 75);
        y = 140;
      }

      // Tabela de Paradas
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor);
      doc.text('Itinerário Sequencial de Visitas (Sem Exposição de Coordenadas):', 14, y);
      y += 6;

      // Header da Tabela
      doc.setFillColor(primaryColor);
      doc.rect(14, y, 182, 7, 'F');
      doc.setTextColor('#FFFFFF');
      doc.setFontSize(8);
      doc.text('#', 17, y + 5);
      doc.text('Local / Cliente', 26, y + 5);
      doc.text('Endereço Completo', 75, y + 5);
      doc.text('Previsão', 155, y + 5);
      doc.text('Ordem', 175, y + 5);
      y += 7;

      // Linhas da Tabela
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      res.ordered_stops.forEach((stop, index) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }

        const isEven = index % 2 === 0;
        if (isEven) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, y, 182, 6.5, 'F');
        }

        doc.setTextColor('#111827');
        let stepLabel = `#${stop.step}`;
        if (stop.action === 'DEPARTURE') {
          stepLabel = 'Partida';
        } else if (stop.action === 'RETURN') {
          stepLabel = 'Retorno';
        }

        doc.text(stepLabel, 17, y + 4.5);
        doc.text(stop.name.substring(0, 24), 26, y + 4.5);

        const addr = stop.address?.full_address || `${stop.address?.street || ''}, ${stop.address?.number || ''} - ${stop.address?.neighborhood || ''}`;
        doc.text(addr.substring(0, 48), 75, y + 4.5);

        doc.text(`+${stop.arrival_time_minutes.toFixed(0)} min`, 155, y + 4.5);
        doc.text(stop.is_fixed ? 'Fixado' : 'IA', 175, y + 4.5);

        y += 6.5;
      });

      // Rodapé Institucional
      doc.setFontSize(7);
      doc.setTextColor('#9CA3AF');
      doc.text(
        'Fitoherb Nordeste - Distribuidora Líder em Nutrição Esportiva e Suplementos | Rua Itaeté, 434 - Lauro de Freitas - BA',
        14,
        290
      );

      // Download com nomenclatura explicativa
      const fileSuffix = includeMap ? 'com_mapa' : 'sem_mapa';
      doc.save(`roteiro_fitoherb_${fileSuffix}_${today.replaceAll('/', '-')}.pdf`);
      this.showToast(`PDF ${includeMap ? 'com mapa' : 'sem mapa'} exportado com sucesso!`);
    } catch (e) {
      console.error('Erro ao gerar PDF', e);
      this.showToast('Erro ao exportar PDF.');
    } finally {
      this.isExportingPdf.set(false);
    }
  }


  showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
