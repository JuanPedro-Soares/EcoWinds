import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../core/models/page.model';

export abstract class BaseCrudService<T extends { id: number }> {
  protected abstract readonly resourceUrl: string;

  protected constructor(protected readonly http: HttpClient) {}

  search(search = '', page = 0, size = 10): Observable<PageResponse<T>> {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<T>>(`${this.resourceUrl}/search`, { params });
  }

  findById(id: number): Observable<T> {
    return this.http.get<T>(`${this.resourceUrl}/${id}`);
  }

  create(payload: Partial<T>): Observable<T> {
    return this.http.post<T>(this.resourceUrl, payload);
  }

  update(id: number, payload: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.resourceUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
