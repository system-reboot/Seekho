import React from 'react';
import { Stack } from 'expo-router';

type Nameprop = { name: string };

export default function RootStack({ name }: Nameprop) {


    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#a81400',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                headerShown:false
            }}
        >
            <Stack.Screen name="[name]" />
        </Stack>
    );
}
