import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ImageBackground, Image } from 'react-native';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// @ts-expect-error
import Icon from 'react-native-vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
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

            console.log(content, context, courseName, teacherName)

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', data.message);
                router.push("/details/Created Courses")
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
            <Stack.Screen options={{
                headerTitle: `Welcome ${teacherName} `,
                headerTitleStyle: {
                    color: "black",
                    fontSize: 20,
                    fontWeight: 700,
                },
                headerStyle: {
                    backgroundColor: "white",

                },
                headerTintColor: "black", // Change back button color here
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
                                source={{ uri: 'https://cdn.discordapp.com/attachments/1277183421483057264/1293637008127688704/14620625_5484597-removebg-preview.png?ex=670818d9&is=6706c759&hm=4a0b99bef0947274578f678ba674b4baa6b62e07bf28170c0f9231cffc9ff1eb&' }}
                                style={{ height: 100, width: 100 }} // Use style prop for height and width
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
                                source={{ uri: 'https://cdn.discordapp.com/attachments/1277183421483057264/1293632026871730217/rb_2149341898.png?ex=67081435&is=6706c2b5&hm=574dc10f7e27672d8f2fc4c82badf87c7c051af0e66ad47e697485720a3195f0&' }}
                                style={{ height: 100, width: 100 }} // Use style prop for height and width
                            />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.buttonText}>Create New Course</Text>
                            <Icon name="add-circle-outline" size={30} color="#a81400" />
                        </View>
                    </View>

                </TouchableOpacity>
            </>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {loading ? <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#a81400" />
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

    textContainer: {
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        borderRadius: 20,
    },
    innerShadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        backgroundColor: 'white', // Adjust the color and opacity
        shadowColor: '#c4210b',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        zIndex: 1,
    },
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

        // borderColor:"#a81400",
        // borderWidth:3,
    },
    imageBackground: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        padding: 5,
        justifyContent: 'center',
        alignContent: "flex-end",
        width: '100%', // Full width of the button
        height: '100%', // Full height of the button
    },
    content: {
        position: 'relative', // Ensure the content appears above the shadow
        zIndex: 2,
        margin: 30,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent:"center"
    },
    buttonText: {
        color: 'black',
        fontWeight: "500",
        width: 120,
        fontSize: 20,
        marginLeft: 20,
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
        backgroundColor: '#a81400',
        padding: 15,
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
