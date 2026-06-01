import { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, StyleSheet, RefreshControl, ListRenderItemInfo } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { listarOcorrencias } from '../../services/api';
import { BASE_URL } from '@env';

const COR_RISCO: Record<string, string> = {
    baixo: '#4CAF50', moderado: '#FF9800', alto: '#F44336'
};
const ICONES: Record<string, string> = {
    barranco: '⛰️', lixo: '🗑️', entulho: '🚧',
    alagamento: '💧', bueiro: '🌧️', deslizamento: '🪨',
    arvore: '🌳', rachadura: '🧱'
};


type Ocorrencia = {
    id: number;
    categoria: string;
    descricao: string;
    risco: string;
    latitude: string;
    longitude: string;
    criado_em: string;
    foto?: string;
};

export default function AlertasScreen() {
    const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => { carregar(); }, [])
    );

    async function carregar() {
        setRefreshing(true);
        try {
            const resp = await listarOcorrencias();
            setOcorrencias(resp.data.reverse());
        } finally {
            setRefreshing(false);
        }
    }

    function renderCard({ item }: ListRenderItemInfo<Ocorrencia>) {
        const corRisco = COR_RISCO[item.risco] || '#FF9800';
        return (
            <View style={styles.card}>
                {item.foto && (
                    <Image source={{ uri: `${BASE_URL}/${item.foto}` }} style={styles.foto} />
                )}
                <View style={styles.cardBody}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.icone}>{ICONES[item.categoria] || '⚠️'}</Text>
                        <Text style={styles.categoria}>
                            {item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1)}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: corRisco }]}>
                            <Text style={styles.badgeTexto}>{item.risco}</Text>
                        </View>
                    </View>
                    {item.descricao ? <Text style={styles.descricao}>{item.descricao}</Text> : null}
                    <Text style={styles.data}>
                        📍 {parseFloat(item.latitude).toFixed(4)}, {parseFloat(item.longitude).toFixed(4)}
                        {'  ·  '}
                        {new Date(item.criado_em).toLocaleDateString('pt-BR')}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>⚠️ Alertas registrados</Text>
            <FlatList
                data={ocorrencias}
                renderItem={renderCard}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 16, gap: 12 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={carregar} />}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: '#999', marginTop: 40 }}>
                        Nenhum alerta registrado ainda
                    </Text>
                }
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5'
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 20,
        paddingBottom: 8,
        color: '#1B5E20'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2
    },
    foto: {
        width: '100%',
        height: 180,
        resizeMode: 'cover'
    },
    cardBody: {
        padding: 14
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8
    },
    icone: {
        fontSize: 22
    },
    categoria: {
        flex: 1,
        fontWeight: '700',
        fontSize: 15,
        color: '#212121'
    },
    badge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4
    },
    badgeTexto: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700'
    },
    descricao: {
        color: '#555',
        fontSize: 13,
        marginBottom: 8,
        lineHeight: 20
    },
    data: {
        color: '#9E9E9E',
        fontSize: 11
    },
});