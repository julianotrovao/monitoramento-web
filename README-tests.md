# Testes da Aplicação

## Estrutura de Testes

A aplicação possui testes unitários e de integração implementados com Jest:

- `__tests__/monitor.test.js` - Testes das funções de monitoramento (ping e HTTP)
- `__tests__/db.test.js` - Testes do módulo de banco de dados
- `__tests__/integration.test.js` - Testes de integração do fluxo completo

## Executar Testes

### Instalar dependências
```bash
npm install
```

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

## Cobertura de Testes

Os testes cobrem:

✅ **Monitor Module**
- Ping bem-sucedido e com falhas
- Requisições HTTP com diferentes status codes
- Tratamento de erros de rede
- Medição de tempo de resposta

✅ **Database Module**
- Inicialização e criação de tabelas
- Inserção de resultados de ping
- Inserção de resultados HTTP
- Inserção de resultados com erro
- Queries customizadas

✅ **Integration Tests**
- Monitoramento de múltiplos targets
- Execução em intervalos configurados
- Continuidade mesmo com erros
- Cancelamento de monitoramento

## Relatório de Cobertura

Após executar `npm test`, o relatório de cobertura estará disponível em `coverage/lcov-report/index.html`
