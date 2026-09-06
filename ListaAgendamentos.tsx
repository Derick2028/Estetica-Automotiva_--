import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Agendamento } from '../utils/types';

interface Props { agendamentos: Agendamento[]; onVoltar: () => void; onNovoAgendamento: () => void; onLogout: () => void; }

export default function ListaAgendamentos({ agendamentos, onVoltar, onNovoAgendamento, onLogout }: Props) {
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
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Agendamentos</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 30 },
  title: { color: '#ffffff', fontSize: 23, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  emptyCard: { backgroundColor: '#161616', borderRadius: 10, padding: 20, borderWidth: 1, borderColor: '#2b2b2b' },
  emptyTitle: { color: '#ffffff', fontSize: 19, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: '#999999', lineHeight: 20 },
  card: { backgroundColor: '#161616', borderWidth: 1, borderColor: '#2b2b2b', borderRadius: 10, padding: 15, marginBottom: 10 },
  cardTitle: { color: '#00aeff', fontSize: 19, fontWeight: '700', marginBottom: 8 },
  text: { color: '#ffffff', marginTop: 3 },
  primaryButton: { backgroundColor: '#0066cc', paddingVertical: 15, borderRadius: 9, alignItems: 'center', marginTop: 10 },
  primaryText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, backgroundColor: '#000000', borderTopWidth: 1, borderTopColor: '#222222' },
  backButton: { flex: 1, marginRight: 8, backgroundColor: '#303030', paddingVertical: 13, borderRadius: 9, alignItems: 'center' },
  backText: { color: '#ffffff', fontWeight: '700' },
  logoutButton: { flex: 1, marginLeft: 8, backgroundColor: '#a00000', paddingVertical: 13, borderRadius: 9, alignItems: 'center' },
  logoutText: { color: '#ffffff', fontWeight: '700' },
});
