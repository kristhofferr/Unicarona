
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarona } from '../context/CaronaContext';
import MensagemFeedback from '../components/MensagemFeedback';

export default function MinhasCaronasScreen({ navigation }) {
  const { caronas, caronasConfirmadas, cancelarCarona, tema } = useCarona();
  const [modalCarona, setModalCarona] = useState(null);
  const [feedback, setFeedback] = useState({ id: 0, visivel: false, mensagem: '', tipo: 'erro' });

  const minhasCaronas = caronas.filter(c => caronasConfirmadas.includes(c.id));

  function mostrar(mensagem, tipo = 'erro') {
    setFeedback(prev => ({ id: prev.id + 1, visivel: true, mensagem, tipo }));
  }

  function handleCancelarModal() {
    const nome = modalCarona.nome;
    cancelarCarona(modalCarona.id);
    setModalCarona(null);
    mostrar(`Carona com ${nome} cancelada.`);
  }

  function renderItem({ item }) {
    return (
      <View style={[styles.card, { backgroundColor: tema.darkCard, borderColor: tema.darkBorder }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: tema.accent }]}>
            <Text style={styles.avatarTexto}>{item.nome?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardNome, { color: tema.darkText }]}>{item.nome}</Text>
            <Text style={[styles.cardCurso, { color: tema.darkTextSecondary }]}>{item.curso}</Text>
          </View>
          <View style={[styles.tag, { borderColor: tema.success }]}>
            <Text style={[styles.tagTexto, { color: tema.success }]}>✓ Confirmada</Text>
          </View>
        </View>

        <View style={[styles.divisor, { backgroundColor: tema.darkBorder }]} />

        <View style={styles.rota}>
          <View style={styles.rotaItem}>
            <Ionicons name="radio-button-on" size={14} color={tema.success} />
            <Text style={[styles.rotaTexto, { color: tema.darkText }]}>{item.origem}</Text>
          </View>
          <View style={styles.rotaItem}>
            <Ionicons name="location" size={14} color={tema.accent} />
            <Text style={[styles.rotaTexto, { color: tema.darkText }]}>{item.destino}</Text>
          </View>
        </View>

        <View style={styles.detalhes}>
          <View style={styles.detalheItem}>
            <Ionicons name="time-outline" size={13} color={tema.darkTextSecondary} />
            <Text style={[styles.detalheTexto, { color: tema.darkTextSecondary }]}>{item.horario}</Text>
          </View>
          <View style={styles.detalheItem}>
            <Ionicons name="people-outline" size={13} color={tema.darkTextSecondary} />
            <Text style={[styles.detalheTexto, { color: tema.darkTextSecondary }]}>{item.vagas} vagas restantes</Text>
          </View>
          <View style={styles.detalheItem}>
            <Ionicons name={item.tipo === 'horas' ? 'school-outline' : 'cash-outline'} size={13} color={item.tipo === 'horas' ? tema.success : tema.darkTextSecondary} />
            <Text style={[styles.detalheTexto, { color: item.tipo === 'horas' ? tema.success : tema.darkTextSecondary }]}>
              {item.tipo === 'horas' ? 'Gratuita' : `R$ ${item.valor}`}
            </Text>
          </View>
        </View>

        <View style={styles.acoes}>
          <TouchableOpacity
            style={[styles.botaoChat, { borderColor: tema.accentBlue }]}
            onPress={() => navigation.navigate('Chat', { caronaId: item.id, nomeMotorista: item.nome })}
          >
            <Ionicons name="chatbubble-outline" size={15} color={tema.accentBlue} />
            <Text style={[styles.botaoChatTexto, { color: tema.accentBlue }]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoCancelar, { borderColor: tema.accent }]}
            onPress={() => setModalCarona(item)}
          >
            <Ionicons name="close-circle-outline" size={15} color={tema.accent} />
            <Text style={[styles.botaoCancelarTexto, { color: tema.accent }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.darkBg }]}>
      <View style={[styles.header, { borderBottomColor: tema.darkBorder }]}>
        <Text style={[styles.titulo, { color: tema.darkText }]}>Minhas Caronas</Text>
      </View>

      {feedback.visivel && (
        <MensagemFeedback
          key={feedback.id}
          mensagem={feedback.mensagem}
          tipo={feedback.tipo}
          onDismiss={() => setFeedback(prev => ({ ...prev, visivel: false }))}
        />
      )}

      <FlatList
        data={minhasCaronas}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="car-outline" size={48} color={tema.darkTextTertiary} />
            <Text style={[styles.vazioTexto, { color: tema.darkTextSecondary }]}>Nenhuma carona confirmada</Text>
            <Text style={[styles.vazioSub, { color: tema.darkTextTertiary }]}>
              Busque e confirme uma carona para ela aparecer aqui.
            </Text>
          </View>
        }
      />

      <Modal visible={!!modalCarona} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: tema.darkCard, borderColor: tema.darkBorder }]}>
            <View style={styles.modalIcone}>
              <Ionicons name="alert-circle-outline" size={36} color={tema.accent} />
            </View>
            <Text style={[styles.modalTitulo, { color: tema.darkText }]}>Cancelar carona</Text>
            <Text style={[styles.modalSubtitulo, { color: tema.darkTextSecondary }]}>
              Tem certeza que deseja cancelar a carona com{' '}
              <Text style={[styles.modalNome, { color: tema.darkText }]}>{modalCarona?.nome}</Text>?
            </Text>
            <Text style={[styles.modalAviso, { color: tema.darkTextTertiary }]}>
              A vaga será devolvida automaticamente.
            </Text>

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotaoVoltar, { borderColor: tema.darkBorder }]}
                onPress={() => setModalCarona(null)}
              >
                <Text style={[styles.modalBotaoVoltarTexto, { color: tema.darkTextSecondary }]}>Manter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBotaoCancelar2, { backgroundColor: tema.accent }]}
                onPress={handleCancelarModal}
              >
                <Text style={styles.modalBotaoCancelarTexto2}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  lista: { paddingHorizontal: 25, paddingBottom: 40, paddingTop: 8 },
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
  cardCurso: { fontSize: 12, marginTop: 2 },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(46, 213, 115, 0.12)',
  },
  tagTexto: { fontSize: 11, fontWeight: 'bold' },
  divisor: { height: 1, marginBottom: 12 },
  rota: { gap: 6, marginBottom: 12 },
  rotaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rotaTexto: { fontSize: 13 },
  detalhes: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  detalheItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detalheTexto: { fontSize: 12 },
  acoes: { flexDirection: 'row', gap: 10 },
  botaoChat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
  },
  botaoChatTexto: { fontSize: 13, fontWeight: 'bold' },
  botaoCancelar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
  },
  botaoCancelarTexto: { fontSize: 13, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: { borderRadius: 16, padding: 24, width: '100%', alignItems: 'center', borderWidth: 1 },
  modalIcone: { marginBottom: 12 },
  modalTitulo: { fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
  modalSubtitulo: { fontSize: 14, textAlign: 'center', marginBottom: 6 },
  modalNome: { fontWeight: 'bold' },
  modalAviso: { fontSize: 12, marginBottom: 24 },
  modalBotoes: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBotaoVoltar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalBotaoVoltarTexto: { fontSize: 14, fontWeight: 'bold' },
  modalBotaoCancelar2: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalBotaoCancelarTexto2: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  vazio: { alignItems: 'center', paddingTop: 80, gap: 12 },
  vazioTexto: { fontSize: 16, fontWeight: 'bold' },
  vazioSub: { fontSize: 13, textAlign: 'center', paddingHorizontal: 20 },
});
