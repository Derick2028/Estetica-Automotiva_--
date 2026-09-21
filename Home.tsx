import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');

interface HomeProps {
  onAgendar: () => void;
  onVerAgendamentos: () => void;
  onLogout: () => void;
  onPerfil: () => void;
}

export default function Home({ onAgendar, onVerAgendamentos, onLogout, onPerfil }: HomeProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) setLocationDenied(true);
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        if (mounted) setLocation(currentLocation);
      } catch {
        if (mounted) setLocationDenied(true);
      }
    };
    loadLocation();
    return () => { mounted = false; };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Sua localização atual</Text>
        <View style={styles.mapContainer}>
          {location ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation
            >
              <Marker
                coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                title="Sua posição"
                description="Local para atendimento de estética automotiva"
              />
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.loadingText}>
                {locationDenied ? 'Permissão de localização não concedida.' : 'Obtendo sua localização...'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={onAgendar} accessibilityRole="button">
          <Text style={styles.actionButtonText}>Novo agendamento</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onPerfil} accessibilityRole="button"><Text style={styles.actionButtonText}>Meu perfil</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onVerAgendamentos} accessibilityRole="button">
          <Text style={styles.actionButtonText}>Ver agendamentos</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomSpacer} />
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} accessibilityRole="button">
          <Text style={styles.logoutText}>Sair do aplicativo</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1 },
  content: { paddingBottom: 28 },
  header: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10, backgroundColor: '#000000', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerLogo: { width: Math.min(width * 0.52, 240), height: 82 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  mapContainer: { height: 250, marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#00aeff', marginBottom: 20 },
  map: { width: '100%', height: '100%' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#161616', paddingHorizontal: 20 },
  loadingText: { color: '#888888', textAlign: 'center' },
  actionButton: { backgroundColor: '#0066cc', marginHorizontal: 16, marginTop: 10, paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  actionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#222222' },
  bottomSpacer: { flex: 1 },
  logoutButton: { minWidth: 150, backgroundColor: '#a00000', paddingHorizontal: 18, paddingVertical: 13, borderRadius: 9, alignItems: 'center' },
  logoutText: { color: '#ffffff', fontWeight: '700' },
});
