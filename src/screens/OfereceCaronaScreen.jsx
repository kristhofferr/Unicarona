// Tela para o usuário oferecer uma carona.
// Funciona em 2 etapas: (1) preenchimento do formulário com dados da rota,
// (2) visualização da rota no mapa antes de confirmar a publicação.
// Geocodifica os endereços via Nominatim (OpenStreetMap) e traça a rota com OSRM.
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import BotaoCustom from '../components/BotaoCustom';
import Header from '../components/Header';
import MensagemFeedback from '../components/MensagemFeedback';
import { useCarona } from '../context/CaronaContext';
import { buscarLugarConhecido } from '../data/lugaresConhecidos';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function OfereceCaronaScreen({ navigation }) {
  const { publicarCarona, usuario, adicionarNotificacao } = useCarona();

  const [etapa, setEtapa] = useState(1);
  const [tipoCarona, setTipoCarona] = useState('horas');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('UNIPAR');
  const [horario, setHorario] = useState('');
  const [vagas, setVagas] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [valor, setValor] = useState('');
  const [diasSelecionados, setDiasSelecionados] = useState([]);

  const [carregando, setCarregando] = useState(false);
  const [erroRota, setErroRota] = useState('');
  const [coordOrigem, setCoordOrigem] = useState(null);
  const [coordDestino, setCoordDestino] = useState(null);
  const [rota, setRota] = useState([]);
  const [feedback, setFeedback] = useState({ id: 0, visivel: false, mensagem: '', tipo: 'sucesso' });

  // Exibe mensagem de feedback no topo da tela
  function mostrar(mensagem, tipo) {
    setFeedback(prev => ({ id: prev.id + 1, visivel: true, mensagem, tipo }));
  }

  // Adiciona ou remove um dia da lista de dias disponíveis da carona
  function toggleDia(dia) {
    setDiasSelecionados(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  }

  // Converte um endereço em coordenadas geográficas.
  // Primeiro tenta nos lugares conhecidos locais, depois usa a API Nominatim.
  async function geocodificar(texto) {
    const conhecido = buscarLugarConhecido(texto);
    if (conhecido) return { latitude: conhecido.latitude, longitude: conhecido.longitude };

    const headers = { 'User-Agent': 'Unicarona/1.0 (app universitario)', 'Accept-Language': 'pt-BR' };
    const viewbox = '-53.15,-26.20,-52.90,-25.95';
    const baseParams = `format=json&limit=1&countrycodes=br&bounded=1&viewbox=${viewbox}`;

    const tentativas = [
      `${texto}, Francisco Beltrão, PR`,
      `${texto}, Francisco Beltrão`,
      texto,
    ];

    for (const query of tentativas) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&${baseParams}`,
        { headers }
      );
      const data = await res.json();
      if (data.length > 0) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
      }
    }

    const resFallback = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(tentativas[0])}&format=json&limit=1&countrycodes=br`,
      { headers }
    );
    const dataFallback = await resFallback.json();
    if (dataFallback.length > 0) {
      return { latitude: parseFloat(dataFallback[0].lat), longitude: parseFloat(dataFallback[0].lon) };
    }

    return null;
  }

  // Busca os pontos da rota entre dois pares de coordenadas usando a API OSRM
  async function buscarRota(cOrigem, cDestino) {
    const url = `https://router.project-osrm.org/route/v1/driving/${cOrigem.longitude},${cOrigem.latitude};${cDestino.longitude},${cDestino.latitude}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    return data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
      latitude: lat,
      longitude: lon,
    }));
  }

  // Valida campos, geocodifica os endereços e avança para a etapa do mapa
  async function handleAvancar() {
    if (!origem || !horario || !vagas || !veiculo) {
      mostrar('Preencha todos os campos antes de continuar.', 'erro');
      return;
    }

    setCarregando(true);
    setErroRota('');
    setEtapa(2);

    try {
      const [cOrigem, cDestino] = await Promise.all([
        geocodificar(origem),
        geocodificar(destino),
      ]);

      if (!cOrigem) { setErroRota(`Não encontrei "${origem}". Use o nome da rua ou bairro como referência.`); return; }
      if (!cDestino) { setErroRota(`Não encontrei "${destino}". Use o nome da rua ou bairro como referência.`); return; }

      setCoordOrigem(cOrigem);
      setCoordDestino(cDestino);

      const coords = await buscarRota(cOrigem, cDestino);
      setRota(coords);
    } catch {
      setErroRota('Erro ao buscar a rota. Verifique sua conexão e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  // Publica a carona no contexto global e navega de volta à tela anterior
  function handlePublicar() {
    publicarCarona({
      nome: usuario?.nome ?? 'Motorista',
      curso: usuario?.curso ?? '',
      origem,
      destino,
      horario,
      vagas: Number(vagas),
      veiculo,
      tipo: tipoCarona,
      valor: tipoCarona === 'horas' ? '0,00' : (valor.trim() || '0,00'),
      dias: diasSelecionados,
      avaliacao: 5.0,
      latitude: coordOrigem.latitude,
      longitude: coordOrigem.longitude,
      latitudeDestino: coordDestino.latitude,
      longitudeDestino: coordDestino.longitude,
    });
    adicionarNotificacao({
      titulo: 'Carona publicada!',
      mensagem: 'Sua carona foi publicada com sucesso.',
      icone: 'checkmark-circle',
    });
    navigation.goBack();
  }

  // Retorna à etapa 1 e limpa os dados de rota calculados
  function handleVoltar() {
    setEtapa(1);
    setErroRota('');
    setRota([]);
    setCoordOrigem(null);
    setCoordDestino(null);
  }

  if (etapa === 2) {
    const regiaoInicial = coordOrigem
      ? { ...coordOrigem, latitudeDelta: 0.06, longitudeDelta: 0.06 }
      : { latitude: -26.0820, longitude: -53.0548, latitudeDelta: 0.06, longitudeDelta: 0.06 };

    return (
      <View style={styles.containerMapa}>
        <View style={styles.headerMapa}>
          <TouchableOpacity onPress={handleVoltar}>
            <Ionicons name="arrow-back" size={22} color="#2563EB" />
          </TouchableOpacity>
          <Text style={styles.tituloMapa}>Confirmar rota</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={styles.rotaResumo}>
          <View style={styles.rotaResumoItem}>
            <View style={[styles.rotaPonto, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.rotaResumoTexto} numberOfLines={1}>{origem}</Text>
          </View>
          <View style={styles.rotaResumoItem}>
            <View style={[styles.rotaPonto, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.rotaResumoTexto} numberOfLines={1}>{destino}</Text>
          </View>
        </View>

        <MapView style={{ flex: 1 }} region={regiaoInicial} scrollEnabled zoomEnabled>
          {coordOrigem && <Marker coordinate={coordOrigem} pinColor="#22C55E" title="Saída" />}
          {coordDestino && <Marker coordinate={coordDestino} pinColor="#EF4444" title="Destino" />}
          {rota.length > 1 && (
            <Polyline coordinates={rota} strokeColor="#2563EB" strokeWidth={4} />
          )}
        </MapView>

        {carregando && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.overlayTexto}>Buscando rota...</Text>
          </View>
        )}

        <View style={styles.rodapeMapa}>
          {erroRota ? (
            <View style={styles.erroBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.erroTexto}>{erroRota}</Text>
              <TouchableOpacity onPress={handleVoltar}>
                <Text style={styles.erroVoltar}>Corrigir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.botaoPublicar, (carregando || !rota.length) && styles.botaoDesabilitado]}
              onPress={handlePublicar}
              disabled={carregando || !rota.length}
            >
              <Text style={styles.botaoPublicarTexto}>Confirmar e publicar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header titulo="Oferecer carona" mostrarVoltar />
      {feedback.visivel && (
        <MensagemFeedback
          key={feedback.id}
          mensagem={feedback.mensagem}
          tipo={feedback.tipo}
          onDismiss={() => setFeedback(prev => ({ ...prev, visivel: false }))}
        />
      )}
      <ScrollView contentContainerStyle={styles.conteudo}>

        <Text style={styles.label}>Tipo de carona</Text>
        <View style={styles.tipoContainer}>
          <TouchableOpacity
            style={[styles.tipoChip, tipoCarona === 'horas' && styles.tipoChipHoras]}
            onPress={() => setTipoCarona('horas')}
            activeOpacity={0.8}
          >
            <Ionicons name="school-outline" size={16} color={tipoCarona === 'horas' ? '#fff' : '#374151'} />
            <Text style={[styles.tipoChipTexto, tipoCarona === 'horas' && { color: '#fff' }]}>
              Horas Complementares
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoChip, tipoCarona === 'paga' && styles.tipoChipPaga]}
            onPress={() => setTipoCarona('paga')}
            activeOpacity={0.8}
          >
            <Ionicons name="cash-outline" size={16} color={tipoCarona === 'paga' ? '#fff' : '#374151'} />
            <Text style={[styles.tipoChipTexto, tipoCarona === 'paga' && { color: '#fff' }]}>
              Carona Paga
            </Text>
          </TouchableOpacity>
        </View>
        {tipoCarona === 'horas' ? (
          <Text style={styles.tipoDescricao}>
            Corrida gratuita para o passageiro. Você acumula pontos para suas horas complementares.
          </Text>
        ) : (
          <Text style={styles.tipoDescricao}>
            Você define o valor por passageiro. Esta corrida não conta para horas complementares.
          </Text>
        )}

        <Text style={styles.label}>Ponto de partida</Text>
        <TextInput style={styles.input} placeholder="Ex: Centro, Umuarama" value={origem} onChangeText={setOrigem} />

        <Text style={styles.label}>Destino</Text>
        <TextInput style={styles.input} placeholder="Ex: UNIPAR" value={destino} onChangeText={setDestino} />

        <Text style={styles.label}>Horário de saída</Text>
        <TextInput style={styles.input} placeholder="Ex: 07:30" value={horario} onChangeText={setHorario} />

        <Text style={styles.label}>Vagas disponíveis</Text>
        <TextInput style={styles.input} placeholder="Ex: 3" value={vagas} onChangeText={setVagas} keyboardType="numeric" />

        <Text style={styles.label}>Veículo</Text>
        <TextInput style={styles.input} placeholder="Ex: Gol 2020" value={veiculo} onChangeText={setVeiculo} />

        {tipoCarona === 'paga' && (
          <>
            <Text style={styles.label}>Valor por passageiro (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5,00"
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
            />
          </>
        )}

        <Text style={styles.label}>Dias disponíveis</Text>
        <View style={styles.diasContainer}>
          {DIAS.map(dia => {
            const selecionado = diasSelecionados.includes(dia);
            return (
              <TouchableOpacity
                key={dia}
                style={[styles.diaChip, selecionado && styles.diaChipSelecionado]}
                onPress={() => toggleDia(dia)}
                activeOpacity={0.75}
              >
                <Text style={[styles.diaChipTexto, selecionado && styles.diaChipTextoSelecionado]}>
                  {dia}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.botaoContainer}>
          <BotaoCustom titulo="Ver rota no mapa" onPress={handleAvancar} />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  conteudo: { padding: 24, gap: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  diasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  diaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  diaChipSelecionado: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  diaChipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  diaChipTextoSelecionado: {
    color: '#fff',
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  tipoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  tipoChipHoras: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  tipoChipPaga: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  tipoChipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  tipoDescricao: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 4,
  },
  botaoContainer: { marginTop: 24 },
  containerMapa: { flex: 1, backgroundColor: '#F9FAFB' },
  headerMapa: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  tituloMapa: { fontSize: 17, fontWeight: '700', color: '#111827' },
  rotaResumo: {
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB', gap: 6,
  },
  rotaResumoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rotaPonto: { width: 10, height: 10, borderRadius: 5 },
  rotaResumoTexto: { fontSize: 13, color: '#374151', fontWeight: '500', flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  overlayTexto: { fontSize: 15, color: '#2563EB', fontWeight: '600' },
  rodapeMapa: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  erroBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 10, padding: 14,
  },
  erroTexto: { flex: 1, color: '#EF4444', fontSize: 13 },
  erroVoltar: { color: '#2563EB', fontSize: 13, fontWeight: '700' },
  botaoPublicar: {
    backgroundColor: '#2563EB', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
  },
  botaoDesabilitado: { backgroundColor: '#D1D5DB' },
  botaoPublicarTexto: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
