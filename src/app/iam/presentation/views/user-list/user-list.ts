import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Notifier } from '../../../../shared/application/notifier';
import { IamStore } from '../../../application/iam.store';
import { Role } from '../../../domain/model/role.enum';
import { User } from '../../../domain/model/user.entity';

/**
 * Lists the accounts of the company with their role and status.
 */
@Component({
  selector: 'app-user-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    TranslatePipe,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList implements OnInit {
  protected readonly store = inject(IamStore);
  private readonly notifier = inject(Notifier);
  protected readonly roles = Object.values(Role);
  protected readonly displayedColumns = ['name', 'email', 'role', 'status'];

  ngOnInit(): void {
    this.store.loadUsers({ page: 0 });
  }

  filterByRole = (role: Role | null): void => this.store.loadUsers({ role, page: 0 });

  filterByStatus = (isActive: boolean | null): void => this.store.loadUsers({ isActive, page: 0 });

  changePage = (event: PageEvent): void => this.store.loadUsers({ page: event.pageIndex, size: event.pageSize });

  isCurrentUser = (user: User): boolean => user.id === this.store.currentUser()?.id;

  changeRole = (user: User, role: Role): void =>
    this.store.updateUser(user.id, { role }, (error) => this.notify(error, 'iam.users.roleChanged', user));

  changeStatus = (user: User, isActive: boolean): void =>
    this.store.updateUser(user.id, { isActive }, (error) =>
      this.notify(error, isActive ? 'iam.users.activated' : 'iam.users.deactivated', user),
    );

  private notify(error: string | null, successKey: string, user: User): void {
    if (error) this.notifier.error(error);
    else this.notifier.success(successKey, { name: user.fullName });
  }
}
