import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OptimizeRouteRequest, OptimizeRouteResponse } from '../../types/routing/routing.interface';

@Injectable({
  providedIn: 'root'
})
export class CommercialRoutingService {
  private readonly http = inject(HttpClient);
  private readonly aiBaseUrl = (environment as any).aiUrl || 'http://localhost:8000/api/v1';

  optimizeRoute(request: OptimizeRouteRequest): Observable<OptimizeRouteResponse> {
    return this.http.post<OptimizeRouteResponse>(`${this.aiBaseUrl}/routing/optimize`, request);
  }

  recalculateRoute(request: OptimizeRouteRequest): Observable<OptimizeRouteResponse> {
    return this.http.post<OptimizeRouteResponse>(`${this.aiBaseUrl}/routing/recalculate`, request);
  }

  searchAddress(query: string, lat?: number, lon?: number): Observable<any[]> {
    const trimmed = query.trim();
    if (!trimmed) return of([]);
    const encoded = encodeURIComponent(trimmed);
    let proxyUrl = `${this.aiBaseUrl}/routing/search-address?q=${encoded}`;

    if (lat !== undefined && lon !== undefined) {
      proxyUrl += `&lat=${lat}&lon=${lon}`;
    }

    let photonDirect = `https://photon.komoot.io/api/?q=${encoded}&lang=pt&limit=12`;
    if (lat !== undefined && lon !== undefined) {
      photonDirect += `&lat=${lat}&lon=${lon}`;
    }

    return this.http.get<any[]>(proxyUrl).pipe(
      catchError(() => {
        // Fallback resiliente direto para Photon (com normalização de GeoJSON para formato OSM)
        return this.http.get<any>(photonDirect).pipe(
          map(res => {
            if (res && res.features && Array.isArray(res.features)) {
              return res.features.map((f: any) => {
                const props = f.properties || {};
                const coords = f.geometry?.coordinates || [0, 0];
                const name = props.name || props.street || trimmed;
                const parts = [
                  name,
                  props.street ? `${props.street} ${props.housenumber || ''}`.trim() : '',
                  props.district || props.suburb || '',
                  props.city || '',
                  props.state || '',
                  'Brasil'
                ].filter(Boolean);
                return {
                  lat: String(coords[1]),
                  lon: String(coords[0]),
                  name: name,
                  display_name: parts.join(', '),
                  address: {
                    road: props.street || '',
                    house_number: props.housenumber || '',
                    suburb: props.district || props.suburb || '',
                    city: props.city || '',
                    state: props.state || '',
                    postcode: props.postcode || '',
                    country: 'Brasil'
                  }
                };
              });
            }
            return [];
          }),
          catchError(() => {
            let nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&addressdetails=1&countrycodes=br&limit=10`;
            if (lat !== undefined && lon !== undefined) {
              const delta = 1.5;
              const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
              nomUrl += `&viewbox=${viewbox}&bounded=0`;
            }
            return this.http.get<any[]>(nomUrl).pipe(catchError(() => of([])));
          })
        );
      })
    );
  }

  reverseGeocode(lat: number, lon: number): Observable<any> {
    const proxyUrl = `${this.aiBaseUrl}/routing/reverse-geocode?lat=${lat}&lon=${lon}`;
    const directUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    return this.http.get<any>(proxyUrl).pipe(
      catchError(() => this.http.get<any>(directUrl))
    );
  }
}
