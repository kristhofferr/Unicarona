
import React, { createContext, useContext, useState } from 'react';

const CaronaContext = createContext();

export const CARONAS_POR_SEMESTRE = 20;
export const HORAS_POR_SEMESTRE = 10;
export const META_SEMANAL = 2;
export const MAX_SEMESTRES = 5;

const temas = {
  claro: {
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    border: '#F3F4F6',
    borderInput: '#E5E7EB',
    primary: '#2563EB',
    danger: '#EF4444',
    dangerBg: '#FEF2F2',
    inputBackground: '#F3F4F6',
    placeholder: '#9CA3AF',
    switchTrackFalse: '#D1D5DB',
    switchTrackTrue: '#BFDBFE',
    switchThumb: '#FFFFFF',
    icon: '#374151',
    iconSecondary: '#9CA3AF',
    avatarBackground: '#EFF6FF',
    avatarIcon: '#2563EB',
    header: '#FFFFFF',
    headerText: '#111827',
    headerBorder: '#F3F4F6',
    darkBg: '#F9FAFB',
    darkCard: '#FFFFFF',
    darkBorder: '#E5E7EB',
    darkText: '#111827',
    darkTextSecondary: '#6B7280',
    darkTextTertiary: '#9CA3AF',
    accent: '#e94560',
    accentBlue: '#2563EB',
    success: '#059669',
    tabBarBg: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabBarActive: '#e94560',
    tabBarInactive: '#9CA3AF',
    chatBubbleMine: '#e94560',
    chatBubbleOther: '#F3F4F6',
    chatTextMine: '#FFFFFF',
    chatTextOther: '#111827',
  },
  escuro: {
    background: '#0F172A',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    borderInput: '#475569',
    primary: '#3B82F6',
    danger: '#F87171',
    dangerBg: '#2D1515',
    inputBackground: '#0F172A',
    placeholder: '#64748B',
    switchTrackFalse: '#334155',
    switchTrackTrue: '#1D4ED8',
    switchThumb: '#FFFFFF',
    icon: '#CBD5E1',
    iconSecondary: '#64748B',
    avatarBackground: '#1E3A5F',
    avatarIcon: '#60A5FA',
    header: '#1E293B',
    headerText: '#F1F5F9',
    headerBorder: '#334155',
    darkBg: '#1a1a2e',
    darkCard: '#16213e',
    darkBorder: '#0f3460',
    darkText: '#FFFFFF',
    darkTextSecondary: '#aaa',
    darkTextTertiary: '#555',
    accent: '#e94560',
    accentBlue: '#4a90d9',
    success: '#2ed573',
    tabBarBg: '#16213e',
    tabBarBorder: '#0f3460',
    tabBarActive: '#e94560',
    tabBarInactive: '#555',
    chatBubbleMine: '#e94560',
    chatBubbleOther: '#0f3460',
    chatTextMine: '#FFFFFF',
    chatTextOther: '#FFFFFF',
  },
};

const DIA_PARA_JS = { Dom: 0, Seg: 1, Ter: 2, Qua: 3, Qui: 4, Sex: 5, 'Sáb': 6 };
const LIMITE_NOTIFICACAO_MS = 2 * 60 * 60 * 1000; // 2 horas

function agoraBrasilia() {
  return new Date(Date.now() - 3 * 60 * 60 * 1000);
}

function obterSemanaAtual() {
  const agora = agoraBrasilia();
  const inicioAno = new Date(Date.UTC(agora.getUTCFullYear(), 0, 1));
  const diaDoAno = Math.floor((agora.getTime() - inicioAno.getTime()) / 86400000);
  return `${agora.getUTCFullYear()}-S${Math.floor(diaDoAno / 7)}`;
}

function calcularDelaysNotificacao(horario, diaSelecionado) {
  if (!diaSelecionado || !horario) return null;

  const brasilia = agoraBrasilia();

  // getUTCDay/getUTCHours/getUTCMinutes no objeto deslocado == horário local de Brasília
  if (DIA_PARA_JS[diaSelecionado] !== brasilia.getUTCDay()) return null;

  const [horasCarona, minutosCarona] = horario.split(':').map(Number);
  const minutosCaronaTotal = horasCarona * 60 + minutosCarona;
  const minutosAgoraBrasilia = brasilia.getUTCHours() * 60 + brasilia.getUTCMinutes();

  const msAteCarona = (minutosCaronaTotal - minutosAgoraBrasilia) * 60_000
    - brasilia.getUTCSeconds() * 1000;

  if (msAteCarona < 0) return null;
  if (msAteCarona > LIMITE_NOTIFICACAO_MS) return null;

  return {
    aCaminho:  Math.max(15_000, msAteCarona - 30_000), // 30s antes do horário
    chegou:    Math.max(25_000, msAteCarona - 15_000), // 15s após "a caminho"
    concluida: Math.max(35_000, msAteCarona -  5_000), // 10s após "chegou"
  };
}

export function CaronaProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [caronasConfirmadas, setCaronasConfirmadas] = useState([]);
  const [temaAtual, setTemaAtual] = useState('escuro');
  const [raioBusca, setRaioBuscaState] = useState(10);
  const [notificacoes, setNotificacoes] = useState([]);
  const [notificacaoPendente, setNotificacaoPendente] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState({});
  const [historicoCaronas, setHistoricoCaronas] = useState([]);
  const [avaliacaoPendente, setAvaliacaoPendente] = useState(null);
  const [mensagens, setMensagens] = useState({});
  const [progressoHoras, setProgressoHoras] = useState({
    semestreAtual: 1,
    caronasSemestre: 0,
    totalHorasResgatadas: 0,
    caronasSemana: 0,
    semanaRef: null,
  });
  const [caronas, setCaronas] = useState([
    {
      id: 1,
      nome: 'João Silva',
      curso: 'Engenharia de Software',
      origem: 'Centro',
      destino: 'Unioeste',
      horario: '07:30',
      vagas: 3,
      valor: '5,00',
      tipo: 'paga',
      avaliacao: 4.8,
      dias: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
      latitude: -26.0786627,
      longitude: -53.0560072,
      latitudeDestino: -26.0774,
      longitudeDestino: -53.0527,
    },
    {
      id: 2,
      nome: 'Maria Souza',
      curso: 'Administração',
      origem: 'Bairro Industrial',
      destino: 'UTFPR',
      horario: '08:00',
      vagas: 2,
      valor: '0,00',
      tipo: 'horas',
      avaliacao: 5.0,
      dias: ['Seg', 'Qua', 'Sex'],
      latitude: -26.0952288,
      longitude: -53.0663185,
      latitudeDestino: -26.0695,
      longitudeDestino: -53.0585,
    },
    {
      id: 3,
      nome: 'Pedro Costa',
      curso: 'Ciência da Computação',
      origem: 'Cesul',
      destino: 'Terminal Central',
      horario: '18:30',
      vagas: 4,
      valor: '3,00',
      tipo: 'paga',
      avaliacao: 4.5,
      dias: ['Ter', 'Qui'],
      latitude: -26.0761230,
      longitude: -53.0480486,
      latitudeDestino: -26.0804,
      longitudeDestino: -53.0572,
    },
  ]);

  function login(dados) {
    setUsuario({ senha: '123456', ...dados });
  }

  function logout() {
    setUsuario(null);
  }

  function toggleTema() {
    setTemaAtual(prev => (prev === 'claro' ? 'escuro' : 'claro'));
  }

  function atualizarRaioBusca(km) {
    setRaioBuscaState(km);
  }

  function atualizarPerfil({ nome, curso }) {
    setUsuario(prev => ({ ...prev, nome, curso }));
  }

  function alterarEmail(novoEmail) {
    setUsuario(prev => ({ ...prev, email: novoEmail }));
  }

  function alterarSenha(senhaAtual, novaSenha) {
    if (usuario?.senha !== senhaAtual) {
      return { ok: false, mensagem: 'Senha atual incorreta.' };
    }
    setUsuario(prev => ({ ...prev, senha: novaSenha }));
    return { ok: true };
  }

  function excluirConta() {
    logout();
  }

  function adicionarNotificacao(dados) {
    const nova = { id: Date.now(), ...dados, lida: false, tempo: new Date() };
    setNotificacoes(prev => [nova, ...prev]);
    setNotificacaoPendente(nova);
  }

  function limparNotificacaoPendente(idDismissed) {
    setNotificacaoPendente(prev => (prev?.id === idDismissed ? null : prev));
  }

  function marcarTodasLidas() {
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  }

  function registrarHoraComplementar() {
    const semanaAtual = obterSemanaAtual();
    setProgressoHoras(prev => {
      const semanaReset = prev.semanaRef !== semanaAtual;
      const caronasSemana = semanaReset ? 1 : prev.caronasSemana + 1;
      if (prev.caronasSemestre >= CARONAS_POR_SEMESTRE || prev.semestreAtual > MAX_SEMESTRES) {
        return { ...prev, caronasSemana, semanaRef: semanaAtual };
      }
      return {
        ...prev,
        caronasSemestre: prev.caronasSemestre + 1,
        caronasSemana,
        semanaRef: semanaAtual,
      };
    });
  }

  function resgatarHoras() {
    setProgressoHoras(prev => {
      if (prev.caronasSemestre < CARONAS_POR_SEMESTRE) return prev;
      if (prev.semestreAtual > MAX_SEMESTRES) return prev;
      return {
        ...prev,
        totalHorasResgatadas: prev.totalHorasResgatadas + HORAS_POR_SEMESTRE,
        semestreAtual: prev.semestreAtual + 1,
        caronasSemestre: 0,
      };
    });
  }

  function concluirCarona(id) {
    const carona = caronas.find(c => c.id === id);
    setCaronasConfirmadas(prev => prev.filter(cId => cId !== id));
    if (carona) {
      setHistoricoCaronas(prev => [...prev, { ...carona, concluidaEm: new Date() }]);
      setAvaliacaoPendente(carona);
      if (carona.tipo === 'horas') {
        registrarHoraComplementar();
      }
    }
  }

  function avaliarCarona(id, nota) {
    setAvaliacoes(prev => ({ ...prev, [id]: nota }));
    setAvaliacaoPendente(null);
  }

  function dispensarAvaliacao() {
    setAvaliacaoPendente(null);
  }

  function enviarMensagem(caronaId, texto) {
    const hora = new Date();
    const novaMinha = { id: Date.now(), texto, remetente: 'eu', horario: hora };
    setMensagens(prev => ({
      ...prev,
      [caronaId]: [...(prev[caronaId] ?? []), novaMinha],
    }));

    const respostas = [
      'Ok! Te vejo lá.',
      'Combinado! Pode esperar que chego logo.',
      'Perfeito! Qualquer coisa me avisa.',
      'Ok, estou a caminho!',
      'Tudo certo, nos vemos em breve!',
    ];
    const resposta = respostas[Math.floor(Math.random() * respostas.length)];

    setTimeout(() => {
      setMensagens(prev => ({
        ...prev,
        [caronaId]: [
          ...(prev[caronaId] ?? []),
          { id: Date.now() + 1, texto: resposta, remetente: 'motorista', horario: new Date() },
        ],
      }));
    }, 2000 + Math.random() * 2000);
  }

  function publicarCarona(carona) {
    setCaronas(prev => [...prev, { id: Date.now(), ...carona }]);
  }

  function confirmarCarona(id, diaSelecionado) {
    const carona = caronas.find(c => c.id === id);
    const nomeMotorista = carona?.nome ?? 'Motorista';

    setCaronasConfirmadas(prev => [...prev, id]);
    setCaronas(prev => prev.map(c => c.id === id ? { ...c, vagas: c.vagas - 1 } : c));

    setMensagens(prev => ({
      ...prev,
      [id]: [
        {
          id: Date.now(),
          texto: `Olá! Sou ${nomeMotorista}. Carona confirmada para ${carona?.horario}${diaSelecionado ? ` (${diaSelecionado})` : ''}. Te vejo em breve!`,
          remetente: 'motorista',
          horario: new Date(),
        },
      ],
    }));

    // Sempre dispara confirmação 10s após reservar
    setTimeout(() => adicionarNotificacao({
      titulo: 'Carona confirmada!',
      mensagem: `${nomeMotorista} confirmou sua solicitação de carona.`,
      icone: 'checkmark-circle',
    }), 10_000);

    // As demais notificações só disparam se for hoje e dentro da janela de 2h
    const delays = calcularDelaysNotificacao(carona?.horario ?? '', diaSelecionado);
    if (!delays) return;

    setTimeout(() => adicionarNotificacao({
      titulo: 'Motorista a caminho!',
      mensagem: `${nomeMotorista} está saindo para te buscar. Fique pronto!`,
      icone: 'car',
    }), delays.aCaminho);

    setTimeout(() => adicionarNotificacao({
      titulo: 'Motorista chegou!',
      mensagem: `${nomeMotorista} chegou ao ponto de encontro. Vá até ele!`,
      icone: 'car',
    }), delays.chegou);

    setTimeout(() => {
      adicionarNotificacao({
        titulo: 'Corrida concluída com sucesso!',
        mensagem: 'Você chegou ao destino! Avalie sua experiência.',
        icone: 'star',
      });
      concluirCarona(id);
    }, delays.concluida);
  }

  function cancelarCarona(id) {
    setCaronasConfirmadas(prev => prev.filter(cId => cId !== id));
    setCaronas(prev =>
      prev.map(c => c.id === id ? { ...c, vagas: c.vagas + 1 } : c)
    );
  }

  return (
    <CaronaContext.Provider value={{
      usuario,
      caronas,
      caronasConfirmadas,
      temaAtual,
      tema: temas[temaAtual],
      raioBusca,
      notificacoes,
      notificacaoPendente,
      notificacoesNaoLidas: notificacoes.filter(n => !n.lida).length,
      avaliacoes,
      historicoCaronas,
      avaliacaoPendente,
      mensagens,
      login,
      logout,
      toggleTema,
      atualizarRaioBusca,
      atualizarPerfil,
      alterarEmail,
      alterarSenha,
      excluirConta,
      adicionarNotificacao,
      limparNotificacaoPendente,
      marcarTodasLidas,
      publicarCarona,
      confirmarCarona,
      cancelarCarona,
      avaliarCarona,
      dispensarAvaliacao,
      enviarMensagem,
      progressoHoras,
      resgatarHoras,
    }}>
      {children}
    </CaronaContext.Provider>
  );
}

export function useCarona() {
  return useContext(CaronaContext);
}
