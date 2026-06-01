import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, cadastrar } from '../services/api';

export default function LoginScreen() {
    const router = useRouter();
    const [modo, setModo] = useState('login');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit() {
        if (!email || !senha) return Alert.alert('Preencha todos os campos');
        if (modo === 'cadastro' && !nome) return Alert.alert('Informe seu nome');
        setCarregando(true);
        try {
            const resp = modo === 'login'
                ? await login(email, senha)
                : await cadastrar(nome, email, senha);
            await AsyncStorage.setItem('usuario', JSON.stringify(resp.data));
            router.replace('/tabs');
        } catch (e: any) {
            Alert.alert('Erro', e.response?.data?.detail || 'Falha na conexão');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Text style={styles.titulo}>🗺️ Riscos Urbanos</Text>
            <Text style={styles.subtitulo}>Monitoramento comunitário</Text>

            <View style={styles.card}>
                <View style={styles.tabs}>
                    {(['login', 'cadastro']).map(m => (
                        <TouchableOpacity
                            key={m}
                            style={[styles.tab, modo === m && styles.tabAtiva]}
                            onPress={() => setModo(m)}
                        >
                            <Text style={[styles.tabTexto, modo === m && styles.tabTextoAtivo]}>
                                {m === 'login' ? 'Entrar' : 'Cadastrar'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {modo === 'cadastro' && (
                    <TextInput
                        style={styles.input}
                        placeholder="Nome completo"
                        value={nome}
                        onChangeText={setNome}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholder="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.botao} onPress={handleSubmit} disabled={carregando}>
                    <Text style={styles.botaoTexto}>
                        {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F1F8E9' },
    titulo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#1B5E20', marginBottom: 4 },
    subtitulo: { fontSize: 14, textAlign: 'center', color: '#558B2F', marginBottom: 32 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 4 },
    tabs: { flexDirection: 'row', marginBottom: 20, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E0E0E0' },
    tab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#F5F5F5' },
    tabAtiva: { backgroundColor: '#2E7D32' },
    tabTexto: { color: '#757575', fontWeight: '600' },
    tabTextoAtivo: { color: '#fff' },
    input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
    botao: { backgroundColor: '#2E7D32', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 4 },
    botaoTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});