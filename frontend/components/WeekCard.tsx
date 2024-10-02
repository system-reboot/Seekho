import { useTeacherContext } from '@/context/TeacherId';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button, Alert, Modal, ScrollView,ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';


type WeekCardProp = {
    week: string,
    subTopic: string;
}

const WeekCard = ({ week, subTopic }: WeekCardProp) => {
    const [isOpen, setIsOpen] = useState(false);
    const dataArray = subTopic ? subTopic.split("*") : [];
    const [videoUrls, setVideoUrls] = useState<any>(dataArray.filter((item) => (item!== ""  && ''))); // Store video URLs
    const [loading, setLoading] = useState(false);
    const { courseName } = useTeacherContext();


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
                
                if(data === "Summary not found for the given course and week")
                {
                    setIsOpen(!isOpen);
                }
                else{
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

    const allVideosStored = videoUrls.every((url:any) => url !== '');

    const storeVideos = async () => {
        setLoading(true);
        for (let i = 0; i < dataArray.length; i++) {
            const videoUrl:string = videoUrls[i];
            if (videoUrl !== undefined ) {
                await storeVideo(dataArray[i], videoUrl);
            }
        }
        setLoading(false);
        setIsOpen(false); 
        handleTrigger(); // Automatically run the handleTrigger function after storing videos
    };

    const storeVideo = async (subTopic: string, videoUrl: string) => {
        const match = week.match(/Week (\d+)/i);
        let weekNumber = match ? parseInt(match[1]) : null;

        const teacherName = courseName?.trim(); // Use your appropriate variable for teacher's name
        const url = `http://34.45.174.70:80/store_video/?video_url=${videoUrl}&week=${weekNumber}&topic_name=${subTopic.trim()}&course_name=${teacherName}`;
    
        try {
            const response = await fetch(url, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', `Video for ${subTopic} stored successfully.`);
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
                // Handle successful response here if needed
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

        console.log(courseName,weekNumber)
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
                // Handle successful response here if needed
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
                <ActivityIndicator size="large" color="#c4210b" />
            </View> 
        );
    }


    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={toggleDropdown} style={styles.header}>
                <Text style={styles.weekText}>{week}</Text>
            </TouchableOpacity>
            <Modal visible={isOpen} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.headerText}>Enter the video URL for: {week}</Text>
                    <ScrollView>
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
                    <br/>
                    <Button title="Close" color="#c4210b" onPress={() => setIsOpen(false)} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
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
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical:20,
    },
});

export default WeekCard;
