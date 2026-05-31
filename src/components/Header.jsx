import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Header({ titulo, mostrarVoltar = false, acaoDireita, corFundo, corTexto, corBorda }) {
  const navigation = useNavigation();

  const bg = corFundo ?? '#fff';
  const textColor = corTexto ?? '#111827';
  const borderColor = corBorda ?? '#F3F4F6';

  return (
    <View style={[styles.container, { backgroundColor: bg, borderBottomColor: borderColor }]}>
      <View style={styles.esquerda}>
        {mostrarVoltar && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.titulo, { color: textColor }]} numberOfLines={1}>{titulo}</Text>

      <View style={styles.direita}>
        {acaoDireita && acaoDireita()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  esquerda: {
    width: 40,
  },
  titulo: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  direita: {
    width: 40,
    alignItems: 'flex-end',
  },
  botaoVoltar: {
    padding: 4,
  },
});
