


import { useTeacherContext } from '@/context/TeacherId';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Button, Alert } from 'react-native';
type SubTopicCard = {
    subTopic: string;
    week: string
}

export const SubTopicCard = ({ subTopic, week }: SubTopicCard) => {

    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const { courseName } = useTeacherContext();


    const handleSubtopicPress = (subtopic: string) => {
        // Handle subtopic press, e.g., navigate to a details page
        router.push(`/subtopic/${subtopic} - ${week}`)
    };

    const storeVideo = async () => {

        console.log(week)
        const match = week.match(/Week (\d+)/i); // Added 'i' for case-insensitivity
        let weekNumber;
        
        if (match) {
            weekNumber = parseInt(match[1]);
        } else {
            weekNumber = null; // Handle the case where there's no match
        }
        

        console.log(weekNumber,videoUrl,subTopic,courseName)
        setLoading(true)
        try {
            const response = await fetch('http://127.0.0.1:8000/store_video/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    video_url: videoUrl,
                    week: weekNumber,
                    topic_name: subTopic.trim(),
                    course_name: courseName?.trim()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.message === 'Video stored successfully') {
                    Alert.alert('Success', data.message);
                    console.log("Video stored successfully")
                    // router.push("/Created Courses")
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

        }

    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => handleSubtopicPress(subTopic)}
                style={styles.subtopicButton}
            >
                <Text style={styles.subtopicText}>{subTopic}</Text>
            </TouchableOpacity>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter video URL"
                    value={videoUrl}
                    onChangeText={setVideoUrl}
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={storeVideo}
                >
                    <Text style={{
                        color: "white"
                    }}>store Video</Text>
                </TouchableOpacity>
            </View>
        </View>)
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        gap: 4,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#c4210b',
        padding: 15,
        color: "white",
        margin: 10,
        borderRadius: 5,
    },
    card: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        overflow: 'hidden',
    },
    header: {
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    weekText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtopicsContainer: {
        padding: 10,
    },
    subtopicButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginBottom: 5,
        borderRadius: 5,
        backgroundColor: '#e0e0e0',
        borderColor: '#ccc',
        borderWidth: 1,
    },
    subtopicText: {
        fontSize: 16,
        color: '#333',
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginBottom: 20
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginRight: 10,
        width: '70%',
    },
});

