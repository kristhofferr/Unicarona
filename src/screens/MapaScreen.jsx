// Tela de mapa interativo com a localização dos motoristas disponíveis.
// Solicita permissão de localização do dispositivo e centraliza o mapa
// na posição do usuário. Ao clicar em um marcador, exibe a rota da carona.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Header from '../components/Header';
import { useCarona } from '../context/CaronaContext';

export default function MapaScreen() {
  const [localizacao, setLocalizacao] = useState(null);
  const [erro, setErro] = useState(null);
  const [caronaSelecionada, setCaronaSelecionada] = useState(null);
  const [rota, setRota] = useState([]);
  const [carregandoRota, setCarregandoRota] = useState(false);
  const { caronas } = useCarona();

  // Busca a rota entre origem e destino da carona usando a API OSRM (OpenStreetMap)
  async function buscarRota(carona) {
    if (!carona.latitudeDestino || !carona.longitudeDestino) return;
    setCarregandoRota(true);
    setRota([]);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${carona.longitude},${carona.latitude};${carona.longitudeDestino},${carona.latitudeDestino}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => ({
        latitude: lat,
        longitude: lon,
      }));
      setRota(coords);
    } catch {
      // sem rota disponível
    } finally {
      setCarregandoRota(false);
    }
  }

  useEffect(() => {
    // Solicita permissão e obtém a localização atual ao montar a tela
    async function obterLocalizacao() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setLocalizacao({ latitude: -26.0820, longitude: -53.0548, latitudeDelta: 0.05, longitudeDelta: 0.05 });
          setErro('Permissão negada. Exibindo localização padrão.');
          return;
        }

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 15000)
        );
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const loc = await Promise.race([locationPromise, timeoutPromise]);
        const { latitude, longitude } = loc.coords;

        const dentroNoBrasil =
          latitude >= -33.75 && latitude <= 5.27 &&
          longitude >= -73.98 && longitude <= -28.84;

        if (dentroNoBrasil) {
          setLocalizacao({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        } else {
          setLocalizacao({ latitude: -26.0820, longitude: -53.0548, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        }

      } catch (e) {
        setLocalizacao({ latitude: -26.0820, longitude: -53.0548, latitudeDelta: 0.05, longitudeDelta: 0.05 });
        setErro('Usando localização padrão (Francisco Beltrão).');
      }
    }

    obterLocalizacao();
  }, []);

  return (
    <View style={styles.container}>
      <Header titulo="Mapa de caronas" mostrarVoltar />

      {!localizacao && !erro && (
        <View style={styles.centralizador}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.textoCarregando}>Obtendo localização...</Text>
        </View>
      )}

      {!localizacao && erro && (
        <View style={styles.centralizador}>
          <Text style={styles.textoErro}>{erro}</Text>
        </View>
      )}

      {localizacao && (
        <View style={{ flex: 1 }}>
          <MapView
            style={styles.mapa}
            initialRegion={{
              latitude: localizacao.latitude,
              longitude: localizacao.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation
            onPress={() => { setCaronaSelecionada(null); setRota([]); }}
          >
            {caronas.map(carona => (
              <Marker
                key={carona.id}
                coordinate={{ latitude: carona.latitude, longitude: carona.longitude }}
                onPress={() => { setCaronaSelecionada(carona); buscarRota(carona); }}
              >
                <View style={styles.marcadorCarona} />
              </Marker>
            ))}

            {rota.length > 1 && (
              <Polyline
                coordinates={rota}
                strokeColor="#2563EB"
                strokeWidth={4}
              />
            )}
          </MapView>

          {carregandoRota && (
            <View style={styles.carregandoRota}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.carregandoRotaTexto}>Calculando rota...</Text>
            </View>
          )}

          {erro && (
            <View style={styles.banner}>
              <Text style={styles.textoBanner}>{erro}</Text>
            </View>
          )}

          {caronaSelecionada && (
            <View style={styles.cardOverlay}>
              <View style={styles.card}>
                <View style={styles.cardCabecalho}>
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={22} color="#2563EB" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardNome}>{caronaSelecionada.nome}</Text>
                    <Text style={styles.cardCurso}>{caronaSelecionada.curso}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setCaronaSelecionada(null)}>
                    <Ionicons name="close" size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardRota}>
                  <View style={styles.linhaRota}>
                    <Ionicons name="radio-button-on" size={15} color="#22C55E" />
                    <Text style={styles.textoRota}>{caronaSelecionada.origem}</Text>
                  </View>
                  <View style={styles.linhaRota}>
                    <Ionicons name="location" size={15} color="#EF4444" />
                    <Text style={styles.textoRota}>{caronaSelecionada.destino}</Text>
                  </View>
                </View>

                <View style={styles.cardRodape}>
                  <View style={styles.detalhe}>
                    <Ionicons name="time-outline" size={13} color="#6B7280" />
                    <Text style={styles.detalheTexto}>{caronaSelecionada.horario}</Text>
                  </View>
                  <View style={styles.detalhe}>
                    <Ionicons name="people-outline" size={13} color="#6B7280" />
                    <Text style={styles.detalheTexto}>{caronaSelecionada.vagas} vagas</Text>
                  </View>
                  <View style={styles.detalhe}>
                    <Ionicons name="cash-outline" size={13} color="#6B7280" />
                    <Text style={styles.detalheTexto}>R$ {caronaSelecionada.valor}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mapa: {
    flex: 1,
  },
  centralizador: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  textoCarregando: {
    fontSize: 15,
    color: '#6B7280',
  },
  textoErro: {
    fontSize: 15,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  banner: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  textoBanner: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
  },
  carregandoRota: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  carregandoRotaTexto: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '500',
  },
  marcadorCarona: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  cardCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cardCurso: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cardRota: {
    gap: 6,
    marginBottom: 12,
  },
  linhaRota: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoRota: {
    fontSize: 14,
    color: '#374151',
  },
  cardRodape: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detalhe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detalheTexto: {
    fontSize: 12,
    color: '#6B7280',
  },
});
