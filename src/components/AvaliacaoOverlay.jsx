import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarona } from '../context/CaronaContext';

export default function AvaliacaoOverlay() {
  const { avaliacaoPendente, avaliarCarona, dispensarAvaliacao } = useCarona();
  const [notaSelecionada, setNotaSelecionada] = useState(0);

  if (!avaliacaoPendente) return null;

  function handleAvaliar() {
    if (notaSelecionada === 0) return;
    avaliarCarona(avaliacaoPendente.id, notaSelecionada);
    setNotaSelecionada(0);
  }

  function handlePular() {
    dispensarAvaliacao();
    setNotaSelecionada(0);
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <View style={styles.iconeWrap}>
            <Ionicons name="star" size={32} color="#D97706" />
          </View>
          <Text style={styles.titulo}>Avalie sua carona</Text>
          <Text style={styles.subtitulo}>
            Como foi sua experiência com {avaliacaoPendente.nome}?
          </Text>
          <Text style={styles.rota}>
            {avaliacaoPendente.origem} → {avaliacaoPendente.destino}
          </Text>

          <View style={styles.estrelas}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setNotaSelecionada(n)} activeOpacity={0.7}>
                <Ionicons
                  name={n <= notaSelecionada ? 'star' : 'star-outline'}
                  size={40}
                  color={n <= notaSelecionada ? '#D97706' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.botoes}>
            <TouchableOpacity style={styles.botaoPular} onPress={handlePular}>
              <Text style={styles.botaoPularTexto}>Pular</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoAvaliar, notaSelecionada === 0 && styles.botaoDesabilitado]}
              onPress={handleAvaliar}
              disabled={notaSelecionada === 0}
            >
              <Text style={styles.botaoAvaliarTexto}>Avaliar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  iconeWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  rota: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  estrelas: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  botaoPular: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  botaoPularTexto: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 15,
  },
  botaoAvaliar: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#e94560',
  },
  botaoDesabilitado: {
    backgroundColor: '#D1D5DB',
  },
  botaoAvaliarTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
