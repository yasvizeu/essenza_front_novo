import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { 
  mockClientes, 
  mockProfissionais, 
  mockServicos, 
  mockProdutos, 
  mockAgendamentos,
  mockMovimentosEstoque,
  buildJwt,
  MockUser,
  MockServico,
  MockProduto,
  MockAgendamento,
  MockMovimentoEstoque,
  MockFichaAnamnese
} from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class MockBackendService {
  private usuarios: MockUser[] = [...mockClientes, ...mockProfissionais];
  private servicos: MockServico[] = [...mockServicos];
  private produtos: MockProduto[] = [...mockProdutos];
  private agendamentos: MockAgendamento[] = [...mockAgendamentos];
  private movimentosEstoque: MockMovimentoEstoque[] = [...mockMovimentosEstoque];
  private fichasAnamnese: MockFichaAnamnese[] = [];
  private carrinho: any[] = [];

  constructor() {
    console.log('🔧 MockBackendService inicializado');
  }

  // ===== AUTENTICAÇÃO =====
  
  login(credentials: { email: string; senha: string; userType?: string }): Observable<any> {
    console.log('🔧 MockBackend - Login:', credentials);
    
    const usuario = this.usuarios.find(u => 
      u.email === credentials.email && 
      (credentials.userType ? u.tipo === credentials.userType : true)
    );

    if (!usuario) {
      return throwError(() => ({ 
        status: 401, 
        error: { message: 'Credenciais inválidas' } 
      }));
    }

    // Simular senha (qualquer senha funciona no mock)
    const token = buildJwt(usuario);
    const refreshToken = 'mock-refresh-token-' + Date.now();

    return of({
      access_token: token,
      refresh_token: refreshToken,
      user: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
        cpf: usuario.cpf,
        birthDate: usuario.birthDate,
        cell: usuario.cell,
        address: usuario.address,
        especialidade: usuario.especialidade,
        admin: usuario.admin,
        cnec: usuario.cnec
      }
    }).pipe(delay(500));
  }

  register(userData: any): Observable<any> {
    console.log('🔧 MockBackend - Register:', userData);
    
    const novoId = Math.max(...this.usuarios.map(u => u.id)) + 1;
    const novoUsuario: MockUser = {
      id: novoId,
      email: userData.email,
      nome: userData.nome,
      tipo: userData.tipo,
      cpf: userData.cpf,
      birthDate: userData.birthDate,
      cell: userData.cell,
      address: userData.address,
      especialidade: userData.especialidade,
      admin: userData.admin || false,
      cnec: userData.cnec
    };

    this.usuarios.push(novoUsuario);
    
    return of({
      message: 'Usuário cadastrado com sucesso',
      user: novoUsuario
    }).pipe(delay(300));
  }

  refreshToken(refreshToken: string): Observable<any> {
    console.log('🔧 MockBackend - Refresh token');
    
    return of({
      access_token: buildJwt({ id: 1, email: 'test@test.com', nome: 'Test', tipo: 'cliente' } as MockUser),
      refresh_token: 'new-refresh-token-' + Date.now()
    }).pipe(delay(200));
  }

  verifyToken(): Observable<any> {
    return of({ valid: true }).pipe(delay(100));
  }

  getProfile(): Observable<any> {
    return of({
      id: 1,
      email: 'test@test.com',
      nome: 'Test User',
      tipo: 'cliente'
    }).pipe(delay(200));
  }

  // ===== SERVIÇOS =====
  
  getServicos(page: number = 1, limit: number = 20, categoria?: string): Observable<any> {
    console.log('🔧 MockBackend - Get serviços');
    
    let servicosFiltrados = [...this.servicos];
    
    if (categoria) {
      servicosFiltrados = servicosFiltrados.filter(s => s.categoria === categoria);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedServicos = servicosFiltrados.slice(startIndex, endIndex);

    return of({
      data: paginatedServicos,
      pagination: {
        page,
        limit,
        total: servicosFiltrados.length,
        totalPages: Math.ceil(servicosFiltrados.length / limit),
        hasNext: endIndex < servicosFiltrados.length,
        hasPrev: page > 1
      }
    }).pipe(delay(300));
  }

  getServicoById(id: number): Observable<MockServico> {
    const servico = this.servicos.find(s => s.id === id);
    if (!servico) {
      return throwError(() => ({ status: 404, error: { message: 'Serviço não encontrado' } }));
    }
    return of(servico).pipe(delay(200));
  }

  // ===== PRODUTOS =====
  
  getProdutos(): Observable<MockProduto[]> {
    console.log('🔧 MockBackend - Get produtos');
    return of([...this.produtos]).pipe(delay(300));
  }

  getSaldoProduto(produtoId: number): Observable<any> {
    const produto = this.produtos.find(p => p.id === produtoId);
    if (!produto) {
      return throwError(() => ({ status: 404, error: { message: 'Produto não encontrado' } }));
    }

    // Calcular saldo baseado nas movimentações
    const saldo = this.movimentosEstoque
      .filter(m => m.produtoId === produtoId)
      .reduce((total, mov) => total + mov.quantidade, 0);

    return of({
      produtoId,
      nome: produto.nome,
      saldo,
      unidade: 'un'
    }).pipe(delay(200));
  }

  getMovimentacoesProduto(produtoId: number, limit: number = 50): Observable<MockMovimentoEstoque[]> {
    const movimentacoes = this.movimentosEstoque
      .filter(m => m.produtoId === produtoId)
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      .slice(0, limit);

    return of(movimentacoes).pipe(delay(200));
  }

  criarMovimentoEstoque(movimento: any): Observable<any> {
    console.log('🔧 MockBackend - Criar movimento estoque:', movimento);
    
    const novoMovimento: MockMovimentoEstoque = {
      id: Math.max(...this.movimentosEstoque.map(m => m.id)) + 1,
      produtoId: movimento.produtoId,
      quantidade: movimento.quantidade,
      motivo: movimento.motivo,
      refTipo: movimento.refTipo,
      refId: movimento.refId,
      criadoEm: new Date().toISOString()
    };

    this.movimentosEstoque.push(novoMovimento);
    
    return of({
      message: 'Movimento criado com sucesso',
      movimento: novoMovimento
    }).pipe(delay(300));
  }

  getProdutosBaixoEstoque(): Observable<MockProduto[]> {
    // Simular produtos com baixo estoque
    const produtosBaixoEstoque = this.produtos.filter(p => 
      this.movimentosEstoque
        .filter(m => m.produtoId === p.id)
        .reduce((total, mov) => total + mov.quantidade, 0) < 10
    );

    return of(produtosBaixoEstoque).pipe(delay(200));
  }

  getUltimasMovimentacoes(limit: number = 10): Observable<MockMovimentoEstoque[]> {
    const ultimas = this.movimentosEstoque
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
      .slice(0, limit);

    return of(ultimas).pipe(delay(200));
  }

  // ===== CLIENTES =====
  
  getClientes(): Observable<MockUser[]> {
    console.log('🔧 MockBackend - Get clientes');
    const clientes = this.usuarios.filter(u => u.tipo === 'cliente');
    return of(clientes).pipe(delay(300));
  }

  getCliente(id: number): Observable<MockUser> {
    const cliente = this.usuarios.find(u => u.id === id && u.tipo === 'cliente');
    if (!cliente) {
      return throwError(() => ({ status: 404, error: { message: 'Cliente não encontrado' } }));
    }
    return of(cliente).pipe(delay(200));
  }

  // Cadastrar cliente
  cadastrarCliente(cliente: any): Observable<any> {
    console.log('🔧 MockBackend - Cadastrar cliente:', cliente);
    
    // Verificar se email já existe
    const emailExistente = this.usuarios.find(u => u.email === cliente.email);
    if (emailExistente) {
      return throwError(() => ({ 
        status: 400, 
        error: { message: 'Email já cadastrado' } 
      }));
    }

    // Verificar se CPF já existe
    const cpfExistente = this.usuarios.find(u => u.cpf === cliente.cpf);
    if (cpfExistente) {
      return throwError(() => ({ 
        status: 400, 
        error: { message: 'CPF já cadastrado' } 
      }));
    }

    const novoId = Math.max(...this.usuarios.map(u => u.id)) + 1;
    const novoCliente: MockUser = {
      id: novoId,
      email: cliente.email,
      nome: cliente.name,
      senha: cliente.password,
      tipo: 'cliente',
      cpf: cliente.cpf,
      birthDate: cliente.birthDate,
      cell: cliente.cell,
      address: cliente.address
    };

    this.usuarios.push(novoCliente);
    
    return of({
      id: novoCliente.id,
      email: novoCliente.email,
      nome: novoCliente.nome,
      tipo: novoCliente.tipo,
      cpf: novoCliente.cpf,
      birthDate: novoCliente.birthDate,
      cell: novoCliente.cell,
      address: novoCliente.address
    }).pipe(delay(500));
  }

  // Cadastrar ficha de anamnese
  cadastrarFichaAnamnese(ficha: any): Observable<any> {
    console.log('🔧 MockBackend - Cadastrar ficha anamnese:', ficha);
    
    const novoId = Math.max(...this.fichasAnamnese.map(f => f.id)) + 1;
    const novaFicha: MockFichaAnamnese = {
      id: novoId,
      clienteId: ficha.clienteId,
      healthProblems: ficha.healthProblems,
      medications: ficha.medications,
      allergies: ficha.allergies,
      surgeries: ficha.surgeries,
      lifestyle: ficha.lifestyle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.fichasAnamnese.push(novaFicha);
    
    return of(novaFicha).pipe(delay(300));
  }

  // Verificar CPF existente
  verificarCpfExistente(cpf: string): Observable<{ exists: boolean }> {
    const cpfExistente = this.usuarios.find(u => u.cpf === cpf);
    return of({ exists: !!cpfExistente }).pipe(delay(200));
  }

  // Buscar ficha de anamnese por cliente
  getFichaAnamnese(clienteId: number): Observable<MockFichaAnamnese> {
    const ficha = this.fichasAnamnese.find(f => f.clienteId === clienteId);
    if (!ficha) {
      return throwError(() => ({ status: 404, error: { message: 'Ficha de anamnese não encontrada' } }));
    }
    return of(ficha).pipe(delay(200));
  }

  // ===== PROFISSIONAIS =====
  
  getProfissionais(): Observable<MockUser[]> {
    console.log('🔧 MockBackend - Get profissionais');
    const profissionais = this.usuarios.filter(u => u.tipo === 'profissional');
    return of(profissionais).pipe(delay(300));
  }

  cadastrarProfissional(profissional: any): Observable<any> {
    console.log('🔧 MockBackend - Cadastrar profissional:', profissional);
    
    const novoId = Math.max(...this.usuarios.map(u => u.id)) + 1;
    const novoProfissional: MockUser = {
      id: novoId,
      email: profissional.email,
      nome: profissional.nome,
      tipo: 'profissional',
      cpf: profissional.cpf,
      birthDate: profissional.birthDate,
      cell: profissional.cell,
      address: profissional.address,
      especialidade: profissional.especialidade,
      admin: profissional.admin || false,
      cnec: profissional.cnec
    };

    this.usuarios.push(novoProfissional);
    
    return of({
      message: 'Profissional cadastrado com sucesso',
      profissional: novoProfissional
    }).pipe(delay(300));
  }

  // ===== AGENDAMENTOS =====
  
  getAgendamentosCliente(clienteId: number): Observable<MockAgendamento[]> {
    console.log('🔧 MockBackend - Get agendamentos cliente:', clienteId);
    
    const agendamentosCliente = this.agendamentos.filter(a => a.clienteId === clienteId);
    return of(agendamentosCliente).pipe(delay(300));
  }

  getAgendamentosProfissional(profissionalId: number): Observable<MockAgendamento[]> {
    console.log('🔧 MockBackend - ===== GET AGENDAMENTOS PROFISSIONAL =====');
    console.log('🔧 MockBackend - Profissional ID:', profissionalId);
    console.log('🔧 MockBackend - Total de agendamentos:', this.agendamentos.length);
    console.log('🔧 MockBackend - Todos os agendamentos:', this.agendamentos.map(a => ({
      id: a.id,
      profissionalId: a.profissionalId,
      status: a.status,
      servicoId: a.servicoId,
      startDateTime: a.startDateTime
    })));
    
    const agendamentosProfissional = this.agendamentos.filter(a => a.profissionalId === profissionalId);
    console.log('🔧 MockBackend - Agendamentos filtrados para profissional:', agendamentosProfissional.length);
    console.log('🔧 MockBackend - Agendamentos do profissional:', agendamentosProfissional.map(a => ({
      id: a.id,
      profissionalId: a.profissionalId,
      status: a.status,
      servicoId: a.servicoId,
      startDateTime: a.startDateTime
    })));
    console.log('🔧 MockBackend - ===== FIM GET AGENDAMENTOS PROFISSIONAL =====');
    
    return of(agendamentosProfissional).pipe(delay(300));
  }

  getServicosPagosNaoAgendados(clienteId: number): Observable<any[]> {
    console.log('🔧 MockBackend - ===== INÍCIO getServicosPagosNaoAgendados =====');
    console.log('🔧 MockBackend - Cliente ID:', clienteId);
    console.log('🔧 MockBackend - Total de agendamentos:', this.agendamentos.length);
    console.log('🔧 MockBackend - Agendamentos completos:', this.agendamentos);
    
    // Simular serviços pagos não agendados (status tentative)
    const agendamentosFiltrados = this.agendamentos.filter(a => {
      const match = a.clienteId === clienteId && a.status === 'tentative' && a.statusPagamento === 'pago';
      console.log('🔧 MockBackend - Agendamento ID', a.id, 'match:', match, {
        clienteId: a.clienteId,
        status: a.status,
        statusPagamento: a.statusPagamento
      });
      return match;
    });
    
    console.log('🔧 MockBackend - Agendamentos filtrados encontrados:', agendamentosFiltrados.length);
    console.log('🔧 MockBackend - Agendamentos filtrados:', agendamentosFiltrados);
    
    const servicosPagos = agendamentosFiltrados.map(a => {
      console.log('🔧 MockBackend - Processando agendamento ID:', a.id);
      
      // Buscar o serviço real pelo servicoId
      const servicoReal = this.servicos.find(s => s.id === a.servicoId);
      console.log('🔧 MockBackend - Serviço real encontrado para servicoId', a.servicoId, ':', servicoReal);
      
      const servicoFinal = {
        id: a.id,
        agendamentoId: a.id,
        nome: servicoReal?.nome || a.servico?.nome || a.title || 'Serviço',
        descricao: servicoReal?.descricao || a.servico?.descricao || a.description || 'Descrição',
        preco: servicoReal?.preco || a.servico?.preco || a.valor || 0,
        duracao: servicoReal?.duracao || 60,
        categoria: servicoReal?.categoria || 'Serviço',
        imagem: servicoReal?.imagem || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
      };
      
      console.log('🔧 MockBackend - Serviço final processado:', servicoFinal);
      return servicoFinal;
    });

    console.log('🔧 MockBackend - RESULTADO FINAL - Serviços pagos:', servicosPagos);
    console.log('🔧 MockBackend - Quantidade de serviços pagos:', servicosPagos.length);
    console.log('🔧 MockBackend - ===== FIM getServicosPagosNaoAgendados =====');
    return of(servicosPagos).pipe(delay(300));
  }

  criarAgendamento(agendamento: any): Observable<MockAgendamento> {
    console.log('🔧 MockBackend - Criar agendamento:', agendamento);
    
    const novoId = Math.max(...this.agendamentos.map(a => a.id)) + 1;
    const dataHora = new Date(`${agendamento.data}T${agendamento.horario}:00`);
    const dataHoraFim = new Date(dataHora.getTime() + (agendamento.duracao || 60) * 60000);

    const novoAgendamento: MockAgendamento = {
      id: novoId,
      startDateTime: dataHora.toISOString(),
      endDateTime: dataHoraFim.toISOString(),
      timeZone: 'America/Sao_Paulo',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      servicoId: agendamento.servicoId,
      clienteId: agendamento.clienteId,
      profissionalId: agendamento.profissionalId,
      servico: this.servicos.find(s => s.id === agendamento.servicoId),
      cliente: (() => {
        const cliente = this.usuarios.find(u => u.id === agendamento.clienteId);
        return cliente ? {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          cell: cliente.cell || ''
        } : undefined;
      })(),
      profissional: this.usuarios.find(u => u.id === agendamento.profissionalId),
      statusPagamento: 'pago',
      observacoes: agendamento.observacoes || ''
    };

    this.agendamentos.push(novoAgendamento);
    
    return of(novoAgendamento).pipe(delay(500));
  }

  criarAgendamentoCompleto(agendamento: any): Observable<MockAgendamento> {
    console.log('🔧 MockBackend - Criar agendamento completo:', agendamento);
    
    const novoId = Math.max(...this.agendamentos.map(a => a.id)) + 1;

    // Buscar o serviço completo
    const servicoCompleto = this.servicos.find(s => s.id === agendamento.servicoId);
    console.log('🔧 MockBackend - Serviço completo encontrado para agendamento:', servicoCompleto);
    
    const novoAgendamento: MockAgendamento = {
      id: novoId,
      startDateTime: agendamento.startDateTime,
      endDateTime: agendamento.endDateTime,
      timeZone: 'America/Sao_Paulo',
      status: agendamento.status || 'tentative', // Mudança: padrão é tentative para serviços pagos
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      servicoId: agendamento.servicoId,
      clienteId: agendamento.clienteId,
      profissionalId: agendamento.profissionalId,
      servico: servicoCompleto ? {
        id: servicoCompleto.id,
        nome: servicoCompleto.nome,
        descricao: servicoCompleto.descricao,
        preco: servicoCompleto.preco
      } : undefined,
      cliente: (() => {
        const cliente = this.usuarios.find(u => u.id === agendamento.clienteId);
        return cliente ? {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          cell: cliente.cell || ''
        } : undefined;
      })(),
      profissional: this.usuarios.find(u => u.id === agendamento.profissionalId),
      statusPagamento: agendamento.statusPagamento || 'pago',
      observacoes: agendamento.observacoes || '',
      title: agendamento.title || servicoCompleto?.nome || 'Serviço',
      description: agendamento.description || servicoCompleto?.descricao || 'Descrição',
      valor: agendamento.valor || servicoCompleto?.preco || 0
    };

    this.agendamentos.push(novoAgendamento);
    
    return of(novoAgendamento).pipe(delay(500));
  }

  confirmarAgendamento(id: string): Observable<MockAgendamento> {
    console.log('🔧 MockBackend - Confirmar agendamento:', id);
    
    const agendamento = this.agendamentos.find(a => a.id === parseInt(id));
    if (!agendamento) {
      return throwError(() => ({ status: 404, error: { message: 'Agendamento não encontrado' } }));
    }

    agendamento.status = 'confirmed';
    agendamento.updatedAt = new Date().toISOString();
    
    return of(agendamento).pipe(delay(300));
  }

  confirmarAgendamentoPago(id: string | number, startDateTime: string, endDateTime: string, profissionalId: number): Observable<MockAgendamento> {
    console.log('🔧 MockBackend - Confirmar agendamento pago:', id);
    console.log('🔧 MockBackend - Parâmetros:', { startDateTime, endDateTime, profissionalId });
    console.log('🔧 MockBackend - Agendamentos antes da confirmação:', this.agendamentos.map(a => ({ id: a.id, status: a.status, servicoId: a.servicoId })));
    
    const agendamento = this.agendamentos.find(a => a.id === parseInt(id.toString()));
    if (!agendamento) {
      console.log('🔧 MockBackend - Agendamento não encontrado para ID:', id);
      return throwError(() => ({ status: 404, error: { message: 'Agendamento não encontrado' } }));
    }

    console.log('🔧 MockBackend - Agendamento encontrado antes da confirmação:', agendamento);
    
    agendamento.startDateTime = startDateTime;
    agendamento.endDateTime = endDateTime;
    agendamento.profissionalId = profissionalId;
    agendamento.status = 'confirmed';
    agendamento.updatedAt = new Date().toISOString();
    
    console.log('🔧 MockBackend - Agendamento após confirmação:', agendamento);
    console.log('🔧 MockBackend - Agendamentos após confirmação:', this.agendamentos.map(a => ({ id: a.id, status: a.status, servicoId: a.servicoId })));
    
    return of(agendamento).pipe(delay(300));
  }

  cancelarAgendamento(id: string, motivo?: string): Observable<MockAgendamento> {
    console.log('🔧 MockBackend - Cancelar agendamento:', id);
    
    const agendamento = this.agendamentos.find(a => a.id === parseInt(id));
    if (!agendamento) {
      return throwError(() => ({ status: 404, error: { message: 'Agendamento não encontrado' } }));
    }

    agendamento.status = 'cancelled';
    agendamento.updatedAt = new Date().toISOString();
    
    return of(agendamento).pipe(delay(300));
  }

  atualizarAgendamento(id: string | number, dados: any): Observable<MockAgendamento> {
    console.log('🔧 MockBackend - Atualizar agendamento:', id);
    
    const agendamento = this.agendamentos.find(a => a.id === parseInt(id.toString()));
    if (!agendamento) {
      return throwError(() => ({ status: 404, error: { message: 'Agendamento não encontrado' } }));
    }

    Object.assign(agendamento, dados);
    agendamento.updatedAt = new Date().toISOString();
    
    return of(agendamento).pipe(delay(300));
  }

  // ===== CARRINHO =====
  
  getCarrinho(): Observable<any> {
    console.log('🔧 MockBackend - Get carrinho');
    return of({
      items: this.carrinho,
      total: this.carrinho.reduce((sum, item) => sum + (item.precoTotal || 0), 0),
      totalItems: this.carrinho.reduce((sum, item) => sum + (item.quantidade || 0), 0)
    }).pipe(delay(200));
  }

  adicionarAoCarrinho(item: any): Observable<any> {
    console.log('🔧 MockBackend - Adicionar ao carrinho:', item);
    
    const servico = this.servicos.find(s => s.id === item.servicoId);
    if (!servico) {
      return throwError(() => ({ status: 404, error: { message: 'Serviço não encontrado' } }));
    }

    const itemExistente = this.carrinho.find(i => i.servicoId === item.servicoId);
    if (itemExistente) {
      itemExistente.quantidade += item.quantidade;
      itemExistente.precoTotal = itemExistente.precoUnitario * itemExistente.quantidade;
    } else {
      const novoItem = {
        id: Date.now(),
        servicoId: item.servicoId,
        servico: servico,
        quantidade: item.quantidade,
        precoUnitario: servico.preco,
        precoTotal: servico.preco * item.quantidade
      };
      this.carrinho.push(novoItem);
    }

    return of({ success: true }).pipe(delay(200));
  }

  removerDoCarrinho(itemId: number): Observable<any> {
    console.log('🔧 MockBackend - Remover do carrinho:', itemId);
    
    this.carrinho = this.carrinho.filter(item => item.id !== itemId);
    
    return of({ success: true }).pipe(delay(200));
  }

  atualizarCarrinho(itemId: number, quantidade: number): Observable<any> {
    console.log('🔧 MockBackend - Atualizar carrinho:', itemId, quantidade);
    
    const item = this.carrinho.find(i => i.id === itemId);
    if (item) {
      item.quantidade = quantidade;
      item.precoTotal = item.precoUnitario * quantidade;
    }
    
    return of({ success: true }).pipe(delay(200));
  }

  limparCarrinho(): Observable<any> {
    console.log('🔧 MockBackend - Limpar carrinho');
    
    this.carrinho = [];
    
    return of({ success: true }).pipe(delay(200));
  }

  // ===== EXECUÇÃO DE SERVIÇOS =====
  
  executarServico(execucao: any): Observable<any> {
    console.log('🔧 MockBackend - Executar serviço:', execucao);
    
    // Simular baixa no estoque
    const movimento: MockMovimentoEstoque = {
      id: Math.max(...this.movimentosEstoque.map(m => m.id)) + 1,
      produtoId: 1, // Simular produto usado no serviço
      quantidade: -execucao.quantidade,
      motivo: 'execucao_servico',
      refTipo: execucao.refTipo || 'servico',
      refId: execucao.refId || execucao.servicoId.toString(),
      criadoEm: new Date().toISOString()
    };

    this.movimentosEstoque.push(movimento);
    
    return of({
      message: 'Serviço executado com sucesso',
      movimento
    }).pipe(delay(300));
  }

  // ===== ESTATÍSTICAS =====
  
  getEstatisticas(): Observable<any> {
    console.log('🔧 MockBackend - Get estatísticas');
    
    const totalClientes = this.usuarios.filter(u => u.tipo === 'cliente').length;
    const totalProdutos = this.produtos.length;
    const totalServicos = this.servicos.length;
    const produtosBaixoEstoque = this.produtos.filter(p => 
      this.movimentosEstoque
        .filter(m => m.produtoId === p.id)
        .reduce((total, mov) => total + mov.quantidade, 0) < 10
    ).length;
    const movimentacoesHoje = this.movimentosEstoque.filter(m => {
      const hoje = new Date().toDateString();
      const dataMov = new Date(m.criadoEm).toDateString();
      return dataMov === hoje;
    }).length;

    return of({
      totalClientes,
      totalProdutos,
      totalServicos,
      produtosBaixoEstoque,
      movimentacoesHoje
    }).pipe(delay(200));
  }
}
