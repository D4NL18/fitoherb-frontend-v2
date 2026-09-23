import { 
  Component, 
  OnInit, 
  AfterViewInit, 
  OnDestroy, 
  signal, 
  inject, 
  ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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

declare let L: any;

@Component({
  selector: 'app-seller-routes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-routes.component.html',
  styleUrl: './seller-routes.component.scss'
})
export class SellerRoutesComponent implements OnInit, AfterViewInit, OnDestroy {
  private savedLocationsService = inject(SavedLocationsService);
  private routingService = inject(CommercialRoutingService);
  private cdr = inject(ChangeDetectorRef);

  // Estados Reativos
  isLoading = signal<boolean>(false);
  isOptimizing = signal<boolean>(false);
  isExportingPdf = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  toastMessage = signal<string | null>(null);

  // Aba lateral ativa: 'stops' (gerenciamento) ou 'results' (itinerário da IA)
  activeSidebarTab = signal<'stops' | 'results'>('stops');

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

  depot = signal<LocationPointDto>(this.FITOHERB_HQ);
  isUsingCustomBase = signal<boolean>(false);

  // Lista de Paradas para a Rota do Vendedor
  stops = signal<DeliveryStopDto[]>([]);

  // Favoritos salvos no banco
  savedLocations = signal<SavedLocation[]>([]);

  // Resultados da Otimização da IA
  optimizationResult = signal<OptimizeRouteResponse | null>(null);

  // Trecho Ativo / Filtrado para Destaque no Mapa
  selectedLegIndex = signal<number | null>(null);

  // Paleta Harmoniosa de Cores para Identificação Visual dos Trechos
  readonly ROUTE_LEG_COLORS: string[] = [
    '#2563eb', // Trecho 1: Azul Real Vibrante
    '#d97706', // Trecho 2: Âmbar / Laranja
    '#7c3aed', // Trecho 3: Violeta / Roxo
    '#059669', // Trecho 4: Verde Esmeralda
    '#dc2626', // Trecho 5: Vermelho Carmim
    '#0891b2', // Trecho 6: Azul Petróleo / Ciano
    '#ea580c', // Trecho 7: Laranja Queimado
    '#4f46e5', // Trecho 8: Índigo
    '#c026d3', // Trecho 9: Magenta
    '#0d9488', // Trecho 10: Teal
    '#65a30d', // Trecho 11: Verde Lima
    '#475569'  // Trecho Retorno à Base: Ardósia
  ];

  getLegColor(legIndex: number): string {
    if (legIndex < 0) return '#2e4f24';
    return this.ROUTE_LEG_COLORS[legIndex % this.ROUTE_LEG_COLORS.length];
  }

  // Busca e Autocomplete de Endereços
  searchQuery: string = '';
  searchResults = signal<any[]>([]);
  isSearchingAddress = signal<boolean>(false);
  showSearchDropdown = signal<boolean>(false);
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Modal de Adição/Edição de Ponto (ao clicar no mapa ou editar)
  showPointModal = signal<boolean>(false);
  editingStopIndex = signal<number | null>(null);
  modalPointType: 'delivery' | 'base' = 'delivery';
  modalPointTitle: string = '';
  modalPointLat: number = 0;
  modalPointLon: number = 0;
  modalPointPriority: 'REGULAR' | 'HIGH' | 'CRITICAL' = 'REGULAR';
  modalPointFixedOrder: number | null = null;
  modalPointServiceMinutes: number | null = null;
  modalPointSaveFavorite: boolean = false;
  modalIsReverseGeocoding = signal<boolean>(false);

  // Parâmetros de Partida da Jornada Comercial (Horário Opcional)
  departureTime = signal<string>('08:00');

  // Modal de Gerenciamento e Exclusão de Favoritos Salvos
  showManageFavoritesModal = signal<boolean>(false);
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

  ngOnInit() {
    this.loadSavedLocations();

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

  // Locais salvos filtrados pela busca
  get filteredSavedLocations(): SavedLocation[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.savedLocations();
    return this.savedLocations().filter(l => 
      (l.title && l.title.toLowerCase().includes(q)) ||
      (l.neighborhood && l.neighborhood.toLowerCase().includes(q)) ||
      (l.city && l.city.toLowerCase().includes(q)) ||
      (l.street && l.street.toLowerCase().includes(q))
    );
  }

  // Foco no campo de busca: exibe sugestões imediatamente se houver favoritos salvos
  onSearchFocus() {
    if (this.savedLocations().length > 0 || this.searchResults().length > 0) {
      this.showSearchDropdown.set(true);
    }
  }

  // Executa busca via API de mapas com Nominatim / Proxy priorizando arredores da base
  executeAddressSearch(queryOverride?: string) {
    const q = (queryOverride !== undefined ? queryOverride : this.searchQuery).trim();
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
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
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
    const streetLabel = street ? `${street}${number ? ', ' + number : ''}` : '';
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

  // Lista de favoritos filtrados para o modal de gerenciamento
  get manageFilteredFavorites(): SavedLocation[] {
    const q = this.manageFavoritesSearchQuery.trim().toLowerCase();
    const favs = this.savedLocations().filter(l => l.type === 'FAVORITE');
    if (!q) return favs;
    return favs.filter(l => 
      (l.title && l.title.toLowerCase().includes(q)) ||
      (l.neighborhood && l.neighborhood.toLowerCase().includes(q)) ||
      (l.city && l.city.toLowerCase().includes(q)) ||
      (l.street && l.street.toLowerCase().includes(q)) ||
      (l.fullAddress && l.fullAddress.toLowerCase().includes(q))
    );
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

  // Mapa de referências de marcadores Leaflet
  private stopMarkers: Map<string, any> = new Map();
  private routeLayersMap: Map<number, any> = new Map();
  private fullGeoJson: any = null;

  // Foca e centraliza o mapa em uma parada específica e destaca o trecho correspondente até ela
  focusStopOnMap(step: OrderedStopDto) {
    if (!this.map) return;
    const lat = step.lat !== undefined ? step.lat : (step.action !== 'VISIT' ? this.depot().lat : this.stops().find(s => s.id === step.id)?.lat);
    const lon = step.lon !== undefined ? step.lon : (step.action !== 'VISIT' ? this.depot().lon : this.stops().find(s => s.id === step.id)?.lon);
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

      layer.setStyle({
        color: color,
        weight: isSelected ? 8 : (isAnySelected ? 3.5 : 6),
        opacity: isSelected ? 1.0 : (isAnySelected ? 0.20 : 0.85)
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
      optRes.ordered_stops.forEach((s) => {
        if (s.action !== 'VISIT') return;

        const lat = s.lat !== undefined ? s.lat : this.stops().find(x => x.id === s.id)?.lat;
        const lon = s.lon !== undefined ? s.lon : this.stops().find(x => x.id === s.id)?.lon;
        if (lat === undefined || lon === undefined) return;

        let pinClass = 'pin--optimized';
        if (s.priority === 'CRITICAL') pinClass += ' pin--critical';
        else if (s.priority === 'HIGH') pinClass += ' pin--high';
        if (s.is_fixed) pinClass += ' pin--fixed';

        const priorityLabel = this.getPriorityLabel(s.priority);
        const priorityBadgeClass = s.priority === 'CRITICAL' ? 'popup-badge--critical' : (s.priority === 'HIGH' ? 'popup-badge--high' : 'popup-badge--regular');
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
      return;
    }

    // 3. Modo de Planejamento Inicial (antes de rodar a IA)
    this.stops().forEach((s, idx) => {
      let pinClass = s.fixed_order ? 'pin--fixed' : (s.priority === 'CRITICAL' ? 'pin--critical' : (s.priority === 'HIGH' ? 'pin--high' : ''));
      const pinBadge = s.fixed_order ? `🔒 #${s.fixed_order}` : `#${idx + 1}`;
      const priorityLabel = this.getPriorityLabel(s.priority);
      const priorityBadgeClass = s.priority === 'CRITICAL' ? 'popup-badge--critical' : (s.priority === 'HIGH' ? 'popup-badge--high' : 'popup-badge--regular');

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
              <span class="popup-step">${s.fixed_order ? 'Ordem #' + s.fixed_order : 'Ponto #' + (idx + 1)}</span>
              <span class="popup-time">${s.fixed_order ? '🔒 Fixado' : '⚡ Livre'}</span>
            </div>
            <div class="popup-card__title">${s.name}</div>
            <div class="popup-card__addr">${s.address?.full_address || ''}</div>
            <div class="popup-card__footer">
              <span class="popup-badge ${priorityBadgeClass}">${priorityLabel}</span>
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

        return {
          color: color,
          weight: isSelected ? 8 : (isAnySelected ? 3.5 : 6),
          opacity: isSelected ? 1.0 : (isAnySelected ? 0.20 : 0.85),
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

  // Exportação Oficial em PDF com Imagem do Mapa (Regra P-105)
  async exportPdf() {
    const res = this.optimizationResult();
    if (!res) {
      this.showToast('Otimize a rota antes de exportar o PDF.');
      return;
    }

    this.isExportingPdf.set(true);

    try {
      // 1. Captura da imagem do mapa
      const mapElement = document.getElementById('sellerRouteMap');
      let mapImgBase64 = '';

      if (mapElement && this.map) {
        // Assegura que todos os trechos estão com opacidade total no PDF
        const prevFilter = this.selectedLegIndex();
        this.selectedLegIndex.set(null);
        this.updateRouteStyles();

        this.map.invalidateSize();

        const canvas = await html2canvas(mapElement, {
          useCORS: true,
          allowTaint: true,
          scale: 1.5,
          logging: false
        });

        // Desenha os trechos viários coloridos no canvas para garantir renderização perfeita no PDF
        const ctx = canvas.getContext('2d');
        if (ctx && this.fullGeoJson) {
          this.drawRoutePolylinesOnCanvas(ctx, this.fullGeoJson, 1.5);
        }

        mapImgBase64 = canvas.toDataURL('image/png');

        // Restaura estado prévio de filtro
        if (prevFilter !== null) {
          this.selectedLegIndex.set(prevFilter);
          this.updateRouteStyles();
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
      doc.text(`Roteiro Oficial de Visitas Comerciais - ${today}`, 14, 26);
      doc.text(`Ponto de Partida: ${this.depot().name}`, 14, 31);

      // KPI Box
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(14, 36, 182, 16, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setTextColor('#1F2937');
      doc.text(`Distância Total: ${res.total_distance_km.toFixed(1)} km`, 20, 46);
      doc.text(`Tempo Estimado: ${res.total_time_minutes.toFixed(0)} min`, 85, 46);
      doc.text(`Total de Paradas: ${res.stops_count} visitas`, 145, 46);

      // Imagem do Mapa
      if (mapImgBase64) {
        doc.addImage(mapImgBase64, 'PNG', 14, 56, 182, 75);
      }

      // Tabela de Paradas
      let y = 140;
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
        const stepLabel = stop.action === 'DEPARTURE' ? 'Partida' : (stop.action === 'RETURN' ? 'Retorno' : `#${stop.step}`);
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

      // Download
      doc.save(`roteiro_fitoherb_${today.replace(/\//g, '-')}.pdf`);
      this.showToast('PDF exportado com sucesso!');
    } catch (e) {
      console.error('Erro ao gerar PDF', e);
      this.showToast('Erro ao exportar PDF.');
    } finally {
      this.isExportingPdf.set(false);
    }
  }

  // Desenha os trechos viários diretamente no canvas do screenshot do PDF
  private drawRoutePolylinesOnCanvas(ctx: CanvasRenderingContext2D, geojson: any, scale: number) {
    if (!this.map || !geojson) return;

    const features = geojson.features || [];
    if (features.length === 0 && geojson.coordinates) {
      this.strokePathOnCanvas(ctx, geojson.coordinates, '#2e4f24', scale);
      return;
    }

    features.forEach((feat: any) => {
      const coords = feat.geometry?.coordinates || [];
      const color = feat.properties?.color || this.getLegColor(feat.properties?.leg_index ?? 0);
      this.strokePathOnCanvas(ctx, coords, color, scale);
    });
  }

  private strokePathOnCanvas(ctx: CanvasRenderingContext2D, coords: number[][], color: string, scale: number) {
    if (coords.length < 2) return;

    ctx.save();

    // Contorno suave em branco para contraste perfeito sobre o mapa
    ctx.beginPath();
    ctx.lineWidth = 6 * scale;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    coords.forEach((coord, idx) => {
      const pt = this.map.latLngToContainerPoint([coord[1], coord[0]]);
      const x = pt.x * scale;
      const y = pt.y * scale;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Traçado colorido oficial do trecho
    ctx.beginPath();
    ctx.lineWidth = 4 * scale;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.95;

    coords.forEach((coord, idx) => {
      const pt = this.map.latLngToContainerPoint([coord[1], coord[0]]);
      const x = pt.x * scale;
      const y = pt.y * scale;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.restore();
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
