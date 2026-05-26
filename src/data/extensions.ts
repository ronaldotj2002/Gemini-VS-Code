export interface EnterpriseStep {
  id: string;
  title: string;
  stepNumber: number;
  description: string;
  actions: string[];
  commandTip?: string;
}

export const enterpriseSetupSteps: EnterpriseStep[] = [
  {
    id: 'install-extension',
    title: 'Instalar a Extensão Oficial do Google Cloud Code',
    stepNumber: 1,
    description: 'A extensão oficial do VS Code que traz o Gemini Code Assist Enterprise para seu editor. Ela lida nativamente com autenticação corporativa única (SSO) do seu Workspace ou conta Google Cloud.',
    actions: [
      'Abra o VS Code.',
      'Acesse a loja de extensões (Ctrl+Shift+X ou Cmd+Shift+X).',
      'Pesquise por "Google Cloud Code" e clique em "Instalar".',
      'No menu lateral inferior esquerdo do VS Code, clique no ícone do Cloud Code e escolha "Sign In" com o e-mail corporativo autorizado pela sua empresa.'
    ],
    commandTip: 'ext install Google.cloud-code'
  },
  {
    id: 'codebase-indexing',
    title: 'Customização de Código (Enterprise Repository Indexing)',
    stepNumber: 2,
    description: 'Para que o Gemini entenda a totalidade do seu projeto, o administrador do Google Cloud configura o Developer Connect com repositórios GitHub, GitLab ou Bitbucket para indexar o codebase de forma centralizada e segura.',
    actions: [
      'Acesso ao Console do Google Cloud no projeto autorizado.',
      'Acesse "Gemini for Google Cloud" > "Developer Connect" > "Connections".',
      'Crie a conexão de repositório vinculando seu repositório Git corporativo.',
      'Ative a indexação inteligente. O Gemini criará um vetor semântico seguro de todo seu código-fonte de forma isolada, protegendo a propriedade intelectual.'
    ]
  },
  {
    id: 'developer-groups',
    title: 'Grupos de Desenvolvedor & IAM',
    stepNumber: 3,
    description: 'O Gemini usa permissões com privilégios específicos para desenvolvedores. Certifique-se de que seu usuário possui as permissões IAM adequadas para interagir com o modelo Enterprise.',
    actions: [
      'Assegure que seu e-mail corporativo possui o papel de IAM "Gemini for Google Cloud Users" (roles/cloudaicompanion.user).',
      'Selecione o projeto do Google Cloud ativo na barra de status inferior do VS Code clicando no Cloud Code.'
    ]
  }
];

export interface CustomRulesTemplate {
  projectName: string;
  architecture: string;
  framework: string;
  testingLib: string;
  conventions: string[];
}

export const generateCloudAiConfig = (config: CustomRulesTemplate) => {
  return `# Geração de Contexto e Diretrizes Locais para Gemini Code Assist Enterprise
# Salve este arquivo na raiz do seu projeto como: .cloudaiconfig ou use no painel de regras

project_name: "${config.projectName}"
context_indexing:
  mode: "semantic"
  exclude_patterns:
    - "node_modules/**"
    - "dist/**"
    - "build/**"
    - "*.log"

architectural_style:
  style: "${config.architecture}"
  preferred_patterns:
    - "Princípios SOLID para desacoplamento"
    - "Arquitetura limpa com separação de responsabilidades"
    - "Utilização estrita de TypeScript para segurança estatística"

technical_stack:
  language: "TypeScript"
  framework: "${config.framework}"
  testing: "${config.testingLib}"

custom_contextual_rules:
${config.conventions.map(conv => `  - "${conv}"`).join('\n')}

diagnostic_lookup_strategies:
  - "Ao analisar stack traces, identifique arquivos usando correspondências semânticas no seu workspace local."
  - "Sempre use o comando '@workspace' antes de pedir diagnóstico de rotas ou dados entre múltiplos arquivos."
  - "Prefira carregar os tipos compartilhados com '@file src/types.ts' ou caminhos de tipos equivalentes ao lidar com erros de compilação."
`;
};
