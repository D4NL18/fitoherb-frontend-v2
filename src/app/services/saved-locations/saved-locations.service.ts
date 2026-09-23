import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SavedLocation, SavedLocationReq } from '../../types/saved-locations/saved-location.interface';

@Injectable({
  providedIn: 'root'
})
export class SavedLocationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/saved-locations`;

  getAll(): Observable<SavedLocation[]> {
    return this.http.get<SavedLocation[]>(this.apiUrl);
  }

  getBase(): Observable<SavedLocation | null> {
    return this.http.get<SavedLocation | null>(`${this.apiUrl}/base`);
  }

  getById(id: string): Observable<SavedLocation> {
    return this.http.get<SavedLocation>(`${this.apiUrl}/${id}`);
  }

  create(req: SavedLocationReq): Observable<SavedLocation> {
    return this.http.post<SavedLocation>(this.apiUrl, req);
  }

  update(id: string, req: SavedLocationReq): Observable<SavedLocation> {
    return this.http.put<SavedLocation>(`${this.apiUrl}/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
