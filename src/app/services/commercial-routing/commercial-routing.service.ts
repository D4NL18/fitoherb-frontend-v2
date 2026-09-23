import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  searchAddress(query: string): Observable<any[]> {
    const encoded = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&addressdetails=1&countrycodes=br&limit=6`;
    return this.http.get<any[]>(url);
  }

  reverseGeocode(lat: number, lon: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    return this.http.get<any>(url);
  }
}
