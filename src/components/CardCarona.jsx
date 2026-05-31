import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CardCarona({ carona, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cabecalho}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color="#2563EB" />
        </View>
        <View style={styles.info}>
          <Text style={styles.nome}>{carona.nome}</Text>
          <Text style={styles.veiculo}>{carona.veiculo} • {carona.placa}</Text>
        </View>
        <View style={styles.avaliacao}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.avaliacaoTexto}>{carona.avaliacao}</Text>
        </View>
      </View>

      <View style={styles.rota}>
        <View style={styles.linhaRota}>
          <Ionicons name="radio-button-on" size={16} color="#22C55E" />
          <Text style={styles.textoRota}>{carona.origem}</Text>
        </View>
        <View style={styles.linhaRota}>
          <Ionicons name="location" size={16} color="#EF4444" />
          <Text style={styles.textoRota}>{carona.destino}</Text>
        </View>
      </View>

      <View style={styles.rodape}>
        <View style={styles.detalhe}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.detalheTexto}>{carona.horario}</Text>
        </View>
        <View style={styles.detalhe}>
          <Ionicons name="people-outline" size={14} color="#6B7280" />
          <Text style={styles.detalheTexto}>{carona.vagas} vagas</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  veiculo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  avaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avaliacaoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  rota: {
    gap: 6,
    marginBottom: 12,
  },
  linhaRota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoRota: {
    fontSize: 14,
    color: '#374151',
  },
  rodape: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detalhe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detalheTexto: {
    fontSize: 13,
    color: '#6B7280',
  },
});
