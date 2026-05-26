export interface ExtensionDetail {
  id: string;
  name: string;
  publisher: string;
  logoUrl?: string;
  rating: string;
  downloads: string;
  description: string;
  pros: string[];
  cons: string[];
  vscodeLink: string;
}

export const extensions: ExtensionDetail[] = [
  {
    id: 'continue',
    name: 'Continue.dev',
    publisher: 'Continue',
    rating: '4.8/5',
    downloads: '+400k',
    description: 'A melhor extensão de código de código aberto, que se integra perfeitamente com a API Key direta do Gemini do Google AI Studio. Permite chat lateral, autopreenchimento por tabulação (tab-autocomplete), e comandos inline inovadores gratuitamente!',
    pros: [
      'Código 100% aberto e altamente customizável',
      'Suporta Tab-Autocomplete usando Gemini 2.5 Flash',
      'Permite indexar todo o seu repositório localmente (@codebase)',
      'Totalmente gratuito usando sua chave de API do Google AI Studio'
    ],
    cons: [
      'Requer uma edição rápida de um arquivo config.json'
    ],
    vscodeLink: 'vscode:extension/Continue.continue'
  },
  {
    id: 'google-cloud',
    name: 'Gemini Code Assist',
    publisher: 'Google Cloud',
    rating: '4.2/5',
    downloads: '+1.2M',
    description: 'A extensão oficial do Google Cloud para o VS Code. Oferece assistência por IA em todo o ciclo de desenvolvimento de software, assistência de codificação contextualizada para o Google Cloud e IA preditiva diretamente no editor.',
    pros: [
      'Extensão oficial mantida pelo Google',
      'Excelente integração com APIs e produtos do Google Cloud',
      'Autocompletação nativa muito rápida'
    ],
    cons: [
      'Geralmente requer login com conta Google Cloud/Enterprise ou projeto ativo',
      'Menos customização fina para desenvolvedor individual comparada ao Continue'
    ],
    vscodeLink: 'vscode:extension/Google.cloud-code'
  },
  {
    id: 'codegpt',
    name: 'CodeGPT',
    publisher: 'CodeGPT',
    rating: '4.5/5',
    downloads: '+1.0M',
    description: 'Uma extensão de IA robusta e extremamente popular mundialmente que suporta múltiplos provedores, incluindo a API direta do Gemini do Google AI Studio de maneira simples através das configurações gráficas da própria extensão.',
    pros: [
      'Interface simples, ideal para quem não quer editar arquivos de configuração',
      'Possui recursos de chat nativos, explicação de código e refatoração rápida',
      'Fácil alternância de provedores e modelos'
    ],
    cons: [
      'Algumas funcionalidades premium de indexação de repositório são pagas'
    ],
    vscodeLink: 'vscode:extension/codegpt.codegpt'
  }
];

export const getContinueConfigJson = (apiKey: string, modelName: string) => {
  const cleanKey = apiKey.trim() || "SUA_API_KEY_AQUI";
  return `{
  "models": [
    {
      "title": "Gemini 2.5 Flash (Recomendado)",
      "provider": "gemini",
      "model": "${modelName}",
      "apiKey": "${cleanKey}"
    },
    {
      "title": "Gemini 2.5 Pro (Melhor para lógica complexa)",
      "provider": "gemini",
      "model": "gemini-2.5-pro",
      "apiKey": "${cleanKey}"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Gemini 2.5 Flash Autocomplete",
    "provider": "gemini",
    "model": "${modelName}",
    "apiKey": "${cleanKey}"
  },
  "customCommands": [
    {
      "name": "refactor",
      "prompt": "Refatore este código para torná-lo mais legível, reduzir complexidade e seguir boas práticas.",
      "description": "Refatora o código selecionado"
    },
    {
      "name": "test",
      "prompt": "Gere testes unitários robustos cobrindo casos felizes e de erro para o seguinte código.",
      "description": "Cria testes para o código selecionado"
    }
  ]
}`;
};
