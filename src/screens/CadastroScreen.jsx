
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useCarona } from '../context/CaronaContext';
import MensagemFeedback from '../components/MensagemFeedback';

export default function CadastroScreen({ navigation }) {
  const { login } = useCarona();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [curso, setCurso] = useState('');
  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [feedback, setFeedback] = useState({ id: 0, visivel: false, mensagem: '', tipo: 'erro' });

  function mostrar(mensagem) {
    setFeedback(prev => ({ id: prev.id + 1, visivel: true, mensagem, tipo: 'erro' }));
  }

  function validarEmail(email) {
    return email.endsWith('.edu.br');
  }

  function validarSenha(senha) {
    return senha.length >= 6;
  }

  function handleCadastro() {
    if (!nome || !email || !curso || !ra || !senha || !confirmaSenha) {
      mostrar('Preencha todos os campos.');
      return;
    }

    if (!validarEmail(email)) {
      mostrar('Use seu e-mail institucional. Ex: nome@aluno.utfpr.edu.br');
      return;
    }

    if (!validarSenha(senha)) {
      mostrar('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmaSenha) {
      mostrar('As senhas não coincidem.');
      return;
    }

    login({
      nome,
      email,
      curso,
      ra,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {feedback.visivel && (
        <View style={styles.feedbackOverlay}>
          <MensagemFeedback
            key={feedback.id}
            mensagem={feedback.mensagem}
            tipo={feedback.tipo}
            onDismiss={() => setFeedback(prev => ({ ...prev, visivel: false }))}
          />
        </View>
      )}
      <ScrollView contentContainerStyle={styles.inner}>

        <Text style={styles.titulo}>Criar Conta</Text>
        <Text style={styles.subtitulo}>Preencha seus dados universitários</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="E-mail institucional"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Curso"
          placeholderTextColor="#999"
          value={curso}
          onChangeText={setCurso}
        />

        <TextInput
          style={styles.input}
          placeholder="RA (Registro Acadêmico)"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={ra}
          onChangeText={setRa}
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirmaSenha}
          onChangeText={setConfirmaSenha}
        />

        <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkLogin}>Já tem conta? Faça login</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  botao: {
    backgroundColor: '#e94560',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkLogin: {
    color: '#e94560',
    textAlign: 'center',
    fontSize: 14,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});