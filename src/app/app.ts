import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { DemoPanelComponent } from './components/demo-panel/demo-panel';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, Header, Footer, DemoPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('essenza_front');
}
