import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SellerRoutesComponent } from './seller-routes.component';
import { CommercialRoutingService } from '../../../../services/commercial-routing/commercial-routing.service';
import { SavedLocationsService } from '../../../../services/saved-locations/saved-locations.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ScheduledRoutesService } from '../../../../services/scheduled-routes/scheduled-routes.service';
import { of } from 'rxjs';

describe('SellerRoutesComponent - Fuzzy Search and PDF Modal', () => {
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
    // Simula que existe rota otimizada
    (component as any).optimizationResult.set({
      total_distance_km: 15.5,
      total_time_minutes: 45,
      stops_count: 2,
      ordered_stops: []
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
    // Busca com typo "drogazil" (em vez de Drogasil)
    component.searchQuery = 'drogazil';
    const results = component.filteredSavedLocations;
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toContain('Drogasil');

    // Busca sem acento "sao marcos" (em vez de São Marcos)
    component.searchQuery = 'sao marcos';
    const resultsUnaccented = component.filteredSavedLocations;
    expect(resultsUnaccented.length).toBeGreaterThanOrEqual(1);
    expect(resultsUnaccented[0].title).toContain('São Marcos');
  });

  it('should match locations phonetically, such as itapuã matching Itapoan and vice-versa', () => {
    // Busca por "itapuã" deve encontrar "Farmácia Itapoan Farol"
    component.searchQuery = 'itapuã';
    const results = component.filteredSavedLocations;
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].title).toBe('Farmácia Itapoan Farol');

    // Busca por "itapua" (sem acento) também
    component.searchQuery = 'itapua';
    const resultsUnaccented = component.filteredSavedLocations;
    expect(resultsUnaccented.length).toBeGreaterThanOrEqual(1);
    expect(resultsUnaccented[0].title).toBe('Farmácia Itapoan Farol');
  });

  it('should prioritize results closer to depot in filteredSavedLocations', () => {
    // Base está em Lauro de Freitas (-12.8992, -38.3242)
    // O local 2 (Lauro de Freitas) está a ~0.1 km, enquanto local 1 (Pituba) está a ~17 km
    component.searchQuery = 'farmacia';
    const results = component.filteredSavedLocations;
    expect(results).toHaveSize(3);
    // O mais próximo da base (Lauro) deve estar na frente
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

    const mockResponse: any = {
      total_distance_km: 10,
      total_time_minutes: 30,
      stops_count: 1,
      ordered_stops: [],
      geojson_geometry: { type: 'FeatureCollection', features: [] }
    };
    routingService.optimizeRoute.and.returnValue(of(mockResponse));

    component.optimizeRoute();
    expect(component.autoSaveRoute).toHaveBeenCalledWith(mockResponse);
  });
});
