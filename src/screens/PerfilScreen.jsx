import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import MensagemFeedback from '../components/MensagemFeedback';
import {
  useCarona,
  CARONAS_POR_SEMESTRE,
  HORAS_POR_SEMESTRE,
  META_SEMANAL,
  MAX_SEMESTRES,
} from '../context/CaronaContext';

function OpcaoPerfil({ icone, texto, onPress, corTexto, corBorda, corIcone, corSeta }) {
  return (
    <TouchableOpacity
      style={[styles.opcao, { borderBottomColor: corBorda }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icone} size={22} color={corIcone} />
      <Text style={[styles.opcaoTexto, { color: corTexto }]}>{texto}</Text>
      <Ionicons name="chevron-forward" size={18} color={corSeta} />
    </TouchableOpacity>
  );
}

export default function PerfilScreen({ navigation }) {
  const { usuario, logout, tema, progressoHoras, resgatarHoras } = useCarona();
  const [modalLogout, setModalLogout] = useState(false);
  const [modalResgatar, setModalResgatar] = useState(false);
  const [feedback, setFeedback] = useState({ id: 0, visivel: false, mensagem: '', tipo: 'sucesso' });

  function mostrar(mensagem, tipo = 'sucesso') {
    setFeedback(prev => ({ id: prev.id + 1, visivel: true, mensagem, tipo }));
  }

  const horasSemestre = progressoHoras.caronasSemestre * 0.5;
  const pctSemestre = Math.min(1, progressoHoras.caronasSemestre / CARONAS_POR_SEMESTRE);
  const pctSemana = Math.min(1, progressoHoras.caronasSemana / META_SEMANAL);
  const semestreConcluido = progressoHoras.semestreAtual > MAX_SEMESTRES;
  const podeResgatar =
    !semestreConcluido && progressoHoras.caronasSemestre >= CARONAS_POR_SEMESTRE;

  function handleResgatar() {
    setModalResgatar(true);
  }

  function confirmarResgatar() {
    setModalResgatar(false);
    resgatarHoras();
    mostrar('Certificado solicitado! Será enviado em até 48 horas.');
  }

  function handleLogout() {
    setModalLogout(true);
  }

  function confirmarLogout() {
    setModalLogout(false);
    logout();
    navigation.replace('Login');
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.background }]}>
      <Header
        titulo="Meu Perfil"
        corFundo={tema.header}
        corTexto={tema.headerText}
        corBorda={tema.headerBorder}
      />

      {feedback.visivel && (
        <MensagemFeedback
          key={feedback.id}
          mensagem={feedback.mensagem}
          tipo={feedback.tipo}
          onDismiss={() => setFeedback(prev => ({ ...prev, visivel: false }))}
        />
      )}

      <ScrollView>

        <View style={[styles.avatarContainer, { backgroundColor: tema.card, borderBottomColor: tema.border }]}>
          <View style={[styles.avatar, { backgroundColor: tema.avatarBackground }]}>
            <Ionicons name="person" size={48} color={tema.avatarIcon} />
          </View>
          <Text style={[styles.nome, { color: tema.text }]}>{usuario?.nome ?? 'Usuário'}</Text>
          <Text style={[styles.email, { color: tema.textSecondary }]}>{usuario?.email ?? ''}</Text>
          {usuario?.curso ? (
            <Text style={[styles.curso, { color: tema.textSecondary }]}>{usuario.curso}</Text>
          ) : null}
        </View>


        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>HORAS COMPLEMENTARES</Text>
        <View style={[styles.horasCard, { backgroundColor: tema.card, borderColor: tema.border }]}>

          {semestreConcluido ? (
            <View style={styles.horasConcluido}>
              <Ionicons name="trophy" size={28} color="#F59E0B" />
              <Text style={[styles.horasConcluidoTexto, { color: tema.text }]}>
                Parabéns! Você concluiu todos os {MAX_SEMESTRES} semestres e acumulou {progressoHoras.totalHorasResgatadas}h complementares.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.horasHeaderRow}>
                <Ionicons name="school-outline" size={18} color={tema.accent} />
                <Text style={[styles.horasSemTitulo, { color: tema.text }]}>
                  Semestre {Math.min(progressoHoras.semestreAtual, MAX_SEMESTRES)} de {MAX_SEMESTRES}
                </Text>
                <Text style={[styles.horasTotalBadge, { backgroundColor: tema.avatarBackground, color: tema.accentBlue }]}>
                  {progressoHoras.totalHorasResgatadas}h / {MAX_SEMESTRES * HORAS_POR_SEMESTRE}h total
                </Text>
              </View>


              <View style={[styles.progressBarBg, { backgroundColor: tema.border }]}>
                <View style={[styles.progressBarFg, { width: `${pctSemestre * 100}%`, backgroundColor: tema.accent }]} />
              </View>

              <View style={styles.horasInfoRow}>
                <Text style={[styles.horasInfoLabel, { color: tema.textSecondary }]}>
                  {progressoHoras.caronasSemestre} / {CARONAS_POR_SEMESTRE} caronas
                </Text>
                <Text style={[styles.horasInfoLabel, { color: tema.textSecondary }]}>
                  {horasSemestre}h / {HORAS_POR_SEMESTRE}h
                </Text>
              </View>


              <View style={[styles.metaContainer, { borderTopColor: tema.border }]}>
                <View style={styles.metaHeader}>
                  <Ionicons name="flag-outline" size={14} color={tema.textSecondary} />
                  <Text style={[styles.metaLabel, { color: tema.textSecondary }]}>
                    Meta semanal: {progressoHoras.caronasSemana} / {META_SEMANAL} caronas
                  </Text>
                  {progressoHoras.caronasSemana >= META_SEMANAL && (
                    <Ionicons name="checkmark-circle" size={14} color={tema.success} />
                  )}
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: tema.border, marginTop: 6 }]}>
                  <View style={[styles.progressBarFg, { width: `${pctSemana * 100}%`, backgroundColor: tema.success }]} />
                </View>
              </View>

              {podeResgatar && (
                <TouchableOpacity
                  style={[styles.resgatarBtn, { backgroundColor: tema.accent }]}
                  onPress={handleResgatar}
                  activeOpacity={0.8}
                >
                  <Ionicons name="ribbon-outline" size={18} color="#FFF" />
                  <Text style={styles.resgatarBtnTexto}>Resgatar {HORAS_POR_SEMESTRE}h complementares</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>


        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>PERFIL</Text>
        <View style={[styles.opcoes, { backgroundColor: tema.card, borderColor: tema.border }]}>
          <OpcaoPerfil
            icone="person-outline"
            texto="Editar perfil"
            onPress={() => navigation.navigate('EditarPerfil')}
            corTexto={tema.text}
            corBorda={tema.border}
            corIcone={tema.icon}
            corSeta={tema.iconSecondary}
          />
          <OpcaoPerfil
            icone="car-outline"
            texto="Minhas caronas"
            onPress={() => navigation.navigate('Reservas')}
            corTexto={tema.text}
            corBorda={tema.border}
            corIcone={tema.icon}
            corSeta={tema.iconSecondary}
          />
          <OpcaoPerfil
            icone="time-outline"
            texto="Histórico de caronas"
            onPress={() => navigation.navigate('Historico')}
            corTexto={tema.text}
            corBorda={tema.border}
            corIcone={tema.icon}
            corSeta={tema.iconSecondary}
          />
        </View>

        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>PREFERÊNCIAS</Text>
        <View style={[styles.opcoes, { backgroundColor: tema.card, borderColor: tema.border }]}>
          <OpcaoPerfil
            icone="settings-outline"
            texto="Configurações"
            onPress={() => navigation.navigate('Configuracoes')}
            corTexto={tema.text}
            corBorda={tema.border}
            corIcone={tema.icon}
            corSeta={tema.iconSecondary}
          />
        </View>

        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>CONTA</Text>
        <View style={[styles.opcoes, { backgroundColor: tema.card, borderColor: tema.border }]}>
          <TouchableOpacity
            style={[styles.opcaoSair, { borderBottomColor: 'transparent' }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={tema.danger} />
            <Text style={[styles.opcaoTexto, { color: tema.danger }]}>Sair da conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rodape} />
      </ScrollView>


      <Modal visible={modalLogout} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: tema.card, borderColor: tema.border }]}>
            <View style={styles.modalIcone}>
              <Ionicons name="log-out-outline" size={36} color={tema.danger} />
            </View>
            <Text style={[styles.modalTitulo, { color: tema.text }]}>Sair da conta</Text>
            <Text style={[styles.modalSubtitulo, { color: tema.textSecondary }]}>
              Deseja realmente sair da sua conta?
            </Text>
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotaoCancelar, { borderColor: tema.border }]}
                onPress={() => setModalLogout(false)}
              >
                <Text style={[styles.modalBotaoCancelarTexto, { color: tema.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBotaoConfirmar, { backgroundColor: tema.danger }]}
                onPress={confirmarLogout}
              >
                <Text style={styles.modalBotaoConfirmarTexto}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <Modal visible={modalResgatar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: tema.card, borderColor: tema.border }]}>
            <View style={styles.modalIcone}>
              <Ionicons name="ribbon-outline" size={36} color={tema.accent} />
            </View>
            <Text style={[styles.modalTitulo, { color: tema.text }]}>Resgatar Horas Complementares</Text>
            <Text style={[styles.modalSubtitulo, { color: tema.textSecondary }]}>
              Parabéns! Você completou {CARONAS_POR_SEMESTRE} caronas e conquistou {HORAS_POR_SEMESTRE}h complementares.
            </Text>
            <View style={[styles.modalInfo, { backgroundColor: tema.avatarBackground }]}>
              <Ionicons name="card-outline" size={16} color={tema.accent} />
              <Text style={[styles.modalInfoTexto, { color: tema.text }]}>
                Taxa de emissão do certificado: R$ 15,00
              </Text>
            </View>
            <Text style={[styles.modalAviso, { color: tema.textSecondary }]}>
              O certificado será enviado ao seu e-mail cadastrado.
            </Text>
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotaoCancelar, { borderColor: tema.border }]}
                onPress={() => setModalResgatar(false)}
              >
                <Text style={[styles.modalBotaoCancelarTexto, { color: tema.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBotaoConfirmar, { backgroundColor: tema.accent }]}
                onPress={confirmarResgatar}
              >
                <Text style={styles.modalBotaoConfirmarTexto}>Pagar R$ 15,00</Text>
              </TouchableOpacity>
            </View>
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
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 28,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  nome: {
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  curso: {
    fontSize: 13,
    marginTop: 2,
  },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  opcoes: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 14,
    borderBottomWidth: 1,
  },
  opcaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 14,
    borderBottomWidth: 1,
  },
  opcaoTexto: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  rodape: {
    height: 32,
  },
  horasCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  horasHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  horasSemTitulo: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  horasTotalBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFg: {
    height: '100%',
    borderRadius: 4,
  },
  horasInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  horasInfoLabel: {
    fontSize: 12,
  },
  metaContainer: {
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    flex: 1,
    fontSize: 12,
  },
  resgatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  resgatarBtnTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  horasConcluido: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  horasConcluidoTexto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
  },
  modalIcone: { marginBottom: 12 },
  modalTitulo: { fontSize: 17, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  modalSubtitulo: { fontSize: 14, textAlign: 'center', marginBottom: 14, lineHeight: 20 },
  modalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
    width: '100%',
  },
  modalInfoTexto: { fontSize: 14, fontWeight: '600', flex: 1 },
  modalAviso: { fontSize: 12, textAlign: 'center', marginBottom: 20 },
  modalBotoes: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalBotaoCancelarTexto: { fontSize: 14, fontWeight: 'bold' },
  modalBotaoConfirmar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBotaoConfirmarTexto: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
