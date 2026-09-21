import React, { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parse, isValid, isBefore, startOfDay } from 'date-fns';
import { Agendamento } from '../services/types';
import { verificarDisponibilidade } from '../services/disponibilidade';
import PlacaCamera from '../components/camera/PlacaCamera';

interface AgendamentoFormProps {
  onAgendamento: (novoAgendamento: Agendamento) => void;
  agendamentos: Agendamento[];
  onVoltar: () => void;
  onLogout: () => void;
}

const PLACA_REGEX = /^[A-Z]{3}(?:[0-9]{4}|[0-9][A-Z][0-9]{2})$/;
const HORA_REGEX = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function formatarData(texto: string) {
  const digits = texto.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function formatarHora(texto: string) {
  const digits = texto.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export default function AgendamentoForm({ agendamentos, onAgendamento, onVoltar, onLogout }: AgendamentoFormProps) {
  const [placa, setPlaca] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [tipoLavagem, setTipoLavagem] = useState('');
  const [listaTiposAberta, setListaTiposAberta] = useState(false);
  const [cameraAberta, setCameraAberta] = useState(false);
  const [fotoPlaca, setFotoPlaca] = useState<string | null>(null);
  const placaInputRef = useRef<TextInput>(null);

  const disponibilidade = verificarDisponibilidade(data, horario, agendamentos);

  const handleLogout = () => {
    Alert.alert('Sair do aplicativo', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: onLogout },
    ]);
  };

  const handleAgendar = () => {
    const placaNormalizada = placa.trim().toUpperCase();
    const dataNormalizada = data.trim();
    const horarioNormalizado = horario.trim();
    const tipoNormalizado = tipoLavagem.trim();

    if (!PLACA_REGEX.test(placaNormalizada)) {
      Alert.alert('Placa inválida', 'Use o formato ABC1D23 ou ABC1234.'); return;
    }
    const dataConvertida = parse(dataNormalizada, 'dd/MM/yyyy', new Date());
    if (!isValid(dataConvertida) || dataNormalizada.length !== 10) {
      Alert.alert('Data inválida', 'Informe a data no formato DD/MM/AAAA.'); return;
    }
    if (isBefore(startOfDay(dataConvertida), startOfDay(new Date()))) {
      Alert.alert('Data inválida', 'Escolha hoje ou uma data futura.'); return;
    }
    if (!HORA_REGEX.test(horarioNormalizado)) {
      Alert.alert('Horário inválido', 'Informe o horário no formato HH:MM.'); return;
    }
    const [hora, minuto] = horarioNormalizado.split(':').map(Number);
    const totalMinutos = hora * 60 + minuto;
    if (totalMinutos < 600 || totalMinutos >= 1080 || (totalMinutos >= 720 && totalMinutos < 780)) {
      Alert.alert('Horário indisponível', 'O atendimento funciona das 10:00 às 18:00, com pausa das 12:00 às 13:00.'); return;
    }
    if (tipoNormalizado !== 'Simples' && tipoNormalizado !== 'Completa') {
      Alert.alert('Tipo inválido', 'Informe exatamente Simples ou Completa.'); return;
    }
    const disponibilidadeAtual = verificarDisponibilidade(dataNormalizada, horarioNormalizado, agendamentos);
    if (!disponibilidadeAtual.disponivel) {
      Alert.alert('Horário indisponível', disponibilidadeAtual.mensagem); return;
    }
    onAgendamento({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, placa: placaNormalizada, data: dataNormalizada, horario: horarioNormalizado, tipoLavagem: tipoNormalizado, fotoPlaca: fotoPlaca ?? undefined });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>Novo agendamento</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <Text style={styles.label}>Placa</Text>
        <View style={styles.plateOptions}>
          <TouchableOpacity style={[styles.plateOption, styles.plateOptionActive]} onPress={() => placaInputRef.current?.focus()} accessibilityRole="button">
            <Text style={styles.plateOptionText}>✍️ Digitar placa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.plateOption} onPress={() => setCameraAberta(true)} accessibilityRole="button">
            <Text style={styles.plateOptionText}>📷 Fotografar placa</Text>
          </TouchableOpacity>
        </View>
        <TextInput ref={placaInputRef} style={styles.input} value={placa} onChangeText={setPlaca} placeholder="ABC1D23" placeholderTextColor="#777" autoCapitalize="characters" maxLength={7} />
        {fotoPlaca && (
          <View style={styles.photoCard}>
            <Image source={{ uri: fotoPlaca }} style={styles.photoThumb} resizeMode="cover" />
            <View style={styles.photoInfo}>
              <Text style={styles.photoTitle}>Foto da placa adicionada</Text>
              <Text style={styles.photoText}>A foto será vinculada a este agendamento.</Text>
              <TouchableOpacity onPress={() => setCameraAberta(true)} accessibilityRole="button">
                <Text style={styles.photoAction}>Tirar outra foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <Text style={styles.label}>Data</Text>
        <TextInput style={styles.input} value={data} onChangeText={(text) => setData(formatarData(text))} placeholder="DD/MM/AAAA" placeholderTextColor="#777" keyboardType="number-pad" maxLength={10} />
        <Text style={styles.label}>Horário</Text>
        <TextInput style={styles.input} value={horario} onChangeText={(text) => setHorario(formatarHora(text))} placeholder="HH:MM" placeholderTextColor="#777" keyboardType="number-pad" maxLength={5} />

        {data.length === 10 && horario.length === 5 && (
          <View style={[styles.availabilityCard, disponibilidade.disponivel ? styles.availabilityAvailable : styles.availabilityUnavailable]}>
            <Text style={styles.availabilityIcon}>{disponibilidade.disponivel ? '✓' : '!'}</Text>
            <View style={styles.availabilityInfo}>
              <Text style={[styles.availabilityTitle, disponibilidade.disponivel ? styles.availableText : styles.unavailableText]}>
                {disponibilidade.disponivel ? 'Horário disponível' : 'Horário indisponível'}
              </Text>
              <Text style={styles.availabilityMessage}>{disponibilidade.mensagem}</Text>
            </View>
          </View>
        )}
        <Text style={styles.label}>Tipo de lavagem</Text>
        <TouchableOpacity
          style={styles.select}
          onPress={() => setListaTiposAberta((aberta) => !aberta)}
          accessibilityRole="button"
          accessibilityLabel="Selecionar tipo de lavagem"
          accessibilityState={{ expanded: listaTiposAberta }}
        >
          <Text style={[styles.selectText, !tipoLavagem && styles.placeholderText]}>
            {tipoLavagem || 'Selecione o tipo de lavagem'}
          </Text>
          <Text style={styles.selectArrow}>{listaTiposAberta ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {listaTiposAberta && (
          <View style={styles.optionsList}>
            {['Simples', 'Completa'].map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={styles.option}
                onPress={() => {
                  setTipoLavagem(tipo);
                  setListaTiposAberta(false);
                }}
                accessibilityRole="button"
              >
                <Text style={styles.optionText}>{tipo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={handleAgendar} accessibilityRole="button">
          <Text style={styles.primaryText}>Confirmar agendamento</Text>
        </TouchableOpacity>
      </ScrollView>

      <PlacaCamera visible={cameraAberta} onClose={() => setCameraAberta(false)} onPhotoTaken={setFotoPlaca} />

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.backButton} onPress={onVoltar} accessibilityRole="button">
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button">
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1 },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 32 },
  title: { color: '#ffffff', fontSize: 23, fontWeight: '800', textAlign: 'center', width: '100%' },
  label: { color: '#ffffff', fontSize: 16, marginBottom: 6 },
  plateOptions: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  plateOption: { flex: 1, backgroundColor: '#303030', paddingVertical: 12, borderRadius: 9, alignItems: 'center', borderWidth: 1, borderColor: '#444444' },
  plateOptionActive: { borderColor: '#00aeff' },
  plateOptionText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  input: { height: 50, borderWidth: 1, borderColor: '#333333', borderRadius: 9, paddingHorizontal: 14, color: '#ffffff', backgroundColor: '#161616', marginBottom: 16, fontSize: 16 },
  select: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#333333', borderRadius: 9, paddingHorizontal: 14, backgroundColor: '#161616' },
  selectText: { color: '#ffffff', fontSize: 16 },
  placeholderText: { color: '#777777' },
  selectArrow: { color: '#00aeff', fontSize: 14, fontWeight: '800', marginLeft: 12 },
  optionsList: { marginTop: 5, marginBottom: 16, borderWidth: 1, borderColor: '#333333', borderRadius: 9, overflow: 'hidden', backgroundColor: '#161616' },
  option: { minHeight: 50, justifyContent: 'center', paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' },
  optionText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  photoCard: { flexDirection: 'row', backgroundColor: '#161616', borderWidth: 1, borderColor: '#2b2b2b', borderRadius: 10, padding: 10, marginBottom: 15 },
  photoThumb: { width: 92, height: 64, borderRadius: 7, backgroundColor: '#000000' },
  photoInfo: { flex: 1, marginLeft: 10, justifyContent: 'center' },
  photoTitle: { color: '#ffffff', fontWeight: '700', marginBottom: 4 },
  photoText: { color: '#888888', fontSize: 12, lineHeight: 17, marginBottom: 5 },
  photoAction: { color: '#00aeff', fontWeight: '700', fontSize: 13 },
  availabilityCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 9, padding: 12, marginTop: -6, marginBottom: 16, borderWidth: 1 },
  availabilityAvailable: { backgroundColor: '#0d2a17', borderColor: '#237a3b' },
  availabilityUnavailable: { backgroundColor: '#2a1111', borderColor: '#8a3030' },
  availabilityIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#111111', color: '#ffffff', textAlign: 'center', textAlignVertical: 'center', fontSize: 18, fontWeight: '800', marginRight: 10 },
  availabilityInfo: { flex: 1 },
  availabilityTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  availableText: { color: '#5ee58a' },
  unavailableText: { color: '#ff7777' },
  availabilityMessage: { color: '#dddddd', fontSize: 13, lineHeight: 18 },
  primaryButton: { backgroundColor: '#0066cc', paddingVertical: 15, borderRadius: 9, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#222222' },
  backButton: { flex: 1, marginRight: 8, backgroundColor: '#303030', paddingVertical: 13, borderRadius: 9, alignItems: 'center' },
  backText: { color: '#ffffff', fontWeight: '700' },
  logoutButton: { flex: 1, marginLeft: 8, backgroundColor: '#a00000', paddingVertical: 13, borderRadius: 9, alignItems: 'center' },
  logoutText: { color: '#ffffff', fontWeight: '700' },
});
