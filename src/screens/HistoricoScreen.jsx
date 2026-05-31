import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarona } from '../context/CaronaContext';
import Header from '../components/Header';

function formatarData(data) {
  const d = new Date(data);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function Estrelas({ nota }) {
  if (!nota) {
    return <Text style={styles.semAvaliacao}>Não avaliada</Text>;
  }
  return (
    <View style={styles.estrelasRow}>
      {[1, 2, 3, 4, 5].map(n => (
        <Ionicons
          key={n}
          name={n <= nota ? 'star' : 'star-outline'}
          size={14}
          color="#D97706"
        />
      ))}
    </View>
  );
}

export default function HistoricoScreen({ navigation }) {
  const { historicoCaronas, avaliacoes, tema } = useCarona();

  function renderItem({ item }) {
    const nota = avaliacoes[item.id];
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
          <View style={styles.cardDireita}>
            <Text style={[styles.cardValor, { color: tema.accent }]}>R$ {item.valor}</Text>
            <Text style={[styles.cardData, { color: tema.darkTextTertiary }]}>
              {formatarData(item.concluidaEm)}
            </Text>
          </View>
        </View>

        <View style={[styles.divisor, { backgroundColor: tema.darkBorder }]} />

        <View style={styles.rota}>
          <View style={styles.rotaItem}>
            <Ionicons name="radio-button-on" size={13} color={tema.success} />
            <Text style={[styles.rotaTexto, { color: tema.darkText }]}>{item.origem}</Text>
          </View>
          <View style={styles.rotaItem}>
            <Ionicons name="location" size={13} color={tema.accent} />
            <Text style={[styles.rotaTexto, { color: tema.darkText }]}>{item.destino}</Text>
          </View>
        </View>

        <View style={styles.rodape}>
          <Text style={[styles.rodapeDetalhe, { color: tema.darkTextSecondary }]}>
            🕐 {item.horario}
          </Text>
          <Estrelas nota={nota} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.darkBg }]}>
      <Header
        titulo="Histórico de Caronas"
        mostrarVoltar
        corFundo={tema.darkBg}
        corTexto={tema.darkText}
        corBorda={tema.darkBorder}
      />

      <FlatList
        data={[...historicoCaronas].reverse()}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="time-outline" size={52} color={tema.darkTextTertiary} />
            <Text style={[styles.vazioTexto, { color: tema.darkTextSecondary }]}>
              Nenhuma carona concluída ainda
            </Text>
            <Text style={[styles.vazioSub, { color: tema.darkTextTertiary }]}>
              Quando você concluir uma carona, ela aparecerá aqui.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lista: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardInfo: { flex: 1 },
  cardNome: { fontWeight: 'bold', fontSize: 14 },
  cardCurso: { fontSize: 12, marginTop: 2 },
  cardDireita: { alignItems: 'flex-end', gap: 3 },
  cardValor: { fontWeight: 'bold', fontSize: 14 },
  cardData: { fontSize: 11 },
  divisor: { height: 1, marginBottom: 12 },
  rota: { gap: 6, marginBottom: 12 },
  rotaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rotaTexto: { fontSize: 13 },
  rodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rodapeDetalhe: { fontSize: 12 },
  estrelasRow: { flexDirection: 'row', gap: 2 },
  semAvaliacao: { fontSize: 12, color: '#9CA3AF' },
  vazio: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  vazioTexto: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  vazioSub: { fontSize: 13, textAlign: 'center' },
});
