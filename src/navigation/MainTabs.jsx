import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useCarona } from '../context/CaronaContext';

import HomeScreen from '../screens/HomeScreen';
import MinhasCaronasScreen from '../screens/MinhasCaronasScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import PerfilScreen from '../screens/PerfilScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { notificacoesNaoLidas, tema } = useCarona();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tema.tabBarBg,
          borderTopColor: tema.tabBarBorder,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: tema.tabBarActive,
        tabBarInactiveTintColor: tema.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Caronas:      focused ? 'car'           : 'car-outline',
            Reservas:     focused ? 'bookmark'      : 'bookmark-outline',
            Notificacoes: focused ? 'notifications' : 'notifications-outline',
            Perfil:       focused ? 'person'        : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Caronas"      component={HomeScreen}          options={{ tabBarLabel: 'Caronas' }} />
      <Tab.Screen name="Reservas"     component={MinhasCaronasScreen} options={{ tabBarLabel: 'Reservas' }} />
      <Tab.Screen
        name="Notificacoes"
        component={NotificacoesScreen}
        options={{
          tabBarLabel: 'Notificações',
          tabBarBadge: notificacoesNaoLidas > 0 ? notificacoesNaoLidas : undefined,
          tabBarBadgeStyle: { backgroundColor: '#e94560', fontSize: 10 },
        }}
      />
      <Tab.Screen name="Perfil"       component={PerfilScreen}        options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}
