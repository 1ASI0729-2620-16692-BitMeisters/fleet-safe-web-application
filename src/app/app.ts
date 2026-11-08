import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IamStore } from './iam/application/iam.store';
import { Layout } from './shared/presentation/components/layout/layout';

@Component({
  imports: [Layout, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('FleetSafe');
  protected readonly iamStore = inject(IamStore);
}
