import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Room } from '../models/room.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class RoomsService extends BaseCrudService<Room> {
  protected override readonly resourceUrl = `${environment.apiBaseUrl}/room`;

  constructor(http: HttpClient) {
    super(http);
  }
}
