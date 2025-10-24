import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-demo-panel',
  templateUrl: './demo-panel.html',
  styleUrl: './demo-panel.scss',
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class DemoPanelComponent {
  showPanel = false;
  
  // Dados de demonstração
  demoCredentials = {
    cliente: {
      email: 'cliente@essenza.com',
      senha: '123456'
    },
    profissional: {
      email: 'pro@essenza.com',
      senha: '123456'
    }
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePanel(): void {
    this.showPanel = !this.showPanel;
  }

  // Login rápido como cliente
  loginAsCliente(): void {
    this.authService.loginCliente(this.demoCredentials.cliente).subscribe({
      next: (response) => {
        console.log('Login cliente realizado:', response);
        this.router.navigate(['/cliente-home']);
        this.showPanel = false;
      },
      error: (error) => {
        console.error('Erro no login cliente:', error);
        alert('Erro no login. Verifique o console.');
      }
    });
  }

  // Login rápido como profissional
  loginAsProfissional(): void {
    this.authService.loginProfissional(this.demoCredentials.profissional).subscribe({
      next: (response) => {
        console.log('Login profissional realizado:', response);
        this.router.navigate(['/dashboard-profissional']);
        this.showPanel = false;
      },
      error: (error) => {
        console.error('Erro no login profissional:', error);
        alert('Erro no login. Verifique o console.');
      }
    });
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.showPanel = false;
  }

  // Navegação rápida
  goToHome(): void {
    this.router.navigate(['/']);
    this.showPanel = false;
  }

  goToServicos(): void {
    this.router.navigate(['/servicos']);
    this.showPanel = false;
  }

  goToCadastro(): void {
    this.router.navigate(['/cadastro']);
    this.showPanel = false;
  }

  // Verificar se está logado
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  // Obter tipo de usuário
  getUserType(): string {
    const user = this.authService.getCurrentUser();
    return user?.tipo || 'visitante';
  }

  // Obter nome do usuário
  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.nome || 'Usuário';
  }
}
