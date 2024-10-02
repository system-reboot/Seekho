import React from 'react';
import { Stack } from 'expo-router';
import { useTeacherContext } from '@/context/TeacherId';

type Nameprop = { name: string };

export default function RootStack({ name }: Nameprop) {

    const {teacherName} = useTeacherContext();

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
            }}
        >
            <Stack.Screen name="index" options={{
                headerShown: true,
                title: `welcome ${teacherName}`,  // Set dynamic title
            }} />
        </Stack>
    );
}
