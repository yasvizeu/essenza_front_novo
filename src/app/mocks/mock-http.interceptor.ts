import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { MockBackendService } from './mock-backend.service';

@Injectable()
export class MockHttpInterceptor implements HttpInterceptor {
  constructor(private mockBackend: MockBackendService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔧 MockInterceptor - Interceptando:', req.method, req.url);

    // Interceptar todas as requisições para localhost:3000
    if (req.url.startsWith('http://localhost:3000')) {
      return this.handleMockRequest(req);
    }

    // Deixar outras requisições passarem normalmente
    return next.handle(req);
  }

  private handleMockRequest(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const url = req.url;
    const method = req.method;
    const body = req.body;

    console.log('🔧 MockInterceptor - Processando:', method, url, body);

    let response$: Observable<any> | undefined;

    // ===== AUTENTICAÇÃO =====
    if (url.includes('/auth/login') && method === 'POST') {
      response$ = this.mockBackend.login(body);
    } else if (url.includes('/auth/register') && method === 'POST') {
      response$ = this.mockBackend.register(body);
    } else if (url.includes('/auth/refresh') && method === 'POST') {
      response$ = this.mockBackend.refreshToken(body.refreshToken);
    } else if (url.includes('/auth/verify') && method === 'GET') {
      response$ = this.mockBackend.verifyToken();
    } else if (url.includes('/auth/profile') && method === 'GET') {
      response$ = this.mockBackend.getProfile();
    }

    // ===== SERVIÇOS =====
    else if (url.includes('/servico') && method === 'GET') {
      const urlObj = new URL(url);
      const page = parseInt(urlObj.searchParams.get('page') || '1');
      const limit = parseInt(urlObj.searchParams.get('limit') || '20');
      const categoria = urlObj.searchParams.get('categoria') || undefined;
      response$ = this.mockBackend.getServicos(page, limit, categoria);
    } else if (url.match(/\/servico\/\d+$/) && method === 'GET') {
      const id = parseInt(url.split('/').pop() || '0');
      response$ = this.mockBackend.getServicoById(id);
    }

    // ===== PRODUTOS =====
    else if (url.includes('/produtos') && method === 'GET') {
      response$ = this.mockBackend.getProdutos();
    } else if (url.match(/\/inventario\/produtos\/\d+\/saldo$/) && method === 'GET') {
      const id = parseInt(url.split('/')[4] || '0');
      response$ = this.mockBackend.getSaldoProduto(id);
    } else if (url.match(/\/inventario\/produtos\/\d+\/extrato/) && method === 'GET') {
      const urlObj = new URL(url);
      const id = parseInt(url.split('/')[4] || '0');
      const limit = parseInt(urlObj.searchParams.get('limit') || '50');
      response$ = this.mockBackend.getMovimentacoesProduto(id, limit);
    } else if (url.includes('/inventario/estoque/movimentos') && method === 'POST') {
      response$ = this.mockBackend.criarMovimentoEstoque(body);
    } else if (url.includes('/dashboard/produtos-baixo-estoque') && method === 'GET') {
      response$ = this.mockBackend.getProdutosBaixoEstoque();
    } else if (url.includes('/dashboard/ultimas-movimentacoes') && method === 'GET') {
      const urlObj = new URL(url);
      const limit = parseInt(urlObj.searchParams.get('limit') || '10');
      response$ = this.mockBackend.getUltimasMovimentacoes(limit);
    }

    // ===== CLIENTES =====
    else if (url.includes('/clientes') && method === 'GET' && !url.includes('/')) {
      response$ = this.mockBackend.getClientes();
    } else if (url.match(/\/clientes\/\d+$/) && method === 'GET') {
      const id = parseInt(url.split('/').pop() || '0');
      response$ = this.mockBackend.getCliente(id);
    } else if (url.includes('/clientes') && method === 'POST') {
      response$ = this.mockBackend.cadastrarCliente(body);
    } else if (url.match(/\/clientes\/verificar-cpf\/\d+$/) && method === 'GET') {
      const cpf = url.split('/').pop() || '';
      response$ = this.mockBackend.verificarCpfExistente(cpf);
    }

    // ===== FICHAS DE ANAMNESE =====
    else if (url.includes('/fichas') && method === 'POST') {
      response$ = this.mockBackend.cadastrarFichaAnamnese(body);
    } else if (url.includes('/fichas') && method === 'GET') {
      const urlObj = new URL(url);
      const clienteId = urlObj.searchParams.get('clienteId');
      if (clienteId) {
        response$ = this.mockBackend.getFichaAnamnese(parseInt(clienteId));
      }
    }

    // ===== PROFISSIONAIS =====
    else if (url.includes('/profissionais') && method === 'GET') {
      response$ = this.mockBackend.getProfissionais();
    } else if (url.includes('/profissionais') && method === 'POST') {
      response$ = this.mockBackend.cadastrarProfissional(body);
    }

    // ===== AGENDAMENTOS =====
    else if (url.match(/\/agendamentos\/cliente\/\d+$/) && method === 'GET') {
      const id = parseInt(url.split('/').pop() || '0');
      response$ = this.mockBackend.getAgendamentosCliente(id);
    } else if (url.match(/\/agendamentos\/profissional\/\d+$/) && method === 'GET') {
      const id = parseInt(url.split('/').pop() || '0');
      response$ = this.mockBackend.getAgendamentosProfissional(id);
    } else if (url.match(/\/agendamentos\/servicos-pagos\/\d+$/) && method === 'GET') {
      const id = parseInt(url.split('/').pop() || '0');
      console.log('🔧 MockInterceptor - Interceptando chamada para serviços pagos:', url, 'ID:', id);
      response$ = this.mockBackend.getServicosPagosNaoAgendados(id);
    } else if (url.includes('/agendamentos') && method === 'POST') {
      response$ = this.mockBackend.criarAgendamentoCompleto(body);
    } else if (url.match(/\/agendamentos\/\d+\/confirmar$/) && method === 'PATCH') {
      const id = url.split('/')[3];
      response$ = this.mockBackend.confirmarAgendamento(id);
    } else if (url.match(/\/agendamentos\/\d+\/confirmar-pago$/) && method === 'POST') {
      const id = url.split('/')[3];
      response$ = this.mockBackend.confirmarAgendamentoPago(id, body.startDateTime, body.endDateTime, body.profissionalId);
    } else if (url.match(/\/agendamentos\/\d+\/cancelar$/) && method === 'PATCH') {
      const id = url.split('/')[3];
      response$ = this.mockBackend.cancelarAgendamento(id, body.motivo);
    } else if (url.match(/\/agendamentos\/\d+$/) && method === 'PUT') {
      const id = url.split('/')[3];
      response$ = this.mockBackend.atualizarAgendamento(id, body);
    }

    // ===== CARRINHO =====
    else if (url.includes('/carrinho') && method === 'GET') {
      response$ = this.mockBackend.getCarrinho();
    } else if (url.includes('/carrinho/adicionar') && method === 'POST') {
      response$ = this.mockBackend.adicionarAoCarrinho(body);
    } else if (url.match(/\/carrinho\/\d+$/) && method === 'DELETE') {
      const id = parseInt(url.split('/').pop() || '0');
      response$ = this.mockBackend.removerDoCarrinho(id);
    } else if (url.match(/\/carrinho\/\d+$/) && method === 'PUT') {
      const id = parseInt(url.split('/').pop() || '0');
      response$ = this.mockBackend.atualizarCarrinho(id, body.quantidade);
    } else if (url.includes('/carrinho') && method === 'DELETE') {
      response$ = this.mockBackend.limparCarrinho();
    }

    // ===== EXECUÇÃO DE SERVIÇOS =====
    else if (url.includes('/inventario/ordens-servico/execucoes') && method === 'POST') {
      response$ = this.mockBackend.executarServico(body);
    }

    // ===== ESTATÍSTICAS =====
    else if (url.includes('/dashboard/estatisticas') && method === 'GET') {
      response$ = this.mockBackend.getEstatisticas();
    }

    // ===== FALLBACK =====
    if (!response$) {
      console.log('🔧 MockInterceptor - Rota não encontrada, retornando erro 404');
      response$ = of(new HttpResponse({
        status: 404,
        statusText: 'Not Found',
        body: { message: 'Endpoint não implementado no mock' }
      }));
    }

    return response$.pipe(
      // Simular delay de rede
      delay(200),
      // Converter para HttpResponse se não for já
      map(response => {
        if (response instanceof HttpResponse) {
          return response;
        }
        return new HttpResponse({
          status: 200,
          body: response
        });
      })
    );
  }
}

// Interceptor funcional para Angular 17+
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const mockBackend = inject(MockBackendService);
  
  const url = req.url;
  const method = req.method;
  const body = req.body;

  console.log('🔧 MockInterceptor - Processando:', method, url, body);

  let response$: Observable<any> | undefined;

  // ===== AUTENTICAÇÃO =====
  if (url.includes('/auth/login') && method === 'POST') {
    response$ = mockBackend.login(body as any);
  } else if (url.includes('/auth/register') && method === 'POST') {
    response$ = mockBackend.register(body as any);
  } else if (url.includes('/auth/refresh') && method === 'POST') {
    response$ = mockBackend.refreshToken((body as any).refreshToken);
  } else if (url.includes('/auth/verify') && method === 'GET') {
    response$ = mockBackend.verifyToken();
  } else if (url.includes('/auth/profile') && method === 'GET') {
    response$ = mockBackend.getProfile();
  }

  // ===== SERVIÇOS =====
  else if (url.includes('/servico') && method === 'GET') {
    const urlObj = new URL(url);
    const page = parseInt(urlObj.searchParams.get('page') || '1');
    const limit = parseInt(urlObj.searchParams.get('limit') || '20');
    response$ = mockBackend.getServicos(page, limit);
  } else if (url.match(/\/servico\/\d+$/) && method === 'GET') {
    const id = parseInt(url.split('/').pop() || '0');
    response$ = mockBackend.getServicoById(id);
  }

  // ===== PRODUTOS =====
  else if (url.includes('/produtos') && method === 'GET') {
    response$ = mockBackend.getProdutos();
  }

  // ===== DASHBOARD =====
  else if (url.includes('/dashboard/produtos-baixo-estoque') && method === 'GET') {
    response$ = mockBackend.getProdutosBaixoEstoque();
  } else if (url.includes('/dashboard/ultimas-movimentacoes') && method === 'GET') {
    const urlObj = new URL(url);
    const limit = parseInt(urlObj.searchParams.get('limit') || '10');
    response$ = mockBackend.getUltimasMovimentacoes(limit);
  }

  // ===== CLIENTES =====
  else if (url.includes('/clientes') && method === 'GET' && !url.includes('/')) {
    response$ = mockBackend.getClientes();
  } else if (url.match(/\/clientes\/\d+$/) && method === 'GET') {
    const id = parseInt(url.split('/').pop() || '0');
    response$ = mockBackend.getCliente(id);
  } else if (url.includes('/clientes') && method === 'POST') {
    response$ = mockBackend.cadastrarCliente(body as any);
  } else if (url.match(/\/clientes\/verificar-cpf\/\d+$/) && method === 'GET') {
    const cpf = url.split('/').pop() || '';
    response$ = mockBackend.verificarCpfExistente(cpf);
  }

  // ===== FICHAS DE ANAMNESE =====
  else if (url.includes('/fichas') && method === 'POST') {
    response$ = mockBackend.cadastrarFichaAnamnese(body as any);
  } else if (url.includes('/fichas') && method === 'GET') {
    const urlObj = new URL(url);
    const clienteId = urlObj.searchParams.get('clienteId');
    if (clienteId) {
      response$ = mockBackend.getFichaAnamnese(parseInt(clienteId));
    }
  }

  // ===== PROFISSIONAIS =====
  else if (url.includes('/profissionais') && method === 'GET') {
    response$ = mockBackend.getProfissionais();
  } else if (url.includes('/profissionais') && method === 'POST') {
    response$ = mockBackend.cadastrarProfissional(body as any);
  }

  // ===== AGENDAMENTOS =====
  else if (url.match(/\/agendamentos\/cliente\/\d+$/) && method === 'GET') {
    const id = parseInt(url.split('/').pop() || '0');
    response$ = mockBackend.getAgendamentosCliente(id);
  } else if (url.match(/\/agendamentos\/profissional\/\d+$/) && method === 'GET') {
    const id = parseInt(url.split('/').pop() || '0');
    response$ = mockBackend.getAgendamentosProfissional(id);
  } else if (url.match(/\/agendamentos\/servicos-pagos\/\d+$/) && method === 'GET') {
    const id = parseInt(url.split('/').pop() || '0');
    response$ = mockBackend.getServicosPagosNaoAgendados(id);
  } else if (url.includes('/agendamentos') && method === 'POST') {
    response$ = mockBackend.criarAgendamentoCompleto(body as any);
  } else if (url.match(/\/agendamentos\/\d+\/confirmar$/) && method === 'PATCH') {
    const id = url.split('/')[3];
    response$ = mockBackend.confirmarAgendamento(id);
  } else if (url.match(/\/agendamentos\/\d+\/confirmar-pago$/) && method === 'POST') {
    const id = url.split('/')[3];
    response$ = mockBackend.confirmarAgendamentoPago(id, (body as any).startDateTime, (body as any).endDateTime, (body as any).profissionalId);
  } else if (url.match(/\/agendamentos\/\d+\/cancelar$/) && method === 'PATCH') {
    const id = url.split('/')[3];
    response$ = mockBackend.cancelarAgendamento(id, (body as any).motivo);
  }

  // ===== CARRINHO =====
  else if (url.includes('/carrinho') && method === 'GET') {
    response$ = mockBackend.getCarrinho();
  } else if (url.includes('/carrinho/adicionar') && method === 'POST') {
    response$ = mockBackend.adicionarAoCarrinho(body as any);
  } else if (url.match(/\/carrinho\/\d+$/) && method === 'DELETE') {
    const id = parseInt(url.split('/').pop() || '0');
    response$ = mockBackend.removerDoCarrinho(id);
  } else if (url.includes('/carrinho') && method === 'DELETE') {
    response$ = mockBackend.limparCarrinho();
  }

  // ===== ESTATÍSTICAS =====
  else if (url.includes('/dashboard/estatisticas') && method === 'GET') {
    response$ = mockBackend.getEstatisticas();
  }

  // ===== FALLBACK =====
  if (!response$) {
    console.log('🔧 MockInterceptor - Rota não encontrada, retornando erro 404');
    response$ = of(new HttpResponse({
      status: 404,
      statusText: 'Not Found',
      body: { message: 'Endpoint não implementado no mock' }
    }));
  }

  return response$.pipe(
    // Simular delay de rede
    delay(200),
    // Converter para HttpResponse se não for já
    map(response => {
      if (response instanceof HttpResponse) {
        return response;
      }
      return new HttpResponse({
        status: 200,
        body: response
      });
    })
  );
};
