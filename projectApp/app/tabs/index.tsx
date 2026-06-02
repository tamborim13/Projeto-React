import { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Modal, TextInput, ScrollView, Alert, Image
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listarOcorrencias, criarOcorrencia } from '../../services/api';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { BASE_URL } from '../../services/config';

const ICONES: Record<string, string> = {
    barranco: '⛰️', lixo: '🗑️', entulho: '🚧',
    alagamento: '💧', bueiro: '🌧️', deslizamento: '🪨',
    arvore: '🌳', rachadura: '🧱'
};

const CATEGORIAS = [
    { label: '⛰️ Barranco', value: 'barranco' },
    { label: '🗑️ Lixo', value: 'lixo' },
    { label: '🚧 Entulho', value: 'entulho' },
    { label: '💧 Alagamento', value: 'alagamento' },
    { label: '🌧️ Bueiro', value: 'bueiro' },
    { label: '🪨 Deslizamento', value: 'deslizamento' },
    { label: '🌳 Árvore', value: 'arvore' },
    { label: '🧱 Rachadura', value: 'rachadura' },
];

const COR_RISCO: Record<string, string> = {
    baixo: '#4CAF50', moderado: '#FF9800', alto: '#F44336'
};


export default function MapaScreen() {
    const [ocorrencias, setOcorrencias] = useState<any[]>([]);
    const [localizacao, setLocalizacao] = useState<any>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [modalAlertas, setModalAlertas] = useState(false);
    const [alertaSelecionado, setAlertaSelecionado] = useState<any>(null);
    const [categoria, setCategoria] = useState('');
    const [descricao, setDescricao] = useState('');
    const [risco, setRisco] = useState('moderado');
    const [foto, setFoto] = useState<any>(null);
    const [salvando, setSalvando] = useState(false);
    const [usuario, setUsuario] = useState<any>(null);
    const router = useRouter();

    async function logout() {
        await AsyncStorage.removeItem('usuario');
        router.replace('/login');
    }

    useEffect(() => {
        obterLocalizacao();
        carregarOcorrencias();
        async function carregarUsuario() {
            const u = await AsyncStorage.getItem('usuario');
            if (u) setUsuario(JSON.parse(u));
        }
        carregarUsuario();
    }, []);

    async function obterLocalizacao() {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({});
        setLocalizacao(loc.coords);
    }

    async function carregarOcorrencias() {
        try {
            const resp = await listarOcorrencias();
            setOcorrencias(resp.data);
        } catch (e) { console.error(e); }
    }

    async function escolherFoto() {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'] as any,
            quality: 0.7,
        });
        if (!result.canceled) setFoto(result.assets[0]);
    }

    async function salvarAlerta() {
        if (!categoria) return Alert.alert('Selecione uma categoria');
        if (!localizacao) return Alert.alert('Aguarde a localização');
        setSalvando(true);
        try {
            const formData = new FormData();
            formData.append('usuario_id', usuario.id);
            formData.append('categoria', categoria);
            formData.append('descricao', descricao);
            formData.append('risco', risco);
            formData.append('latitude', localizacao.latitude);
            formData.append('longitude', localizacao.longitude);
            if (foto) {
                formData.append('foto', {
                    uri: foto.uri, name: 'foto.jpg', type: 'image/jpeg'
                } as any);
            }
            await criarOcorrencia(formData);
            setModalAberto(false);
            resetForm();
            carregarOcorrencias();
            Alert.alert('✅ Alerta registrado!', 'Marcado no mapa.');
        } catch (e) {
            Alert.alert('Erro', 'Não foi possível salvar');
        } finally {
            setSalvando(false);
        }
    }

    function resetForm() {
        setCategoria(''); setDescricao(''); setRisco('moderado'); setFoto(null);
    }

    async function deletarAlerta(id: number) {
        Alert.alert(
            'Excluir alerta',
            'Tem certeza que deseja excluir este alerta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/ocorrencias/${id}`);
                            setAlertaSelecionado(null);
                            carregarOcorrencias();
                            Alert.alert('✅ Alerta excluído!');
                        } catch (e) {
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    }
                }
            ]
        );
    }

    function abrirDetalhes(oc: any) {
        setModalAlertas(false);
        setAlertaSelecionado(oc);
    }

    return (
        <View style={{ flex: 1 }}>
            {localizacao && (
                <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: localizacao.latitude,
                        longitude: localizacao.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showsUserLocation
                >
                    {ocorrencias.map((oc) => (
                        <Marker
                            key={oc.id}
                            coordinate={{ latitude: parseFloat(oc.latitude), longitude: parseFloat(oc.longitude) }}
                            onPress={() => abrirDetalhes(oc)}
                        >
                            <View style={{
                                backgroundColor: COR_RISCO[oc.risco] || '#FF9800',
                                borderRadius: 20,
                                padding: 6,
                                borderWidth: 2,
                                borderColor: '#fff',
                                elevation: 4,
                            }}>
                                <Text style={{ fontSize: 18 }}>
                                    {ICONES[oc.categoria] || '⚠️'}
                                </Text>
                            </View>
                        </Marker>
                    ))}
                </MapView>
            )}

            {/* Botão + */}
            <TouchableOpacity style={styles.botaoFlutuante} onPress={() => setModalAberto(true)}>
                <Text style={styles.botaoFlutuanteTexto}>＋</Text>
            </TouchableOpacity>

            {/* Botão lista alertas */}
            <TouchableOpacity style={styles.botaoAlertas} onPress={() => setModalAlertas(true)}>
                <Text style={styles.botaoAlertasTexto}>⚠️ {ocorrencias.length}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoLogout} onPress={logout}>
                <Text style={styles.botaoLogoutTexto}>🚪 Sair</Text>
            </TouchableOpacity>

            {/* Modal registrar alerta */}
            <Modal visible={modalAberto} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitulo}>⚠️ Registrar alerta</Text>

                        <Text style={styles.label}>Categoria</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                            {CATEGORIAS.map((c) => (
                                <TouchableOpacity
                                    key={c.value}
                                    style={[styles.chip, categoria === c.value && styles.chipSelecionado]}
                                    onPress={() => setCategoria(c.value)}
                                >
                                    <Text style={{ fontSize: 12, color: categoria === c.value ? '#fff' : '#333' }}>
                                        {c.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>Nível de risco</Text>
                        <View style={styles.riscoRow}>
                            {['baixo', 'moderado', 'alto'].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    style={[styles.chipRisco, { borderColor: COR_RISCO[r] }, risco === r && { backgroundColor: COR_RISCO[r] }]}
                                    onPress={() => setRisco(r)}
                                >
                                    <Text style={{ color: risco === r ? '#fff' : COR_RISCO[r], fontWeight: '600', fontSize: 13 }}>
                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Descrição</Text>
                        <TextInput
                            style={styles.inputTexto}
                            placeholder="Descreva o problema..."
                            value={descricao}
                            onChangeText={setDescricao}
                            multiline
                            numberOfLines={3}
                        />

                        <TouchableOpacity style={styles.botaoFoto} onPress={escolherFoto}>
                            <Text style={{ color: '#1565C0', fontWeight: '600' }}>
                                {foto ? '✅ Foto selecionada' : '📷 Tirar foto'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.botoesModal}>
                            <TouchableOpacity
                                style={[styles.botaoModal, { backgroundColor: '#E0E0E0' }]}
                                onPress={() => { setModalAberto(false); resetForm(); }}
                            >
                                <Text style={{ color: '#333' }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.botaoModal, { backgroundColor: '#2E7D32' }]}
                                onPress={salvarAlerta}
                                disabled={salvando}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                    {salvando ? 'Salvando...' : 'Salvar alerta'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal lista de alertas */}
            <Modal visible={modalAlertas} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitulo}>⚠️ Alertas no mapa</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {ocorrencias.map((oc) => (
                                <TouchableOpacity
                                    key={oc.id}
                                    style={styles.alertaItem}
                                    onPress={() => abrirDetalhes(oc)}
                                >
                                    <View style={[styles.alertaIcone, { backgroundColor: COR_RISCO[oc.risco] }]}>
                                        <Text style={{ fontSize: 20 }}>{ICONES[oc.categoria] || '⚠️'}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.alertaTitulo}>
                                            {oc.categoria.charAt(0).toUpperCase() + oc.categoria.slice(1)}
                                        </Text>
                                        {oc.descricao ? <Text style={styles.alertaDesc}>{oc.descricao}</Text> : null}
                                        <Text style={styles.alertaData}>
                                            {new Date(oc.criado_em).toLocaleDateString('pt-BR')}
                                        </Text>
                                    </View>
                                    <View style={[styles.alertaBadge, { backgroundColor: COR_RISCO[oc.risco] }]}>
                                        <Text style={styles.alertaBadgeTexto}>{oc.risco}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={{ backgroundColor: '#2E7D32', marginTop: 16, padding: 14, borderRadius: 8, alignItems: 'center' }}
                            onPress={() => setModalAlertas(false)}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal detalhes do alerta */}
            <Modal visible={!!alertaSelecionado} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        {alertaSelecionado && (
                            <>
                                <Text style={styles.modalTitulo}>
                                    {ICONES[alertaSelecionado.categoria] || '⚠️'} {alertaSelecionado.categoria.charAt(0).toUpperCase() + alertaSelecionado.categoria.slice(1)}
                                </Text>

                                {alertaSelecionado.foto && (
                                    <Image
                                        source={{ uri: `${BASE_URL}/${alertaSelecionado.foto}` }}
                                        style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 12 }}
                                        resizeMode="cover"
                                    />
                                )}

                                <View style={[styles.calloutBadge, { backgroundColor: COR_RISCO[alertaSelecionado.risco], marginBottom: 12 }]}>
                                    <Text style={styles.calloutBadgeTexto}>Risco {alertaSelecionado.risco}</Text>
                                </View>

                                {alertaSelecionado.descricao ? (
                                    <Text style={{ fontSize: 14, color: '#444', marginBottom: 8 }}>{alertaSelecionado.descricao}</Text>
                                ) : null}

                                <Text style={styles.calloutData}>
                                    📍 {parseFloat(alertaSelecionado.latitude).toFixed(4)}, {parseFloat(alertaSelecionado.longitude).toFixed(4)}
                                </Text>
                                <Text style={styles.calloutData}>
                                    🕐 {new Date(alertaSelecionado.criado_em).toLocaleDateString('pt-BR')}
                                </Text>

                                {/* Botões */}
                                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#C62828', padding: 14, borderRadius: 8, alignItems: 'center' }}
                                        onPress={() => {
                                            const id = alertaSelecionado.id;
                                            deletarAlerta(id);
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>🗑️ Excluir</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{ flex: 1, backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center' }}
                                        onPress={() => setAlertaSelecionado(null)}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Fechar</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    botaoFlutuante: {
        position: 'absolute', bottom: 32, right: 24,
        backgroundColor: '#2E7D32', width: 56, height: 56,
        borderRadius: 28, alignItems: 'center', justifyContent: 'center',
        elevation: 8,
    },
    botaoFlutuanteTexto: { color: '#fff', fontSize: 28, fontWeight: 'bold', lineHeight: 32 },
    callout: { width: 200, padding: 10 },
    calloutTitulo: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
    calloutTexto: { fontSize: 12, color: '#555', marginBottom: 4 },
    calloutBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
    calloutBadgeTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
    calloutData: { fontSize: 11, color: '#999', marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
    modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1B5E20' },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
    chip: { marginRight: 8, borderRadius: 20, borderWidth: 1, borderColor: '#CCC', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F5F5F5' },
    chipSelecionado: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
    riscoRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    chipRisco: { flex: 1, borderWidth: 1.5, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
    inputTexto: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, minHeight: 70, textAlignVertical: 'top', marginBottom: 12, fontSize: 14 },
    botaoFoto: { borderWidth: 1, borderColor: '#1565C0', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 16 },
    botoesModal: { flexDirection: 'row', gap: 12 },
    botaoModal: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
    botaoAlertas: {
        position: 'absolute', bottom: 100, right: 24,
        backgroundColor: '#fff', borderRadius: 24,
        paddingHorizontal: 14, paddingVertical: 10,
        elevation: 6, borderWidth: 1, borderColor: '#E0E0E0',
        flexDirection: 'row', alignItems: 'center',
    },
    botaoAlertasTexto: { fontSize: 15, fontWeight: 'bold', color: '#F44336' },
    alertaItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    alertaIcone: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    alertaTitulo: { fontWeight: '700', fontSize: 14, color: '#212121' },
    alertaDesc: { fontSize: 12, color: '#757575', marginTop: 2 },
    alertaData: { fontSize: 11, color: '#9E9E9E', marginTop: 2 },
    alertaBadge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
    alertaBadgeTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },

    botaoLogout: {
        position: 'absolute', top: 48, right: 16,
        backgroundColor: '#fff', borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 8,
        elevation: 4, borderWidth: 1, borderColor: '#E0E0E0',
    },
    botaoLogoutTexto: { fontSize: 13, fontWeight: '600', color: '#C62828' },
});