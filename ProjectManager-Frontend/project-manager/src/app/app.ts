import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../app/shared/navbar/navbar';
import { GlobalLoader } from './shared/ui/global-loader/global-loader';
import { Toast } from './shared/ui/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, GlobalLoader, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('project-manager');
}
