import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { obterClienteBiometriaId } from '../servicos/segurancaUsuario';
import { buscarClientePorId } from '../services/database';

const { width } = Dimensions.get('window');

interface Props {
  onEnter: () => void;
  onCadastro: () => void;
}

function FaceIdIcon({ scanning }: { scanning: boolean }) {
  const scan = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!scanning) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(scan, { toValue: 1, duration: 1400, useNativeDriver: true }),
      Animated.timing(scan, { toValue: 0, duration: 1400, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [scan, scanning]);
  const translateY = scan.interpolate({ inputRange: [0, 1], outputRange: [-42, 42] });
  return (
    <View style={styles.faceIdIcon}>
      <View style={[styles.corner, styles.cornerTL]} /><View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} /><View style={[styles.corner, styles.cornerBR]} />
      <View style={styles.faceOval}><View style={styles.eyeRow}><View style={styles.eye} /><View style={styles.eye} /></View><View style={styles.nose} /><View style={styles.mouth} /></View>
      {scanning && <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />}
    </View>
  );
}

export default function LoginScreen({ onEnter, onCadastro }: Props) {
  const [authenticating, setAuthenticating] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometria');
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const id = await obterClienteBiometriaId();
        setHasSavedProfile(!!id && !!(await buscarClientePorId(id)));
        const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setBiometricLabel(supported.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) ? 'Face ID' : 'Biometria');
      } catch { setHasSavedProfile(false); }
    })();
  }, []);

  const handleBiometrics = useCallback(async () => {
    if (authenticating) return;
    setAuthenticating(true);
    try {
      const id = await obterClienteBiometriaId();
      if (!id || !(await buscarClientePorId(id))) {
        Alert.alert('Cadastro não encontrado', 'Faça seu cadastro primeiro para ativar o acesso por biometria.');
        return;
      }
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert('Biometria indisponível', 'Cadastre uma biometria no aparelho e tente novamente.');
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Entrar no SteticCar com ${biometricLabel}`,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar código do aparelho',
        disableDeviceFallback: false,
      });
      if (result.success) onEnter();
    } catch {
      Alert.alert('Biometria indisponível', 'Não foi possível usar a biometria neste momento.');
    } finally { setAuthenticating(false); }
  }, [authenticating, biometricLabel, onEnter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      <View style={styles.container}>
        <Image source={require('../assets/logo.png')} style={styles.coverLogo} resizeMode="contain" />
        <Text style={styles.title}>SteticCar</Text>
        <Text style={styles.subtitle}>ESTÉTICA AUTOMOTIVA</Text>
        <View style={styles.card}>
          <Text style={styles.welcome}>Bem-vindo</Text>
          <Text style={styles.description}>Cadastre seus dados para ter uma experiência personalizada e usar biometria no acesso.</Text>
          <TouchableOpacity style={styles.enterButton} onPress={onEnter}><Text style={styles.enterText}>Entrar no aplicativo</Text></TouchableOpacity>
          <TouchableOpacity style={styles.registerButton} onPress={onCadastro}><Text style={styles.registerText}>Criar meu cadastro</Text></TouchableOpacity>
        </View>
        <View style={styles.biometricCard}>
          <FaceIdIcon scanning={authenticating} />
          <Text style={styles.biometricTitle}>{authenticating ? `Aguardando ${biometricLabel}...` : `Acesso por ${biometricLabel}`}</Text>
          <Text style={styles.biometricSubtitle}>{hasSavedProfile ? 'Use a biometria cadastrada no aparelho para entrar.' : 'Depois do cadastro, você poderá ativar o Face ID ou a biometria.'}</Text>
          <TouchableOpacity style={[styles.biometricButton, !hasSavedProfile && styles.biometricDisabled]} onPress={handleBiometrics} disabled={authenticating || !hasSavedProfile}>
            <Text style={styles.biometricButtonText}>{hasSavedProfile ? (authenticating ? 'Autenticando...' : `Usar ${biometricLabel}`) : 'Cadastre-se primeiro'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: 20 },
  coverLogo: { width: width * 0.58, height: width * 0.34, marginBottom: 2 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginTop: 4 },
  subtitle: { fontSize: 14, color: '#00aeff', letterSpacing: 2, marginBottom: 16, fontWeight: '600' },
  card: { width: '100%', maxWidth: 380, backgroundColor: '#101010', borderWidth: 1, borderColor: '#242424', borderRadius: 18, padding: 20, marginBottom: 12 },
  welcome: { color: '#ffffff', fontSize: 21, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  description: { color: '#999999', fontSize: 13, textAlign: 'center', marginBottom: 16, lineHeight: 19 },
  enterButton: { backgroundColor: '#0066cc', borderWidth: 1, borderColor: '#00aeff', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  enterText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  registerButton: { backgroundColor: '#242424', borderWidth: 1, borderColor: '#444', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  registerText: { color: '#fff', fontWeight: '700' },
  biometricCard: { width: '100%', maxWidth: 380, backgroundColor: '#101010', borderWidth: 1, borderColor: '#242424', borderRadius: 18, padding: 18, alignItems: 'center' },
  faceIdIcon: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', marginBottom: 10 },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: '#00aeff' },
  cornerTL: { left: 0, top: 0, borderLeftWidth: 2, borderTopWidth: 2 }, cornerTR: { right: 0, top: 0, borderRightWidth: 2, borderTopWidth: 2 }, cornerBL: { left: 0, bottom: 0, borderLeftWidth: 2, borderBottomWidth: 2 }, cornerBR: { right: 0, bottom: 0, borderRightWidth: 2, borderBottomWidth: 2 },
  faceOval: { width: 54, height: 66, borderWidth: 2, borderColor: '#00aeff', borderRadius: 28, alignItems: 'center', paddingTop: 18 },
  eyeRow: { flexDirection: 'row', gap: 16 }, eye: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#00aeff' }, nose: { width: 2, height: 10, backgroundColor: '#00aeff', marginTop: 5 }, mouth: { width: 18, height: 7, borderBottomWidth: 2, borderColor: '#00aeff', borderRadius: 10 },
  scanLine: { position: 'absolute', width: 70, height: 2, backgroundColor: '#00aeff' },
  biometricTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 5 }, biometricSubtitle: { color: '#999', fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  biometricButton: { width: '100%', backgroundColor: '#303030', borderColor: '#00aeff', borderWidth: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center' }, biometricDisabled: { opacity: 0.65 }, biometricButtonText: { color: '#fff', fontWeight: '800' },
});
