import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { criarCliente, buscarClientePorCelular, buscarClientePorPlaca } from '../services/database';
import { salvarClienteBiometria, salvarSenha } from '../servicos/segurancaUsuario';

interface Props {
  onCadastroConcluido: (id: number) => void;
  onVoltar: () => void;
}

function formatarCelular(texto: string) {
  const digits = texto.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function normalizarPlaca(texto: string) {
  return texto.replace(/[^a-zA-Z0-9]/g, '').slice(0, 7).toUpperCase();
}

const PLACA_REGEX = /^[A-Z]{3}(?:[0-9]{4}|[0-9][A-Z][0-9]{2})$/;

export default function CadastroCliente({ onCadastroConcluido, onVoltar }: Props) {
  const [nome, setNome] = useState('');
  const [celular, setCelular] = useState('');
  const [endereco, setEndereco] = useState('');
  const [placa, setPlaca] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  const cadastrar = async () => {
    if (salvando) return;
    const nomeFinal = nome.trim();
    const celularFinal = celular.replace(/\D/g, '');
    const enderecoFinal = endereco.trim();
    const placaFinal = normalizarPlaca(placa);

    if (nomeFinal.length < 3) return Alert.alert('Nome inválido', 'Informe seu nome completo.');
    if (celularFinal.length < 10 || celularFinal.length > 11) return Alert.alert('Celular inválido', 'Informe um número de celular válido.');
    if (enderecoFinal.length < 5) return Alert.alert('Endereço inválido', 'Informe seu endereço.');
    if (senha.length < 6) return Alert.alert('Senha inválida', 'Crie uma senha com pelo menos 6 caracteres.');
    if (senha !== confirmarSenha) return Alert.alert('Senhas diferentes', 'A confirmação da senha não confere.');
    if (!PLACA_REGEX.test(placaFinal)) return Alert.alert('Placa inválida', 'Use o formato ABC1234 ou ABC1D23.');

    setSalvando(true);
    try {
      if (await buscarClientePorCelular(celularFinal)) {
        Alert.alert('Cadastro já existe', 'Já existe um cadastro com este número de celular.');
        return;
      }
      if (await buscarClientePorPlaca(placaFinal)) {
        Alert.alert('Placa já cadastrada', 'Esta placa já está vinculada a outro cadastro.');
        return;
      }

      const id = await criarCliente({ nome: nomeFinal, celular: celularFinal, endereco: enderecoFinal, placa: placaFinal, foto_perfil: null });
      await salvarSenha(id, senha);
      const hardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = hardware && await LocalAuthentication.isEnrolledAsync();
      if (enrolled) {
        Alert.alert(
          'Cadastro concluído',
          'Deseja ativar o Face ID/biometria para entrar mais rápido nas próximas vezes?',
          [
            { text: 'Agora não', onPress: () => onCadastroConcluido(id) },
            {
              text: 'Ativar',
              onPress: async () => {
                try {
                  const auth = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Confirme para ativar o acesso do SteticCar',
                    cancelLabel: 'Cancelar',
                  });
                  if (auth.success) await salvarClienteBiometria(id);
                } catch { /* segue sem biometria */ }
                onCadastroConcluido(id);
              },
            },
          ],
        );
      } else {
        Alert.alert('Cadastro concluído', 'Seu cadastro foi salvo com sucesso.', [{ text: 'Continuar', onPress: () => onCadastroConcluido(id) }]);
      }
    } catch (error: any) {
      Alert.alert('Erro no cadastro', error?.message || 'Não foi possível salvar seus dados.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Criar cadastro</Text>
          <Text style={styles.subtitle}>Preencha seus dados para usar o SteticCar.</Text>

          <Text style={styles.label}>Nome completo</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Digite seu nome" placeholderTextColor="#777" autoCapitalize="words" />

          <Text style={styles.label}>Número do celular</Text>
          <TextInput style={styles.input} value={celular} onChangeText={(v) => setCelular(formatarCelular(v))} placeholder="(00) 00000-0000" placeholderTextColor="#777" keyboardType="phone-pad" maxLength={15} />

          <Text style={styles.label}>Endereço</Text>
          <TextInput style={[styles.input, styles.multiline]} value={endereco} onChangeText={setEndereco} placeholder="Rua, número, bairro, cidade" placeholderTextColor="#777" multiline />

          <Text style={styles.label}>Senha</Text>
          <TextInput style={styles.input} value={senha} onChangeText={setSenha} placeholder="Mínimo de 6 caracteres" placeholderTextColor="#777" secureTextEntry />

          <Text style={styles.label}>Confirmar senha</Text>
          <TextInput style={styles.input} value={confirmarSenha} onChangeText={setConfirmarSenha} placeholder="Digite a senha novamente" placeholderTextColor="#777" secureTextEntry />

          <Text style={styles.label}>Placa do carro</Text>
          <TextInput style={styles.input} value={placa} onChangeText={(v) => setPlaca(normalizarPlaca(v))} placeholder="ABC1D23" placeholderTextColor="#777" autoCapitalize="characters" maxLength={7} />

          <View style={styles.info}>
            <Text style={styles.infoTitle}>🔐 Acesso biométrico</Text>
            <Text style={styles.infoText}>Depois do cadastro, você poderá ativar Face ID ou a biometria do aparelho para entrar no aplicativo.</Text>
          </View>

          <TouchableOpacity style={styles.primary} onPress={cadastrar} disabled={salvando}>
            <Text style={styles.primaryText}>{salvando ? 'Salvando...' : 'Cadastrar meus dados'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={onVoltar} disabled={salvando}>
            <Text style={styles.secondaryText}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 22, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 18 },
  subtitle: { color: '#999', textAlign: 'center', marginTop: 8, marginBottom: 28 },
  label: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: '#161616', borderColor: '#333', borderWidth: 1, borderRadius: 10, minHeight: 50, paddingHorizontal: 14, color: '#fff', fontSize: 16, marginBottom: 18 },
  multiline: { minHeight: 86, paddingTop: 14, textAlignVertical: 'top' },
  info: { backgroundColor: '#111c24', borderColor: '#1c5f7a', borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 18 },
  infoTitle: { color: '#fff', fontWeight: '800', marginBottom: 5 },
  infoText: { color: '#bbb', fontSize: 13, lineHeight: 19 },
  primary: { backgroundColor: '#0066cc', borderColor: '#00aeff', borderWidth: 1, borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondary: { backgroundColor: '#303030', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  secondaryText: { color: '#fff', fontWeight: '700' },
});
