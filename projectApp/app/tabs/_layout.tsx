import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
    const [checando, setChecando] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        async function checar() {
            const usuario = await AsyncStorage.getItem('usuario');
            const nasTabs = segments[0] === 'tabs';
            if (!usuario && nasTabs) router.replace('/login');
            if (usuario && !nasTabs) router.replace('/tabs');
            setChecando(false);
        }
        checar();
    }, []);

    if (checando) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
    return <Slot />;
}