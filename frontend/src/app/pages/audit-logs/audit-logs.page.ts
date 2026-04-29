import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { AuditLog } from '../../models/audit-log.model';
import { AuditLogsService } from '../../services/audit-logs.service';
import { EspDevicesService } from '../../services/esp-devices.service';
import { RoomsService } from '../../services/rooms.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  DataTableComponent,
  TableAction,
  TableColumn,
} from '../../shared/components/data-table/data-table.component';
import {
  EntityFormDialogComponent,
  EntityFormField,
  EntityFormOption,
} from '../../shared/components/entity-form-dialog/entity-form-dialog.component';

@Component({
  selector: 'app-audit-logs-page',
  standalone: true,
  imports: [ConfirmDialogComponent, DataTableComponent, EntityFormDialogComponent],
  templateUrl: './audit-logs.page.html',
})
export class AuditLogsPageComponent implements OnInit {
  private readonly auditLogsService = inject(AuditLogsService);
  private readonly roomsService = inject(RoomsService);
  private readonly devicesService = inject(EspDevicesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  protected logs: AuditLog[] = [];
  protected roomOptions: EntityFormOption[] = [];
  protected deviceOptions: EntityFormOption[] = [];
  protected loading = false;
  protected saving = false;
  protected deleting = false;
  protected error = '';
  protected dialogError = '';
  protected search = '';
  protected page = 0;
  protected pageSize = 10;
  protected totalPages = 0;
  protected totalElements = 0;
  protected dialogOpen = false;
  protected dialogReadonly = false;
  protected selectedLog: AuditLog | null = null;
  protected logToDelete: AuditLog | null = null;
  protected readonly actions: readonly TableAction[] = ['view', 'edit', 'delete'];
  protected readonly columns: readonly TableColumn[] = [
    { key: 'timestamp', label: 'Data do envio', kind: 'datetime' },
    { key: 'action', label: 'Evento', kind: 'badge' },
    { key: 'origin', label: 'Origem' },
    { key: 'userId', label: 'Usuário', fallback: '--' },
    { key: 'roomId', label: 'Sala', fallback: '--' },
    { key: 'espDeviceId', label: 'Microcontrolador', fallback: '--' },
  ];
  protected readonly form = this.formBuilder.group({
    timestamp: ['', Validators.required],
    action: ['', Validators.required],
    origin: ['', Validators.required],
    userId: [null as number | null],
    roomId: [null as number | null],
    espDeviceId: [null as number | null],
  });

  protected get fields(): readonly EntityFormField[] {
    return [
      { key: 'timestamp', label: 'Data e hora', type: 'datetime-local', required: true },
      { key: 'action', label: 'Evento', type: 'text', placeholder: 'Ligar, Desligar, Manual...', required: true },
      { key: 'origin', label: 'Origem', type: 'text', placeholder: 'Programado ou Manual', required: true },
      // O backend atual não expõe CRUD/listagem de usuários; substitua por select quando houver endpoint.
      {
        key: 'userId',
        label: 'ID do usuário',
        type: 'number',
        hint: 'O backend atual não expõe endpoint de usuários; informe o ID apenas se necessário.',
      },
      { key: 'roomId', label: 'Sala', type: 'select', options: this.roomOptions },
      { key: 'espDeviceId', label: 'Microcontrolador', type: 'select', options: this.deviceOptions },
    ];
  }

  ngOnInit(): void {
    this.loadLogs();
    this.loadRelationshipOptions();
  }

  protected onSearch(term: string): void {
    this.search = term;
    this.page = 0;
    this.loadLogs();
  }

  protected onPageChange(page: number): void {
    this.page = page;
    this.loadLogs();
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 0;
    this.loadLogs();
  }

  protected openCreate(): void {
    this.selectedLog = null;
    this.dialogReadonly = false;
    this.dialogError = '';
    this.form.enable();
    this.form.reset({
      timestamp: this.toDateTimeInputValue(new Date().toISOString()),
      action: '',
      origin: '',
      userId: null,
      roomId: null,
      espDeviceId: null,
    });
    this.dialogOpen = true;
  }

  protected openView(row: unknown): void {
    this.populateDialog(row as AuditLog, true);
  }

  protected openEdit(row: unknown): void {
    this.populateDialog(row as AuditLog, false);
  }

  protected closeDialog(): void {
    this.dialogOpen = false;
    this.dialogReadonly = false;
    this.dialogError = '';
    this.form.enable();
  }

  protected saveLog(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: Partial<AuditLog> = {
      timestamp: this.normalizeTimestamp(raw.timestamp ?? ''),
      action: raw.action ?? '',
      origin: raw.origin ?? '',
      userId: this.toNumberOrNull(raw.userId),
      roomId: this.toNumberOrNull(raw.roomId),
      espDeviceId: this.toNumberOrNull(raw.espDeviceId),
    };
    const request = this.selectedLog
      ? this.auditLogsService.update(this.selectedLog.id, payload)
      : this.auditLogsService.create(payload);

    this.saving = true;
    this.dialogError = '';

    request.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.notificationService.success(
          this.selectedLog ? 'Log atualizado com sucesso.' : 'Log cadastrado com sucesso.',
        );
        this.closeDialog();
        this.loadLogs();
      },
      error: () => {
        this.dialogError = 'Não foi possível salvar o log.';
      },
    });
  }

  protected confirmDelete(row: unknown): void {
    this.logToDelete = row as AuditLog;
  }

  protected cancelDelete(): void {
    this.logToDelete = null;
  }

  protected deleteLog(): void {
    if (!this.logToDelete) {
      return;
    }

    this.deleting = true;

    this.auditLogsService
      .delete(this.logToDelete.id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () => {
          this.notificationService.success('Log excluído com sucesso.');
          this.logToDelete = null;
          if (this.logs.length === 1 && this.page > 0) {
            this.page -= 1;
          }
          this.loadLogs();
        },
        error: () => {
          this.notificationService.error('Não foi possível excluir o log.');
        },
      });
  }

  private loadLogs(): void {
    this.loading = true;
    this.error = '';

    this.auditLogsService
      .search(this.search, this.page, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (page) => {
          this.logs = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = page.totalPages;
        },
        error: () => {
          this.error = 'Não foi possível carregar os logs.';
        },
      });
  }

  private loadRelationshipOptions(): void {
    this.roomsService.search('', 0, 100).subscribe({
      next: (page) => {
        this.roomOptions = page.content.map((room) => ({
          label: `${room.identification} - ${room.block}`,
          value: room.id,
        }));
      },
      error: () => {
        this.notificationService.info('Não foi possível carregar as salas para vínculo.');
      },
    });

    this.devicesService.search('', 0, 100).subscribe({
      next: (page) => {
        this.deviceOptions = page.content.map((device) => ({
          label: `${device.ipAddress} (${device.macAddress})`,
          value: device.id,
        }));
      },
      error: () => {
        this.notificationService.info('Não foi possível carregar os microcontroladores para vínculo.');
      },
    });
  }

  private populateDialog(log: AuditLog, readonly: boolean): void {
    this.selectedLog = log;
    this.dialogReadonly = readonly;
    this.dialogError = '';
    this.form.enable();
    this.form.reset({
      timestamp: this.toDateTimeInputValue(log.timestamp),
      action: log.action,
      origin: log.origin,
      userId: log.userId,
      roomId: log.roomId,
      espDeviceId: log.espDeviceId,
    });

    if (readonly) {
      this.form.disable();
    }

    this.dialogOpen = true;
  }

  private normalizeTimestamp(value: string): string {
    return value.length === 16 ? `${value}:00` : value;
  }

  private toDateTimeInputValue(value: string): string {
    return value.slice(0, 16);
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return Number(value);
  }
}
