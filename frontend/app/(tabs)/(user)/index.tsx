import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// @ts-expect-error
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';
import { useTeacherContext } from '@/context/TeacherId';

export default function RootLayout() {
    const [modalVisible, setModalVisible] = useState(false);
    const [content, setContent] = useState('');
    const [context, setContext] = useState('');
    const [courseName, setCourseName] = useState('');
   const [loading, setLoading] = useState(false);
    const { teacherName } = useTeacherContext()

    const handleCreateCourse = async () => {
        setLoading(true)
        try {

            const url = `http://34.45.174.70:80/generate_layout?content=${content}&context=${context}&course_name=${courseName}&teacher_id=${teacherName}`;

            console.log(content,context,courseName,teacherName)

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            if (response.ok) {
                if (data && data.message === 'Course Generated Successfully') {
                    Alert.alert('Success', data.message);
                    router.push("/Created Courses")
                } else {
                    Alert.alert('Error', data.message);
                }
            } else {
                Alert.alert('Error', 'Something went wrong, please try again later.');
            }

        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server.');
            console.error('Error:', error);
        }
        finally {
            setLoading(false);
            setModalVisible(false);

        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => {
                router.push("/Created Courses")
            }}>
                <Icon name="book-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>All My Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}
            >
                <Icon name="add-circle-outline" size={24} color="#fff" />
                <Text style={styles.buttonText}>Create New Course</Text>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {loading ? <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#c4210b" />
                    </View> : <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#0000009a" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Create New Course</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Course Name"
                            value={courseName}
                            onChangeText={setCourseName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Content"
                            value={content}
                            onChangeText={setContent}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Context"
                            value={context}
                            onChangeText={setContext}
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleCreateCourse}
                        >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>}
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#c4210b',
        padding: 15,
        width: 200,
        margin: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        marginLeft: 10,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    submitButton: {
        backgroundColor: '#c4210b',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
    }, closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
});
