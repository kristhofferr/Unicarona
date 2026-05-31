import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import MensagemFeedback from '../components/MensagemFeedback';
import { useCarona } from '../context/CaronaContext';

export default function ConfiguracoesScreen() {
  const { tema, temaAtual, toggleTema, raioBusca, atualizarRaioBusca } = useCarona();
  const [raioTemp, setRaioTemp] = useState(String(raioBusca));
  const [feedback, setFeedback] = useState({ id: 0, visivel: false, mensagem: '', tipo: 'sucesso' });

  function mostrar(mensagem, tipo) {
    setFeedback(prev => ({ id: prev.id + 1, visivel: true, mensagem, tipo }));
  }

  function salvarRaio() {
    const km = parseInt(raioTemp, 10);
    if (isNaN(km) || km < 1 || km > 500) {
      mostrar('Insira um raio entre 1 e 500 km.', 'erro');
      return;
    }
    atualizarRaioBusca(km);
    mostrar(`Raio de busca atualizado para ${km} km.`, 'sucesso');
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.background }]}>
      <Header
        titulo="Configurações"
        mostrarVoltar
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

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>APARÊNCIA</Text>
        <View style={[styles.card, { backgroundColor: tema.card, borderColor: tema.border }]}>
          <View style={styles.linha}>
            <View style={styles.linhaEsquerda}>
              <Ionicons name="moon-outline" size={22} color={tema.icon} />
              <Text style={[styles.linhaTexto, { color: tema.text }]}>Tema escuro</Text>
            </View>
            <Switch
              value={temaAtual === 'escuro'}
              onValueChange={toggleTema}
              trackColor={{ false: tema.switchTrackFalse, true: tema.switchTrackTrue }}
              thumbColor={tema.switchThumb}
              ios_backgroundColor={tema.switchTrackFalse}
            />
          </View>
        </View>

        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>BUSCA</Text>
        <View style={[styles.card, { backgroundColor: tema.card, borderColor: tema.border }]}>
          <View style={styles.linha}>
            <View style={styles.linhaEsquerda}>
              <Ionicons name="navigate-circle-outline" size={22} color={tema.icon} />
              <View>
                <Text style={[styles.linhaTexto, { color: tema.text }]}>Raio de busca</Text>
                <Text style={[styles.linhaSubtexto, { color: tema.textSecondary }]}>
                  Distância máxima para encontrar caronas
                </Text>
              </View>
            </View>
            <View style={styles.raioContainer}>
              <TextInput
                style={[
                  styles.raioInput,
                  {
                    backgroundColor: tema.inputBackground,
                    color: tema.text,
                    borderColor: tema.borderInput,
                  },
                ]}
                value={raioTemp}
                onChangeText={setRaioTemp}
                keyboardType="numeric"
                maxLength={3}
                selectTextOnFocus
              />
              <Text style={[styles.raioUnidade, { color: tema.textSecondary }]}>km</Text>
            </View>
          </View>

          <View style={[styles.separador, { backgroundColor: tema.border }]} />

          <TouchableOpacity
            style={[styles.botaoSalvarRaio, { backgroundColor: tema.primary }]}
            onPress={salvarRaio}
            activeOpacity={0.85}
          >
            <Text style={styles.botaoSalvarRaioTexto}>Salvar raio</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rodape}>
          <Text style={[styles.rodapeTexto, { color: tema.textSecondary }]}>
            Unicarona v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  linhaEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  linhaTexto: {
    fontSize: 15,
    fontWeight: '500',
  },
  linhaSubtexto: {
    fontSize: 12,
    marginTop: 2,
  },
  raioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  raioInput: {
    width: 60,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  raioUnidade: {
    fontSize: 14,
    fontWeight: '600',
  },
  separador: {
    height: 1,
    marginHorizontal: 16,
  },
  botaoSalvarRaio: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoSalvarRaioTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  rodape: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  rodapeTexto: {
    fontSize: 12,
  },
});
