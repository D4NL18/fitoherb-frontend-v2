import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ScheduledRouteReq, ScheduledRouteRes, ScheduledRouteSummaryRes } from '../../types/scheduled-routes/scheduled-route.interface';

@Injectable({
  providedIn: 'root'
})
export class ScheduledRoutesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/scheduled-routes`;

  saveRoute(req: ScheduledRouteReq): Observable<ScheduledRouteRes> {
    return this.http.post<ScheduledRouteRes>(this.baseUrl, req, { withCredentials: true });
  }

  listRoutes(): Observable<ScheduledRouteSummaryRes[]> {
    return this.http.get<ScheduledRouteSummaryRes[]>(this.baseUrl, { withCredentials: true });
  }

  getRouteDates(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/dates`, { withCredentials: true });
  }

  getRouteByDate(date: string): Observable<ScheduledRouteRes> {
    return this.http.get<ScheduledRouteRes>(`${this.baseUrl}/date/${date}`, { withCredentials: true });
  }

  deleteRouteByDate(date: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/date/${date}`, { withCredentials: true });
  }
}
