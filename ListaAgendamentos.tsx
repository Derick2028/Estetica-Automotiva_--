import React from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Agendamento } from '../services/types';

interface Props { agendamentos: Agendamento[]; onVoltar: () => void; onNovoAgendamento: () => void; onLogout: () => void; onEditar: (agendamento: Agendamento) => void; onCancelar: (id: string) => void; }

export default function ListaAgendamentos({ agendamentos, onVoltar, onNovoAgendamento, onLogout, onEditar, onCancelar }: Props) {
  const ordenados = [...agendamentos].sort((a, b) => {
    const dataHoraA = `${a.data.split('/').reverse().join('-')}T${a.horario}:00`;
    const dataHoraB = `${b.data.split('/').reverse().join('-')}T${b.horario}:00`;
    return dataHoraA.localeCompare(dataHoraB);
  });

  const handleLogout = () => Alert.alert('Sair do aplicativo', 'Deseja realmente sair?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Sair', style: 'destructive', onPress: onLogout },
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Agendamentos</Text>
        </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {ordenados.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nenhum agendamento</Text>
            <Text style={styles.emptyText}>Cadastre um novo agendamento para ele aparecer aqui.</Text>
          </View>
        ) : (
          ordenados.map((agendamento) => (
            <View key={agendamento.id} style={styles.card}>
              <Text style={styles.cardTitle}>{agendamento.placa}</Text>
              <Text style={styles.text}>Data: {agendamento.data}</Text>
              <Text style={styles.text}>Horário: {agendamento.horario}</Text>
              <Text style={styles.text}>Lavagem: {agendamento.tipoLavagem}</Text>
              {agendamento.fotoPlaca && <Image source={{ uri: agendamento.fotoPlaca }} style={styles.platePhoto} resizeMode="cover" />}
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => onEditar(agendamento)} accessibilityRole="button">
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => onCancelar(agendamento.id)} accessibilityRole="button">
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.primaryButton} onPress={onNovoAgendamento} accessibilityRole="button">
          <Text style={styles.primaryText}>Novo agendamento</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.backButton} onPress={onVoltar} accessibilityRole="button">
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button">
          <Text style={styles.logoutText}>Sair</Text>
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
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 30 },
  header: { minHeight: 64, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#000000', borderBottomWidth: 1, borderBottomColor: '#222222' },
  title: { color: '#ffffff', fontSize: 23, fontWeight: '800', textAlign: 'center', width: '100%' },
  emptyCard: { backgroundColor: '#161616', borderRadius: 10, padding: 20, borderWidth: 1, borderColor: '#2b2b2b' },
  emptyTitle: { color: '#ffffff', fontSize: 19, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#999999', lineHeight: 20 },
  card: { backgroundColor: '#161616', borderWidth: 1, borderColor: '#2b2b2b', borderRadius: 10, padding: 15, marginBottom: 10 },
  cardTitle: { color: '#00aeff', fontSize: 19, fontWeight: '700', marginBottom: 8 },
  text: { color: '#ffffff', marginTop: 3 },
  platePhoto: { width: '100%', height: 130, borderRadius: 8, marginTop: 10, backgroundColor: '#000000' },
  primaryButton: { backgroundColor: '#0066cc', paddingVertical: 15, borderRadius: 9, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  cardActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  editButton: { flex: 1, backgroundColor: '#0066cc', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  editText: { color: '#ffffff', fontWeight: '700' },
  cancelButton: { flex: 1, backgroundColor: '#6f0000', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelText: { color: '#ffffff', fontWeight: '700' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#222222' },
  backButton: { flex: 1, marginRight: 8, backgroundColor: '#303030', paddingVertical: 13, borderRadius: 9, alignItems: 'center' },
  backText: { color: '#ffffff', fontWeight: '700' },
  logoutButton: { flex: 1, marginLeft: 8, backgroundColor: '#a00000', paddingVertical: 13, borderRadius: 9, alignItems: 'center' },
  logoutText: { color: '#ffffff', fontWeight: '700' },
});
