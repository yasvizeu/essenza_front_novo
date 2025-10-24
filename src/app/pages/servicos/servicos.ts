import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicosService, Servico, PaginatedResponse } from '../../services/servicos';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-servicos',
  templateUrl: './servicos.html',
  styleUrl: './servicos.scss',
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ServicosComponent implements OnInit, OnDestroy {
  servicos: Servico[] = [];
  isLoading = false;
  selectedServico: Servico | null = null;
  showModal = false;
  quantidade = 1;
  cart: any = { items: [], total: 0, totalItems: 0 };
  private cartSubscription: any;
  
  // Paginação
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;
  hasNextPage = false;
  hasPrevPage = false;

  // Filtros
  categoriaSelecionada = '';
  categorias = [
    { value: '', label: 'Todos os Serviços', icon: 'bi-grid' },
    { value: 'Facial', label: 'Facial', icon: 'bi-face-smile' },
    { value: 'Corporal', label: 'Corporal', icon: 'bi-person' },
    { value: 'Massagem', label: 'Massagem Relaxante', icon: 'bi-heart' }
  ];

  constructor(
    private servicosService: ServicosService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Verificar parâmetros da URL
    this.route.queryParams.subscribe(params => {
      this.categoriaSelecionada = params['categoria'] || '';
      this.currentPage = 1;
      this.loadServicos();
    });

    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
    });

    // Carregar carrinho se autenticado
    this.cartService.loadCartIfAuthenticated();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadServicos(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.servicosService.getServicos(this.currentPage, this.pageSize, this.categoriaSelecionada).subscribe({
      next: (response: PaginatedResponse<Servico>) => {
        this.servicos = response.data || [];
        this.totalPages = response.pagination.totalPages;
        this.hasNextPage = response.pagination.hasNext;
        this.hasPrevPage = response.pagination.hasPrev;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar serviços:', error);
        this.servicos = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
    this.currentPage = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoria: categoria || null },
      queryParamsHandling: 'merge'
    });
  }

  openModal(servico: Servico): void {
    console.log('🔍 Debug - Abrindo modal para serviço:', servico);
    console.log('🔍 Debug - Nome do serviço:', servico?.nome);
    
    // Verificar se o serviço é válido
    if (!servico || !servico.nome) {
      console.error('❌ Erro - Serviço inválido:', servico);
      return;
    }
    
    this.selectedServico = servico;
    this.quantidade = 1;
    this.showModal = true;
    document.body.classList.add('modal-open');
    console.log('🔍 Debug - selectedServico.nome:', this.selectedServico?.nome);
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedServico = null;
    document.body.classList.remove('modal-open');
  }

  addToCart(): void {
    if (this.selectedServico && this.quantidade > 0) {
      this.cartService.addToCart(this.selectedServico, this.quantidade).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccessMessage('Serviço adicionado ao carrinho com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao adicionar ao carrinho:', error);
          alert('Erro ao adicionar ao carrinho. Tente novamente.');
        }
      });
    }
  }

  incrementQuantity(): void {
    this.quantidade++;
  }

  decrementQuantity(): void {
    if (this.quantidade > 1) {
      this.quantidade--;
    }
  }

  // Métodos de paginação
  nextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.loadServicos();
    }
  }

  prevPage(): void {
    if (this.hasPrevPage) {
      this.currentPage--;
      this.loadServicos();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadServicos();
    }
  }

  formatPrice(price: number | string): string {
    return this.servicosService.formatPrice(price);
  }

  formatDuration(minutes: number): string {
    return this.servicosService.formatDuration(minutes);
  }

  // Calcular preço total (preço * quantidade)
  calculateTotalPrice(servico: Servico | null, quantidade: number): number {
    if (!servico?.preco) return 0;
    const numericPrice = typeof servico.preco === 'string' ? parseFloat(servico.preco) : servico.preco;
    return isNaN(numericPrice) ? 0 : numericPrice * quantidade;
  }

  getServicoImage(servico: Servico): string {
    if (servico.imagem) {
      return servico.imagem;
    }
    
    const servicoImages: { [key: string]: string } = {
      'Limpeza de Pele': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Tratamento Anti-idade': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Hidratação': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Peeling': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'Acne': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    };

    for (const [key, image] of Object.entries(servicoImages)) {
      if (servico.nome.toLowerCase().includes(key.toLowerCase())) {
        return image;
      }
    }

    return 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  }

  showSuccessMessage(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
      <i class="bi bi-check-circle me-2"></i>
      ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}
