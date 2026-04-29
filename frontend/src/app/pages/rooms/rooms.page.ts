import { Component, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { Room, ROOM_STATUS_LABELS, RoomStatus } from '../../models/room.model';
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
} from '../../shared/components/entity-form-dialog/entity-form-dialog.component';

@Component({
  selector: 'app-rooms-page',
  standalone: true,
  imports: [ConfirmDialogComponent, DataTableComponent, EntityFormDialogComponent],
  templateUrl: './rooms.page.html',
})
export class RoomsPageComponent implements OnInit {
  private readonly roomsService = inject(RoomsService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly notificationService = inject(NotificationService);

  protected rooms: Room[] = [];
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
  protected selectedRoom: Room | null = null;
  protected roomToDelete: Room | null = null;
  protected readonly actions: readonly TableAction[] = ['view', 'edit', 'delete'];
  protected readonly columns: readonly TableColumn[] = [
    { key: 'identification', label: 'Nome' },
    { key: 'block', label: 'Bloco' },
    { key: 'status', label: 'Status', kind: 'badge', valueMap: ROOM_STATUS_LABELS },
  ];
  protected readonly fields: readonly EntityFormField[] = [
    {
      key: 'identification',
      label: 'Identificação',
      type: 'text',
      placeholder: 'Sala 02 - B3',
      required: true,
    },
    { key: 'block', label: 'Bloco', type: 'text', placeholder: 'Bloco 03', required: true },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { label: ROOM_STATUS_LABELS.ACTIVE, value: 'ACTIVE' },
        { label: ROOM_STATUS_LABELS.INACTIVE, value: 'INACTIVE' },
        { label: ROOM_STATUS_LABELS.MAINTENANCE, value: 'MAINTENANCE' },
      ],
    },
  ];
  protected readonly form = this.formBuilder.group({
    identification: ['', Validators.required],
    block: ['', Validators.required],
    status: ['ACTIVE' as RoomStatus, Validators.required],
  });

  ngOnInit(): void {
    this.loadRooms();
  }

  protected onSearch(term: string): void {
    this.search = term;
    this.page = 0;
    this.loadRooms();
  }

  protected onPageChange(page: number): void {
    this.page = page;
    this.loadRooms();
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 0;
    this.loadRooms();
  }

  protected openCreate(): void {
    this.selectedRoom = null;
    this.dialogReadonly = false;
    this.dialogError = '';
    this.form.enable();
    this.form.reset({ identification: '', block: '', status: 'ACTIVE' });
    this.dialogOpen = true;
  }

  protected openView(row: unknown): void {
    this.populateDialog(row as Room, true);
  }

  protected openEdit(row: unknown): void {
    this.populateDialog(row as Room, false);
  }

  protected closeDialog(): void {
    this.dialogOpen = false;
    this.dialogReadonly = false;
    this.dialogError = '';
    this.form.enable();
  }

  protected saveRoom(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    const request = this.selectedRoom
      ? this.roomsService.update(this.selectedRoom.id, payload)
      : this.roomsService.create(payload);

    this.saving = true;
    this.dialogError = '';

    request.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.notificationService.success(
          this.selectedRoom ? 'Sala atualizada com sucesso.' : 'Sala cadastrada com sucesso.',
        );
        this.closeDialog();
        this.loadRooms();
      },
      error: () => {
        this.dialogError = 'Não foi possível salvar a sala. Verifique os dados informados.';
      },
    });
  }

  protected confirmDelete(row: unknown): void {
    this.roomToDelete = row as Room;
  }

  protected cancelDelete(): void {
    this.roomToDelete = null;
  }

  protected deleteRoom(): void {
    if (!this.roomToDelete) {
      return;
    }

    this.deleting = true;

    this.roomsService
      .delete(this.roomToDelete.id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: () => {
          this.notificationService.success('Sala excluída com sucesso.');
          this.roomToDelete = null;
          if (this.rooms.length === 1 && this.page > 0) {
            this.page -= 1;
          }
          this.loadRooms();
        },
        error: () => {
          this.notificationService.error('Não foi possível excluir a sala.');
        },
      });
  }

  private loadRooms(): void {
    this.loading = true;
    this.error = '';

    this.roomsService
      .search(this.search, this.page, this.pageSize)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (page) => {
          this.rooms = page.content;
          this.totalElements = page.totalElements;
          this.totalPages = page.totalPages;
        },
        error: () => {
          this.error = 'Não foi possível carregar as salas.';
        },
      });
  }

  private populateDialog(room: Room, readonly: boolean): void {
    this.selectedRoom = room;
    this.dialogReadonly = readonly;
    this.dialogError = '';
    this.form.enable();
    this.form.reset({
      identification: room.identification,
      block: room.block,
      status: room.status,
    });

    if (readonly) {
      this.form.disable();
    }

    this.dialogOpen = true;
  }
}
