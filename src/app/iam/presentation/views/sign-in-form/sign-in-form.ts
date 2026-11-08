import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseForm } from '../../../../shared/presentation/components/base-form/base-form';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';
import { IamStore } from '../../../application/iam.store';
import { SignInCommand } from '../../../domain/model/sign-in.command';

/**
 * Collects the credentials and triggers the IAM sign-in.
 */
@Component({
  selector: 'app-sign-in-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './sign-in-form.html',
  styleUrl: './sign-in-form.css',
})
export class SignInForm extends BaseForm {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(IamStore);

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  performSignIn = (): void => {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const signInCommand = new SignInCommand({
      email: this.form.controls.email.value,
      password: this.form.controls.password.value,
    });
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/home';
    this.store.signIn(signInCommand, this.router, returnUrl.startsWith('/iam') ? '/home' : returnUrl);
  };
}
