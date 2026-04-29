import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuditLog } from '../models/audit-log.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class AuditLogsService extends BaseCrudService<AuditLog> {
  protected override readonly resourceUrl = `${environment.apiBaseUrl}/audit-log`;

  constructor(http: HttpClient) {
    super(http);
  }
}
