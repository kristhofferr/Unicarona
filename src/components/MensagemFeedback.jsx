// Mensagem de feedback animada exibida no topo da tela.
// Suporta dois tipos: 'sucesso' (verde) e 'erro' (vermelho).
// Fecha automaticamente após 3 segundos ou ao tocar no ícone X.
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CONFIG = {
  sucesso: {
    fundo: '#ECFDF5',
    texto: '#065F46',
    borda: '#6EE7B7',
    icone: 'checkmark-circle',
  },
  erro: {
    fundo: '#FEF2F2',
    texto: '#991B1B',
    borda: '#FCA5A5',
    icone: 'alert-circle',
  },
};

// Props: mensagem (string), tipo ('sucesso'|'erro'), onDismiss (callback ao fechar)
export default function MensagemFeedback({ mensagem, tipo = 'sucesso', onDismiss }) {
  // Valores animados para fade in/out e deslizamento vertical
  const opacidade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    // Anima a entrada: fade in + desloca de -10 para 0 no eixo Y
    Animated.parallel([
      Animated.timing(opacidade, { toValue: 1, duration: 230, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 230, useNativeDriver: true }),
    ]).start();

    // Fecha automaticamente após 3 segundos
    const timer = setTimeout(fechar, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Anima a saída e chama o callback onDismiss ao terminar
  function fechar() {
    Animated.parallel([
      Animated.timing(opacidade, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -10, duration: 180, useNativeDriver: true }),
    ]).start(() => onDismiss?.());
  }

  const cores = CONFIG[tipo] ?? CONFIG.sucesso;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: cores.fundo, borderColor: cores.borda, opacity: opacidade, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={cores.icone} size={20} color={cores.texto} />
      <Text style={[styles.texto, { color: cores.texto }]} numberOfLines={2}>{mensagem}</Text>
      <TouchableOpacity onPress={fechar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={18} color={cores.texto} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  texto: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },
});
