# Deploy do Essenza na Vercel

## Configuração para Deploy

### 1. Preparação do Projeto
- ✅ Mock backend configurado
- ✅ Interceptor HTTP implementado
- ✅ Build de produção configurado
- ✅ Painel de demonstração adicionado

### 2. Scripts de Build
```bash
# Build de produção
npm run build:prod

# Build para Vercel
npm run vercel-build
```

### 3. Configuração da Vercel
- **vercel.json**: Configurado para Angular SPA
- **.vercelignore**: Otimizado para deploy
- **angular.json**: Configurado para build estático

### 4. Dados de Demonstração
O sistema inclui dados mockados para demonstração:

#### Usuários de Teste:
- **Cliente**: `cliente@essenza.com` / `123456`
- **Profissional**: `pro@essenza.com` / `123456`

#### Funcionalidades Disponíveis:
- ✅ Cadastro de usuários
- ✅ Login automático
- ✅ Agendamento de serviços
- ✅ Gestão de estoque
- ✅ Dashboard profissional
- ✅ Carrinho de compras
- ✅ Painel de demonstração

### 5. Deploy na Vercel

1. **Conectar repositório**:
   - Acesse [vercel.com](https://vercel.com)
   - Conecte seu repositório GitHub

2. **Configurações de Build**:
   - Framework: Angular
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist/essenza_front/browser`
   - Install Command: `npm install`

3. **Variáveis de Ambiente** (se necessário):
   - Não são necessárias para o mock backend

### 6. Teste Pós-Deploy

1. **Acesse a URL** fornecida pela Vercel
2. **Use o painel de demonstração** (botão flutuante no canto inferior direito)
3. **Teste os fluxos**:
   - Login como cliente
   - Login como profissional
   - Agendamento de serviços
   - Gestão de estoque

### 7. Funcionalidades do Painel de Demo

O painel de demonstração permite:
- Login rápido com usuários pré-configurados
- Navegação entre páginas
- Logout
- Visualização do status do usuário

### 8. Troubleshooting

Se houver problemas:
1. Verifique os logs de build na Vercel
2. Teste o build local: `npm run build:prod`
3. Verifique se todos os arquivos estão commitados
4. Confirme se o `vercel.json` está correto

### 9. URLs de Teste

Após o deploy, teste estas rotas:
- `/` - Home
- `/servicos` - Catálogo de serviços
- `/cadastro` - Cadastro de usuários
- `/login` - Login
- `/cliente-home` - Dashboard do cliente
- `/dashboard-profissional` - Dashboard do profissional
- `/cliente-agendamentos` - Agendamentos do cliente

### 10. Notas Importantes

- O sistema usa dados mockados, não há persistência real
- Todos os dados são resetados ao recarregar a página
- O mock backend simula todas as operações de API
- O painel de demonstração facilita os testes durante apresentações
