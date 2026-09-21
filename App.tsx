import React, { useState } from 'react';
import { Alert } from 'react-native';
import Login from './telas/autenticacao/Login';
import PerfilUsuario from './telas/perfil/PerfilUsuario';
import CadastroCliente from './screens/CadastroCliente';
import { useEffect } from 'react';
import { inicializarBanco } from './services/database';
import Home from './screens/Home';
import AgendamentoForm from './screens/AgendamentoForm';
import ListaAgendamentos from './screens/ListaAgendamentos';
import EditarAgendamento from './screens/EditarAgendamento';
import { Agendamento } from './services/types';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type Screen = 'login' | 'cadastro' | 'home' | 'novo' | 'lista' | 'editar' | 'perfil';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState<Agendamento | null>(null);

  useEffect(() => {
    inicializarBanco().catch((error) => console.warn('Não foi possível inicializar o banco local:', error));
  }, []);

  const logout = () => { setAgendamentoEmEdicao(null); setClienteId(null); setScreen('login'); };
  const entrar = (id:number) => { setClienteId(id); setScreen('home'); };

  const abrirEdicao = (agendamento: Agendamento) => {
    setAgendamentoEmEdicao(agendamento);
    setScreen('editar');
  };

  const salvarEdicao = (atualizado: Agendamento) => {
    setAgendamentos((atual) => atual.map((item) => item.id === atualizado.id ? atualizado : item));
    setAgendamentoEmEdicao(null);
    setScreen('lista');
    Alert.alert('Agendamento atualizado', 'As alterações foram salvas com sucesso.');
  };

  const cancelarAgendamento = (id: string) => {
    const agendamento = agendamentos.find((item) => item.id === id);
    if (!agendamento) return;
    Alert.alert(
      'Cancelar agendamento',
      `Deseja realmente cancelar o agendamento da placa ${agendamento.placa} em ${agendamento.data} às ${agendamento.horario}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () => {
            setAgendamentos((atual) => atual.filter((item) => item.id !== id));
            Alert.alert('Agendamento cancelado', 'O horário foi liberado para um novo agendamento.');
          },
        },
      ],
    );
  };

  const salvarAgendamento = (novo: Agendamento) => {
    setAgendamentos((atual) => [...atual, novo]);
    setScreen('lista');
    Alert.alert('Agendamento realizado', 'O agendamento foi salvo e já está disponível em Ver agendamentos.');
  };

  return (
    <SafeAreaProvider>
      {screen === 'login' && (
        <Login
          onEnter={entrar}
          onCadastro={() => setScreen('cadastro')}
        />
      )}
      {screen === 'cadastro' && (
        <CadastroCliente
          onCadastroConcluido={entrar}
          onVoltar={() => setScreen('login')}
        />
      )}
      {screen === 'novo' && (
        <AgendamentoForm
          agendamentos={agendamentos}
          onAgendamento={salvarAgendamento}
          onVoltar={() => setScreen('home')}
          onLogout={logout}
        />
      )}
      {screen === 'lista' && (
        <ListaAgendamentos
          agendamentos={agendamentos}
          onVoltar={() => setScreen('home')}
          onNovoAgendamento={() => setScreen('novo')}
          onLogout={logout}
          onEditar={abrirEdicao}
          onCancelar={cancelarAgendamento}
        />
      )}
      {screen === 'editar' && agendamentoEmEdicao && (
        <EditarAgendamento
          agendamento={agendamentoEmEdicao}
          agendamentos={agendamentos}
          onSalvar={salvarEdicao}
          onVoltar={() => { setAgendamentoEmEdicao(null); setScreen('lista'); }}
          onLogout={logout}
        />
      )}
      {screen === 'perfil' && clienteId && <PerfilUsuario clienteId={clienteId} onVoltar={() => setScreen('home')} />}
      {screen === 'home' && (
        <Home
          onAgendar={() => setScreen('novo')}
          onVerAgendamentos={() => setScreen('lista')}
          onLogout={logout}
          onPerfil={() => setScreen('perfil')}
        />
      )}
    </SafeAreaProvider>
  );
}
