import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Terminal, 
  Code, 
  ShieldAlert, 
  Settings, 
  BookOpen, 
  CheckSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Workflow, 
  ArrowRight, 
  Award, 
  Lightbulb, 
  Info, 
  ChevronRight, 
  Search, 
  ShieldCheck,
  Zap,
  Laptop,
  GitBranch,
  Bug,
  Compass,
  FileCode,
  FileText,
  AlertTriangle,
  RefreshCw,
  Eye,
  Maximize2
} from 'lucide-react';
import { enterprisePrompts, EnterprisePrompt } from './data/prompts';
import { enterpriseSetupSteps, generateCloudAiConfig, CustomRulesTemplate } from './data/extensions';

type TabType = 'how-it-works' | 'repo-context' | 'bug-simulator' | 'rule-generator' | 'prompt-library' | 'checklist';

interface SimulatedBugScenario {
  id: string;
  name: string;
  severity: 'Alta' | 'Crítica' | 'Média';
  service: string;
  stackTrace: string;
  workspacePath: string;
  wrongCode: string;
  fixedCode: string;
  lineRange: string;
  geminiAnalysis: string;
  promptToUse: string;
}

const BUG_SCENARIOS: SimulatedBugScenario[] = [
  {
    id: 'db-pool-exhausted',
    name: 'Erro 500: ETIMEDOUT (Connection Pool Exhaustion)',
    severity: 'Crítica',
    service: 'Database Service',
    stackTrace: `Error: Connection lost: The server closed the connection.
    at Protocol._onTimeout (/app/node_modules/mysql2/lib/protocol/Protocol.js:358:16)
    at Timer.active (/app/node_modules/mysql2/lib/protocol/Protocol.js:20:10)
    ---------------------------------------------------------
    at PoolEngine.getConnection (/app/src/database/pool.ts:42:25)
    at OrderRepository.createOrder (/app/src/repositories/orders.ts:89:33)
    at OrderController.checkout (/app/src/controllers/orderController.ts:18:40)`,
    workspacePath: 'src/database/pool.ts',
    lineRange: 'Linhas 35-48',
    wrongCode: `// INCORRETO (Vazamento de conexão)
export async function getDatabaseConnection() {
  const connection = await pool.getConnection();
  // Conexão é criada, mas nunca retornada ao pool no fluxo de erro.
  return connection;
}`,
    fixedCode: `// CORREÇÃO RECOMENDADA PELO GEMINI
export async function getDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error("Falha ao obter conexão do pool", error);
    throw new Error("Database unavailable");
  }
  // Lembre de liberar as conexões usando connection.release() no repo!
}`,
    geminiAnalysis: 'O Gemini identificou que no arquivo "/src/database/pool.ts" linha 42, você busca conexões mas o bloco não possui uma liberação explícita ou "release()" nas tratativas de erro. No arquivo "/src/repositories/orders.ts", a função "createOrder" não possui um bloco try-finally fechando a instância, causando esgotamento gradual sob stress.',
    promptToUse: `@workspace
Estou recebendo o erro "ETIMEDOUT (Connection Pool Exhaustion)" no momento que os usuários finalizam checkout.
Aqui está a linha crucial do stack trace: 
"at PoolEngine.getConnection (/app/src/database/pool.ts:42:25)"

1. Analise o arquivo "src/database/pool.ts" e "src/repositories/orders.ts".
2. Verifique se existem vazamentos onde conexões ficam abertas sem retorno para o pool.
3. Forneça o código corrigido e o bloco try-finally recomendado.`
  },
  {
    id: 'token-validation-bypass',
    name: 'Vulnerabilidade: JWT Token Verification Bypass',
    severity: 'Crítica',
    service: 'Auth Middleware',
    stackTrace: `JsonWebTokenError: jwt malformed
    at module.exports [as verify] (/app/node_modules/jsonwebtoken/verify.js:15:20)
    at verifyToken (/app/src/middlewares/auth.ts:14:31)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)`,
    workspacePath: 'src/middlewares/auth.ts',
    lineRange: 'Linhas 10-22',
    wrongCode: `// INCORRETO (Vulnerabilidade de Bypass)
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(101).json({ message: "Incompleto" });
  
  // ERRO: Erro capturado por try-catch silencioso que chama next() mesmo sem validar
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
  } catch (err) {
    // Falha silenciosa! Permite o acesso
    console.warn("Token inválido recebido, pulando etapa com fallback temporário.");
  }
  next();
}`,
    fixedCode: `// CORREÇÃO RECOMENDADA PELO GEMINI
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Acesso não autorizado: Bearer Token ausente" });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next(); // Próximo passo somente se for válido!
  } catch (err) {
    return res.status(401).json({ error: "Acesso negado: Token inválido ou expirado" });
  }
}`,
    geminiAnalysis: 'O Gemini identificou uma falha de bypass crítica no arquivo "/src/middlewares/auth.ts" (Linha 14). Em caso de erro de verificação (jwt malformed/expirado), o bloco "catch" imprime um alerta no console mas não interrompe o fluxo de requisição, permitindo o bypass chamando "next()" por padrão fora do try-catch.',
    promptToUse: `@workspace
No arquivo "src/middlewares/auth.ts", analisando as rotas protegidas, percebemos requisições não autorizadas passando.
Analise a função de validação "verifyToken". 
Existem frestas de segurança na estrutura de try-catch ou interrupções parciais que deixam requisições com tokens errados avançarem? Mostre onde consertar.`
  },
  {
    id: 'typescript-mismatch',
    name: 'Incompatibilidade de Tipo (REST API vs DB Interface)',
    severity: 'Média',
    service: 'Data Transfer Layer',
    stackTrace: `TypeError: Cannot read properties of undefined (reading 'toUpperCase')
    at OrderMapper.toPersistence (/app/src/mappers/orderMapper.ts:33:48)
    at src/services/orderService.ts:104:19
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)`,
    workspacePath: 'src/mappers/orderMapper.ts',
    lineRange: 'Linhas 28-39',
    wrongCode: `// INCORRETO (Suposições de dados preenchidos)
export function toPersistence(apiData: APIOrderInput): DBOrder {
  return {
    id: apiData.id,
    sku_code: apiData.skuCode,
    payment_status: apiData.status.toUpperCase(), // Se o status for opcional/undefined, quebra!
    created_at: new Date()
  };
}`,
    fixedCode: `// CORREÇÃO RECOMENDADA PELO GEMINI
export function toPersistence(apiData: APIOrderInput): DBOrder {
  return {
    id: apiData.id,
    sku_code: apiData.skuCode,
    // Aplicação de Safe Navigation e Fallback Padrão
    payment_status: (apiData.status || 'pending').toUpperCase(),
    created_at: new Date()
  };
}`,
    geminiAnalysis: 'Análise Semântica do Gemini: O Mapper "/src/mappers/orderMapper.ts" presume que o objeto de entrada vindo da API Rest possui obrigatoriamente um campo string "status". No entanto, conforme definido na sua interface compartilhada de tipos no workspace, "status" é opcional (APIOrderInput?.status). O Gemini sugere safe navigation/fallback antes do método ".toUpperCase()".',
    promptToUse: `@workspace
Estou recebendo o erro de runtime "Cannot read properties of undefined (reading 'toUpperCase')" no arquivo "src/mappers/orderMapper.ts:33:48".
Estude as interfaces correspondentes e explique como garantir que o status seja mapeado de forma defensiva e recomendada.`
  }
];

const CORPORATE_MILESTONES = [
  { id: '1', label: 'Verificar Acesso à Extensão Cloud Code', desc: 'Instalar extensão oficial Google Cloud Code no VS Code corporativo.', weight: 15 },
  { id: '2', label: 'Efetuar Autenticação SSO', desc: 'Logar via Identity Provider (IDP / Google Identity) da empresa sem requerer chaves manuais.', weight: 15 },
  { id: '3', label: 'Conectar Repositório (Developer Connect)', desc: 'Garantir no GCP Console que seu repositório de trabalho está indexado.', weight: 20 },
  { id: '4', label: 'Executar Prompt @workspace Exploratório', desc: 'Fazer o primeiro mapeamento de arquivos e serviços automáticos.', weight: 15 },
  { id: '5', label: 'Definir o arquivo local .cloudaiconfig', desc: 'Sincronizar regras, tecnologia, e patterns para o assistente não alucinar.', weight: 15 },
  { id: '6', label: 'Adotar Estratégia de Stack Trace em Linha', desc: 'Rastrear falha do console mandando logs envelopados ao chat do Gemini.', weight: 20 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('how-it-works');
  const [selectedScenario, setSelectedScenario] = useState<SimulatedBugScenario>(BUG_SCENARIOS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [simulatedInput, setSimulatedInput] = useState<string>('');
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [isSimulatingResponse, setIsSimulatingResponse] = useState<boolean>(false);
  const [simulatedChatHistory, setSimulatedChatHistory] = useState<Array<{ sender: 'user' | 'assistant', text: string, code?: string }>>([]);

  // Config Generator State
  const [configParams, setConfigParams] = useState<CustomRulesTemplate>({
    projectName: 'meu-projeto-enterprise',
    architecture: 'Clean Architecture (Camada Separada de Domínio, Caso de Uso e Repositórios)',
    framework: 'React + Node (Express/TypeScript)',
    testingLib: 'Vitest + TS Jest',
    conventions: [
      'Seguir padrões estritos de Early Return para reduzir aninhamento',
      'Sempre liberar conexões de banco de dados em blocos try-finally',
      'Utilizar o cn() utilitário para classes condicionais de CSS',
      'Jamais usar exports padrões (default exports), priorizar named exports'
    ]
  });

  const [activeConventionInput, setActiveConventionInput] = useState('');

  // Local persistence for goals setup progress
  const [checkedGoals, setCheckedGoals] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gemini_enterprise_goals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('gemini_enterprise_goals', JSON.stringify(checkedGoals));
  }, [checkedGoals]);

  const handleToggleGoal = (id: string) => {
    setCheckedGoals(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddConvention = () => {
    if (activeConventionInput.trim()) {
      setConfigParams(prev => ({
        ...prev,
        conventions: [...prev.conventions, activeConventionInput.trim()]
      }));
      setActiveConventionInput('');
    }
  };

  const handleRemoveConvention = (index: number) => {
    setConfigParams(prev => ({
      ...prev,
      conventions: prev.conventions.filter((_, idx) => idx !== index)
    }));
  };

  const score = CORPORATE_MILESTONES.reduce((sum, item) => {
    return sum + (checkedGoals.includes(item.id) ? item.weight : 0);
  }, 0);

  // Simulated Chat Flow
  const handleTriggerSimulatedPrompt = (promptText: string) => {
    setIsSimulatingResponse(true);
    setSimulatedChatHistory(prev => [
      ...prev,
      { sender: 'user', text: promptText }
    ]);

    setTimeout(() => {
      setSimulatedChatHistory(prev => [
        ...prev,
        { 
          sender: 'assistant', 
          text: `Análise finalizada! Foram detectados padrões equivalentes ao cenário "${selectedScenario.name}". Um potencial erro no arquivo "${selectedScenario.workspacePath}" (${selectedScenario.lineRange}) foi encontrado.\n\nMais detalhes semânticos:\n${selectedScenario.geminiAnalysis}`,
          code: selectedScenario.fixedCode
        }
      ]);
      setIsSimulatingResponse(false);
      // Completa o goal correspondente automaticamente
      if (!checkedGoals.includes('6')) {
        setCheckedGoals(prev => [...prev, '6']);
      }
    }, 1500);
  };

  const handleClearChatHistory = () => {
    setSimulatedChatHistory([]);
  };

  return (
    <div id="enterprise-agent-dashboard" className="min-h-screen bg-[#070b16] text-[#e2e8f0] font-sans relative selection:bg-sky-500/30 selection:text-sky-300">
      
      {/* Dynamic Header Glow */}
      <div className="absolute top-0 inset-x-0 h-[480px] bg-gradient-to-b from-sky-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 relative z-10">
        
        {/* Banner Informação Central Enterprise */}
        <div id="main-banner" className="bg-gradient-to-r from-sky-950/50 via-slate-900/60 to-slate-900 border border-sky-900/40 rounded-2xl p-6 mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-sky-500 via-indigo-500 to-purple-600" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-sky-500/10 text-sky-400 text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full font-bold border border-sky-500/20">EDITION 2026</span>
              <span className="bg-[#111827] text-slate-300 text-[10px] font-mono tracking-widest px-2.5 py-1 rounded-full border border-slate-800">CORPORATE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              Gemini Code Assist Enterprise <span className="text-sky-400 font-light">&</span> VS Code
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              Descubra abordagens pragmáticas de como o motor corporativo do Google pode assimilar as regras inerentes à arquitetura do seu software e mapear instantaneamente o local de erros usando o recurso de análise inteligente multidirecional.
            </p>
          </div>

          <div id="stat-progress-panel" className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex items-center gap-4 shrink-0 min-w-[245px]">
            <div className="space-y-1">
              <div className="text-[11px] text-slate-500 font-mono tracking-wider uppercase">Setup Corporativo</div>
              <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1">
                <CheckSquare className="w-5 h-5 text-emerald-500" />
                {score}% Completo
              </div>
            </div>
            <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center relative shadow-inner">
              <span className="text-sm font-semibold font-mono text-slate-100">{checkedGoals.length}/{CORPORATE_MILESTONES.length}</span>
              <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Global Inner Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Controls Left side */}
          <nav id="doc-tabs-navigation" className="lg:col-span-1 space-y-4">
            
            <div className="bg-[#0b101f]/90 border border-slate-800 rounded-xl p-4.5 space-y-1.5 shadow-xl">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">INTEGRAÇÃO PRINCIPAL</div>
              
              <button
                onClick={() => setActiveTab('how-it-works')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-semibold ${
                  activeTab === 'how-it-works'
                    ? 'bg-sky-500/10 text-sky-300 border-l-2 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Compass className="w-4 h-4 text-sky-400 shrink-0" />
                <span>1. Como Funciona a Extensão</span>
              </button>

              <button
                onClick={() => setActiveTab('repo-context')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-semibold ${
                  activeTab === 'repo-context'
                    ? 'bg-sky-500/10 text-sky-300 border-l-2 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <GitBranch className="w-4 h-4 text-sky-400 shrink-0" />
                <span>2. Indexar Código da Empresa</span>
              </button>

              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-4 mb-2">RESPOSTAS AO PEDIDO</div>

              <button
                onClick={() => setActiveTab('bug-simulator')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-semibold relative ${
                  activeTab === 'bug-simulator'
                    ? 'bg-[#1e1b4b]/50 text-indigo-300 border-l-2 border-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Bug className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="flex-1">3. Localizador de Bugs</span>
                <span className="absolute right-2 px-1.5 py-0.2 text-[9px] bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/20">Simulador</span>
              </button>

              <button
                onClick={() => setActiveTab('rule-generator')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-semibold ${
                  activeTab === 'rule-generator'
                    ? 'bg-sky-500/10 text-sky-300 border-l-2 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                <span>4. Gerar .cloudaiconfig</span>
              </button>

              <button
                onClick={() => setActiveTab('prompt-library')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-semibold ${
                  activeTab === 'prompt-library'
                    ? 'bg-sky-500/10 text-sky-300 border-l-2 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Biblioteca de Prompts</span>
              </button>

              <button
                onClick={() => setActiveTab('checklist')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all text-xs font-semibold ${
                  activeTab === 'checklist'
                    ? 'bg-sky-500/10 text-sky-300 border-l-2 border-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Roteiro Prático</span>
                </span>
                <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                  {checkedGoals.length}/6
                </span>
              </button>
            </div>

            {/* SSO VS Manual API Key Disclaimer banner */}
            <div className="bg-[#1e293b]/40 border border-slate-800 rounded-xl p-4 text-xs leading-relaxed space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-500">
                <ShieldAlert className="w-4 h-4" />
                <span>Dispensado de API Key Manuais</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                No produto <strong>Gemini Enterprise</strong>, os desenvolvedores não utilizam chaves de API individuais geradas localmente. A autenticação é delegada a um locatário seguro (OIDC/SAML/GCP Cloud Identity) pelo administrador, integrado de forma transparente ao ambiente corporativo.
              </p>
            </div>
          </nav>

          {/* Dynamic Window Workspace Right Side */}
          <section id="doc-primary-display" className="lg:col-span-3 bg-[#0d1324] border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-2xl relative">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                
                {/* -------------------- TAB: HOW IT WORKS -------------------- */}
                {activeTab === 'how-it-works' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                      <Compass className="w-5 h-5 text-sky-400" />
                      <h2 className="text-xl font-bold text-white">Integração do Gemini no VS Code Corporativo</h2>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      Diferente de ambientes pessoais, a integração com o <strong>Gemini Code Assist Enterprise</strong> funciona por meio de diretrizes corporativas restritas, visando blindagem intelectual e segurança. Não são injetados tokens provisórios na extensão: ao invés disso, há uma ponte federada de autenticação ligada à sua organização no Google Cloud.
                    </p>

                    {/* Step-by-step connection schema */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono text-sky-400 uppercase tracking-widest font-bold">Passo a Passo de Instalação e Login:</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {enterpriseSetupSteps.map((step) => (
                          <div key={step.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3 relative group">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xs font-mono font-bold text-sky-400">
                                  {step.stepNumber}
                                </span>
                                {step.id === 'install-extension' && (
                                  <span className="text-[9px] font-mono select-none px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/15">Recomendado</span>
                                )}
                              </div>
                              <h5 className="font-bold text-xs text-slate-200">{step.title}</h5>
                              <p className="text-[11px] text-slate-400 leading-normal">{step.description}</p>
                            </div>

                            <div className="pt-2">
                              {step.commandTip ? (
                                <div className="bg-slate-950 p-2 rounded border border-slate-800/80 flex items-center justify-between font-mono text-[9px] text-sky-400 overflow-x-auto">
                                  <span>{step.commandTip}</span>
                                  <button 
                                    onClick={() => handleCopyText(step.commandTip || '', step.id)}
                                    className="text-slate-500 hover:text-slate-300 ml-2 shrink-0"
                                  >
                                    {copiedId === step.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-500 italic">Configure via painel GCP/IAM</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Card to explain the authentication process flow */}
                    <div className="bg-[#121c33]/40 border border-sky-950 rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-sky-400" />
                        <h4 className="font-bold text-sm text-slate-200">Como funciona a sua autorização no VS Code?</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Ao efetuar o login na extensão do VS Code usando sua conta autorizada, a IDE envia comandos identificados com seu respectivo ID de projeto padrão do Google Cloud. Toda requisição de chat ou autocomplete envia parâmetros de IAM implícitos no cabeçalho das chamadas à API da organização, resguardando logs internos no Stackdriver para auditorias automáticas da empresa.
                      </p>
                      
                      {/* Step helper trigger */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setActiveTab('repo-context')}
                          className="flex items-center gap-1 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs py-2 px-3.5 rounded-lg transition"
                        >
                          <span>Como indexar o repositório</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* -------------------- TAB: REPO CONTEXT -------------------- */}
                {activeTab === 'repo-context' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                      <GitBranch className="w-5 h-5 text-sky-400" />
                      <h2 className="text-xl font-bold text-white">Como fazer o Gemini entender TODO o seu Projeto?</h2>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      Se você apenas abrir um arquivo isoladamente, o assistente só terá a visão daquele código estático. Para resolver problemas complexos que cruzam múltiplos arquivos do seu repositório, você precisa usar as ferramentas adequadas de **Contextualização Semântica**.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Concept A: Local indexing and workspaces */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3.5">
                        <div className="flex items-center gap-2.5">
                          <Terminal className="w-5 h-5 text-sky-400" />
                          <h4 className="font-bold text-sm text-slate-200">1. Indexação Local via Workspace</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Ao digitar <strong className="text-slate-100 font-mono text-[11px]">@workspace</strong> no chat do VS Code, a extensão do Gemini varre localmente a árvore de arquivos, localiza arquivos relacionados, referências de classes, assinaturas de método e compila um resumo representativo como contexto adjacente na requisição da IA.
                        </p>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800/80 text-[11px] font-mono text-slate-400">
                          <span className="text-sky-400 font-bold">@workspace</span> Onde fica a lógica de persistência do model order?
                        </div>
                        <div className="text-[11px] text-slate-500 italic">
                          ★ Excelente para perguntas gerais de arquitetura ou para localizar conexões rápidas entre pastas ativas.
                        </div>
                      </div>

                      {/* Concept B: Centralized Cloud repository customization */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3.5">
                        <div className="flex items-center gap-2.5">
                          <Workflow className="w-5 h-5 text-indigo-400" />
                          <h4 className="font-bold text-sm text-slate-200">2. Customização por Developer Connect (Enterprise)</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Para codebases massivos mantidos no GitHub Enterprise, GitLab ou Bitbucket, sua empresa agenda rotinas automáticas de indexação semântica robusta. O Gemini gera tokens vetoriais seguros que enriquecem o autocomplete mesmo se o arquivo correspondente não estiver aberto localmente no seu computador.
                        </p>
                        <div className="p-3 bg-indigo-950/20 border border-indigo-950 rounded text-[11.5px] leading-relaxed text-slate-300">
                          <strong>Conectividade Nativa:</strong> Nenhum dado que trafega pelo Developer Connect é usado para treinar modelos base públicos do Google. O isolamento lógico dos dados corporativos é um pré-requisito contratual da edição Enterprise.
                        </div>
                      </div>
                    </div>

                    {/* How to query local context file-by-file */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Info className="w-4.5 h-4.5 text-sky-300" />
                        <h4 className="font-bold text-sm text-slate-200">Técnicas de Precisão de Contexto: "Alimentando com Arquivos Únicos"</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Se você notou que o Gemini se perdeu com classes homônimas ou escopos muito largos, restrinja o contexto explicitamente citando os arquivos participantes do bug:
                      </p>
                      
                      <div className="space-y-2 pt-1">
                        <div className="p-3 bg-slate-900 border-l-2 border-indigo-500 rounded-r flex justify-between items-center text-xs">
                          <div className="font-mono">
                            <span className="text-sky-400">@file src/middlewares/auth.ts</span> e <span className="text-sky-400">@file package.json</span> verifique se o JWT está devidamente verificado.
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Ao usar <span className="font-mono text-slate-400 bg-slate-900 px-1 rounded">@file [caminho_do_arquivo]</span> ou arrastar partes do código ao chat lateral, a extensão inclui a árvore de tokens exatos daquele script no contexto imediato eliminando "alucinações" arquiteturais.
                        </p>
                      </div>
                    </div>

                    {/* Button link step 3 */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setActiveTab('bug-simulator')}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-md transition"
                      >
                        <span>Entrar no Localizador Interativo de Bugs</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}

                {/* -------------------- TAB: BUG SIMULATOR -------------------- */}
                {activeTab === 'bug-simulator' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Bug className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-xl font-bold text-white">Localizador de Bugs de Produção (Simulado)</h2>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/15 text-indigo-300 font-mono tracking-wider font-semibold border border-indigo-500/20 uppercase">Prático</span>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      Selecione um cenário hipotético de erro de produção abaixo que normalmente ocorreria em sua infraestrutura. Descubra imediatamente qual prompt passar ao **Gemini Code Assist Enterprise** usando ferramentas de workspace para ele escanear os arquivos corretos e dar a linha exata da falha.
                    </p>

                    {/* Scenario Selection Pills */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {BUG_SCENARIOS.map((scenario) => (
                        <button
                          key={scenario.id}
                          onClick={() => {
                            setSelectedScenario(scenario);
                            // Keep history synchronized with select
                            setSimulatedChatHistory([]);
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between space-y-1 ${
                            selectedScenario.id === scenario.id
                              ? 'bg-indigo-550/15 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/5'
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                              scenario.severity === 'Crítica' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {scenario.severity}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{scenario.service}</span>
                          </div>
                          <h4 className={`text-xs font-bold leading-snug mt-1.5 ${selectedScenario.id === scenario.id ? 'text-white' : 'text-slate-300'}`}>
                            {scenario.name}
                          </h4>
                        </button>
                      ))}
                    </div>

                    {/* Simulator Sandbox Splitter */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                      
                      {/* Left Block: Stack trace and prompt command */}
                      <div className="lg:col-span-5 space-y-4">
                        
                        {/* Error Log Console Display */}
                        <div className="bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden shadow-inner">
                          <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                              <span>Console de Logs do Servidor</span>
                            </div>
                            <span className="text-[9px] text-red-500 font-mono font-semibold">ERROR DISPATCHED</span>
                          </div>
                          <div className="p-3.5 max-h-[140px] overflow-y-auto bg-slate-950 font-mono text-[10px] text-red-400/90 leading-relaxed whitespace-pre scrollbar-thin">
                            {selectedScenario.stackTrace}
                          </div>
                        </div>

                        {/* Copyable prompt to give the AI */}
                        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-200">Como perguntar ao Gemini?</span>
                            <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono px-2 py-0.5 rounded font-bold uppercase">Sintaxe Forte</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            O prompt abaixo combina o operador <code className="text-indigo-400 font-mono">@workspace</code> de navegação geral associado ao log defeituoso, guiando o assistente Enterprise a apontar o ponto geográfico correto do erro nos seus arquivos locais:
                          </p>

                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 relative font-mono text-[10px] leading-relaxed max-h-[150px] overflow-y-auto">
                            <pre className="text-slate-300 whitespace-pre-wrap">{selectedScenario.promptToUse}</pre>
                            <button
                              onClick={() => handleCopyText(selectedScenario.promptToUse, 'chat-prompt-sim')}
                              className="absolute right-2 top-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-705 p-1 rounded transition"
                              title="Copiar prompt para teste"
                            >
                              {copiedId === 'chat-prompt-sim' ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                              )}
                            </button>
                          </div>

                          <button
                            onClick={() => handleTriggerSimulatedPrompt(selectedScenario.promptToUse)}
                            disabled={isSimulatingResponse}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-md transition-all"
                          >
                            {isSimulatingResponse ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Gemini está escanando seu workspace...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                                <span>Simular Resposta do Gemini no Chat</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right Block: VS Code Chat Simulator View & Code Highlight */}
                      <div className="lg:col-span-7 bg-[#0b0f19] rounded-xl border border-slate-800 flex flex-col justify-between overflow-hidden shadow-2xl min-h-[380px]">
                        
                        {/* Simulated VS Code Header tab */}
                        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[7px] text-sky-400">G</span>
                            <span className="text-[11px] font-semibold text-slate-200">Painel de Chat - Gemini Code Assist</span>
                          </div>
                          
                          {simulatedChatHistory.length > 0 && (
                            <button
                              onClick={handleClearChatHistory}
                              className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer underline"
                            >
                              Limpar Chat
                            </button>
                          )}
                        </div>

                        {/* Interactive message feeds */}
                        <div className="flex-1 p-4 space-y-4 max-h-[340px] overflow-y-auto scrollbar-thin">
                          {simulatedChatHistory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3.5">
                              <div className="w-12 h-12 rounded-full bg-indigo-550/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 animate-pulse">
                                <Sparkles className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <h5 className="font-bold text-xs text-slate-300">Aguardando gatilho de prompt...</h5>
                                <p className="text-[11px] text-slate-400 max-w-sm">
                                  Clique no botão azul <strong className="text-indigo-400">"Simular Resposta"</strong> à esquerda para ver o Gemini encontrar o ponto exato da correção no projeto corporativo.
                                </p>
                              </div>
                            </div>
                          ) : (
                            simulatedChatHistory.map((chat, idx) => (
                              <div 
                                key={idx} 
                                className={`flex flex-col space-y-1 ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}
                              >
                                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider px-1">
                                  {chat.sender === 'user' ? 'Você (Developer)' : 'Gemini Assistant Enterprise'}
                                </span>
                                
                                <div className={`p-3 rounded-xl max-w-[90%] text-xs leading-relaxed ${
                                  chat.sender === 'user' 
                                    ? 'bg-slate-800 text-slate-100 rounded-tr-none' 
                                    : 'bg-indigo-950/45 text-slate-200 border border-indigo-900/30 rounded-tl-none'
                                }`}>
                                  <p className="whitespace-pre-line">{chat.text}</p>

                                  {chat.code && (
                                    <div className="mt-3 bg-slate-950 border border-slate-900 rounded-lg overflow-hidden">
                                      <div className="bg-slate-900/75 px-3 py-1 text-[10px] font-mono text-slate-400 border-b border-slate-900 flex items-center justify-between">
                                        <span>Modificação no arquivo {selectedScenario.workspacePath} ({selectedScenario.lineRange})</span>
                                        <button 
                                          onClick={() => handleCopyText(chat.code || '', 'code-copied-block-sim')}
                                          className="hover:text-white"
                                        >
                                          {copiedId === 'code-copied-block-sim' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                                        </button>
                                      </div>
                                      <div className="p-3 overflow-x-auto">
                                        <pre className="font-mono text-[9px] text-[#22c55e] leading-relaxed select-all">
                                          <code>{chat.code}</code>
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Interactive UI highlight showing files list metadata */}
                        <div className="bg-slate-900/60 p-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-mono text-[10px] text-[#38bdf8]">Workspace: {selectedScenario.workspacePath} {selectedScenario.lineRange}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 italic">Mapeamento Vetorial Resolvido</span>
                        </div>
                      </div>

                    </div>

                    {/* Proactive Tip highlighting how to feed compiler diagnostics */}
                    <div className="p-4 bg-[#121d2f]/50 border border-sky-900/30 rounded-xl flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-slate-200">Abordagem de Ouro: Como alimentar logs de erro de forma perfeita</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Para obter a melhor acurácia do Gemini Code Assist, não envie apenas "o código quebrou". Use a tríade pragmática: 
                          <strong className="text-slate-300"> Primeiro</strong>, copie as últimas 15 linhas do stack trace;
                          <strong className="text-slate-300"> Segundo</strong>, cite os caminhos relativos vistos no log (ex: `@workspace analise src/controllers/orderController.ts`);
                          <strong className="text-slate-300"> Terceiro</strong>, especifique a alteração recente ou o contexto do banco de dados (ex: `@workspace o banco de dados acabou de sofrer migração para Postgres`). Essa fórmula garante acerto de linha na primeira tentativa.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------- TAB: RULE GENERATOR .CLOUDAICONFIG -------------------- */}
                {activeTab === 'rule-generator' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-5 h-5 text-sky-400" />
                        <h2 className="text-xl font-bold text-white">Gerador Local de Regras (.cloudaiconfig)</h2>
                      </div>
                      <span className="bg-sky-500/10 text-sky-400 text-[10px] tracking-wider uppercase font-mono border border-sky-500/20 px-2 py-0.5 rounded">Gera Instruções</span>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      O Gemini Code Assist Enterprise lê arquivos especiais de configuração como <strong className="text-slate-200">.cloudaiconfig</strong> para alinhar respostas às diretrizes, restrições e linguagens de sua empresa. Crie o seu arquivo de política de desenvolvimento customizado abaixo:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      
                      {/* Configuration Settings Panel */}
                      <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-4">
                        <h4 className="font-bold text-xs font-mono uppercase text-slate-300 tracking-wider">Parâmetros de Produção</h4>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Nome do Projeto Corporativo</label>
                          <input 
                            type="text"
                            value={configParams.projectName}
                            onChange={(e) => setConfigParams(prev => ({ ...prev, projectName: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs rounded-lg p-2.5 outline-none font-mono text-slate-200"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Estilo de Arquitetura Alvo</label>
                          <select 
                            value={configParams.architecture}
                            onChange={(e) => setConfigParams(prev => ({ ...prev, architecture: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs rounded-lg p-2.5 outline-none text-slate-200"
                          >
                            <option value="Clean Architecture (Domínio Puro desacoplado, Casos de Uso explicados)">Clean Architecture</option>
                            <option value="Arquitetura Hexagonal (Ports & Adapters)">Arquitetura Hexagonal</option>
                            <option value="MVC Tradicional (Controller, Repository, View dividida)">Model-View-Controller (MVC)</option>
                            <option value="Microserviços orientados por eventos (Event-Driven)">Microserviços Orientados a Evento</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Tech Stack Principal</label>
                          <input 
                            type="text"
                            value={configParams.framework}
                            onChange={(e) => setConfigParams(prev => ({ ...prev, framework: e.target.value }))}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs rounded-lg p-2.5 outline-none font-mono text-slate-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-medium block">Convenções Estritas de Código ({configParams.conventions.length})</label>
                          
                          {/* List of current added items */}
                          <div className="space-y-1 max-h-[140px] overflow-y-auto scrollbar-thin">
                            {configParams.conventions.map((conv, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded">
                                <span className="text-[10px] text-slate-400 leading-normal truncate flex-1">{conv}</span>
                                <button 
                                  onClick={() => handleRemoveConvention(idx)}
                                  className="text-[9px] text-red-500 hover:text-red-400 hover:scale-105 transition shrink-0"
                                >
                                  Remover
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Quick add layout */}
                          <div className="flex gap-1.5">
                            <input 
                              type="text"
                              value={activeConventionInput}
                              onChange={(e) => setActiveConventionInput(e.target.value)}
                              placeholder="Ex: Jamais usar any em tipos"
                              className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 text-xs rounded-lg p-2 outline-none text-slate-200"
                            />
                            <button
                              onClick={handleAddConvention}
                              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-3 rounded-lg text-white text-xs font-bold transition"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Config Generator Live Copy Output Block */}
                      <div className="lg:col-span-3 bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-between shadow-2xl">
                        
                        <div className="bg-slate-900 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                            <FileText className="w-4 h-4 text-sky-400" />
                            <span>.cloudaiconfig</span>
                          </div>

                          <button 
                            onClick={() => {
                              handleCopyText(generateCloudAiConfig(configParams), 'copy-cloud-ai-config');
                              // Tick goal
                              if (!checkedGoals.includes('5')) {
                                setCheckedGoals(prev => [...prev, '5']);
                              }
                            }}
                            className="bg-slate-800 hover:bg-slate-705 border border-slate-700/80 text-xs font-semibold px-2.5 py-1 text-slate-300 rounded hover:text-white flex items-center gap-1"
                          >
                            {copiedId === 'copy-cloud-ai-config' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar Regras</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Config text representation */}
                        <div className="p-4 overflow-x-auto max-h-[360px]">
                          <pre className="text-[11px] font-mono text-emerald-400/90 leading-relaxed select-all">
                            <code>{generateCloudAiConfig(configParams)}</code>
                          </pre>
                        </div>

                        <div className="bg-slate-900/45 px-4 py-2 text-[10px] font-mono text-slate-500 text-right border-t border-slate-800/60">
                          Coloque este arquivo na raiz do repositório
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* -------------------- TAB: PROMPT LIBRARY -------------------- */}
                {activeTab === 'prompt-library' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                      <BookOpen className="w-5 h-5 text-sky-400" />
                      <h2 className="text-xl font-bold text-white">Livraria de Interações para Workspace Enterprise</h2>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      Prompts projetados para se fazer entender em repositórios complexos instalados no VS Code. Use-os no painel do chat lateral para diagnosticar, mapear efeitos colaterais e otimizar rotinas corporativas.
                    </p>

                    {/* Prompts list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {enterprisePrompts.map((p) => (
                        <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700/80 transition shadow-lg">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/25 px-2.5 py-0.5 rounded">
                                {p.strategyName}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">Operador: @workspace</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-200">{p.title}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
                          </div>

                          <div className="bg-slate-950 p-3 rounded border border-slate-800/80 relative font-mono text-[10.5px] max-h-[140px] overflow-y-auto leading-relaxed select-all">
                            <pre className="text-slate-300 whitespace-pre-wrap">{p.fullPrompt}</pre>
                            <button
                              onClick={() => {
                                handleCopyText(p.fullPrompt, p.id);
                                if (!checkedGoals.includes('4')) {
                                  setCheckedGoals(prev => [...prev, '4']);
                                }
                              }}
                              className="absolute right-2 top-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/85 p-1 rounded transition"
                              title="Copiar prompt corporativo"
                            >
                              {copiedId === p.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* -------------------- TAB: CHECKLIST -------------------- */}
                {activeTab === 'checklist' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                      <CheckSquare className="w-5 h-5 text-sky-400" />
                      <h2 className="text-xl font-bold text-white">Roteiro de Treinamento e Produtividade</h2>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed">
                      Utilize o roteiro gamificado abaixo para certificar-se de que sua máquina e o ecossistema corporativo do Google Cloud estão configurados perfeitamente para acelerar suas entregas.
                    </p>

                    <div className="space-y-3">
                      {CORPORATE_MILESTONES.map((item) => {
                        const isChecked = checkedGoals.includes(item.id);
                        return (
                          <div 
                            key={item.id}
                            onClick={() => handleToggleGoal(item.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                              isChecked 
                                ? 'bg-emerald-500/5 border-emerald-500/40 text-slate-200' 
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              <div className={`w-5 h-5 rounded flex items-center justify-center transition ${
                                isChecked 
                                  ? 'bg-emerald-500 text-slate-950' 
                                  : 'border border-slate-75 * text-transparent'
                              }`}>
                                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                              </div>
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-200">{item.label}</span>
                                <span className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.2 rounded border border-slate-850">
                                  +{item.weight} PTS
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-normal">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reset local data button option */}
                    <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500">Seu progresso é gravado localmente no seu navegador para acompanhamento.</p>
                      <button 
                        onClick={() => setCheckedGoals([])}
                        className="text-xs text-red-500 hover:text-red-400 hover:underline font-medium transition"
                      >
                        Limpar Progresso
                      </button>
                    </div>

                  </div>
                )}
                
              </motion.div>
            </AnimatePresence>

          </section>

        </div>

        {/* Footer Area with legal constraints links */}
        <footer id="app-footer" className="mt-12 pt-6 border-t border-slate-900 text-center space-y-2">
          <p className="text-xs text-slate-500">
            © 2026 Gemini Code Assist Enterprise Guide. Construído de forma compatível com o portal Google Cloud, Developer Connect e políticas corporativas de segurança.
          </p>
          <p className="text-[10px] text-slate-600 font-mono">
            Isolamento de Dados Garantido • IAM SSO Auth Ativo • Suporte Completo à Variância de Workspace Local (@workspace)
          </p>
        </footer>

      </div>
    </div>
  );
}
