import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// @ts-expect-error
import Icon from 'react-native-vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import { useTeacherContext } from '@/context/TeacherId';
import CourseCreationModal from './CourseCreationModal';

export default function RootLayout() {
    const [modalVisible, setModalVisible] = useState(false);
    const { teacherName } = useTeacherContext();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: `Welcome ${teacherName}`,
                headerTitleStyle: {
                    color: "black",
                    fontSize: 20,
                    fontWeight: '700',
                },
                headerStyle: {
                    backgroundColor: "white",
                },
                headerTintColor: "black",
                headerShown: true,
            }} />
            <>
                <TouchableOpacity style={styles.button}
                    onPress={() => router.push("/details/Created Courses")}>
                    <View style={styles.innerShadow} />
                    <View style={styles.content}>
                        <View style={styles.textContainer}>
                            <Icon name="book-outline" size={30} color="#a81400" />
                            <Text style={styles.buttonText}>Go to All My Courses</Text>
                        </View>
                        <View>
                            <Image
                                source={require('../../../assets/images/all_courses.png')}
                                style={{ height: 100, width: 100 }}
                            />
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button}
                    onPress={() => setModalVisible(true)}>
                    <View style={styles.innerShadow} />
                    <View style={styles.content}>
                        <View>
                            <Image
                                source={require('../../../assets/images/create_courses.png')}
                                style={{ height: 100, width: 100 }}
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.buttonText}>Create New Course</Text>
                            <Icon name="add-circle-outline" size={30} color="#a81400" />
                        </View>
                    </View>
                </TouchableOpacity>
            </>
            <CourseCreationModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0e6e6',
        padding: 10,
        gap: 30,
        paddingVertical: 200,
    },
    button: {
        flexDirection: 'row',
        flex: 1,
        width: "100%",
        gap: 1,
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
        margin: "auto",
        backgroundColor: "white",
        borderRadius: 20,
    },
    innerShadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        backgroundColor: 'white',
        shadowColor: '#c4210b',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        zIndex: 1,
    },
    content: {
        position: 'relative',
        zIndex: 2,
        margin: 30,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center"
    },
    textContainer: {
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        borderRadius: 20,
        gap:5,
    },
    buttonText: {
        color: '#a81400',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});