
// Tela de login do aplicativo Unicarona.
// Valida e-mail institucional (deve terminar em .edu.br) e RA (8 dígitos numéricos).
// Após validação bem-sucedida, autentica o usuário via contexto global.
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useCarona } from '../context/CaronaContext';
import MensagemFeedback from '../components/MensagemFeedback';

export default function LoginScreen({ navigation }) {
  const { login } = useCarona();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [feedback, setFeedback] = useState({ id: 0, visivel: false, mensagem: '', tipo: 'erro' });

  function mostrar(mensagem) {
    setFeedback(prev => ({ id: prev.id + 1, visivel: true, mensagem, tipo: 'erro' }));
  }

  // Verifica se o e-mail é de domínio institucional (contém 'edu' e termina em '.br')
  function validarEmail(email) {
    const dominio = email.split('@')[1] || '';
    return dominio.includes('edu') && dominio.endsWith('.br');
  }

  // Valida que o RA (Registro Acadêmico) possui exatamente 8 dígitos numéricos
  function validarSenha(senha) {
    return /^\d{8}$/.test(senha);
  }

  // Executa as validações e autentica o usuário em caso de sucesso
  function handleLogin() {
    if (!email || !senha) {
      mostrar('Preencha todos os campos.');
      return;
    }

    if (!validarEmail(email)) {
      mostrar('Use seu e-mail institucional. Ex: nome@edu.unipar.br');
      return;
    }

    if (!validarSenha(senha)) {
      mostrar('O Registro Acadêmico deve conter exatamente 8 números.');
      return;
    }

    // simula login sem back-end
    login({
      nome: email.split('@')[0],
      email,
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
      <View style={styles.inner}>

        <Text style={styles.titulo}>Unicarona</Text>
        <Text style={styles.subtitulo}>Caronas universitárias</Text>

    <Text style={styles.labelRA}>E-mail institucional </Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.labelRA}>Digite seu RA </Text>
        <TextInput
          style={styles.input}
    
          placeholderTextColor="#999"
          secureTextEntry
          keyboardType="numeric"
          maxLength={8}
          value={senha}
          onChangeText={setSenha}
        />

        <TouchableOpacity style={styles.botao} onPress={handleLogin}>
          <Text style={styles.botaoTexto}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.linkCadastro}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  titulo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 40,
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
  linkCadastro: {
    color: '#e94560',
    textAlign: 'center',
    fontSize: 14,
  },
  labelRA: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 6,
  },
  feedbackOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});