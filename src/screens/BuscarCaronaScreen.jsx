
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarona } from '../context/CaronaContext';
import { normalizarTexto } from '../data/lugaresConhecidos';
import Header from '../components/Header';
import MensagemFeedback from '../components/MensagemFeedback';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function BuscarCaronaScreen({ navigation }) {
  const { caronas, caronasConfirmadas, confirmarCarona, tema } = useCarona();
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [horarioFiltro, setHorarioFiltro] = useState('');
  const [diaFiltro, setDiaFiltro] = useState(null);
  const [caronasFiltradas, setCaronasFiltradas] = useState(null);
  const [modalCarona, setModalCarona] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [feedback, setFeedback] = useState({ id: 0, visivel: false, mensagem: '', tipo: 'sucesso' });

  useEffect(() => {
    if (!origem && !destino && !horarioFiltro && !diaFiltro) {
      setCaronasFiltradas(null);
      return;
    }
    aplicarFiltro();
  }, [origem, destino, horarioFiltro, diaFiltro, caronas]);

  function aplicarFiltro() {
    const origemNorm = normalizarTexto(origem);
    const destinoNorm = normalizarTexto(destino);
    const filtradas = caronas.filter(carona => {
      const origemOk = origem ? normalizarTexto(carona.origem).includes(origemNorm) : true;
      const destinoOk = destino ? normalizarTexto(carona.destino).includes(destinoNorm) : true;
      const horarioOk = horarioFiltro ? carona.horario.includes(horarioFiltro) : true;
      const diaOk = diaFiltro
        ? (!carona.dias || carona.dias.includes(diaFiltro))
        : true;
      return origemOk && destinoOk && horarioOk && diaOk;
    });
    setCaronasFiltradas(filtradas);
  }

  function handleLimpar() {
    setOrigem('');
    setDestino('');
    setHorarioFiltro('');
    setDiaFiltro(null);
    setCaronasFiltradas(null);
  }

  function mostrar(mensagem, tipo = 'sucesso') {
    setFeedback(prev => ({ id: prev.id + 1, visivel: true, mensagem, tipo }));
  }

  function abrirModal(item) {
    const diasDaCarona = item.dias ?? [];
    setDiaSelecionado(diasDaCarona.length === 1 ? diasDaCarona[0] : null);
    setModalCarona(item);
  }

  function fecharModal() {
    setModalCarona(null);
    setDiaSelecionado(null);
  }

  function handleConfirmarModal() {
    confirmarCarona(modalCarona.id, diaSelecionado);
    const dia = diaSelecionado ? ` na ${diaSelecionado}` : '';
    const nome = modalCarona.nome;
    fecharModal();
    mostrar(`Carona com ${nome}${dia} confirmada!`);
  }

  const caronasDisponiveis = caronas.filter(c => !caronasConfirmadas.includes(c.id));
  const listaExibida = caronasFiltradas !== null
    ? caronasFiltradas.filter(c => !caronasConfirmadas.includes(c.id))
    : caronasDisponiveis;

  function renderCarona({ item }) {
    const confirmada = caronasConfirmadas.includes(item.id);
    const semVagas = item.vagas === 0;

    return (
      <View style={[styles.card, { backgroundColor: tema.darkCard, borderColor: tema.darkBorder }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: tema.accent }]}>
            <Text style={styles.avatarTexto}>{item.nome?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardNome, { color: tema.darkText }]}>{item.nome}</Text>
            <View style={styles.cardSubRow}>
              <Text style={[styles.cardCurso, { color: tema.darkTextSecondary }]}>{item.curso}</Text>
              {item.avaliacao != null && (
                <View style={styles.avaliacaoBadge}>
                  <Ionicons name="star" size={11} color="#D97706" />
                  <Text style={[styles.avaliacaoTexto, { color: tema.darkTextSecondary }]}>
                    {item.avaliacao.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={[styles.cardValor, { color: tema.accent }]}>R$ {item.valor}</Text>
        </View>

        <View style={[styles.divisor, { backgroundColor: tema.darkBorder }]} />

        <View style={styles.cardRota}>
          <View style={styles.rotaItem}>
            <Text style={styles.rotaPonto}>🟢</Text>
            <Text style={[styles.rotaTexto, { color: tema.darkText }]}>{item.origem}</Text>
          </View>
          <View style={styles.rotaItem}>
            <Text style={styles.rotaPonto}>🔴</Text>
            <Text style={[styles.rotaTexto, { color: tema.darkText }]}>{item.destino}</Text>
          </View>
        </View>

        {item.dias && item.dias.length > 0 && (
          <View style={styles.diasRow}>
            {item.dias.map(d => (
              <View key={d} style={[styles.diaChip, { backgroundColor: tema.darkBorder }]}>
                <Text style={[styles.diaChipTexto, { color: tema.darkTextSecondary }]}>{d}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={[styles.cardDetalhe, { color: tema.darkTextSecondary }]}>🕐 {item.horario}</Text>
          <Text style={[styles.cardDetalhe, { color: tema.darkTextSecondary }]}>💺 {item.vagas} vagas</Text>
          {confirmada ? (
            <View style={styles.tagConfirmada}>
              <Text style={[styles.tagTextoConfirmada, { color: tema.success }]}>✓ Confirmada</Text>
            </View>
          ) : (
            <View style={[styles.tagDisponivel, { borderColor: tema.success }]}>
              <Text style={[styles.tagTexto, { color: tema.success }]}>Disponível</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.botaoConfirmar,
            { backgroundColor: tema.accent },
            (confirmada || semVagas) && styles.botaoConfirmarDesabilitado,
          ]}
          onPress={() => abrirModal(item)}
          disabled={confirmada || semVagas}
        >
          <Text style={styles.botaoConfirmarTexto}>
            {confirmada ? '✓ Carona Confirmada' : semVagas ? 'Sem vagas' : 'Confirmar Carona'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.darkBg }]}>

      <Header
        titulo="Buscar Carona"
        mostrarVoltar
        corFundo={tema.darkBg}
        corTexto={tema.darkText}
        corBorda={tema.darkBorder}
      />

      {feedback.visivel && (
        <MensagemFeedback
          key={feedback.id}
          mensagem={feedback.mensagem}
          tipo={feedback.tipo}
          onDismiss={() => setFeedback(prev => ({ ...prev, visivel: false }))}
        />
      )}

      <View style={styles.filtros}>
        <TextInput
          style={[styles.input, { backgroundColor: tema.darkCard, color: tema.darkText, borderColor: tema.darkBorder }]}
          placeholder="Origem"
          placeholderTextColor={tema.darkTextTertiary}
          value={origem}
          onChangeText={setOrigem}
        />
        <TextInput
          style={[styles.input, { backgroundColor: tema.darkCard, color: tema.darkText, borderColor: tema.darkBorder }]}
          placeholder="Destino"
          placeholderTextColor={tema.darkTextTertiary}
          value={destino}
          onChangeText={setDestino}
        />
        <TextInput
          style={[styles.input, { backgroundColor: tema.darkCard, color: tema.darkText, borderColor: tema.darkBorder }]}
          placeholder="Horário (ex: 07 ou 07:30)"
          placeholderTextColor={tema.darkTextTertiary}
          value={horarioFiltro}
          onChangeText={setHorarioFiltro}
          keyboardType="numbers-and-punctuation"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasScroll}>
          <TouchableOpacity
            style={[
              styles.diaFiltroChip,
              { borderColor: tema.darkBorder },
              !diaFiltro && { backgroundColor: tema.accent, borderColor: tema.accent },
            ]}
            onPress={() => setDiaFiltro(null)}
          >
            <Text style={[styles.diaFiltroTexto, { color: !diaFiltro ? '#fff' : tema.darkTextSecondary }]}>
              Todos
            </Text>
          </TouchableOpacity>
          {DIAS.map(d => (
            <TouchableOpacity
              key={d}
              style={[
                styles.diaFiltroChip,
                { borderColor: tema.darkBorder },
                diaFiltro === d && { backgroundColor: tema.accent, borderColor: tema.accent },
              ]}
              onPress={() => setDiaFiltro(prev => prev === d ? null : d)}
            >
              <Text style={[styles.diaFiltroTexto, { color: diaFiltro === d ? '#fff' : tema.darkTextSecondary }]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.botoesFilro}>
          <TouchableOpacity style={[styles.botaoBuscar, { backgroundColor: tema.accent }]} onPress={aplicarFiltro}>
            <Text style={styles.botaoBuscarTexto}>🔍 Buscar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoLimpar, { backgroundColor: tema.darkCard, borderColor: tema.darkBorder }]}
            onPress={handleLimpar}
          >
            <Text style={[styles.botaoLimparTexto, { color: tema.darkTextSecondary }]}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={listaExibida}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCarona}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <Text style={[styles.resultado, { color: tema.darkTextSecondary }]}>
            {listaExibida.length} carona(s) encontrada(s)
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={[styles.vazioTexto, { color: tema.darkTextSecondary }]}>😕 Nenhuma carona encontrada.</Text>
            <Text style={[styles.vazioSub, { color: tema.darkTextTertiary }]}>
              Tente outros termos ou aguarde novas publicações.
            </Text>
          </View>
        }
      />

      <Modal visible={!!modalCarona} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: tema.darkCard, borderColor: tema.darkBorder }]}>
            <Text style={[styles.modalTitulo, { color: tema.darkText }]}>Confirmar carona</Text>

            {modalCarona && (
              <>
                <View style={[styles.modalInfo, { backgroundColor: tema.darkBg }]}>
                  <Text style={[styles.modalNome, { color: tema.accent }]}>{modalCarona.nome}</Text>
                  <Text style={[styles.modalDetalhe, { color: tema.darkTextSecondary }]}>🟢 {modalCarona.origem}</Text>
                  <Text style={[styles.modalDetalhe, { color: tema.darkTextSecondary }]}>🔴 {modalCarona.destino}</Text>
                  <Text style={[styles.modalDetalhe, { color: tema.darkTextSecondary }]}>
                    🕐 {modalCarona.horario}  •  💺 {modalCarona.vagas} vagas  •  R$ {modalCarona.valor}
                  </Text>
                </View>

                {modalCarona.dias && modalCarona.dias.length > 0 && (
                  <View style={styles.modalDiasContainer}>
                    <Text style={[styles.modalDiasLabel, { color: tema.darkText }]}>
                      Escolha o dia da semana:
                    </Text>
                    <View style={styles.modalDiasRow}>
                      {modalCarona.dias.map(d => (
                        <TouchableOpacity
                          key={d}
                          style={[
                            styles.modalDiaChip,
                            { borderColor: tema.darkBorder, backgroundColor: tema.darkBg },
                            diaSelecionado === d && { backgroundColor: tema.accent, borderColor: tema.accent },
                          ]}
                          onPress={() => setDiaSelecionado(prev => prev === d ? null : d)}
                        >
                          <Text style={[
                            styles.modalDiaChipTexto,
                            { color: diaSelecionado === d ? '#fff' : tema.darkTextSecondary },
                          ]}>
                            {d}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {!diaSelecionado && (
                      <Text style={[styles.modalDiasAviso, { color: tema.accent }]}>
                        Selecione um dia para continuar
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.modalBotoes}>
                  <TouchableOpacity
                    style={[styles.modalBotaoCancelar, { borderColor: tema.darkBorder }]}
                    onPress={fecharModal}
                  >
                    <Text style={[styles.modalBotaoCancelarTexto, { color: tema.darkTextSecondary }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalBotaoConfirmar,
                      { backgroundColor: tema.accent },
                      modalCarona.dias && modalCarona.dias.length > 0 && !diaSelecionado && { opacity: 0.35 },
                    ]}
                    onPress={handleConfirmarModal}
                    disabled={!!(modalCarona.dias && modalCarona.dias.length > 0 && !diaSelecionado)}
                  >
                    <Text style={styles.modalBotaoConfirmarTexto}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filtros: { paddingHorizontal: 25, marginBottom: 10 },
  input: {
    borderRadius: 10,
    padding: 13,
    marginBottom: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  diasScroll: { marginBottom: 10 },
  diaFiltroChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  diaFiltroTexto: { fontSize: 13, fontWeight: '600' },
  botoesFilro: { flexDirection: 'row', gap: 10 },
  botaoBuscar: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoBuscarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  botaoLimpar: {
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  botaoLimparTexto: { fontSize: 14 },
  lista: { paddingHorizontal: 25, paddingBottom: 40 },
  resultado: { fontSize: 13, marginBottom: 15 },
  card: { borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardInfo: { flex: 1 },
  cardNome: { fontWeight: 'bold', fontSize: 14 },
  cardSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  cardCurso: { fontSize: 12 },
  avaliacaoBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  avaliacaoTexto: { fontSize: 11 },
  cardValor: { fontWeight: 'bold', fontSize: 16 },
  divisor: { height: 1, marginBottom: 12 },
  cardRota: { marginBottom: 8, gap: 6 },
  rotaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rotaPonto: { fontSize: 10 },
  rotaTexto: { fontSize: 13 },
  diasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  diaChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  diaChipTexto: { fontSize: 11 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardDetalhe: { fontSize: 12 },
  tagDisponivel: {
    marginLeft: 'auto',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  tagTexto: { fontSize: 11, fontWeight: 'bold' },
  tagConfirmada: {
    marginLeft: 'auto',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagTextoConfirmada: { fontSize: 11, fontWeight: 'bold' },
  botaoConfirmar: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoConfirmarDesabilitado: { backgroundColor: '#2a2a4a' },
  botaoConfirmarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: { borderRadius: 16, padding: 24, width: '100%', borderWidth: 1 },
  modalTitulo: { fontSize: 17, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalInfo: { borderRadius: 10, padding: 14, gap: 6, marginBottom: 20 },
  modalNome: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  modalDetalhe: { fontSize: 13 },
  modalBotoes: { flexDirection: 'row', gap: 10 },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalBotaoCancelarTexto: { fontSize: 14, fontWeight: 'bold' },
  modalBotaoConfirmar: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalBotaoConfirmarTexto: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  vazio: { alignItems: 'center', paddingTop: 40 },
  vazioTexto: { fontSize: 16, marginBottom: 8 },
  vazioSub: { fontSize: 13, textAlign: 'center' },
  modalDiasContainer: { marginBottom: 18 },
  modalDiasLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  modalDiasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalDiaChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  modalDiaChipTexto: { fontSize: 13, fontWeight: '700' },
  modalDiasAviso: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
});
