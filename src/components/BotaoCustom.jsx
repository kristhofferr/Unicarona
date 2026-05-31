import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function BotaoCustom({ titulo, onPress, variante = 'primario', carregando = false, desabilitado = false }) {
  const estiloContainer = [
    styles.botao,
    variante === 'secundario' && styles.botaoSecundario,
    (desabilitado || carregando) && styles.botaoDesabilitado,
  ];

  const estiloTexto = [
    styles.texto,
    variante === 'secundario' && styles.textoSecundario,
  ];

  return (
    <TouchableOpacity
      style={estiloContainer}
      onPress={onPress}
      disabled={desabilitado || carregando}
      activeOpacity={0.8}
    >
      {carregando ? (
        <ActivityIndicator color={variante === 'secundario' ? '#2563EB' : '#fff'} />
      ) : (
        <Text style={estiloTexto}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  texto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  textoSecundario: {
    color: '#2563EB',
  },
});
