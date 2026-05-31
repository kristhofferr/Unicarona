// Tela de notificações do usuário.
// Exibe todas as notificações recebidas (confirmações de carona, avaliações etc).
// Marca todas como lidas automaticamente 600ms após a tela ser aberta.
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarona } from '../context/CaronaContext';

const CONFIG = {
  'checkmark-circle': { cor: '#059669', fundo: '#ECFDF5' },
  'car':              { cor: '#2563EB', fundo: '#EFF6FF' },
  'star':             { cor: '#D97706', fundo: '#FFFBEB' },
};

function formatarTempo(data) {
  const diff = Math.floor((Date.now() - new Date(data)) / 1000);
  if (diff < 5)    return 'Agora mesmo';
  if (diff < 60)   return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

function ItemNotificacao({ item, tema }) {
  const cfg = CONFIG[item.icone] ?? { cor: '#6B7280', fundo: '#F3F4F6' };

  return (
    <View style={[
      styles.item,
      !item.lida && { backgroundColor: 'rgba(233,69,96,0.05)', borderRadius: 10, paddingHorizontal: 8, marginHorizontal: -4 },
    ]}>
      <View style={[styles.iconeWrap, { backgroundColor: cfg.fundo }]}>
        <Ionicons name={item.icone} size={22} color={cfg.cor} />
      </View>
      <View style={styles.itemTextos}>
        <View style={styles.itemTopo}>
          <Text style={[styles.itemTitulo, { color: tema.darkText }]}>{item.titulo}</Text>
          {!item.lida && <View style={[styles.bolinha, { backgroundColor: tema.accent }]} />}
        </View>
        <Text style={[styles.itemMensagem, { color: tema.darkTextSecondary }]}>{item.mensagem}</Text>
        <Text style={[styles.itemTempo, { color: tema.darkTextTertiary }]}>{formatarTempo(item.tempo)}</Text>
      </View>
    </View>
  );
}

export default function NotificacoesScreen() {
  const { notificacoes, marcarTodasLidas, notificacoesNaoLidas, tema } = useCarona();

  useEffect(() => {
    const timer = setTimeout(marcarTodasLidas, 600);
    return () => clearTimeout(timer);
  }, [notificacoes.length]);

  return (
    <View style={[styles.container, { backgroundColor: tema.darkBg }]}>
      <View style={[styles.header, { borderBottomColor: tema.darkBorder }]}>
        <Text style={[styles.titulo, { color: tema.darkText }]}>Notificações</Text>
        {notificacoesNaoLidas > 0 && (
          <TouchableOpacity onPress={marcarTodasLidas} style={styles.botaoLidas}>
            <Text style={[styles.botaoLidasTexto, { color: tema.accent }]}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notificacoes}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <ItemNotificacao item={item} tema={tema} />}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={[styles.separador, { backgroundColor: tema.darkBorder }]} />}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="notifications-off-outline" size={52} color={tema.darkTextTertiary} />
            <Text style={[styles.vazioTexto, { color: tema.darkTextSecondary }]}>Nenhuma notificação</Text>
            <Text style={[styles.vazioSub, { color: tema.darkTextTertiary }]}>
              Você será avisado quando alguém confirmar sua carona.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  botaoLidas: { paddingBottom: 2 },
  botaoLidasTexto: { fontSize: 12, fontWeight: '600' },
  lista: { paddingVertical: 8, paddingHorizontal: 16, paddingBottom: 40 },
  separador: { height: 1, marginHorizontal: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  iconeWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  itemTextos: { flex: 1 },
  itemTopo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  itemTitulo: { fontSize: 14, fontWeight: '700', flex: 1 },
  bolinha: { width: 8, height: 8, borderRadius: 4 },
  itemMensagem: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  itemTempo: { fontSize: 11, fontWeight: '500' },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
    paddingHorizontal: 40,
  },
  vazioTexto: { fontSize: 16, fontWeight: 'bold' },
  vazioSub: { fontSize: 13, textAlign: 'center' },
});
