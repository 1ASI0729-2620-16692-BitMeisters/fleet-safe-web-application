import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Notifier } from '../../../../shared/application/notifier';
import { BaseForm } from '../../../../shared/presentation/components/base-form/base-form';
import { IamStore } from '../../../application/iam.store';
import { RegisterUserCommand } from '../../../domain/model/register-user.command';
import { Role } from '../../../domain/model/role.enum';

/**
 * Lets an administrator open an account in the company.
 */
@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, TranslatePipe],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm extends BaseForm implements OnInit {
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  protected readonly store = inject(IamStore);
  protected readonly roles = Object.values(Role);

  form = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
    }),
    role: new FormControl<Role>(Role.DRIVER, { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.store.clearSaveUserError();
  }

  performRegister = (): void => {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const command = new RegisterUserCommand(this.form.getRawValue());
    this.store.registerUser(command, () => {
      this.notifier.success('iam.userForm.created', { email: command.email });
      this.router.navigate(['/iam']).then();
    });
  };
}
