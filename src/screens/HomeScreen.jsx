
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarona } from '../context/CaronaContext';
import MensagemFeedback from '../components/MensagemFeedback';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function HomeScreen({ navigation }) {
  const { usuario, caronas, caronasConfirmadas, confirmarCarona, avaliacoes, tema } = useCarona();
  const [diaFiltro, setDiaFiltro] = useState(null);
  const [modalCarona, setModalCarona] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [feedback, setFeedback] = useState({ id: 0, visivel: false, mensagem: '', tipo: 'sucesso' });

  function abrirModal(carona) {
    const diasDaCarona = carona.dias ?? [];
    const preSelect = diasDaCarona.length === 1 ? diasDaCarona[0] : null;
    setDiaSelecionado(preSelect);
    setModalCarona(carona);
  }

  function fecharModal() {
    setModalCarona(null);
    setDiaSelecionado(null);
  }

  function mostrar(mensagem, tipo = 'sucesso') {
    setFeedback(prev => ({ id: prev.id + 1, visivel: true, mensagem, tipo }));
  }

  function handleConfirmarModal() {
    confirmarCarona(modalCarona.id, diaSelecionado);
    const nome = modalCarona.nome;
    const dia = diaSelecionado ? ` na ${diaSelecionado}` : '';
    fecharModal();
    mostrar(`Carona com ${nome}${dia} confirmada!`);
  }

  const caronasVisiveis = caronas.filter(c => {
    const diaOk = diaFiltro ? (!c.dias || c.dias.includes(diaFiltro)) : true;
    return diaOk;
  });

  return (
    <View style={{ flex: 1, backgroundColor: tema.darkBg }}>
      {feedback.visivel && (
        <View style={styles.feedbackOverlay}>
          <MensagemFeedback
            key={feedback.id}
            mensagem={feedback.mensagem}
            tipo={feedback.tipo}
            onDismiss={() => setFeedback(prev => ({ ...prev, visivel: false }))}
          />
        </View>
      )}
      <ScrollView style={[styles.container, { backgroundColor: tema.darkBg }]}>

        <View style={styles.header}>
          <View>
            <Text style={[styles.bemVindo, { color: tema.darkText }]}>Olá, {usuario?.nome} </Text>
            <Text style={[styles.subtitulo, { color: tema.darkTextSecondary }]}>Para onde vai hoje?</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
            <View style={[styles.avatar, { backgroundColor: tema.accent }]}>
              <Text style={styles.avatarTexto}>
                {usuario?.nome?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={[styles.botao, { backgroundColor: tema.accent }]}
            onPress={() => navigation.navigate('BuscarCarona')}
            activeOpacity={0.85}
          >
            <Text style={styles.buscarLabel}>ENCONTRE</Text>
            <Text style={styles.buscarTitulo} numberOfLines={1}>Sua Carona</Text>
            <View style={[styles.linhaDetalhe, { backgroundColor: tema.accentBlue }]} />
            <Text style={styles.buscarSub}>disponível agora</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botao, { backgroundColor: tema.darkCard, borderWidth: 1, borderColor: tema.darkBorder }]}
            onPress={() => navigation.navigate('OfereceCarona')}
            activeOpacity={0.85}
          >
            <Text style={styles.ofereceLabel}>compartilhe</Text>
            <Text style={[styles.ofereceDestaque, { color: tema.darkText }]} numberOfLines={1}>Sua Rota</Text>
            <View style={[styles.linhaDetalhe, { backgroundColor: tema.accent }]} />
            <Text style={[styles.ofereceAcao, { color: tema.darkTextSecondary }]}>ofereça agora</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.botaoMapa, { backgroundColor: tema.darkCard, borderColor: tema.darkBorder }]}
          onPress={() => navigation.navigate('Mapa')}
        >
          <Ionicons name="map-outline" size={18} color={tema.darkText} />
          <Text style={[styles.botaoMapaTexto, { color: tema.darkText }]}>Ver Mapa de Motoristas</Text>
        </TouchableOpacity>

        <View style={styles.secao}>
          <Text style={[styles.secaoTitulo, { color: tema.darkText }]}>Caronas Disponíveis</Text>

          {/* Filtro por dias */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.diasScroll}>
            <TouchableOpacity
              style={[
                styles.diaChip,
                { borderColor: tema.darkBorder },
                !diaFiltro && { backgroundColor: tema.accent, borderColor: tema.accent },
              ]}
              onPress={() => setDiaFiltro(null)}
            >
              <Text style={[styles.diaChipTexto, { color: !diaFiltro ? '#fff' : tema.darkTextSecondary }]}>
                Todos
              </Text>
            </TouchableOpacity>
            {DIAS.map(d => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.diaChip,
                  { borderColor: tema.darkBorder },
                  diaFiltro === d && { backgroundColor: tema.accent, borderColor: tema.accent },
                ]}
                onPress={() => setDiaFiltro(prev => prev === d ? null : d)}
              >
                <Text style={[styles.diaChipTexto, { color: diaFiltro === d ? '#fff' : tema.darkTextSecondary }]}>
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {caronasVisiveis.length === 0 ? (
            <View style={[styles.vazio, { backgroundColor: tema.darkCard }]}>
              <Text style={[styles.vazioTexto, { color: tema.darkTextSecondary }]}>
                {diaFiltro ? `Nenhuma carona disponível na ${diaFiltro}.` : 'Nenhuma carona publicada ainda.'}
              </Text>
              {!diaFiltro && (
                <Text style={[styles.vazioSub, { color: tema.accent }]}>Seja o primeiro a oferecer!</Text>
              )}
            </View>
          ) : (
            caronasVisiveis.map(carona => {
              const confirmada = caronasConfirmadas.includes(carona.id);
              const semVagas = carona.vagas === 0;
              return (
                <TouchableOpacity
                  key={carona.id}
                  style={[styles.card, { backgroundColor: tema.darkCard, borderColor: tema.darkBorder }]}
                  onPress={() => abrirModal(carona)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.cardAvatar, { backgroundColor: tema.accent }]}>
                      <Text style={styles.cardAvatarTexto}>{carona.nome?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardNome, { color: tema.darkText }]}>{carona.nome}</Text>
                      {carona.avaliacao != null && (
                        <View style={styles.cardAvaliacaoRow}>
                          <Ionicons name="star" size={11} color="#D97706" />
                          <Text style={[styles.cardAvaliacaoTexto, { color: tema.darkTextSecondary }]}>
                            {carona.avaliacao.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                    {carona.tipo === 'horas' ? (
                      <View style={[styles.badgeHoras, { backgroundColor: tema.success + '22' }]}>
                        <Ionicons name="school-outline" size={11} color={tema.success} />
                        <Text style={[styles.badgeHorasTexto, { color: tema.success }]}>Gratuita</Text>
                      </View>
                    ) : (
                      <Text style={[styles.cardValor, { color: tema.accent }]}>R$ {carona.valor}</Text>
                    )}
                  </View>

                  <View style={[styles.divisor, { backgroundColor: tema.darkBorder }]} />

                  <Text style={[styles.cardRota, { color: tema.darkTextSecondary }]}>
                    🟢 {carona.origem}
                  </Text>
                  <Text style={[styles.cardRota, { color: tema.darkTextSecondary }]}>
                    🔴 {carona.destino}
                  </Text>

                  {carona.dias && carona.dias.length > 0 && (
                    <View style={styles.diasRow}>
                      {carona.dias.map(d => (
                        <View
                          key={d}
                          style={[
                            styles.diaBadge,
                            { backgroundColor: diaFiltro === d ? tema.accent : tema.darkBorder },
                          ]}
                        >
                          <Text style={[styles.diaBadgeTexto, { color: diaFiltro === d ? '#fff' : tema.darkTextSecondary }]}>
                            {d}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <Text style={[styles.cardInfo, { color: tema.darkTextSecondary }]}>🕐 {carona.horario}</Text>
                    <Text style={[styles.cardInfo, { color: tema.darkTextSecondary }]}>💺 {carona.vagas} vagas</Text>
                    {confirmada ? (
                      <View style={styles.tagConfirmada}>
                        <Text style={[styles.tagTexto, { color: tema.success }]}>✓ Confirmada</Text>
                      </View>
                    ) : (
                      <View style={[styles.tagDisponivel, { borderColor: tema.success }]}>
                        <Text style={[styles.tagTexto, { color: tema.success }]}>
                          {semVagas ? 'Sem vagas' : 'Disponível'}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.botaoReservar, { backgroundColor: confirmada || semVagas ? tema.darkBorder : tema.accent }]}>
                    <Text style={[styles.botaoReservarTexto, { color: confirmada || semVagas ? tema.darkTextSecondary : '#fff' }]}>
                      {confirmada ? '✓ Carona Confirmada' : semVagas ? 'Sem vagas' : 'Reservar Carona'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </ScrollView>

      {/* Modal de confirmação */}
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
                    🕐 {modalCarona.horario}  •  💺 {modalCarona.vagas} vagas  •  {modalCarona.tipo === 'horas' ? '🎓 Gratuita' : `R$ ${modalCarona.valor}`}
                  </Text>
                </View>

                {/* Seleção de dia */}
                {!caronasConfirmadas.includes(modalCarona.id) && modalCarona.vagas > 0 && modalCarona.dias && modalCarona.dias.length > 0 && (
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

                {caronasConfirmadas.includes(modalCarona.id) ? (
                  <View style={styles.modalBotoes}>
                    <View style={[styles.modalBotaoConfirmado, { backgroundColor: tema.darkBorder }]}>
                      <Text style={[styles.modalBotaoConfirmadoTexto, { color: tema.success }]}>
                        ✓ Carona já confirmada
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.modalBotaoCancelar, { borderColor: tema.darkBorder }]}
                      onPress={fecharModal}
                    >
                      <Text style={[styles.modalBotaoCancelarTexto, { color: tema.darkTextSecondary }]}>Fechar</Text>
                    </TouchableOpacity>
                  </View>
                ) : modalCarona.vagas === 0 ? (
                  <TouchableOpacity
                    style={[styles.modalBotaoCancelar, { borderColor: tema.darkBorder, flex: 0 }]}
                    onPress={fecharModal}
                  >
                    <Text style={[styles.modalBotaoCancelarTexto, { color: tema.darkTextSecondary }]}>Fechar</Text>
                  </TouchableOpacity>
                ) : (
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
                        modalCarona.dias && modalCarona.dias.length > 0 && !diaSelecionado && styles.modalBotaoConfirmarDesabilitado,
                      ]}
                      onPress={handleConfirmarModal}
                      disabled={!!(modalCarona.dias && modalCarona.dias.length > 0 && !diaSelecionado)}
                    >
                      <Text style={styles.modalBotaoConfirmarTexto}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 25,
  },
  bemVindo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 14,
    marginTop: 4,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  botoesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    gap: 15,
    marginBottom: 15,
  },
  botao: {
    flex: 1,
    borderRadius: 18,
    padding: 20,
    height: 170,
    justifyContent: 'flex-end',
  },
  buscarLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: '600',
    marginBottom: 6,
  },
  buscarTitulo: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'serif',
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 10,
  },
  linhaDetalhe: {
    width: 30,
    height: 2,
    marginBottom: 8,
    borderRadius: 2,
  },
  buscarSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  ofereceLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: '600',
    marginBottom: 6,
  },
  ofereceDestaque: {
    fontSize: 22,
    fontFamily: 'serif',
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 10,
  },
  ofereceAcao: {
    fontSize: 11,
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  botaoMapa: {
    marginHorizontal: 25,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    marginBottom: 25,
  },
  botaoMapaTexto: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  secao: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  diasScroll: {
    marginBottom: 15,
  },
  diaChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  diaChipTexto: {
    fontSize: 13,
    fontWeight: '600',
  },
  vazio: {
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
  },
  vazioTexto: {
    fontSize: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  vazioSub: {
    fontSize: 13,
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  cardAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardNome: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardAvaliacaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  cardAvaliacaoTexto: {
    fontSize: 11,
  },
  cardValor: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  badgeHoras: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeHorasTexto: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  divisor: {
    height: 1,
    marginBottom: 10,
  },
  cardRota: {
    fontSize: 13,
    marginBottom: 4,
  },
  diasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
    marginBottom: 4,
  },
  diaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  diaBadgeTexto: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  cardInfo: {
    fontSize: 12,
  },
  tagDisponivel: {
    marginLeft: 'auto',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  tagConfirmada: {
    marginLeft: 'auto',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagTexto: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  botaoReservar: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  botaoReservarTexto: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInfo: {
    borderRadius: 10,
    padding: 14,
    gap: 6,
    marginBottom: 20,
  },
  modalNome: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  modalDetalhe: {
    fontSize: 13,
  },
  modalBotoes: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalBotaoCancelarTexto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalBotaoConfirmar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBotaoConfirmarTexto: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalBotaoConfirmado: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBotaoConfirmadoTexto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalBotaoConfirmarDesabilitado: {
    opacity: 0.35,
  },
  modalDiasContainer: {
    marginBottom: 18,
  },
  modalDiasLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalDiasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalDiaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalDiaChipTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalDiasAviso: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
