import { useTeacherContext } from '@/context/TeacherId';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, Alert, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';


type WeekCardProp = {
    week: string,
    subTopic: string;
}

const WeekCard = ({ week, subTopic }: WeekCardProp) => {
    const [isOpen, setIsOpen] = useState(false);
    const dataArray = subTopic ? subTopic.split("*") : [];
    const [videoUrls, setVideoUrls] = useState<any>(dataArray.filter((item) => (item !== "" && ''))); // Store video URLs
    const [loading, setLoading] = useState(false);
    const { courseName } = useTeacherContext();
    const [status, setStatus] = useState("")


    const toggleDropdown = () => {

        const handleTrigger = async () => {
            const match = week.match(/Week (\d+)/i); // Added 'i' for case-insensitivity
            let weekNumber;

            if (match) {
                weekNumber = parseInt(match[1]);
            } else {
                weekNumber = null; // Handle the case where there's no match
            }

            let course_name = "";
            if (courseName) {
                course_name = courseName.trim();
                console.log(course_name);
            }
            setLoading(true);
            try {
                const response = await fetch(`http://34.45.174.70:80/fetch_summary/?course_name=${course_name}&week=${weekNumber}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                console.log(data)

                if (data === "Summary not found for the given course and week" || !data) {
                    setIsOpen(!isOpen);
                }
                else {
                    router.push(`/subtopic/${week}`)
                }

                if (!response.ok) {
                    Alert.alert('Error', 'Something went wrong, please try again later.');
                }

            } catch (error) {
                Alert.alert('Error', 'Failed to connect to the server.');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        handleTrigger();
    };

    const handleInputChange = (index: number, value: string) => {
        const updatedUrls = [...videoUrls];
        updatedUrls[index] = value;
        setVideoUrls(updatedUrls);
    };

    const allVideosStored = videoUrls.every((url: any) => url !== '');

    const storeVideos = async () => {
        setLoading(true);
        setStatus("storing video....")
        await storeVideo(dataArray);
        // Automatically run the handleTrigger function after storing videos
    };

    const storeVideo = async (dataArray: string[]) => {
        const match = week.match(/Week (\d+)/i);
        let weekNumber = match ? parseInt(match[1]) : null;

        const cName = courseName?.trim(); // Use your appropriate variable for teacher's name
        let url = `http://34.45.174.70:80/store_video?week=${weekNumber}&course_name=${cName}`;

        dataArray.forEach((topic, index) => {
            if (topic.trim() === "") {
                return null; // Return null instead of undefined
            }
            const videoUrl = videoUrls[index];
            if (videoUrl !== undefined && videoUrl !== null && videoUrl.trim() !== "") {
                url += `&topic_names=${topic.trim()}&video_urls=${videoUrl}`;
            }
        });

        console.log("url check", url)


        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (response.ok) {
                setStatus("generating summary...")
                Alert.alert('Success', `Video for ${subTopic} stored successfully.`);
                setLoading(false);
                setIsOpen(false);
                handleTrigger();
            } else {
                Alert.alert('Error', data.message || 'Something went wrong, please try again later.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server.');
            console.error('Error:', error);
        }
    };

    const handleTrigger = async () => {
        const match = week.match(/Week (\d+)/i);
        let weekNumber;

        if (match) {
            weekNumber = parseInt(match[1]);
        } else {
            weekNumber = null; // Handle the case where there's no match
        }

        const url = `http://34.45.174.70:80/generate_summary/?course_name=${courseName.trim()}&week=${weekNumber}`;

        setLoading(true);
        try {
            // Constructing the URL with query parameters
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            console.log(data)

            if (response.ok) {
                setStatus("generating quiz...")
                handleQuizGeneration();
            } else {
                Alert.alert('Error', 'Something went wrong, please try again later.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuizGeneration = async () => {
        // Extract the week number from the week string
        const match = week.match(/Week (\d+)/i);
        let weekNumber;

        if (match) {
            weekNumber = parseInt(match[1]);
        } else {
            weekNumber = null; // Handle the case where there's no match
        }

        // Construct the URL with the necessary query parameters

        console.log(courseName, weekNumber)
        const url = `http://34.45.174.70:80/generate_quiz/?course_name=${courseName.trim()}&week=${weekNumber}`;

        setLoading(true); // Set loading state to true
        try {
            // Send a POST request to the API
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json(); // Parse the JSON response

            if (response.ok) {
                setStatus("generated quiz")
                Alert.alert('Success', 'Quiz saved successfully.');
            } else {
                Alert.alert('Error', data.message || 'Something went wrong, please try again later.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server.');
            console.error('Error:', error);
        } finally {
            setLoading(false); // Set loading state to false
        }
    };


    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <Text>{status}</Text>
                <ActivityIndicator size="large" color="#c4210b" />
            </View>
        );
    }


    return (
        <View style={styles.card}>

            <View style={styles.card1}>
                <TouchableOpacity onPress={toggleDropdown} style={styles.header}>
                    <View style={styles.innerShadow} />
                    <View style={styles.content}>
                        <Text style={styles.weekText}>{week}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <Modal visible={isOpen} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.headerText}>Enter the video URL for: {week}</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {dataArray.map((subtopic, index) => {
                            if (subtopic.trim() === "") {
                                return null; // Return null instead of undefined
                            }
                            return (
                                <View key={index} style={styles.subtopicInputContainer}>
                                    <Text style={styles.subtopicText}>{subtopic}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter video URL"
                                        value={videoUrls[index]}
                                        onChangeText={(value) => handleInputChange(index, value)}
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>
                    <Button
                        title="Store Videos"
                        color={"#c4210b"}
                        onPress={storeVideos}
                        disabled={!allVideosStored} // Disable if loading or if not all URLs are valid
                    />
                    <br />
                    <Button title="Close" color="#c4210b" onPress={() => setIsOpen(false)} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 10,
        overflow: 'hidden',
    },
    header: {
    },
    weekText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    card1: {
        // backgroundColor: '#f9f9f9',
        padding: 10,
        marginBottom: 8,
        elevation: 2, // Shadow effect for Android
        position: 'relative',
        borderRadius: 20,
        // borderColor: "#a81400",
        // borderWidth: 3,
        overflow: 'hidden', // Ensures inner shadow doesn't overflow
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    subtopicInputContainer: {
        marginBottom: 10,
    },
    subtopicText: {
        fontSize: 16,
        marginBottom: 5,
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
    content: {
        position: 'relative', // Ensure the content appears above the shadow
        zIndex: 2,
        margin: 20,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    headerText: {
        fontSize: 20,                // Increase the font size
        fontWeight: 'bold',          // Make the font bold
        color: '#333',               // Set a dark color for better visibility
        marginBottom: 10,            // Add some space below the text
        textAlign: 'center',         // Center the text
    },
    loaderContainer: {
        flex: 1,
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
});

export default WeekCard;
