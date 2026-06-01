import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function SobreScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
            <Text style={styles.titulo}>🌍 Mapa de Riscos Urbanos</Text>
            <Text style={styles.subtitulo}>Sistema colaborativo de monitoramento ambiental</Text>

            <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Sobre o projeto</Text>
                <Text style={styles.texto}>
                    Este aplicativo permite que moradores registrem e acompanhem ocorrências de riscos
                    ambientais e urbanos em sua comunidade, contribuindo para a prevenção de desastres
                    e a melhoria da qualidade de vida.
                </Text>
            </View>

            <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>Tipos de ocorrências</Text>
                {[
                    ['⛰️', 'Barranco / Erosão', 'Áreas com risco de desmoronamento'],
                    ['🗑️', 'Acúmulo de lixo', 'Pode causar enchentes e doenças'],
                    ['🚧', 'Entulho irregular', 'Obstrução de vias e bueiros'],
                    ['💧', 'Alagamento', 'Regiões com risco de inundação'],
                    ['🌧️', 'Bueiro entupido', 'Causa enchentes em chuvas'],
                    ['🪨', 'Deslizamento', 'Encostas instáveis'],
                    ['🌳', 'Queda de árvore', 'Árvores com risco de tombar'],
                    ['🧱', 'Rachadura', 'Rachaduras em encostas ou estruturas'],
                ].map(([icone, titulo, desc]) => (
                    <View key={titulo} style={styles.item}>
                        <Text style={styles.itemIcone}>{icone}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitulo}>{titulo}</Text>
                            <Text style={styles.itemDesc}>{desc}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.secao}>
                <Text style={styles.secaoTitulo}>ODS relacionados</Text>
                <Text style={styles.texto}>
                    📌 ODS 11 — Cidades e comunidades sustentáveis{'\n'}
                    📌 ODS 13 — Ação contra a mudança global do clima{'\n'}
                    📌 ODS 15 — Vida terrestre
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FBE7' },
    titulo: { fontSize: 26, fontWeight: 'bold', color: '#1B5E20', marginBottom: 4 },
    subtitulo: { fontSize: 14, color: '#558B2F', marginBottom: 24 },
    secao: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
    secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 12 },
    texto: { fontSize: 14, color: '#555', lineHeight: 22 },
    item: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
    itemIcone: { fontSize: 22, marginTop: 2 },
    itemTitulo: { fontWeight: '700', fontSize: 14, color: '#212121' },
    itemDesc: { fontSize: 12, color: '#757575', marginTop: 2 },
});