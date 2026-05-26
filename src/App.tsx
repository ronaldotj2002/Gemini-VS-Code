import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Terminal, 
  Code, 
  Key, 
  Settings, 
  BookOpen, 
  CheckSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  ArrowRight, 
  Award, 
  Lightbulb, 
  Info, 
  ChevronRight, 
  Search, 
  ShieldCheck,
  Zap,
  Laptop
} from 'lucide-react';
import { promptsData, PromptTemplate } from './data/prompts';
import { extensions, getContinueConfigJson } from './data/extensions';

type TabType = 'dashboard' | 'extensions' | 'apikey' | 'generator' | 'prompts' | 'checklist';

interface Milestone {
  id: string;
  label: string;
  description: string;
  points: number;
}

const MILESTONES: Milestone[] = [
  { id: 'apikey', label: 'Obter Chave de API do Gemini', description: 'Crie sua chave de API gratuita no painel do Google AI Studio.', points: 15 },
  { id: 'install', label: 'Instalar uma Extensão no VS Code', description: 'Instale a sua extensão preferida (recomendamos Continue.dev ou Gemini Code Assist).', points: 15 },
  { id: 'config', label: 'Inserir a Chave de API na Extensão', description: 'Vincule sua chave de API gerada nas configurações da extensão instalada.', points: 20 },
  { id: 'first_chat', label: 'Enviar a Primeira Mensagem de Chat', description: 'Abra a aba lateral e peça para o Gemini explicar um bloco de código antigo.', points: 15 },
  { id: 'inline_cmd', label: 'Usar Edição Inline (Refatoração Rápida)', description: 'Selecione um código, aperte o atalho (Ctrl+I ou Cmd+I no Continue) e peça uma mudança.', points: 15 },
  { id: 'shortcut', label: 'Customizar Atalhos de Teclado', description: 'Configure atalhos práticos para acessar os comandos de IA sem tirar as mãos do teclado.', points: 10 },
  { id: 'library_prompt', label: 'Testar um Prompt do Guia Prático', description: 'Copie um dos templates de prompt de alta performance e use no seu VS Code.', points: 10 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [apiKey, setApiKey] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [promptSearch, setPromptSearch] = useState<string>('');
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string>('all');
  
  // Gamefied Checklist State
  const [completedMilestones, setCompletedMilestones] = useState<string[]>(() => {
    const saved = localStorage.getItem('gemini_vscode_milestones');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gemini_vscode_milestones', JSON.stringify(completedMilestones));
  }, [completedMilestones]);

  const handleToggleMilestone = (id: string) => {
    setCompletedMilestones(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleResetChecklist = () => {
    setCompletedMilestones([]);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Calculate Progress Score
  const currentScore = MILESTONES.reduce((acc, current) => {
    return acc + (completedMilestones.includes(current.id) ? current.points : 0);
  }, 0);

  const filteredPrompts = promptsData.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(promptSearch.toLowerCase()) || 
                          p.promptText.toLowerCase().includes(promptSearch.toLowerCase()) ||
                          p.description.toLowerCase().includes(promptSearch.toLowerCase());
    const matchesCategory = selectedPromptCategory === 'all' || p.category === selectedPromptCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="app-container" className="min-h-screen bg-[#0a0f1d] text-gray-100 font-sans selection:bg-[#38bdf8]/30 selection:text-[#38bdf8]">
      {/* Header Grid Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Primary Container Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        
        {/* Top Navbar */}
        <header id="app-header" className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800/60 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-white">Gemini VS Code</h1>
                <span className="text-[10px] font-mono uppercase bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20 font-semibold">Guia 2026</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Potencialize sua produtividade de codificação ao nível sênior</p>
            </div>
          </div>

          {/* Productivity Stats Micro-Widget */}
          <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-xl p-3 px-4">
            <div className="text-center md:text-right">
              <div className="text-xs text-slate-400 font-medium">Seu Progresso de Setup</div>
              <div className="text-base font-mono font-bold text-sky-400 flex items-center justify-end gap-1.5 mt-0.5">
                <Award className="w-4 h-4 text-amber-400" />
                {currentScore}/100 PTS
              </div>
            </div>
            <div className="w-12 h-12 rounded-lg bg-slate-800/60 flex items-center justify-center border border-slate-700/50">
              <span className="text-sm font-semibold font-mono text-white">{Math.round((completedMilestones.length / MILESTONES.length) * 100)}%</span>
            </div>
          </div>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Vertical Sidebar Controls */}
          <aside id="sidebar-navigation" className="lg:col-span-1 space-y-4">
            <div className="bg-[#111827]/85 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-xl backdrop-blur-md">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Menu de Configuração</h3>
              
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-left ${
                  activeTab === 'dashboard' 
                    ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/5 text-sky-400 border border-sky-500/30 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Terminal className="w-4.5 h-4.5 shrink-0" />
                <span className="text-sm">Início & Vantagens</span>
              </button>

              <button 
                onClick={() => setActiveTab('extensions')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-left ${
                  activeTab === 'extensions' 
                    ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/5 text-sky-400 border border-sky-500/30 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Download className="w-4.5 h-4.5 shrink-0" />
                <span className="text-sm">1. Escolher Extensão</span>
              </button>

              <button 
                onClick={() => setActiveTab('apikey')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-left ${
                  activeTab === 'apikey' 
                    ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/5 text-sky-400 border border-sky-500/30 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Key className="w-4.5 h-4.5 shrink-0" />
                <span className="text-sm">2. Obter Chave de API</span>
              </button>

              <button 
                onClick={() => setActiveTab('generator')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-left ${
                  activeTab === 'generator' 
                    ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/5 text-sky-400 border border-sky-500/30 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Settings className="w-4.5 h-4.5 shrink-0" />
                <span className="text-sm">3. Customizador de Config</span>
              </button>

              <button 
                onClick={() => setActiveTab('prompts')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-left ${
                  activeTab === 'prompts' 
                    ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/5 text-sky-400 border border-sky-500/30 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                <BookOpen className="w-4.5 h-4.5 shrink-0" />
                <span className="text-sm">Livraria de Prompts</span>
              </button>

              <button 
                onClick={() => setActiveTab('checklist')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-200 text-left ${
                  activeTab === 'checklist' 
                    ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/5 text-sky-400 border border-sky-500/30 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-3">
                  <CheckSquare className="w-4.5 h-4.5 shrink-0" />
                  <span className="text-sm">Roteiro de Produtividade</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300">
                  {completedMilestones.length}/{MILESTONES.length}
                </span>
              </button>
            </div>

            {/* Quick Helper Tip Box */}
            <div className="bg-[#1e1b4b]/40 border border-indigo-500/20 rounded-2xl p-4 shadow-md">
              <div className="flex items-start gap-2.5">
                <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-200">Recomendação de Ouro</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    A extensão <strong>Continue.dev</strong> aliada com a <strong>API Gemini 2.5</strong> gratuita do AI Studio hoje representa o melhor custo-benefício de autocompletação extremamente rápida no mercado.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Workspace Frame */}
          <main id="workspace-content" className="lg:col-span-3 min-h-[550px] bg-[#111827]/60 border border-slate-800/70 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -7 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                
                {/* -------------------- TAB: DASHBOARD -------------------- */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-medium">BEM-VINDO</span>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Supercharge seu VS Code</h2>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                        Configurar o assistente inteligente do <strong>Gemini</strong> no VS Code é um divisor de águas na carreira do desenvolvedor moderno. Descubra como economizar horas de codificação manual com o uso ideal de IA generativa no seu ambiente local.
                      </p>
                    </div>

                    {/* Feature Grid Infographics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20 text-sky-400">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-sm text-slate-200">Preenchimento Instantâneo</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Edite código com autocompletação em tempo real utilizando o modelo leve e incrivelmente rápido <strong>Gemini 2.5 Flash</strong>.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                          <Code className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-sm text-slate-200">Refatoração em Segundos</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Selecione classes inteiras e peça reescritas focadas em performance, testes e padrões limpos simplesmente usando comandos rápidos.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-sm text-slate-200">100% Gratuito & Seguro</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Usando sua própria chave de API do Google AI Studio, as requisições respeitam limites amplos de cota gratuita para desenvolvedores individuais.
                        </p>
                      </div>
                    </div>

                    {/* Step-by-Step Summary Roadmap */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-5 h-5 text-sky-400" />
                        <h4 className="font-bold text-sm text-white">Como Funciona a Jornada de Configuração?</h4>
                      </div>
                      
                      <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
                        <div className="flex items-start gap-4 relative">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-sky-400 font-bold border border-slate-700 font-mono shrink-0 z-10">1</div>
                          <div>
                            <h5 className="font-semibold text-sm text-slate-200">Escolha o seu plugin cliente</h5>
                            <p className="text-xs text-slate-400">Decida se prefere a flexibilidade aberta do Continue.dev, o minimalismo oficial do Google Cloud ou a portabilidade simples do CodeGPT.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 relative">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-sky-400 font-bold border border-slate-700 font-mono shrink-0 z-10">2</div>
                          <div>
                            <h5 className="font-semibold text-sm text-slate-200">Obtenha sua Chave do Gemini no Google AI Studio</h5>
                            <p className="text-xs text-slate-400">Crie um segredo seguro que permitirá suas chamadas de inteligência artificial de forma segura diretamente no computador.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 relative">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-sky-400 font-bold border border-slate-700 font-mono shrink-0 z-10">3</div>
                          <div>
                            <h5 className="font-semibold text-sm text-slate-200">Carregue e rode seu roteiro de produtividade</h5>
                            <p className="text-xs text-slate-400">Insira suas chaves, configure os arquivos de atalho e use nossa livraria de prompts de alto rendimento para programar em altíssima velocidade.</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button 
                          onClick={() => setActiveTab('extensions')}
                          className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg shadow-md transition-all duration-200"
                        >
                          Começar com o Passo 1
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* -------------------- TAB: EXTENSIONS -------------------- */}
                {activeTab === 'extensions' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-medium">PASSO 1</span>
                        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Escolha a Extensão Ideal</h2>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Existem vários caminhos para habilitar o Gemini dentro do VS Code. Escolha um dos três principais ecossistemas abaixo que melhor se adequa ao seu perfil profissional e clique no link para instalar.
                      </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {extensions.map((ext) => (
                        <div 
                          key={ext.id} 
                          className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all duration-200 shadow-md relative group h-full"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                                {ext.publisher}
                              </span>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-400">Classificação</p>
                                <p className="text-xs font-semibold text-yellow-400">{ext.rating}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors duration-150">
                                {ext.name}
                              </h4>
                              <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                                {ext.description}
                              </p>
                            </div>

                            {/* Pros & Cons list */}
                            <div className="space-y-2 pt-2">
                              <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Prós:</p>
                              <ul className="space-y-1">
                                {ext.pros.map((pro, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                                    <span className="text-emerald-500 font-bold">✔</span>
                                    <span>{pro}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="pt-5 mt-auto">
                            <a 
                              href={ext.vscodeLink}
                              onClick={() => {
                                // Mark setting extension milestone as potentially completed
                                if (!completedMilestones.includes('install')) {
                                  handleToggleMilestone('install');
                                }
                              }}
                              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-sky-500 hover:text-white transition-all duration-200 text-slate-300 font-semibold text-xs py-2 px-3 rounded-lg border border-slate-700 hover:border-sky-400"
                            >
                              <span>Instalar no VS Code</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Guide Note Box */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5">
                      <div className="flex gap-3">
                        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-200">Como instalar a extensão manualmente no seu editor?</h4>
                          <ol className="list-decimal text-xs text-slate-400 leading-relaxed mt-1.5 ml-4 space-y-1">
                            <li>Abra o seu VS Code de trabalho.</li>
                            <li>Aperte o atalho <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-mono inline-block border border-slate-700">Ctrl + Shift + X</kbd> ou <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-mono inline-block border border-slate-700">Cmd + Shift + X</kbd> para abrir o painel de Extensões.</li>
                            <li>Busque por <strong className="text-slate-300">"Continue"</strong> ou <strong className="text-slate-300">"Gemini Code Assist"</strong> no campo de busca.</li>
                            <li>Clique no botão azul <strong className="text-sky-400">Install (Instalar)</strong> que aparece ao lado da extensão oficial.</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Call to action */}
                    <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-xl">
                      <p className="text-xs text-slate-400">Já instalou a extensão favorita? Continue para criar a chave de API.</p>
                      <button 
                        onClick={() => setActiveTab('apikey')}
                        className="flex items-center gap-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs py-2 px-4 rounded-lg font-semibold transition"
                      >
                        Passo 2: Chave de API
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* -------------------- TAB: API KEY INFO -------------------- */}
                {activeTab === 'apikey' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">PASSO 2</span>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Consiga sua Chave de API Gratuita</h2>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        A extensão precisa de uma chave de API para se comunicar com os servidores do Google e realizar as tarefas de processamento de código. Essa chave é gerada de maneira gratuita e rápida pelo Google AI Studio.
                      </p>
                    </div>

                    {/* Step layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono text-xs font-semibold">1</span>
                          <h4 className="font-bold text-sm text-slate-200">Acesse o Google AI Studio</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          O Google AI Studio é uma plataforma baseada na nuvem que permite que desenvolvedores individuais criem e gerenciem credenciais de acesso rápido aos modelos Gemini.
                        </p>
                        <div>
                          <a 
                            href="https://aistudio.google.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => {
                              // Auto complete apikey milestone
                              if (!completedMilestones.includes('apikey')) {
                                handleToggleMilestone('apikey');
                              }
                            }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-lg shadow-md transition-all duration-200"
                          >
                            <span>Ir para o Google AI Studio</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-semibold">2</span>
                          <h4 className="font-bold text-sm text-slate-200">Crie o Token "Get API Key"</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Uma vez logado com sua conta Google regular:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1 leading-relaxed">
                          <li>Clique no botão azul destacado <strong className="text-white font-medium">"Get API key"</strong> no topo esquerdo do painel do AI Studio.</li>
                          <li>Clique no botão <strong className="text-slate-300">"Create API key"</strong> (Criar chave de API).</li>
                          <li>Selecione ou crie um projeto padrão do Google Cloud ou use a provisão rápida.</li>
                          <li>Clique para gerar e depois <strong className="text-emerald-400 font-semibold">COPIE</strong> a chave iniciada com <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1 py-0.5 rounded">AIzaSy...</span>.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Security Notice Box */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-sm text-amber-400">Mantenha sua chave de API segura!</h4>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1">
                            A chave que você gerará funciona como uma senha privada. <strong>Nunca envie ou publique sua chave de API em repositórios públicos como o GitHub</strong>. O Gemini usador nas extensões lerá sua chave localmente em arquivos locais ou variáveis de ambiente do seu sistema operacional.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Link to Customization configuration step */}
                    <div className="flex justify-between items-center bg-slate-900/40 p-4 border border-slate-800/80 rounded-xl">
                      <p className="text-xs text-slate-400">Já gerou e copiou sua chave do AI Studio? Vamos integrá-la no configurador do seu arquivo.</p>
                      <button 
                        onClick={() => setActiveTab('generator')}
                        className="flex items-center gap-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-xs py-2 px-4 rounded-lg font-semibold transition"
                      >
                        Passo 3: Gerar Configurações
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* -------------------- TAB: GENERATOR / CUSTOMIZER -------------------- */}
                {activeTab === 'generator' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-medium">PASSO 3</span>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Customizador de Arquivos de Configração</h2>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Facilitamos a geração do arquivo de configuração perfeito do <strong>Continue.dev</strong> ou do ecossistema correspondente. Digite sua chave abaixo e o modelo preferido para obter a estrutura completa formatada e pronta para colar no VS Code.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      
                      {/* Form inputs */}
                      <div className="lg:col-span-2 bg-[#1c2436]/40 border border-slate-800 rounded-xl p-5 space-y-4">
                        <h4 className="font-bold text-sm text-slate-200">Parâmetros de Configuração</h4>
                        
                        {/* API key Input form */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-medium flex items-center justify-between">
                            <span>Sua Chave de API</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono font-normal">Privado</span>
                          </label>
                          <div className="relative">
                            <Key className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input 
                              type="password"
                              placeholder="Cole sua AIzaSy... aqui"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              className="w-full bg-[#0a0f1d] border border-slate-700/85 focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/20 text-slate-200 text-xs rounded-lg py-2.5 pl-9 pr-4 transition-all duration-150 outline-none font-mono"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400">
                            *Sua chave é mantida localmente no contexto React e nunca sai do aplicativo.
                          </p>
                        </div>

                        {/* Model select slider */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-medium flex justify-between">
                            <span>Modelo de Autocompletação</span>
                            <span className="text-[9px] bg-sky-500/15 text-sky-400 font-semibold px-2 py-0.2 rounded-full font-mono uppercase">Muito Rápido</span>
                          </label>
                          <select 
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full bg-[#0a0f1d] border border-slate-700 text-slate-200 text-xs rounded-lg py-2.5 px-3 transition duration-150 outline-none"
                          >
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado para Autocomplete)</option>
                            <option value="gemini-2.0-flash font-mono">Gemini 2.0 Flash</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Melhor para Lógica Pesada)</option>
                          </select>
                        </div>

                        {/* Checklist milestone link helper */}
                        <div className="bg-slate-90030 border border-slate-800 rounded-xl p-3 space-y-1 text-slate-400 text-xs">
                          <p className="font-semibold text-slate-300">Como colar isso no VS Code?</p>
                          <ol className="list-decimal pl-4 space-y-1 text-[11px] mt-1 text-slate-400">
                            <li>Com o plugin <strong className="text-slate-300">Continue</strong> ativo, clique no ícone de engrenagem (<img src="https://img.icons8.com/material-outlined/24/000000/settings--v1.png" className="w-3 h-3 invert inline" />) no rodapé da barra lateral do Continue.</li>
                            <li>Isso abrirá o arquivo <strong className="text-sky-400 font-mono">config.json</strong>.</li>
                            <li>Substitua todo o conteúdo ou insira os blocos copiados da direita.</li>
                            <li>Salve o arquivo (<kbd className="bg-slate-800 border border-slate-700 px-1 rounded text-[8px]">Ctrl+S</kbd>). Pronto!</li>
                          </ol>
                        </div>
                      </div>

                      {/* Code Generator Output */}
                      <div className="lg:col-span-3 bg-[#0c111e] border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
                        
                        {/* Header metadata bar */}
                        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                            <span className="text-[10px] font-mono text-slate-400 ml-2">~/.continue/config.json</span>
                          </div>

                          <button 
                            onClick={() => {
                              handleCopyText(getContinueConfigJson(apiKey, selectedModel), 'continue-config');
                              // Automatically tick config check milestone
                              if (!completedMilestones.includes('config')) {
                                handleToggleMilestone('config');
                              }
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded transition font-medium text-slate-300"
                          >
                            {copiedId === 'continue-config' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Editor window view */}
                        <div className="p-4 overflow-x-auto select-all max-h-[350px]">
                          <pre className="text-slate-300 text-[11px] font-mono leading-relaxed pointer-events-auto">
                            <code>{getContinueConfigJson(apiKey, selectedModel)}</code>
                          </pre>
                        </div>

                        {/* Footnote status bar */}
                        <div className="bg-slate-900/30 border-t border-slate-800/60 px-4 py-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                          <span>Linhas: ~25</span>
                          <span>JSON Válido</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick validation */}
                    <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex gap-2 items-center text-xs text-slate-400">
                        <span className="text-sky-400 font-bold">★ Dica:</span>
                        <span>Se preferir usar o <strong>CodeGPT</strong>, basta colar sua API key nas configurações globais da extensão.</span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('prompts')}
                        className="flex items-center gap-1 text-xs text-sky-400 font-semibold hover:underline"
                      >
                        Acessar Livraria de Prompts
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* -------------------- TAB: PROMPTS LIBRARY -------------------- */}
                {activeTab === 'prompts' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">BÔNUS IMPERDÍVEL</span>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Livraria de Prompts de Alta Performance</h2>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        A qualidade da resposta do Gemini varia drasticamente de acordo com as instruções (system prompts) que você passa no chat do VS Code. Abaixo, organizei uma seleção refinada de atalhos em formato de prompt para você copiar, colar e disparar sua produtividade.
                      </p>
                    </div>

                    {/* Filter and search controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      
                      {/* Tabs buttons for prompt category */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'all', label: 'Todos' },
                          { id: 'refactor', label: 'Refatoração' },
                          { id: 'test', label: 'Testes' },
                          { id: 'explain', label: 'Explicar Código' },
                          { id: 'doc', label: 'Documentação' },
                          { id: 'debug', label: 'Achar Bugs' }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedPromptCategory(cat.id)}
                            className={`text-xs px-3.5 py-2 rounded-lg font-medium transition ${
                              selectedPromptCategory === cat.id
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Search box input */}
                      <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Buscar prompts..."
                          value={promptSearch}
                          onChange={(e) => setPromptSearch(e.target.value)}
                          className="w-full bg-[#0a0f1d] border border-slate-800 focus:border-indigo-500 text-xs rounded-lg py-2 pl-8.5 pr-4 transition outline-none text-slate-200"
                        />
                      </div>
                    </div>

                    {/* Prompts list grid */}
                    {filteredPrompts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredPrompts.map((prompt) => (
                          <div 
                            key={prompt.id}
                            className="bg-slate-900/40 hover:bg-[#151c2d]/30 border border-slate-800 rounded-xl p-5 flex flex-col justify-between transition"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                                  prompt.category === 'refactor' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                                  prompt.category === 'test' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  prompt.category === 'explain' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                                  prompt.category === 'doc' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {prompt.category === 'refactor' ? 'Refatoração' :
                                   prompt.category === 'test' ? 'Testes Unitários' :
                                   prompt.category === 'explain' ? 'Explicação' :
                                   prompt.category === 'doc' ? 'Documentação' :
                                   'Detecção de Bugs'}
                                </span>
                              </div>

                              <h4 className="text-sm font-bold text-slate-200">{prompt.title}</h4>
                              <p className="text-xs text-slate-400 leading-relaxed">{prompt.description}</p>
                            </div>

                            {/* Prompt block view */}
                            <div className="mt-4 bg-[#0a0f1d] border border-slate-800/80 rounded-lg p-3 relative font-mono text-[10.5px] leading-relaxed max-h-[140px] overflow-y-auto">
                              <pre className="text-slate-400 whitespace-pre-wrap">{prompt.promptText}</pre>
                            </div>

                            {/* Button actions */}
                            <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                              <span className="text-[10px] text-slate-500 font-mono">Dica: cole no chat lateral</span>
                              <button
                                onClick={() => {
                                  handleCopyText(prompt.promptText, prompt.id);
                                  // Mark Milestone
                                  if (!completedMilestones.includes('library_prompt')) {
                                    handleToggleMilestone('library_prompt');
                                  }
                                }}
                                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700/80 hover:text-white border border-slate-705/80 text-slate-300 py-1.5 px-3 rounded transition font-medium"
                              >
                                {copiedId === prompt.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar Prompt</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl space-y-2">
                        <Search className="w-10 h-10 text-slate-600 mx-auto" />
                        <h4 className="font-bold text-sm text-slate-300">Nenhum prompt encontrado</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">Tente alterar os termos da busca ou selecionar a categoria "Todos" para redefinir os resultados.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* -------------------- TAB: CHECKLIST / PLAYBOOK -------------------- */}
                {activeTab === 'checklist' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono font-medium">CHECKLIST</span>
                        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Roteiro de Produtividade do Desenvolvedor</h2>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        Complete as etapas abaixo para configurar o Gemini no VS Code por completo e destravar novos patamares de entrega de softwares rápidos e robustos.
                      </p>
                    </div>

                    {/* Progress representation card */}
                    <div className="bg-gradient-to-r from-sky-900/30 to-indigo-900/10 border border-sky-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-white">Seu Rank de IA: {currentScore >= 100 ? 'Mestre do Código (Sênior)' : currentScore >= 70 ? 'Arquiteto de IA' : currentScore >= 40 ? 'Explorador da IA' : 'Iniciante Curioso'}</h4>
                        <p className="text-xs text-slate-400 max-w-lg">
                          Marque à medida que você for implementando cada ponto no seu VS Code de trabalho para aumentar pontos de reputação e destravar o seu score definitivo.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                        <div className="w-full md:w-32 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-300" style={{ width: `${(completedMilestones.length / MILESTONES.length) * 100}%` }} />
                        </div>
                        <span className="font-mono text-sm text-sky-300 font-bold shrink-0">
                          {Math.round((completedMilestones.length / MILESTONES.length) * 100)}% Completado
                        </span>
                      </div>
                    </div>

                    {/* Checklist Grid */}
                    <div className="space-y-3.5">
                      {MILESTONES.map((stone) => {
                        const isDone = completedMilestones.includes(stone.id);
                        return (
                          <div 
                            key={stone.id}
                            onClick={() => handleToggleMilestone(stone.id)}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                              isDone
                                ? 'bg-slate-900/80 border-emerald-500/30 opacity-85'
                                : 'bg-[#151d30]/65 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <button className="mt-0.5" aria-label="Toggle milestone">
                              <div className={`w-5 h-5 rounded flex items-center justify-center transition border ${
                                isDone 
                                  ? 'bg-emerald-500 text-white border-emerald-400' 
                                  : 'border-slate-600 bg-[#0f1423]'
                              }`}>
                                {isDone && <Check className="w-3.5 h-3.5 font-bold" />}
                              </div>
                            </button>

                            <div className="flex-1 space-y-1 text-left">
                              <div className="flex items-center justify-between">
                                <h5 className={`text-sm font-semibold transition ${isDone ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                                  {stone.label}
                                </h5>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isDone ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                  +{stone.points} PTS
                                </span>
                              </div>
                              <p className={`text-xs transition ${isDone ? 'text-slate-500' : 'text-slate-400'}`}>
                                {stone.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reset checklist and control panel */}
                    {completedMilestones.length > 0 && (
                      <div className="flex justify-end">
                        <button
                          onClick={handleResetChecklist}
                          className="text-xs text-slate-500 hover:text-slate-300 font-medium font-mono"
                        >
                          Zerar meu progresso de setup e recomeçar
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Footer Area */}
        <footer id="app-footer" className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs gap-4">
          <p>© 2026 Guia Gemini VS Code. Criado com React e Tailwind CSS.</p>
          <div className="flex gap-4">
            <a 
              href="https://aistudio.google.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-slate-300 transition"
            >
              Google AI Studio
            </a>
            <span className="text-slate-700">•</span>
            <a 
              href="https://vscode.dev" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-slate-300 transition"
            >
              VS Code Web
            </a>
            <span className="text-slate-700">•</span>
            <a 
              href="https://continue.dev" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-slate-300 transition"
            >
              Documentação Continue.dev
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
