import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SellerRoutesComponent } from './seller-routes.component';
import { CommercialRoutingService } from '../../../../services/commercial-routing/commercial-routing.service';
import { SavedLocationsService } from '../../../../services/saved-locations/saved-locations.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ScheduledRoutesService } from '../../../../services/scheduled-routes/scheduled-routes.service';
import { OptimizeRouteResponse } from '../../../../types/routing/routing.interface';
import { of } from 'rxjs';

describe('SellerRoutesComponent - Fuzzy Search, City Insights (P-107), Suggestions (P-108) & Batch Staging (P-109)', () => {
  let component: SellerRoutesComponent;
  let fixture: ComponentFixture<SellerRoutesComponent>;
  let routingService: jasmine.SpyObj<CommercialRoutingService>;
  let savedLocationsService: jasmine.SpyObj<SavedLocationsService>;

  beforeEach(async () => {
    const routingSpy = jasmine.createSpyObj('CommercialRoutingService', [
      'searchAddress',
      'reverseGeocode',
      'optimizeRoute',
      'recalculateRoute'
    ]);
    const savedLocSpy = jasmine.createSpyObj('SavedLocationsService', [
      'getAll',
      'getBase',
      'create',
      'delete',
      'update'
    ]);
    savedLocSpy.getAll.and.returnValue(of([
      {
        id: '1',
        title: 'Farmácia Drogasil Pituba',
        type: 'FAVORITE',
        latitude: -12.99,
        longitude: -38.45,
        neighborhood: 'Pituba',
        city: 'Salvador',
        street: 'Av Manoel Dias',
        fullAddress: 'Av Manoel Dias, Pituba, Salvador'
      },
      {
        id: '2',
        title: 'Farmácia São Marcos Lauro',
        type: 'FAVORITE',
        latitude: -12.8995,
        longitude: -38.3245,
        neighborhood: 'Centro',
        city: 'Lauro de Freitas',
        street: 'Rua Itaeté',
        fullAddress: 'Rua Itaeté, Centro, Lauro de Freitas'
      },
      {
        id: '3',
        title: 'Farmácia Itapoan Farol',
        type: 'FAVORITE',
        latitude: -12.935,
        longitude: -38.365,
        neighborhood: 'Itapuã',
        city: 'Salvador',
        street: 'Rua das Dunas',
        fullAddress: 'Rua das Dunas, Itapoan, Salvador'
      }
    ]));

    const authSpy = jasmine.createSpyObj('AuthService', ['getUser']);
    authSpy.getUser.and.returnValue(of(null));

    const scheduledSpy = jasmine.createSpyObj('ScheduledRoutesService', ['getRouteDates', 'getRouteByDate']);
    scheduledSpy.getRouteDates.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SellerRoutesComponent, HttpClientTestingModule],
      providers: [
        { provide: CommercialRoutingService, useValue: routingSpy },
        { provide: SavedLocationsService, useValue: savedLocSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ScheduledRoutesService, useValue: scheduledSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SellerRoutesComponent);
    component = fixture.componentInstance;
    routingService = TestBed.inject(CommercialRoutingService) as jasmine.SpyObj<CommercialRoutingService>;
    savedLocationsService = TestBed.inject(SavedLocationsService) as jasmine.SpyObj<SavedLocationsService>;
    fixture.detectChanges();
  });

  it('should initialize with export modal closed', () => {
    expect(component.showExportPdfModal()).toBeFalse();
    expect(component.isExportingPdf()).toBeFalse();
  });

  it('should open export pdf modal when route is optimized', () => {
    component.optimizationResult.set({
      total_distance_km: 15.5,
      total_time_minutes: 45,
      stops_count: 2,
      ordered_stops: [],
      geojson_geometry: { type: 'FeatureCollection', features: [] },
      fitness_history: []
    });

    component.openExportPdfModal();
    expect(component.showExportPdfModal()).toBeTrue();
  });

  it('should close modal and invoke exportPdf on confirmExportPdf', () => {
    spyOn(component, 'exportPdf');
    component.showExportPdfModal.set(true);

    component.confirmExportPdf(false);
    expect(component.showExportPdfModal()).toBeFalse();
    expect(component.exportPdf).toHaveBeenCalledWith(false);
  });

  it('should find saved locations with typo (fuzzy matching) and without accents', () => {
    component.searchQuery = 'drogazil';
    const results = component.filteredSavedLocations;
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toContain('Drogasil');

    component.searchQuery = 'sao marcos';
    const resultsUnaccented = component.filteredSavedLocations;
    expect(resultsUnaccented.length).toBeGreaterThanOrEqual(1);
    expect(resultsUnaccented[0].title).toContain('São Marcos');
  });

  it('should match locations phonetically, such as itapuã matching Itapoan and vice-versa', () => {
    component.searchQuery = 'itapuã';
    const results = component.filteredSavedLocations;
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toBe('Farmácia Itapoan Farol');

    component.searchQuery = 'itapua';
    const resultsUnaccented = component.filteredSavedLocations;
    expect(resultsUnaccented.length).toBeGreaterThanOrEqual(1);
    expect(resultsUnaccented[0].title).toBe('Farmácia Itapoan Farol');
  });

  it('should prioritize results closer to depot in filteredSavedLocations', () => {
    component.searchQuery = 'farmacia';
    const results = component.filteredSavedLocations;
    expect(results).toHaveSize(3);
    expect(results[0].city).toBe('Lauro de Freitas');
    expect(results[0]._distanceKm).toBeLessThan(results[1]._distanceKm!);
  });

  it('should auto-save route when optimizeRoute succeeds', () => {
    spyOn(component, 'autoSaveRoute');
    component.stops.set([
      {
        id: 'stop-1',
        name: 'Cliente 1',
        lat: -12.9,
        lon: -38.3,
        demand: 1,
        priority: 'REGULAR'
      }
    ]);

    const mockResponse: OptimizeRouteResponse = {
      total_distance_km: 10,
      total_time_minutes: 30,
      stops_count: 1,
      ordered_stops: [],
      geojson_geometry: { type: 'FeatureCollection', features: [] },
      fitness_history: []
    };
    routingService.optimizeRoute.and.returnValue(of(mockResponse));

    component.optimizeRoute();
    expect(component.autoSaveRoute).toHaveBeenCalledWith(mockResponse);
  });

  // ============================================================================
  // [P-107, P-108, P-109] City Insights, Proactive Suggestions & Batch Staging
  // ============================================================================

  it('[P-107] should toggle city insights panel and expose demographic metrics from optimizationResult', () => {
    // Arrange
    expect(component.isCityInsightsExpanded()).toBeTrue();
    const mockRes: OptimizeRouteResponse = {
      total_distance_km: 24.5,
      total_time_minutes: 55,
      stops_count: 2,
      ordered_stops: [],
      geojson_geometry: { type: 'FeatureCollection', features: [] },
      fitness_history: [],
      city_insights: [
        {
          city: 'Salvador',
          state: 'BA',
          ibge_code: '2927408',
          population: 2417678,
          city_tier: 'METROPOLIS',
          city_tier_label: 'Metrópole (> 1M hab)',
          demographic_density_hab_km2: 3486.5,
          gdp_per_capita_brl: 27540.0,
          regional_hub_name: 'Capital / Região Metropolitana (RMS)',
          commercial_potential_summary: 'Alto giro em suplementos e redes de drogarias.',
          confirmed_stops_count: 1,
          suggested_leads_count: 1,
          estimated_dwell_minutes: 35
        }
      ]
    };

    // Act
    component.optimizationResult.set(mockRes);
    component.toggleCityInsights();

    // Assert
    expect(component.isCityInsightsExpanded()).toBeFalse();
    expect(component.optimizationResult()?.city_insights?.length).toBe(1);
    expect(component.optimizationResult()?.city_insights?.[0].city).toBe('Salvador');
  });

  it('[P-108 / P-109] should stage multiple removals without calling backend on each click, support undo, and recalculate only once on commit', () => {
    // Arrange: Rota otimizada com 1 parada confirmada e 3 sugestões descobertas pela IA
    spyOn(component, 'autoSaveRoute');
    component.stops.set([
      {
        id: 'stop-confirmed-1',
        name: 'Drogaria São Paulo - Pituba',
        lat: -12.9984,
        lon: -38.4908,
        priority: 'HIGH',
        is_suggestion: false
      }
    ]);

    const initialOptResponse: OptimizeRouteResponse = {
      total_distance_km: 32.0,
      total_time_minutes: 70.0,
      stops_count: 4,
      ordered_stops: [
        {
          step: 0,
          id: 'fitoherb-hq',
          name: 'Fitoherb Nordeste (Matriz)',
          action: 'DEPARTURE',
          is_fixed: true,
          priority: 'BASE',
          arrival_time_minutes: 0
        },
        {
          step: 1,
          id: 'stop-confirmed-1',
          name: 'Drogaria São Paulo - Pituba',
          action: 'VISIT',
          is_fixed: false,
          priority: 'HIGH',
          arrival_time_minutes: 25,
          lat: -12.9984,
          lon: -38.4908,
          is_suggestion: false
        },
        {
          step: 2,
          id: 'sug-1',
          name: 'Mundo Verde - Pituba',
          action: 'VISIT',
          is_fixed: false,
          priority: 'REGULAR',
          arrival_time_minutes: 30,
          lat: -13.0012,
          lon: -38.4865,
          is_suggestion: true,
          suggestion_category: 'PRODUTOS_NATURAIS',
          detour_distance_km: 0.9,
          detour_time_minutes: 3.0
        },
        {
          step: 3,
          id: 'sug-2',
          name: 'Farmácia SantAna - Itaigara',
          action: 'VISIT',
          is_fixed: false,
          priority: 'REGULAR',
          arrival_time_minutes: 38,
          lat: -12.9950,
          lon: -38.4750,
          is_suggestion: true,
          suggestion_category: 'FARMACIA',
          detour_distance_km: 1.2,
          detour_time_minutes: 4.0
        },
        {
          step: 4,
          id: 'sug-3',
          name: 'Empório Vida Natural - Costa Azul',
          action: 'VISIT',
          is_fixed: false,
          priority: 'REGULAR',
          arrival_time_minutes: 45,
          lat: -12.9890,
          lon: -38.4420,
          is_suggestion: true,
          suggestion_category: 'PRODUTOS_NATURAIS',
          detour_distance_km: 1.4,
          detour_time_minutes: 4.5
        },
        {
          step: 5,
          id: 'fitoherb-hq',
          name: 'Fitoherb Nordeste (Matriz)',
          action: 'RETURN',
          is_fixed: true,
          priority: 'BASE',
          arrival_time_minutes: 70
        }
      ],
      geojson_geometry: { type: 'FeatureCollection', features: [] },
      fitness_history: []
    };

    routingService.optimizeRoute.and.returnValue(of(initialOptResponse));
    component.optimizeRoute();

    // Reseta os contadores de chamada HTTP após a previsão inicial
    routingService.optimizeRoute.calls.reset();
    routingService.recalculateRoute.calls.reset();

    expect(component.stops().length).toBe(4);
    expect(component.hasPendingBatchChanges()).toBeFalse();
    expect(component.pendingBatchChangesCount()).toBe(0);

    // Act 1: Remover 3 sugestões seguidas na lista (Manejo em Lote P-109)
    component.removeStopFromTimeline('sug-1');
    component.removeStopFromTimeline('sug-2');
    component.removeStopFromTimeline('sug-3');

    // Assert 1: NENHUMA requisição ao backend deve ter sido disparada durante os cliques individuais
    expect(routingService.optimizeRoute).not.toHaveBeenCalled();
    expect(routingService.recalculateRoute).not.toHaveBeenCalled();
    expect(component.hasPendingBatchChanges()).toBeTrue();
    expect(component.pendingBatchChangesCount()).toBe(3);
    expect(component.stops().length).toBe(1);
    expect(component.stops()[0].id).toBe('stop-confirmed-1');

    // Act 2: Testar Desfazer Alterações (undoBatchChanges)
    component.undoBatchChanges();

    // Assert 2: Snapshot original restaurado sem chamadas HTTP
    expect(component.hasPendingBatchChanges()).toBeFalse();
    expect(component.pendingBatchChangesCount()).toBe(0);
    expect(component.stops().length).toBe(4);
    expect(routingService.optimizeRoute).not.toHaveBeenCalled();
    expect(routingService.recalculateRoute).not.toHaveBeenCalled();

    // Act 3: Remover novamente 2 sugestões, confirmar 1 sugestão e clicar em "Concluir Manejo e Recalcular Rota"
    component.removeStopFromTimeline('sug-2');
    component.removeStopFromTimeline('sug-3');
    component.confirmSuggestionInRoute('sug-1');

    expect(component.hasPendingBatchChanges()).toBeTrue();
    expect(component.pendingBatchChangesCount()).toBe(3);
    expect(routingService.recalculateRoute).not.toHaveBeenCalled();

    const recalculatedResponse: OptimizeRouteResponse = {
      ...initialOptResponse,
      stops_count: 2,
      total_distance_km: 26.4,
      total_time_minutes: 52.0
    };
    routingService.recalculateRoute.and.returnValue(of(recalculatedResponse));

    component.commitBatchChangesAndRecalculate();

    // Assert 3: Exatamente 1 chamada disparada ao backend com as 2 paradas mantidas e discover_suggestions: false
    expect(routingService.recalculateRoute).toHaveBeenCalledTimes(1);
    const recalcArg = routingService.recalculateRoute.calls.mostRecent().args[0];
    expect(recalcArg.stops.length).toBe(2);
    expect(recalcArg.discover_suggestions).toBeFalse();
    expect(component.hasPendingBatchChanges()).toBeFalse();
    expect(component.pendingBatchChangesCount()).toBe(0);
  });
});
