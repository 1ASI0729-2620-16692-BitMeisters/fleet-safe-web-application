import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../application/iam.store';

/**
 * Shows the signed-in user and the sign-out action.
 */
@Component({
  selector: 'app-authentication-section',
  imports: [MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './authentication-section.html',
  styleUrl: './authentication-section.css',
})
export class AuthenticationSection {
  private readonly router = inject(Router);
  protected readonly store = inject(IamStore);

  performSignOut = (): void => this.store.signOut(this.router);
}
