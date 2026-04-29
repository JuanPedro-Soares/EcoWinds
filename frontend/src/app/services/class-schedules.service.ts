import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ClassSchedule } from '../models/class-schedule.model';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class ClassSchedulesService extends BaseCrudService<ClassSchedule> {
  protected override readonly resourceUrl = `${environment.apiBaseUrl}/class-schedule`;

  constructor(http: HttpClient) {
    super(http);
  }
}
