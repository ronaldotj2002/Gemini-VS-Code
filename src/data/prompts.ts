export interface EnterprisePrompt {
  id: string;
  title: string;
  description: string;
  commandSyntax: string;
  fullPrompt: string;
  strategyName: string;
}

export const enterprisePrompts: EnterprisePrompt[] = [
  {
    id: 'workspace-map',
    title: 'Mapear a Arquitetura Geral',
    description: 'Use este prompt quando abrir o projeto pela primeira vez para que o Gemini Code Assist faça um "reconhecimento" de caminhos e sugira onde os principais fluxos rodam.',
    commandSyntax: '@workspace Onde estão definidos...',
    fullPrompt: `@workspace
Preciso entender a arquitetura deste projeto de ponta a ponta. Com base em todos os arquivos indexados no workspace:
1. Explique como está organizada a nossa estrutura de pastas (arquitetura).
2. Onde estão localizados os arquivos de rotas/endpoints da API, conexões de banco de dados e tipos TypeScript principais?
3. Qual é o fluxo típico de uma requisição de ponta a ponta?

Por favor, inclua caminhos relativos de arquivos existentes para facilitar a minha navegação local.`,
    strategyName: 'Reconhecimento de Terreno'
  },
  {
    id: 'bug-localizer-stack',
    title: 'Localizar Bug através de Stack Trace ou Log',
    description: 'Cole o log de erro ou stack trace do seu terminal e utilize o index da workspace para apontar as linhas culpadas.',
    commandSyntax: '@workspace Analise o seguinte erro...',
    fullPrompt: `@workspace
Meu backend ou frontend disparou o seguinte erro em tempo de execução:

----------
[COLE O LOG DE ERRO OU STACK TRACE DO SEU TERMINAL AQUI]
----------

Com base no erro acima e no codebase indexado:
1. Em quais arquivos e linhas exatas do projeto as falhas provavelmente originaram?
2. Explique o motivo conceitual do porquê esse erro acontece (ex: null-pointer, tipagem, import quebrado).
3. Escreva o código corretivo exato para o arquivo relevante.`,
    strategyName: 'Pinpointing Estático por Log'
  },
  {
    id: 'trace-data-flow',
    title: 'Mapear Fluxo de Dados e Dependências',
    description: 'Descubra a árvore de chamadas de uma função ou campo de dados para analisar efeitos colaterais e encontrar o arquivo correto que deve ser alterado.',
    commandSyntax: '@workspace Acompanhe a variável...',
    fullPrompt: `@workspace
Preciso investigar o ciclo de vida e o fluxo de dados para a seguinte funcionalidade:
"Funcionalidade: [Escreva o fluxo, ex: fluxo de checkout ou atualização de usuário]"

1. Identifique quais arquivos participam deste fluxo (Controllers, Auxiliares, Camada de Serviços, Redux/Context).
2. Ao realizar uma alteração no arquivo [Escreva o nome do arquivo, ex: UserRoutes.ts], quais outros arquivos indexados no workspace podem sofrer efeitos colaterais ou quebrar tipos?

Destaque as conexões hierárquicas em formato de diagrama simples.`,
    strategyName: 'Análise de Impacto Semântico'
  },
  {
    id: 'test-gap-analysis',
    title: 'Análise de Gaps de Teste pelo Workspace',
    description: 'Peça para o Gemini rastrear o relacionamento entre seus arquivos de implementação e seus arquivos de teste para ver onde faltam mocks ou coberturas de regressão.',
    commandSyntax: '@workspace Verifique a falta de testes...',
    fullPrompt: `@workspace
Quero melhorar a confiabilidade do nosso sistema. 
1. Liste quais arquivos de funcionalidade principal em nosso workspace local não possuem arquivos de teste correspondentes.
2. Com base no arquivo [Nome do arquivo, ex: PaymentProcessor.ts], gere um esqueleto de teste simulando as dependências corretas já existentes nas pastas do projeto.`,
    strategyName: 'Auditoria de Regressão'
  },
  {
    id: 'compare-working-files',
    title: 'Comparar com Padrões Existentes do Projeto',
    description: 'Evite criar código desalinhado. Peça para o Gemini examinar um arquivo de código bom/padrão que já funciona e sugerir as correções no arquivo novo ou quebrado conforme os mesmos padrões.',
    commandSyntax: '@workspace Siga o mesmo padrão de...',
    fullPrompt: `@workspace
Estou implementando ou atualizando o arquivo: [Arquivo para Corrigir/Adicionar, ex: src/controllers/OrderController.ts]

Quero que a estrutura siga exatamente as convenções, imports, tratamento de erro e padrões arquiteturais do arquivo de referência que já funciona: [Arquivo Saudável, ex: src/controllers/UserController.ts]

1. Faça uma análise comparativa e liste o que está desalinhado no primeiro arquivo.
2. Reescreva as funções desalinhadas aplicando estritamente as melhores práticas copiadas do arquivo saudável.`,
    strategyName: 'Garantia de Padronização Corporativa'
  }
];
