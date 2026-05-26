export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: 'refactor' | 'test' | 'explain' | 'doc' | 'debug';
  promptText: string;
}

export const promptsData: PromptTemplate[] = [
  {
    id: 'refactor-clean-code',
    title: 'Refatoração para Clean Code',
    description: 'Reescreva o código aplicando princípios do Clean Code, SOLID e reduzindo complexidade cognitiva.',
    category: 'refactor',
    promptText: `Refatore o seguinte trecho de código para melhorar a legibilidade, manutenibilidade e desempenho. 
Siga os princípios do Clean Code e SOLID:
1. Elimine aninhamentos desnecessários (early return).
2. Use nomes de variáveis e funções altamente explicativos.
3. Se aplicável, extraia funções menores com responsabilidade única.

Aqui está o código:
\`\`\`
[Cole seu código aqui]
\`\`\``
  },
  {
    id: 'refactor-tailwind-perf',
    title: 'Otimização React + Tailwind',
    description: 'Otimize componentes React, aplicando boas práticas de renderização e Tailwind CSS responsivo.',
    category: 'refactor',
    promptText: `Analise o componente React abaixo e me sugira melhorias focadas em:
1. Evitar re-renders desnecessários (useMemo, useCallback onde apropriado).
2. Simplificação de classes Tailwind CSS (use de cn ou redução de duplicidade).
3. Acessibilidade (atributos ARIA, contraste) e design responsivo.

Componente:
\`\`\`tsx
[Cole seu componente React aqui]
\`\`\``
  },
  {
    id: 'test-coverage',
    title: 'Gerador de Testes Unitários',
    description: 'Gere casos de teste abrangentes usando Jest ou Vitest, incluindo caminhos felizes e de erro.',
    category: 'test',
    promptText: `Escreva uma suíte de testes unitários abrangente para a função/classe abaixo.
Use [Jest/Vitest] com testing-library se for um componente visual, ou testes puros caso seja lógica pura.
Cubra os seguintes cenários:
1. Caso feliz (retorno esperado com entradas válidas).
2. Entradas nulas, indefinidas ou vazias (edge cases).
3. Tratamento de exceções e erros esperados.

Código a ser testado:
\`\`\`
[Cole seu código aqui]
\`\`\``
  },
  {
    id: 'explain-architecture',
    title: 'Explicação de Código Complexo',
    description: 'Explica o código linha por linha ou conceitualmente para desenvolvedores juniores.',
    category: 'explain',
    promptText: `Explique detalhadamente o funcionamento do código abaixo. 
Por favor:
1. Dê uma visão geral de alto nível (o que ele faz).
2. Explique os blocos ou linhas cruciais, detalhando algoritmos específicos utilizados.
3. Identifique potenciais gargalos de desempenho ou pontos cegos de segurança que um junior deveria saber.

Código:
\`\`\`
[Cole seu código aqui]
\`\`\``
  },
  {
    id: 'doc-jsdoc-ts',
    title: 'Documentação JSDoc / TSDoc',
    description: 'Adicione comentários detalhados de tipos, parâmetros e valores de retorno usando TSDoc.',
    category: 'doc',
    promptText: `Insira documentação explicativa e rigorosa no padrão JSDoc/TSDoc para as funções e tipos presentes no código a seguir.
Explique detalhadamente cada parâmetro, tipo de entrada, tipo de retorno, e possíveis exceções disparadas.

Código:
\`\`\`ts
[Cole seu código aqui]
\`\`\``
  },
  {
    id: 'debug-find-bugs',
    title: 'Detetive de Bugs e Vulnerabilidades',
    description: 'Varra o código em busca de erros lógicos, vazamentos de memória e falhas comuns.',
    category: 'debug',
    promptText: `Atue como um Engenheiro de Qualidade e Segurança de Software sênior. 
Analise minuciosamente o código abaixo em busca de:
1. Bugs de lógica ou condições de corrida (race conditions).
2. Problemas potenciais de segurança (injeções, falta de validação).
3. Vazamento de recursos ou de memória.

Apresente as vulnerabilidades encontradas e forneça a versão corrigida do código.

Código:
\`\`\`
[Cole seu código aqui]
\`\`\``
  }
];
