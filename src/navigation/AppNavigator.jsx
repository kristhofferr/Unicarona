import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCarona } from '../context/CaronaContext';

import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import MapaScreen from '../screens/MapaScreen';
import OfereceCaronaScreen from '../screens/OfereceCaronaScreen';
import BuscarCaronaScreen from '../screens/BuscarCaronaScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import EditarPerfilScreen from '../screens/EditarPerfilScreen';
import ChatScreen from '../screens/ChatScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { usuario } = useCarona();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {usuario ? (
          <>
            <Stack.Screen name="MainTabs"       component={MainTabs} />
            <Stack.Screen name="Mapa"           component={MapaScreen} />
            <Stack.Screen name="OfereceCarona"  component={OfereceCaronaScreen} />
            <Stack.Screen name="BuscarCarona"   component={BuscarCaronaScreen} />
            <Stack.Screen name="Configuracoes"  component={ConfiguracoesScreen} />
            <Stack.Screen name="EditarPerfil"   component={EditarPerfilScreen} />
            <Stack.Screen name="Chat"           component={ChatScreen} />
            <Stack.Screen name="Historico"      component={HistoricoScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login"    component={LoginScreen} options={{ animationTypeForReplace: 'pop' }} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
