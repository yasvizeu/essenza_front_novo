import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  MOCK_BASE_URL,
  mockClientes,
  mockProfissionais,
  mockServicos,
  mockProdutos,
  mockEstoque,
  mockAgendamentos,
  mockLogins,
  buildJwt,
  mockFichasAnamnese,
  mockMovimentosEstoque
} from './mock-data';

function ok<T>(body: T, status = 200): Observable<HttpEvent<T>> {
  return of(new HttpResponse({ status, body })).pipe(delay(200));
}

function notFound(message = 'Not found'): Observable<HttpEvent<any>> {
  return of(new HttpResponse({ status: 404, body: { message } })).pipe(delay(200));
}

function badRequest(message = 'Bad request'): Observable<HttpEvent<any>> {
  return of(new HttpResponse({ status: 400, body: { message } })).pipe(delay(200));
}

function extractId(url: string): number | null {
  const match = url.match(/\/(\d+)(?:\?.*)?$/);
  return match ? parseInt(match[1], 10) : null;
}

function enrichAgendamento(a: any) {
  const servico = a.servico ?? mockServicos.find(s => s.id === a.servicoId);
  const cliente = a.cliente ?? mockClientes.find(c => c.id === a.clienteId);
  const prof = a.profissional ?? mockProfissionais.find(p => p.id === a.profissionalId);
  return {
    ...a,
    title: a.title ?? servico?.nome ?? 'Serviço',
    description: a.description ?? servico?.descricao ?? '',
    servicoNome: a.servicoNome ?? servico?.nome,
    valor: a.valor ?? Number(servico?.preco ?? 0),
    clienteNome: a.clienteNome ?? cliente?.nome,
    profissionalNome: a.profissionalNome ?? prof?.nome,
    servico,
    cliente,
    profissional: prof
  };
}

export const mockBackendInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const { url, method, body } = req;

  // Apenas interceptar chamadas ao backend configurado
  if (!url.startsWith(MOCK_BASE_URL)) {
    return next(req);
  }

  // AUTH
  if (url.endsWith('/auth/login') && method === 'POST') {
    const { email, senha } = body || {};
    const user = [...mockClientes, ...mockProfissionais].find(u => u.email === email);
    if (!user) return badRequest('Credenciais inválidas');
    // senha fixa para demo
    if (senha !== mockLogins.cliente.senha && senha !== mockLogins.profissional.senha) return badRequest('Credenciais inválidas');
    const access_token = buildJwt(user);
    const refresh_token = 'mock-refresh-token';
    return ok({ access_token, refresh_token, user });
  }

  if (url.endsWith('/auth/login-profissional') && method === 'POST') {
    const { email, senha } = body || {};
    const user = mockProfissionais.find(u => u.email === email);
    if (!user) return badRequest('Credenciais inválidas');
    if (senha !== mockLogins.profissional.senha) return badRequest('Credenciais inválidas');
    const access_token = buildJwt(user);
    const refresh_token = 'mock-refresh-token';
    return ok({ access_token, refresh_token, user });
  }

  if (url.endsWith('/auth/refresh') && method === 'POST') {
    // renovar o mesmo token para apresentação
    const user = mockProfissionais[0];
    const access_token = buildJwt(user);
    return ok({ access_token });
  }

  if (url.endsWith('/auth/verify') && method === 'GET') {
    return ok({ valid: true });
  }

  if (url.endsWith('/auth/profile') && method === 'GET') {
    // devolver sempre o profissional demo para simplificar
    return ok(mockProfissionais[0]);
  }

  // SERVIÇOS
  if (url.match(/\/servico(\?.*)?$/) && method === 'GET') {
    const page = 1, limit = mockServicos.length, total = mockServicos.length;
    return ok({
      data: mockServicos,
      pagination: { page, limit, total, totalPages: 1, hasNext: false, hasPrev: false }
    });
  }

  if (url.match(/\/servico\/(\d+)$/) && method === 'GET') {
    const id = extractId(url);
    const item = mockServicos.find(s => s.id === id);
    return item ? ok(item) : notFound('Serviço não encontrado');
  }

  // AGENDAMENTOS
  if (url.match(/\/agendamentos\/cliente\/(\d+)/) && method === 'GET') {
    const id = extractId(url);
    const lista = mockAgendamentos
      .filter(a => a.clienteId === id)
      .map(enrichAgendamento);
    return ok(lista);
  }

  if (url.match(/\/agendamentos\/profissional\/(\d+)/) && method === 'GET') {
    const id = extractId(url);
    const lista = mockAgendamentos
      .filter(a => a.profissionalId === id)
      .map(enrichAgendamento);
    return ok(lista);
  }

  if (url.endsWith('/agendamentos') && method === 'POST') {
    const novoId = Math.max(...mockAgendamentos.map(a => a.id)) + 1;
    const startDateTime = body?.startDateTime || new Date().toISOString();
    const endDateTime = body?.endDateTime || new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const novo = enrichAgendamento({
      id: novoId,
      startDateTime,
      endDateTime,
      timeZone: 'America/Sao_Paulo',
      status: 'tentative',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      servicoId: body?.servicoId ?? mockServicos[0].id,
      clienteId: body?.clienteId ?? mockClientes[0].id,
      profissionalId: body?.profissionalId ?? mockProfissionais[0].id,
      statusPagamento: 'pendente'
    });
    (mockAgendamentos as any).push(novo);
    return ok(novo, 201);
  }

  if (url.match(/\/agendamentos\/(\d+)$/) && method === 'PUT') {
    const id = extractId(url);
    const idx = mockAgendamentos.findIndex(a => a.id === id);
    if (idx < 0) return notFound('Agendamento não encontrado');
    (mockAgendamentos as any)[idx] = enrichAgendamento({ ...mockAgendamentos[idx], ...body, updatedAt: new Date().toISOString() });
    return ok(mockAgendamentos[idx]);
  }

  if (url.match(/\/agendamentos\/(\d+)$/) && method === 'DELETE') {
    const id = extractId(url);
    const idx = mockAgendamentos.findIndex(a => a.id === id);
    if (idx < 0) return notFound('Agendamento não encontrado');
    (mockAgendamentos as any).splice(idx, 1);
    return ok({ success: true });
  }

  if (url.match(/\/agendamentos\/(\d+)\/confirmar-pago$/) && method === 'POST') {
    const id = extractId(url);
    const ag = mockAgendamentos.find(a => a.id === id);
    if (!ag) return notFound('Agendamento não encontrado');
    ag.status = 'confirmed';
    ag.statusPagamento = 'pago';
    ag.updatedAt = new Date().toISOString();
    return ok(enrichAgendamento(ag));
  }

  if (url.match(/\/agendamentos\/disponibilidade\/(\d+)/) && method === 'GET') {
    const id = extractId(url);
    const dateParam = (url.split('?')[1] || '').split('&').find(p => p.startsWith('data='));
    const data = dateParam ? decodeURIComponent(dateParam.split('=')[1]) : new Date().toISOString().slice(0,10);
    const horariosDisponiveis = ['09:00', '10:30', '14:00', '16:00', '17:30'];
    return ok({ profissionalId: id, data, horariosDisponiveis });
  }

  if (url.match(/\/agendamentos\/disponibilidade\?.+/) && method === 'GET') {
    // Sempre retorna disponível para a demo
    return ok({ disponivel: true });
  }

  // CARRINHO (in-memory)
  type CartItem = { id: number; servico: any; quantidade: number; precoUnitario: number; precoTotal: number };
  const g: any = globalThis as any;
  if (!g.__ESSENZA_CART__) {
    g.__ESSENZA_CART__ = { items: [] as CartItem[], total: 0, totalItems: 0 };
  }

  const recalcCart = () => {
    const cart = g.__ESSENZA_CART__;
    cart.total = cart.items.reduce((s: number, it: CartItem) => s + it.precoTotal, 0);
    cart.totalItems = cart.items.reduce((s: number, it: CartItem) => s + it.quantidade, 0);
    return cart;
  };

  if (url.endsWith('/carrinho') && method === 'GET') {
    return ok(recalcCart());
  }

  if (url.endsWith('/carrinho') && method === 'DELETE') {
    g.__ESSENZA_CART__ = { items: [], total: 0, totalItems: 0 };
    return ok(recalcCart());
  }

  if (url.endsWith('/carrinho/adicionar') && method === 'POST') {
    const servicoId = body?.servicoId;
    const qtd = Math.max(1, body?.quantidade ?? 1);
    const servico = mockServicos.find(s => s.id === servicoId) ?? mockServicos[0];
    const price = Number(servico.preco);
    const cart = g.__ESSENZA_CART__;
    const existing = cart.items.find((i: CartItem) => i.servico.id === servico.id);
    if (existing) {
      existing.quantidade += qtd;
      existing.precoTotal = existing.quantidade * existing.precoUnitario;
    } else {
      cart.items.push({
        id: Date.now(),
        servico,
        quantidade: qtd,
        precoUnitario: price,
        precoTotal: price * qtd
      });
    }
    return ok(recalcCart(), 201);
  }

  if (url.match(/\/carrinho\/(\d+)$/) && method === 'DELETE') {
    const id = extractId(url);
    const cart = g.__ESSENZA_CART__;
    cart.items = cart.items.filter((i: CartItem) => i.id !== id);
    return ok(recalcCart());
  }

  if (url.match(/\/carrinho\/(\d+)$/) && method === 'PUT') {
    const id = extractId(url);
    const qtd = Math.max(1, body?.quantidade ?? 1);
    const cart = g.__ESSENZA_CART__;
    const item = cart.items.find((i: CartItem) => i.id === id);
    if (!item) return notFound('Item do carrinho não encontrado');
    item.quantidade = qtd;
    item.precoTotal = item.precoUnitario * item.quantidade;
    return ok(recalcCart());
  }

  if (url.match(/\/carrinho\/verificar\/(\d+)$/) && method === 'GET') {
    const servicoId = extractId(url);
    const cart = g.__ESSENZA_CART__;
    const item = cart.items.find((i: CartItem) => i.servico.id === servicoId);
    return ok({ isInCart: !!item, quantidade: item ? item.quantidade : 0 });
  }

  // DASHBOARD: recomendados para você (cliente)
  if (url.endsWith('/dashboard/recomendados') && method === 'GET') {
    // Retorna subset dos serviços com pequena curadoria mockada
    const recomendados = [mockServicos[1], mockServicos[0], mockServicos[2]].filter(Boolean).map(s => ({
      ...s,
      destaque: true,
      motivo: 'Baseado nos seus últimos agendamentos'
    }));
    return ok(recomendados);
  }

  // PRODUTOS
  if (url.match(/\/produtos(\?.*)?$/) && method === 'GET') {
    return ok(mockProdutos);
  }

  // DASHBOARD/ESTOQUE
  if (url.match(/\/inventario\/produtos\/(\d+)\/saldo$/) && method === 'GET') {
    const produtoId = extractId(url);
    const produto = mockProdutos.find(p => p.id === produtoId);
    const est = mockEstoque.find(e => e.produtoId === produtoId);
    return produto && est ? ok({ produtoId, nome: produto.nome, saldo: est.quantidade, unidade: 'un' }) : notFound('Produto não encontrado');
  }

  if (url.match(/\/inventario\/produtos\/(\d+)\/extrato/) && method === 'GET') {
    const produtoId = extractId(url);
    const movimentos = mockMovimentosEstoque.filter(m => m.produtoId === produtoId).sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
    return ok(movimentos);
  }

  if (url.endsWith('/inventario/estoque/movimentos') && method === 'POST') {
    const novoId = Math.max(8000, ...mockMovimentosEstoque.map(m => m.id)) + 1;
    const movimento = { id: novoId, criadoEm: new Date().toISOString(), ...body };
    (mockMovimentosEstoque as any).push(movimento);
    // Atualiza saldo em memória
    const est = mockEstoque.find(e => e.produtoId === movimento.produtoId);
    if (est) est.quantidade += Number(movimento.quantidade || 0);
    return ok(movimento, 201);
  }

  if (url.endsWith('/dashboard/estatisticas') && method === 'GET') {
    const totalClientes = 1; // mock básico
    const totalProdutos = mockProdutos.length;
    const totalServicos = mockServicos.length;
    const produtosBaixoEstoque = mockEstoque.filter(e => e.quantidade < 15).length;
    const movimentacoesHoje = mockMovimentosEstoque.filter(m => new Date(m.criadoEm).toDateString() === new Date().toDateString()).length;
    return ok({ totalClientes, totalProdutos, totalServicos, produtosBaixoEstoque, movimentacoesHoje });
  }

  if (url.endsWith('/dashboard/produtos-baixo-estoque') && method === 'GET') {
    const baixos = mockEstoque.filter(e => e.quantidade < 15).map(e => {
      const p = mockProdutos.find(p => p.id === e.produtoId)!;
      return { id: p.id, nome: p.nome, categoria: p.categoria, baseUnit: 'un', emEstoque: e.quantidade > 0 } as any;
    });
    return ok(baixos);
  }

  if (url.match(/\/dashboard\/ultimas-movimentacoes(\?.*)?$/) && method === 'GET') {
    const limitParam = (url.split('?')[1] || '').split('&').find(p => p.startsWith('limit='));
    const limit = limitParam ? parseInt(limitParam.split('=')[1], 10) : 10;
    const ordenados = [...mockMovimentosEstoque].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
    return ok(ordenados.slice(0, limit));
  }

  // PROFISSIONAIS
  if (url.match(/\/profissionais(\?.*)?$/) && method === 'GET') {
    return ok(mockProfissionais);
  }

  // CLIENTES
  if (url.match(/\/clientes\/(\d+)$/) && method === 'GET') {
    const id = extractId(url);
    const cliente = mockClientes.find(c => c.id === id);
    return cliente ? ok(cliente) : notFound('Cliente não encontrado');
  }
  if (url.match(/\/clientes(\?.*)?$/) && method === 'GET') {
    return ok(mockClientes);
  }

  // FICHAS DE ANAMNESE
  if (url.match(/\/fichas\?clienteId=(\d+)/) && method === 'GET') {
    const clienteId = Number((url.split('clienteId=')[1] || '').split('&')[0]);
    const ficha = mockFichasAnamnese.find(f => f.clienteId === clienteId);
    return ficha ? ok(ficha) : notFound('Ficha de anamnese não encontrada');
  }
  if (url.endsWith('/fichas') && method === 'POST') {
    const novoId = Math.max(7000, ...mockFichasAnamnese.map(f => f.id)) + 1;
    const ficha = { id: novoId, ...body };
    (mockFichasAnamnese as any).push(ficha);
    return ok(ficha, 201);
  }
  if (url.match(/\/fichas\/(\d+)$/) && method === 'PATCH') {
    const id = extractId(url);
    const idx = mockFichasAnamnese.findIndex(f => f.id === id);
    if (idx < 0) return notFound('Ficha de anamnese não encontrada');
    (mockFichasAnamnese as any)[idx] = { ...mockFichasAnamnese[idx], ...body };
    return ok(mockFichasAnamnese[idx]);
  }

  // Serviços pagos não agendados (retorna alguns serviços do mock)
  if (url.match(/\/agendamentos\/servicos-pagos\/(\d+)$/) && method === 'GET') {
    const items = mockServicos.slice(0, 2).map(s => ({
      id: Math.floor(Math.random() * 100000),
      servicoId: s.id,
      servico: s,
      pagoEm: new Date().toISOString(),
      confirmado: false
    }));
    return ok(items);
  }

  if (url.match(/\/produtos\/(\d+)$/) && method === 'GET') {
    const id = extractId(url);
    const item = mockProdutos.find(p => p.id === id);
    return item ? ok(item) : notFound('Produto não encontrado');
  }

  // ESTOQUE
  if (url.match(/\/estoque(\?.*)?$/) && method === 'GET') {
    return ok(mockEstoque);
  }

  // Fallback: encaminhar requisições não mockadas
  return next(req);
};


