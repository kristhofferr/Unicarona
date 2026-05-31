import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarona } from '../context/CaronaContext';

const CONFIG = {
  'checkmark-circle': { cor: '#059669', fundo: '#ECFDF5', borda: '#6EE7B7' },
  'car':              { cor: '#2563EB', fundo: '#EFF6FF', borda: '#93C5FD' },
  'star':             { cor: '#D97706', fundo: '#FFFBEB', borda: '#FCD34D' },
};

function NotifCard({ notif, onDismiss }) {
  const notifId = notif.id;
  const translateY = useRef(new Animated.Value(-130)).current;
  const opacidade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 75, friction: 11 }),
      Animated.timing(opacidade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(fechar, 4000);
    return () => clearTimeout(timer);
  }, []);

  function fechar() {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -130, duration: 280, useNativeDriver: true }),
      Animated.timing(opacidade, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => onDismiss(notifId));
  }

  const cfg = CONFIG[notif.icone] ?? CONFIG['checkmark-circle'];

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: cfg.fundo, borderColor: cfg.borda, opacity: opacidade, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.iconeWrap, { backgroundColor: cfg.cor + '22' }]}>
        <Ionicons name={notif.icone} size={26} color={cfg.cor} />
      </View>

      <View style={styles.textos}>
        <Text style={styles.titulo}>{notif.titulo}</Text>
        <Text style={styles.mensagem} numberOfLines={2}>{notif.mensagem}</Text>
      </View>

      <TouchableOpacity onPress={fechar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close" size={18} color="#6B7280" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NotificacaoOverlay() {
  const { notificacaoPendente, limparNotificacaoPendente } = useCarona();

  if (!notificacaoPendente) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <NotifCard
        key={notificacaoPendente.id}
        notif={notificacaoPendente}
        onDismiss={limparNotificacaoPendente}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 36,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 10,
  },
  iconeWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  mensagem: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
});
