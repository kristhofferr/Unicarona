import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import MensagemFeedback from '../components/MensagemFeedback';
import { useCarona } from '../context/CaronaContext';

function CampoInput({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, tema }) {
  return (
    <View style={styles.campo}>
      <Text style={[styles.campoLabel, { color: tema.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.campoInput,
          {
            backgroundColor: tema.inputBackground,
            color: tema.text,
            borderColor: tema.borderInput,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={tema.placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

export default function EditarPerfilScreen({ navigation }) {
  const { usuario, tema, atualizarPerfil, alterarEmail, alterarSenha, excluirConta } = useCarona();

  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [curso, setCurso] = useState(usuario?.curso ?? '');
  const [novoEmail, setNovoEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [feedback, setFeedback] = useState({ id: 0, visivel: false, mensagem: '', tipo: 'sucesso' });
  const [modalExcluir, setModalExcluir] = useState(false);

  function mostrar(mensagem, tipo) {
    setFeedback(prev => ({ id: prev.id + 1, visivel: true, mensagem, tipo }));
  }

  function salvarPerfil() {
    if (!nome.trim()) {
      mostrar('O nome não pode estar vazio.', 'erro');
      return;
    }
    atualizarPerfil({ nome: nome.trim(), curso: curso.trim() });
    mostrar('Perfil atualizado com sucesso.', 'sucesso');
  }

  function salvarEmail() {
    if (!novoEmail.trim()) {
      mostrar('Informe o novo e-mail.', 'erro');
      return;
    }
    const dominio = novoEmail.split('@')[1] ?? '';
    if (!dominio.includes('edu') || !dominio.endsWith('.br')) {
      mostrar('Use seu e-mail institucional. Ex: nome@edu.unipar.br', 'erro');
      return;
    }
    alterarEmail(novoEmail.trim().toLowerCase());
    setNovoEmail('');
    mostrar('E-mail atualizado com sucesso.', 'sucesso');
  }

  function salvarSenha() {
    if (!senhaAtual || !novaSenha || !confirmaSenha) {
      mostrar('Preencha todos os campos de senha.', 'erro');
      return;
    }
    if (novaSenha.length < 6) {
      mostrar('A nova senha deve ter no mínimo 6 caracteres.', 'erro');
      return;
    }
    if (novaSenha !== confirmaSenha) {
      mostrar('A nova senha e a confirmação não coincidem.', 'erro');
      return;
    }
    const resultado = alterarSenha(senhaAtual, novaSenha);
    if (!resultado.ok) {
      mostrar(resultado.mensagem, 'erro');
      return;
    }
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmaSenha('');
    mostrar('Senha alterada com sucesso.', 'sucesso');
  }

  function confirmarExclusao() {
    setModalExcluir(true);
  }

  function handleExcluirConta() {
    setModalExcluir(false);
    excluirConta();
    navigation.replace('Login');
  }

  return (
    <KeyboardAvoidingView
      style={[styles.wrapper, { backgroundColor: tema.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        titulo="Editar Perfil"
        mostrarVoltar
        corFundo={tema.header}
        corTexto={tema.headerText}
        corBorda={tema.headerBorder}
      />

      {feedback.visivel && (
        <MensagemFeedback
          key={feedback.id}
          mensagem={feedback.mensagem}
          tipo={feedback.tipo}
          onDismiss={() => setFeedback(prev => ({ ...prev, visivel: false }))}
        />
      )}

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>INFORMAÇÕES PESSOAIS</Text>
        <View style={[styles.card, { backgroundColor: tema.card, borderColor: tema.border }]}>
          <CampoInput
            label="Nome completo"
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
            tema={tema}
          />
          <View style={[styles.separador, { backgroundColor: tema.border }]} />
          <CampoInput
            label="Curso"
            value={curso}
            onChangeText={setCurso}
            placeholder="Ex: Engenharia de Software"
            tema={tema}
          />
        </View>
        <TouchableOpacity
          style={[styles.botaoSalvar, { backgroundColor: tema.primary }]}
          onPress={salvarPerfil}
          activeOpacity={0.85}
        >
          <Text style={styles.botaoSalvarTexto}>Salvar informações</Text>
        </TouchableOpacity>

        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>ALTERAR E-MAIL</Text>
        <View style={[styles.infoAtual, { backgroundColor: tema.card, borderColor: tema.border }]}>
          <Ionicons name="mail-outline" size={16} color={tema.textSecondary} />
          <Text style={[styles.infoAtualTexto, { color: tema.textSecondary }]}>
            Atual: {usuario?.email ?? '—'}
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: tema.card, borderColor: tema.border }]}>
          <CampoInput
            label="Novo e-mail institucional"
            value={novoEmail}
            onChangeText={setNovoEmail}
            placeholder="nome@edu.unipar.br"
            keyboardType="email-address"
            autoCapitalize="none"
            tema={tema}
          />
        </View>
        <TouchableOpacity
          style={[styles.botaoSalvar, { backgroundColor: tema.primary }]}
          onPress={salvarEmail}
          activeOpacity={0.85}
        >
          <Text style={styles.botaoSalvarTexto}>Salvar e-mail</Text>
        </TouchableOpacity>

        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>ALTERAR SENHA</Text>
        <View style={[styles.card, { backgroundColor: tema.card, borderColor: tema.border }]}>
          <CampoInput
            label="Senha atual"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            placeholder="••••••"
            secureTextEntry
            autoCapitalize="none"
            tema={tema}
          />
          <View style={[styles.separador, { backgroundColor: tema.border }]} />
          <CampoInput
            label="Nova senha"
            value={novaSenha}
            onChangeText={setNovaSenha}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
            tema={tema}
          />
          <View style={[styles.separador, { backgroundColor: tema.border }]} />
          <CampoInput
            label="Confirmar nova senha"
            value={confirmaSenha}
            onChangeText={setConfirmaSenha}
            placeholder="Repita a nova senha"
            secureTextEntry
            autoCapitalize="none"
            tema={tema}
          />
        </View>
        <TouchableOpacity
          style={[styles.botaoSalvar, { backgroundColor: tema.primary }]}
          onPress={salvarSenha}
          activeOpacity={0.85}
        >
          <Text style={styles.botaoSalvarTexto}>Salvar senha</Text>
        </TouchableOpacity>

        <Text style={[styles.secaoTitulo, { color: tema.textSecondary }]}>CONTA</Text>
        <View style={[styles.card, { backgroundColor: tema.dangerBg, borderColor: tema.danger }]}>
          <TouchableOpacity
            style={styles.botaoExcluir}
            onPress={confirmarExclusao}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={20} color={tema.danger} />
            <Text style={[styles.botaoExcluirTexto, { color: tema.danger }]}>Excluir conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.espacamento} />
      </ScrollView>

      <Modal visible={modalExcluir} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: tema.card, borderColor: tema.danger }]}>
            <View style={styles.modalIcone}>
              <Ionicons name="trash-outline" size={36} color={tema.danger} />
            </View>
            <Text style={[styles.modalTitulo, { color: tema.text }]}>Excluir conta</Text>
            <Text style={[styles.modalSubtitulo, { color: tema.textSecondary }]}>
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotaoCancelar, { borderColor: tema.border }]}
                onPress={() => setModalExcluir(false)}
              >
                <Text style={[styles.modalBotaoCancelarTexto, { color: tema.textSecondary }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBotaoExcluir, { backgroundColor: tema.danger }]}
                onPress={handleExcluirConta}
              >
                <Text style={styles.modalBotaoExcluirTexto}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  campo: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  campoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  campoInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  separador: {
    height: 1,
    marginHorizontal: 16,
  },
  infoAtual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoAtualTexto: {
    fontSize: 13,
  },
  botaoSalvar: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoSalvarTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  botaoExcluir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  botaoExcluirTexto: {
    fontSize: 15,
    fontWeight: '600',
  },
  espacamento: {
    height: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalBox: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
  },
  modalIcone: { marginBottom: 12 },
  modalTitulo: { fontSize: 17, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  modalSubtitulo: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalBotoes: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalBotaoCancelarTexto: { fontSize: 14, fontWeight: 'bold' },
  modalBotaoExcluir: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalBotaoExcluirTexto: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});
