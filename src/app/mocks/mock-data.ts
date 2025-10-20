// Dados mockados para apresentação (somente frontend)
// Estes dados simulam respostas do backend para rotas essenciais

export type UserTipo = 'cliente' | 'profissional';

export interface MockUser {
  id: number;
  email: string;
  nome: string;
  tipo: UserTipo;
  cpf?: string;
  birthDate?: string;
  cell?: string;
  address?: string;
  especialidade?: string;
  admin?: boolean;
  cnec?: number;
}

export interface MockServico {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  categoria?: string;
  imagem?: string;
  disponivel?: boolean;
}

export interface MockProduto {
  id: number;
  nome: string;
  sku: string;
  preco: number;
  categoria?: string;
}

export interface MockEstoqueItem {
  produtoId: number;
  quantidade: number;
  local?: string;
}

export interface MockAgendamento {
  id: number;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  location?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  servicoId: number;
  clienteId: number;
  profissionalId: number;
  servico?: { id: number; nome: string; descricao: string; preco: number };
  cliente?: { id: number; nome: string; email: string; cell: string };
  profissional?: { id: number; nome: string; email: string };
  statusPagamento?: 'pendente' | 'pago' | 'cancelado';
  observacoes?: string;
}

export interface MockFichaAnamnese {
  id: number;
  clienteId: number;
  healthProblems: string;
  medications: string;
  allergies: string;
  surgeries: string;
  lifestyle: string;
}

export const mockClientes: MockUser[] = [
  {
    id: 101,
    email: 'cliente@essenza.com',
    nome: 'Cliente Demo',
    tipo: 'cliente',
    cpf: '123.456.789-00',
    birthDate: '1990-05-20',
    cell: '(11) 91234-5678',
    address: 'Rua das Flores, 123 - São Paulo/SP'
  }
];

export const mockProfissionais: MockUser[] = [
  {
    id: 201,
    email: 'pro@essenza.com',
    nome: 'Profissional Demo',
    tipo: 'profissional',
    especialidade: 'Estética Facial',
    admin: true,
    cnec: 12345
  }
];

export const mockServicos: MockServico[] = [
  // FACIAL
  { id: 1, nome: 'Limpeza de Pele', descricao: 'Tratamento facial completo com emoliência e extração suave', preco: 150, duracao: 60, categoria: 'Facial', disponivel: true },
  { id: 4, nome: 'Peeling Químico', descricao: 'Renovação celular para melhorar textura e manchas', preco: 220, duracao: 50, categoria: 'Facial', disponivel: true },
  { id: 5, nome: 'Hidratação Facial Profunda', descricao: 'Reposição hídrica com ativos calmantes', preco: 130, duracao: 40, categoria: 'Facial', disponivel: true },
  // CORPORAL
  { id: 2, nome: 'Massagem Relaxante', descricao: 'Massagem corporal 60min para aliviar tensões', preco: 200, duracao: 60, categoria: 'Corporal', disponivel: true },
  { id: 3, nome: 'Drenagem Linfática', descricao: 'Técnica manual para reduzir edema e retenção', preco: 180, duracao: 45, categoria: 'Corporal', disponivel: true },
  { id: 6, nome: 'Esfoliação Corporal', descricao: 'Remoção de células mortas e renovação da pele', preco: 160, duracao: 45, categoria: 'Corporal', disponivel: true },
  // MASSAGEM
  { id: 7, nome: 'Massagem Desportiva', descricao: 'Foco em desempenho e recuperação muscular', preco: 210, duracao: 60, categoria: 'Massagem', disponivel: true },
  { id: 8, nome: 'Reflexologia Podal', descricao: 'Técnica de pressão em pontos dos pés', preco: 140, duracao: 40, categoria: 'Massagem', disponivel: true }
];

export const mockProdutos: MockProduto[] = [
  { id: 501, nome: 'Creme Hidratante', sku: 'CRM-HID-001', preco: 49.9, categoria: 'Dermocosméticos' },
  { id: 502, nome: 'Máscara Facial', sku: 'MSK-FCL-002', preco: 29.9, categoria: 'Acessórios' },
  { id: 503, nome: 'Óleo Corporal', sku: 'OIL-CRP-003', preco: 59.9, categoria: 'Dermocosméticos' }
];

export const mockEstoque: MockEstoqueItem[] = [
  { produtoId: 501, quantidade: 35, local: 'Sala 1' },
  { produtoId: 502, quantidade: 80, local: 'Sala 2' },
  { produtoId: 503, quantidade: 12, local: 'Almoxarifado' }
];

function nextHour(hoursFromNow = 2): { start: string; end: string } {
  const start = new Date();
  start.setHours(start.getHours() + hoursFromNow, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 60);
  return { start: start.toISOString(), end: end.toISOString() };
}

const slot1 = nextHour(2);        // hoje +2h
const slot2 = nextHour(24 + 3);   // amanhã +3h
const slot3 = nextHour(24 * 3);   // +3 dias
const slotPast = (() => { const s = new Date(); s.setDate(s.getDate() - 2); const e = new Date(s); e.setHours(e.getHours() + 1); return { start: s.toISOString(), end: e.toISOString() }; })();

export const mockAgendamentos: MockAgendamento[] = [
  // Confirmados futuros (cliente 101 / profissional 201)
  {
    id: 9001,
    startDateTime: slot1.start,
    endDateTime: slot1.end,
    timeZone: 'America/Sao_Paulo',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    servicoId: 1,
    clienteId: 101,
    profissionalId: 201,
    servico: { id: 1, nome: 'Limpeza de Pele', descricao: 'Tratamento facial completo com emoliência e extração suave', preco: 150 },
    cliente: { id: 101, nome: 'Cliente Demo', email: 'cliente@essenza.com', cell: '(11) 91234-5678' },
    profissional: { id: 201, nome: 'Profissional Demo', email: 'pro@essenza.com' },
    statusPagamento: 'pago',
    observacoes: 'Primeira sessão'
  },
  {
    id: 9002,
    startDateTime: slot2.start,
    endDateTime: slot2.end,
    timeZone: 'America/Sao_Paulo',
    status: 'tentative',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    servicoId: 2,
    clienteId: 101,
    profissionalId: 201,
    servico: { id: 2, nome: 'Massagem Relaxante', descricao: 'Massagem corporal 60min para aliviar tensões', preco: 200 },
    cliente: { id: 101, nome: 'Cliente Demo', email: 'cliente@essenza.com', cell: '(11) 91234-5678' },
    profissional: { id: 201, nome: 'Profissional Demo', email: 'pro@essenza.com' },
    statusPagamento: 'pendente'
  },
  {
    id: 9003,
    startDateTime: slot3.start,
    endDateTime: slot3.end,
    timeZone: 'America/Sao_Paulo',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    servicoId: 4,
    clienteId: 101,
    profissionalId: 201,
    servico: { id: 4, nome: 'Peeling Químico', descricao: 'Renovação celular para melhorar textura e manchas', preco: 220 },
    cliente: { id: 101, nome: 'Cliente Demo', email: 'cliente@essenza.com', cell: '(11) 91234-5678' },
    profissional: { id: 201, nome: 'Profissional Demo', email: 'pro@essenza.com' },
    statusPagamento: 'pago'
  },
  // Histórico (passado)
  {
    id: 8990,
    startDateTime: slotPast.start,
    endDateTime: slotPast.end,
    timeZone: 'America/Sao_Paulo',
    status: 'cancelled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    servicoId: 7,
    clienteId: 101,
    profissionalId: 201,
    servico: { id: 7, nome: 'Massagem Desportiva', descricao: 'Foco em desempenho e recuperação muscular', preco: 210 },
    cliente: { id: 101, nome: 'Cliente Demo', email: 'cliente@essenza.com', cell: '(11) 91234-5678' },
    profissional: { id: 201, nome: 'Profissional Demo', email: 'pro@essenza.com' },
    statusPagamento: 'cancelado'
  }
];

export const mockFichasAnamnese: MockFichaAnamnese[] = [
  {
    id: 7001,
    clienteId: 101,
    healthProblems: 'Asma leve controlada; histórico de dermatite atópica.',
    medications: 'Loratadina 10mg (uso eventual); Broncodilatador SOS.',
    allergies: 'Fragrâncias fortes (cosméticos e essências).',
    surgeries: 'Sem cirurgias anteriores.',
    lifestyle: 'Bebe água regularmente (~2L/dia), não fuma, treina 3x/semana.'
  }
];

export interface MockMovimentoEstoque {
  id: number;
  produtoId: number;
  quantidade: number;
  motivo: string;
  refTipo?: string;
  refId?: string;
  criadoEm: string;
}

export const mockMovimentosEstoque: MockMovimentoEstoque[] = [
  { id: 8001, produtoId: 501, quantidade: -2, motivo: 'Execução de serviço: Limpeza de Pele', refTipo: 'ordem-servico', refId: 'OS-1001', criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: 8002, produtoId: 503, quantidade: 10, motivo: 'Reabastecimento', refTipo: 'compra', refId: 'NF-5521', criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
  { id: 8003, produtoId: 502, quantidade: -1, motivo: 'Execução de serviço: Massagem Relaxante', refTipo: 'ordem-servico', refId: 'OS-1002', criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
  { id: 8004, produtoId: 501, quantidade: -1, motivo: 'Uso interno', criadoEm: new Date(Date.now() - 1000 * 60 * 10).toISOString() }
];

export const MOCK_BASE_URL = 'http://localhost:3000';

export const mockLogins = {
  cliente: {
    email: 'cliente@essenza.com',
    senha: '123456'
  },
  profissional: {
    email: 'pro@essenza.com',
    senha: '123456'
  }
};

export function buildJwt(user: MockUser): string {
  // JWT fake apenas para satisfazer o front (não validado pelo backend)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 60 * 60; // 1h
  const payload = btoa(JSON.stringify({ sub: String(user.id), email: user.email, tipo: user.tipo, exp }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
}


