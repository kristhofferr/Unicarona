// Componente raiz do aplicativo Unicarona.
// Envolve toda a aplicação com o CaronaProvider (estado global) e
// registra os overlays globais de notificação e avaliação de carona.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CaronaProvider } from './src/context/CaronaContext';
import AppNavigator from './src/navigation/AppNavigator';
import NotificacaoOverlay from './src/components/NotificacaoOverlay';
import AvaliacaoOverlay from './src/components/AvaliacaoOverlay';

export default function App() {
  return (
    <CaronaProvider>
      <View style={styles.root}>
        <AppNavigator />
        <NotificacaoOverlay />
        <AvaliacaoOverlay />
      </View>
    </CaronaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
