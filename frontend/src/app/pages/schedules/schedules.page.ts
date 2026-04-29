import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import {
  ClassSchedule,
  DAY_OF_WEEK_LABELS,
  DayOfWeek,
} from '../../models/class-schedule.model';
import { ClassSchedulesService } from '../../services/class-schedules.service';
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
  selector: 'app-schedules-page',
  standalone: true,
  imports: [ConfirmDialogComponent, DataTableComponent, EntityFormDialogComponent],
  templateUrl: './schedules.page.html',
})
export class SchedulesPageComponent implements OnInit {
  private readonly schedulesService = inject(ClassSchedulesService);
  private readonly roomsService = inject(RoomsService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  protected schedules: ClassSchedule[] = [];
  protected roomOptions: EntityFormOption[] = [];
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
  protected selectedSchedule: ClassSchedule | null = null;
  protected scheduleToDelete: ClassSchedule | null = null;
  protected readonly actions: readonly TableAction[] = ['view', 'edit', 'delete'];
  protected readonly columns: readonly TableColumn[] = [
    { key: 'course', label: 'Curso' },
    { key: 'dayOfWeek', label: 'Dia', valueMap: DAY_OF_WEEK_LABELS },
    { key: 'startTime', label: 'Início', kind: 'time' },
    { key: 'endTime', label: 'Fim', kind: 'time' },
    { key: 'roomId', label: 'Sala' },
  ];
  protected readonly form = this.formBuilder.group({
    course: ['', Validators.required],
    dayOfWeek: ['MONDAY' as DayOfWeek, Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    roomId: [null as number | null, Validators.required],
  });

  protected get fields(): readonly EntityFormField[] {
    return [
      { key: 'course', label: 'Curso', type: 'text', placeholder: 'Engenharia de Software', required: true, full: true },
      {
        key: 'dayOfWeek',
        label: 'Dia da semana',
        type: 'select',
        required: true,
        options: Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => ({ value, label })),
      },
      { key: 'startTime', label: 'Horário inicial', type: 'time', required: true },
      { key: 'endTime', label: 'Horário final', type: 'time', required: true },
      {
        key: 'roomId',
        label: 'Sala',
        type: 'select',
        required: true,
        options: this.roomOptions,
      },
    ];
  }

  ngOnInit(): void {
    this.loadSchedules();
    this.loadRoomOptions();
  }

  protected onSearch(term: string): void {
    this.search = term;
    this.page = 0;
    this.loadSchedules();
  }

  protected onPageChange(page: number): void {
    this.page = page;
    this.loadSchedules();
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 0;
    this.loadSchedules();
  }

  protected openCreate(): void {
    this.selectedSchedule = null;
    this.dialogReadonly = false;
    this.dialogError = '';
    this.form.enable();
    this.form.reset({
      course: '',
      dayOfWeek: 'MONDAY',
      startTime: '',
      endTime: '',
      roomId: null,
    });
    this.dialogOpen = true;
  }

  protected openView(row: unknown): void {
    this.populateDialog(row as ClassSchedule, true);
  }

  protected openEdit(row: unknown): void {
    this.populateDialog(row as ClassSchedule, false);
  }

  protected closeDialog(): void {
    this.dialogOpen = false;
    this.dialogReadonly = false;
    this.dialogError = '';
    this.form.enable();
  }

  protected saveSchedule(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: Partial<ClassSchedule> = {
      course: raw.course ?? '',
      dayOfWeek: raw.dayOfWeek ?? 'MONDAY',
      startTime: raw.startTime ?? '',
      endTime: raw.endTime ?? '',
      roomId: Number(raw.roomId),
    };
    const request = this.selectedSchedule
      ? this.schedulesService.update(this.selectedSchedule.id, payload)
      : this.schedulesService.create(payload);

    this.saving = true;
    this.dialogError = '';

    request.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.notificationService.success(
          this.selectedSchedule
            ? 'Agendamento atualizado com sucesso.'
            : 'Agendamento cadastrado com sucesso.',
        );
        this.closeDialog();
        this.loadSchedules();
      },
      error: () => {
        this.dialogError = 'Não foi possível salvar o agendamento.';
      },
    });
  }

  protected confirmDelete(row: unknown): void {
    this.scheduleToDelete = row as ClassSchedule;
  }

  protected cancelDelete(): void {
    this.scheduleToDelete = null;
  }

  protected deleteSchedule(): void {
    if (!this.scheduleToDelete) {
      return;
    }

    this.deleting = true;

    this.schedulesService
      .delete(this.scheduleToDelete.id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () => {
          this.notificationService.success('Agendamento excluído com sucesso.');
          this.scheduleToDelete = null;
          if (this.schedules.length === 1 && this.page > 0) {
            this.page -= 1;
          }
          this.loadSchedules();
        },
        error: () => {
          this.notificationService.error('Não foi possível excluir o agendamento.');
        },
      });
  }

  private loadSchedules(): void {
    this.loading = true;
    this.error = '';

    this.schedulesService
      .search(this.search, this.page, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (page) => {
          this.schedules = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = page.totalPages;
        },
        error: () => {
          this.error = 'Não foi possível carregar os agendamentos.';
        },
      });
  }

  private loadRoomOptions(): void {
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
  }

  private populateDialog(schedule: ClassSchedule, readonly: boolean): void {
    this.selectedSchedule = schedule;
    this.dialogReadonly = readonly;
    this.dialogError = '';
    this.form.enable();
    this.form.reset({
      course: schedule.course,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime.slice(0, 5),
      endTime: schedule.endTime.slice(0, 5),
      roomId: schedule.roomId,
    });

    if (readonly) {
      this.form.disable();
    }

    this.dialogOpen = true;
  }
}
