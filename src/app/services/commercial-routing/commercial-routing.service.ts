import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OptimizeRouteRequest, OptimizeRouteResponse } from '../../types/routing/routing.interface';

@Injectable({
  providedIn: 'root'
})
export class CommercialRoutingService {
  private http = inject(HttpClient);
  private aiBaseUrl = (environment as any).aiUrl || 'http://localhost:8000/api/v1';

  optimizeRoute(request: OptimizeRouteRequest): Observable<OptimizeRouteResponse> {
    return this.http.post<OptimizeRouteResponse>(`${this.aiBaseUrl}/routing/optimize`, request);
  }

  searchAddress(query: string, lat?: number, lon?: number): Observable<any[]> {
    const encoded = encodeURIComponent(query.trim());
    let proxyUrl = `${this.aiBaseUrl}/routing/search-address?q=${encoded}`;
    let directUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&addressdetails=1&countrycodes=br&limit=10`;

    if (lat !== undefined && lon !== undefined) {
      proxyUrl += `&lat=${lat}&lon=${lon}`;
      const delta = 1.5;
      const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`;
      directUrl += `&viewbox=${viewbox}&bounded=0`;
    }

    return this.http.get<any[]>(proxyUrl).pipe(
      catchError(() => this.http.get<any[]>(directUrl))
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
