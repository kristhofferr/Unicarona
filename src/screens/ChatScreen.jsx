import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarona } from '../context/CaronaContext';

function formatarHorario(data) {
  const d = new Date(data);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function ChatScreen({ navigation, route }) {
  const { caronaId, nomeMotorista } = route.params;
  const { mensagens, enviarMensagem, tema } = useCarona();
  const [texto, setTexto] = useState('');
  const listRef = useRef(null);

  const msgs = mensagens[caronaId] ?? [];

  useEffect(() => {
    if (msgs.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [msgs.length]);

  function handleEnviar() {
    const t = texto.trim();
    if (!t) return;
    setTexto('');
    enviarMensagem(caronaId, t);
  }

  function renderItem({ item }) {
    const minha = item.remetente === 'eu';
    return (
      <View style={[styles.msgRow, minha ? styles.msgRowMinha : styles.msgRowDele]}>
        <View style={[
          styles.bubble,
          { backgroundColor: minha ? tema.chatBubbleMine : tema.chatBubbleOther },
        ]}>
          <Text style={[styles.bubbleTexto, { color: minha ? tema.chatTextMine : tema.chatTextOther }]}>
            {item.texto}
          </Text>
          <Text style={[
            styles.bubbleHorario,
            { color: minha ? 'rgba(255,255,255,0.6)' : tema.darkTextTertiary },
          ]}>
            {formatarHorario(item.horario)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: tema.darkBg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { backgroundColor: tema.darkCard, borderBottomColor: tema.darkBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={tema.accent} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={[styles.avatar, { backgroundColor: tema.accent }]}>
            <Text style={styles.avatarTexto}>{nomeMotorista?.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={[styles.headerNome, { color: tema.darkText }]}>{nomeMotorista}</Text>
            <Text style={[styles.headerSub, { color: tema.darkTextSecondary }]}>Motorista</Text>
          </View>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="chatbubble-outline" size={44} color={tema.darkTextTertiary} />
            <Text style={[styles.vazioTexto, { color: tema.darkTextSecondary }]}>
              Inicie a conversa!
            </Text>
          </View>
        }
      />

      <View style={[styles.inputRow, { backgroundColor: tema.darkCard, borderTopColor: tema.darkBorder }]}>
        <TextInput
          style={[styles.input, {
            backgroundColor: tema.darkBg,
            color: tema.darkText,
            borderColor: tema.darkBorder,
          }]}
          placeholder="Digite uma mensagem..."
          placeholderTextColor={tema.darkTextTertiary}
          value={texto}
          onChangeText={setTexto}
          onSubmitEditing={handleEnviar}
          returnKeyType="send"
          multiline
        />
        <TouchableOpacity
          style={[
            styles.botaoEnviar,
            { backgroundColor: tema.accent },
            !texto.trim() && styles.botaoEnviarDesabilitado,
          ]}
          onPress={handleEnviar}
          disabled={!texto.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  headerNome: { fontSize: 15, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },
  lista: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  msgRow: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  msgRowMinha: { justifyContent: 'flex-end' },
  msgRowDele: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleTexto: { fontSize: 14, lineHeight: 20 },
  bubbleHorario: { fontSize: 10, alignSelf: 'flex-end' },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  vazioTexto: { fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  botaoEnviar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoEnviarDesabilitado: { opacity: 0.4 },
});
