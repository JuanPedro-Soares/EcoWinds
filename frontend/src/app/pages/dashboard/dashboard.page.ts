import { Component, OnInit, inject } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { AuditLogsService } from '../../services/audit-logs.service';
import { ClassSchedulesService } from '../../services/class-schedules.service';
import { EspDevicesService } from '../../services/esp-devices.service';
import { RoomsService } from '../../services/rooms.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { AuditLog } from '../../models/audit-log.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DataTableComponent, StatCardComponent],
  templateUrl: './dashboard.page.html',
})
export class DashboardPageComponent implements OnInit {
  private readonly roomsService = inject(RoomsService);
  private readonly devicesService = inject(EspDevicesService);
  private readonly schedulesService = inject(ClassSchedulesService);
  private readonly auditLogsService = inject(AuditLogsService);

  protected loadingStats = false;
  protected loadingLogs = false;
  protected statsError = '';
  protected logsError = '';
  protected stats = {
    rooms: 0,
    devices: 0,
    schedules: 0,
  };
  protected logs: AuditLog[] = [];
  protected readonly logColumns: readonly TableColumn[] = [
    { key: 'timestamp', label: 'Data do envio', kind: 'datetime' },
    { key: 'action', label: 'Evento', kind: 'badge' },
    { key: 'origin', label: 'Origem' },
    { key: 'userId', label: 'Usuário', fallback: '--' },
    { key: 'roomId', label: 'Sala', fallback: '--' },
    { key: 'espDeviceId', label: 'Microcontrolador', fallback: '--' },
  ];

  ngOnInit(): void {
    this.loadStats();
    this.loadLogs();
  }

  protected reloadLogs(): void {
    this.loadLogs();
  }

  private loadStats(): void {
    this.loadingStats = true;
    this.statsError = '';

    forkJoin({
      rooms: this.roomsService.search('', 0, 1),
      devices: this.devicesService.search('', 0, 1),
      schedules: this.schedulesService.search('', 0, 1),
    })
      .pipe(finalize(() => (this.loadingStats = false)))
      .subscribe({
        next: ({ rooms, devices, schedules }) => {
          this.stats = {
            rooms: rooms.totalElements,
            devices: devices.totalElements,
            schedules: schedules.totalElements,
          };
        },
        error: () => {
          this.statsError = 'Não foi possível carregar os indicadores do dashboard.';
        },
      });
  }

  private loadLogs(): void {
    this.loadingLogs = true;
    this.logsError = '';

    this.auditLogsService
      .search('', 0, 10)
      .pipe(finalize(() => (this.loadingLogs = false)))
      .subscribe({
        next: (page) => {
          this.logs = page.content;
        },
        error: () => {
          this.logsError = 'Não foi possível carregar os logs recentes.';
        },
      });
  }
}
