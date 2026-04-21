import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { MailReq } from '../../types/mail/mailReq.interface';
import { finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MailService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/emails`;

  private _isLoading = signal(false);
  public isLoading = this._isLoading.asReadonly();

  sendEmail(mailReq: MailReq) {
    this._isLoading.set(true);

    return this.http.post(`${this.API_URL}/send-contact`, mailReq)
      .pipe(
        finalize(() => this._isLoading.set(false))
      );
  }
}
