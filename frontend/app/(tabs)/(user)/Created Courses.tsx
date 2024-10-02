import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useTeacherContext } from '@/context/TeacherId';

export default function RootLayout() {
    const [courseList, setCourseList] = useState([])
    const [loading, setLoading] = useState(true);
    const { teacherName,setTeacherData } = useTeacherContext()

    const handlePress = (item: string) => {
        const courseName = Object.keys(item)[1];
        setTeacherData((prev) => ({
            ...prev,               
            courseName:courseName
        }));
        
        // @ts-expect-error
        router.push(`/details/${item._id.$oid}`, { relativeToDirectory: true });
    };

    const url = `http://34.45.174.70:80/courses/?teacher_id=${teacherName}`;

    useEffect(() => {
        (async () => {

            try {
                const response = await fetch(url, {
                    method: 'GET', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
        
                // console.log(respose)
                const data = await response.json();
                setCourseList(data)

            } catch (error) {
                Alert.alert('Error', 'Failed to connect to the server.');
                console.error('Error:', error);
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <Stack.Screen options={{
                    headerTitle: "loading...",
                }} />

                <ActivityIndicator size="large" color="#c4210b" />
            </View>
        );
    }


    const renderCourseCard = ({ item }: { item: any }) => {

        const keys = Object.keys(item)

        console.log(keys)

        return (<View style={styles.card}>
            <TouchableOpacity
                onPress={() => handlePress(item)}
            >
                <Text style={styles.courseName}>{keys[1]}</Text>
                <Text style={styles.courseWeeks}>{item.teacher_id}</Text>
            </TouchableOpacity>
        </View>)
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: `created course by ${teacherName} `,
            }} />
            <FlatList
                data={courseList}
                renderItem={renderCourseCard}
                keyExtractor={(item) => (item._id.$oid)}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        elevation: 4, // Shadow effect for Android
        shadowColor: '#000', // Shadow effect for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    courseName: {
        fontSize: 15,
        fontWeight: '500',
    },
    courseWeeks: {
        fontSize: 14,
        color: '#777',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
