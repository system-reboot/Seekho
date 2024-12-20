import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TextInput, TouchableOpacity, Button, ActivityIndicator, FlatList } from 'react-native';
import { router, Stack, useLocalSearchParams, useNavigation, useNavigationContainerRef } from 'expo-router';
import { useTeacherContext } from '@/context/TeacherId';
import { Picker } from '@react-native-picker/picker';
import { MarkdownView } from 'react-native-markdown-view'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
// @ts-expect-error
import Ionicons from 'react-native-vector-icons/Ionicons';
import { App } from './YotubePlayer';
import VideoPlayer from './Videoplayer';
// import VideoScreen from './Videoplayer';

// Load the module



const WeekNotes = React.memo(() => {
    const { name } = useLocalSearchParams();
    const { courseName } = useTeacherContext();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState();
    const [selectedLevel, setSelectedLevel] = useState("undergrad");
    const [selectedLanguage, setSelectedLanguage] = useState(0); // Default to English
    const [refresh, setRefresh] = useState(true); // Default to English
    const navigation = useNavigation()

    // Language mapping
    const languageMap = [
        "english",
        "hindi",
        "telugu",
        "tamil",
        "bengali",
    ]


    useEffect(() => {
        const handleTrigger = async () => {
            const week = Array.isArray(name) ? name[0] : name;

            const match = week.match(/Week (\d+)/i);
            let weekNumber;

            if (match) {
                weekNumber = parseInt(match[1]);
            } else {
                weekNumber = null;
            }

            let course_name = "";
            if (courseName) {
                course_name = courseName.trim();
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
                setData(data);

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
    }, [refresh]); // Trigger API call whenever selected language changes




    const handleChange = async (itemValue: any) => {

        const week = Array.isArray(name) ? name[0] : name;

        setSelectedLanguage(itemValue)

        const match = week.match(/Week (\d+)/i);
        let weekNumber;

        if (match) {
            weekNumber = parseInt(match[1]);
        } else {
            weekNumber = null;
        }

        let course_name = "";
        if (courseName) {
            course_name = courseName.trim();
        }

        setLoading(true);

        if (languageMap[itemValue] === "english") {
            setRefresh(!refresh)
            return;
        }

        try {
            const response = await fetch(`http://34.45.174.70:80/translate/?course_name=${course_name}&week=${weekNumber}&level=${selectedLevel}&target_language_code=${languageMap[itemValue]}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            setData((prevData: any) => {
                return {
                    ...prevData,
                    [selectedLevel]: data,
                }
            });
            console.log(data)

            if (!response.ok) {
                Alert.alert('Error', 'Something went wrong, please try again later.');
            }

        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }


    return (
        <View style={styles.container}>

            <Stack.Screen
                options={{
                    headerTitle: Array.isArray(name) ? name[0] : name || 'Course Details',
                    headerTitleStyle: {
                        color: "black",
                        fontSize: 20,
                        fontWeight: 700,
                        width: 230,
                        numberOfLines: 1,  // Limit to one line
                        ellipsizeMode: "tail",
                    },
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.push("/details/Created Courses")} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: "black",
                    headerShown: true,
                }}
            />
            <ScrollView style={styles.scrollView}>
                <MarkdownView>
                    {!loading ? data && data[selectedLevel] : "loading..."}
                </MarkdownView>
            </ScrollView>
            <View style={styles.pickerContainer}>
                <View style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <View style={styles.pickerWrapper}>
                        <View style={styles.innerShadow} />
                        <View style={styles.content}>
                            <Picker
                                selectedValue={selectedLevel}
                                onValueChange={(itemValue) => setSelectedLevel(itemValue)}
                                style={styles.picker}
                            >
                                {selectedLevel === "" && (
                                    <Picker.Item label="Select Level" value="" />
                                )}
                                <Picker.Item label="Difficulty : Undergrad" value="undergrad" />
                                <Picker.Item label="Difficulty : Teenager" value="teenagers" />
                                <Picker.Item label="Difficulty : Expert" value="experts" />
                            </Picker>

                        </View >
                    </View>
                </View>
                <View style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <View style={styles.pickerWrapper}>
                        <View style={styles.innerShadow} />
                        <View style={styles.content}>
                            <Picker
                                selectedValue={selectedLanguage}
                                onValueChange={(itemValue: any) => handleChange(itemValue)}
                                style={styles.picker}
                            >
                                {selectedLanguage === 0 && (
                                    <Picker.Item label="Select Language" value="" />
                                )}
                                {Object.entries(languageMap).map(([value, label]) => (
                                    <Picker.Item
                                        key={value}
                                        label={label.charAt(0).toUpperCase() + label.slice(1)}
                                        value={value}
                                    />
                                ))}
                            </Picker>

                        </View>
                    </View>
                </View>
            </View>



            {/* Scrollable content based on selected level */}
        </View>
    );
})


const sub = React.memo(() => {
    const { name } = useLocalSearchParams();
    const week = Array.isArray(name) ? name[0] : name;
    const [loading, setLoading] = useState(true);
    const [subtopics, setSubTopic] = useState<any>([]);
    const [videos, setVideos] = useState<any>();
    const [selectedSubtopic, setSelectedSubtopic] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { courseName, teacherName } = useTeacherContext();
    const [selectedLevel, setSelectedLevel] = useState();
    const navigation = useNavigation();
    const ref = useRef(null);

    useEffect(() => {
        (async () => {
            const url = `http://34.45.174.70:80/courses/?teacher_id=${teacherName}`;

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                const filterData: any[] = data.filter((item: any) => Object.keys(item).includes(courseName));

                if (filterData.length === 0) {
                    console.error("No data found matching the criteria.");
                    return;
                }

                const getKeys: any = Object.keys(filterData[0]);
                if (!getKeys[1]) {
                    console.error("getKeys[1] is undefined.");
                    return;
                }

                const contextKeys = Object.keys(filterData[0][getKeys[1]]);

                if (contextKeys.length === 0 || !filterData[0][getKeys[1]][contextKeys[0]]["content_layout"]) {
                    console.error("Context key or content layout not found.");
                    return;
                }

                setSubTopic(filterData[0][getKeys[1]][contextKeys[0]]["content_layout"][name].split("*"));
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSubtopicPress = async (subtopic: string) => {
        setSelectedSubtopic(subtopic);

        const match = week.match(/Week (\d+)/i);
        let weekNumber;

        if (match) {
            weekNumber = parseInt(match[1]);
        } else {
            weekNumber = null; // Handle the case where there's no match
        }

        console.log(courseName, week, subtopic)

        const url = `http://34.45.174.70:80/fetch_video?course_name=${courseName.trim()}&week=${weekNumber}&topic_name=${subtopic.trim()}`;
        setLoading(true);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error("Failed to fetch video data");
                return;
            }

            const videoData = await response.json();
            setVideos(videoData.video_url);
            console.log(videoData);
            setIsModalVisible(true); // Show the modal after fetching video details
        } catch (error) {
            console.error('Error fetching video:', error);
        } finally {
            setLoading(false);
            setIsModalVisible(true); // Show the modal
        }
    };

    const closeModal = () => {
        setIsModalVisible(false); // Close the modal
    };

    function isYoutubeUrl(url: string): boolean {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return youtubeRegex.test(url);
    }

    const handleLanguageChange = async (itemValue: string) => {
        setSelectedLevel(itemValue);

        if (itemValue == "english") {
            handleSubtopicPress(selectedSubtopic)
            return;
        }

        const match = week.match(/Week (\d+)/i);
        let weekNumber = match ? parseInt(match[1]) : null;

        console.log(selectedSubtopic, itemValue)
        const url = `http://34.45.174.70:80/lang_change?course_name=${courseName.trim()}&week=${weekNumber}&topic_name=${selectedSubtopic.trim()}&target_language=${itemValue}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                console.error("Failed to change language");
                return;
            }

            const data = await response.json();
            setVideos(data);
        } catch (error) {
            console.error("Error changing language:", error);
        }
    };

    console.log(videos)

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <Stack.Screen
                    options={{
                        headerTitle: "loading...",
                        headerTitleStyle: {
                            color: "black",
                            fontSize: 20,
                            fontWeight: 700,
                            width: 230,
                            numberOfLines: 1,  // Limit to one line
                            ellipsizeMode: "tail",
                        },
                        headerStyle: {
                            backgroundColor: "white",
                        },
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="black" />
                            </TouchableOpacity>
                        ),
                        headerTintColor: "black",
                        headerShown: true,
                    }}
                />
                <ActivityIndicator size="large" color="#c4210b" />
            </View>
        );
    }

    const isYoutube = isYoutubeUrl(videos);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: "Subtopics",
                    headerTitleStyle: {
                        color: "black",
                        fontSize: 20,
                        fontWeight: 700,
                        width: 230,
                        numberOfLines: 1,  // Limit to one line
                        ellipsizeMode: "tail",
                    },
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: "black",
                    headerShown: true,
                }}
            />
            <ScrollView>
                {subtopics.filter((subtopic: any) => subtopic.trim() !== '').map((subtopic: any, index: any) => (
                    <View key={index + subtopic}>
                        <TouchableOpacity onPress={() => handleSubtopicPress(subtopic)}>
                            <View style={styles.innerShadow} />
                            <View style={styles.content}>
                                <View style={styles.subtopicContainer}>
                                    <Text style={styles.subtopicText}>{subtopic}</Text>
                                </View>
                                <Ionicons name="caret-forward" size={20} color={"#cf8a81"} />
                            </View>
                        </TouchableOpacity>
                        <br />
                    </View>
                ))}
            </ScrollView>

            {/* Modal for displaying video and random text */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Choose Audio:</Text>
                        <View style={styles.pickerWrapper}>
                            <View style={styles.innerShadow} />
                            <View style={styles.content}>
                                <Picker
                                    selectedValue={selectedLevel}
                                    onValueChange={handleLanguageChange} // Trigger API on language change
                                    style={styles.picker}
                                >
                                    <Picker.Item label="English" value="english" />
                                    <Picker.Item label="Hindi" value="hindi" />
                                    <Picker.Item label="Telugu" value="telugu" />
                                    <Picker.Item label="Tamil" value="tamil" />
                                    <Picker.Item label="Bengali" value="bengali" />
                                </Picker>
                                <br />
                            </View>
                        </View>

                        {isYoutube ? (
                            <App uriId={videos} />
                        ) : (
                            <VideoPlayer url={videos} />
                        )}
                        <br />
                        <Button title="Close" onPress={closeModal} color={"#a81400"} />
                    </View>
                </View>
            </Modal>
        </View>
    );
});



const quiz = React.memo(() => {
    const { name } = useLocalSearchParams();
    const week = Array.isArray(name) ? name[0] : name;
    const { courseName } = useTeacherContext();
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState<any>();
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const [newOptions, setNewOptions] = useState<string[]>(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        const handleFetchQuiz = async () => {
            const match = week.match(/Week (\d+)/i);
            let weekNumber;

            if (match) {
                weekNumber = match[1]; // Get the week number from the match
            } else {
                console.error("Invalid week format");
                return;
            }

            const url = `http://34.45.174.70:80/fetch_quiz?course_name=${courseName.trim()}&week=${weekNumber}`;

            setLoading(true);
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    setQuizData(data);
                } else {
                    Alert.alert('Error', data.message || 'Something went wrong, please try again later.');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to connect to the server.');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        handleFetchQuiz();
    }, []);

    const handleOptionSelect = (questionKey: string, option: string) => {
        if (selectedAnswers[questionKey]) return; // Prevent selecting another option after answering

        const correctAnswer = quizData.answers[questionKey];
        setSelectedAnswers(prev => ({ ...prev, [questionKey]: option }));

        if (option.trim() === correctAnswer.trim()) {
            setFeedback(prev => ({ ...prev, [questionKey]: 'Correct!' }));
        } else {
            setFeedback(prev => ({
                ...prev,
                [questionKey]: `Wrong! Correct answer: ${correctAnswer}`,
            }));
        }
    };

    const handleAddNewQuestion = async () => {
        const newKey = (Object.keys(quizData.questions).length + 1).toString();
        
        // Update local state with the new question, options, and answer
        const updatedQuizData = {
            ...quizData,
            questions: { ...quizData.questions, [newKey]: newQuestion },
            options: { ...quizData.options, [newKey]: newOptions },
            answers: { ...quizData.answers, [newKey]: correctAnswer }
        };
    
        setQuizData(updatedQuizData);
        setModalVisible(false);
        setNewQuestion('');
        setNewOptions(['', '', '', '']);
        setCorrectAnswer('');
    
        // Prepare the POST request URL
        const match = week.match(/Week (\d+)/i);
        let weekNumber;
    
        if (match) {
            weekNumber = match[1];
        } else {
            console.error("Invalid week format");
            return;
        }
    
        const url = `http://34.45.174.70:80/upload_quiz`;
    
        try {
            // Send POST request to upload the updated quiz data
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    week:weekNumber,
                    course_name:courseName.trim(),
                    quiz:updatedQuizData
                }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                Alert.alert('Success', 'Question added and quiz updated successfully!');
            } else {
                Alert.alert('Error', data.message || 'Something went wrong, please try again later.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server.');
            console.error('Error:', error);
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
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: "Quiz",
                    headerTitleStyle: {
                        color: "black",
                        fontSize: 20,
                        fontWeight: 700,
                        width: 230,
                        numberOfLines: 1,  // Limit to one line
                        ellipsizeMode: "tail",
                    },
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: "black",
                    headerShown: true,
                }}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                {quizData?.questions && Object.keys(quizData.questions).map((key, index) => (
                    <View key={index} style={styles.questionContainer}>
                        <Text style={styles.questionText}>{`${key}. ${quizData.questions[key]}`}</Text>

                        {/* Check if options and answers are available */}
                        {quizData.options && quizData.answers && quizData.options[key] ? (
                            <View>
                                {quizData.options[key].map((option: string, optionIndex: number) => (
                                    <TouchableOpacity
                                        key={optionIndex}
                                        style={[
                                            styles.optionButton,
                                            selectedAnswers[key] === option && (!feedback[key].includes("Wrong") ? styles.selectedOption : styles.wrongOption),
                                        ]}
                                        onPress={() => handleOptionSelect(key, option)}
                                        disabled={!!selectedAnswers[key]} // Disable button once an option is selected
                                    >
                                        <Text style={styles.optionText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                                {/* Display feedback */}
                                {feedback[key] && (
                                    <Text style={feedback[key].includes("Wrong") ? styles.wrongText : styles.feedbackText}>
                                        {feedback[key]}
                                    </Text>
                                )}
                            </View>
                        ) : null} {/* If no options, just show the question */}
                    </View>
                ))}

                {/* Add New Question Button */}
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add New Question</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal for Adding New Question */}
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainerQuiz}>
                    <Text style={styles.modalTitle}>Add New Question</Text>

                    <TextInput
                        placeholder="Enter Question"
                        style={styles.inputQuiz}
                        value={newQuestion}
                        onChangeText={setNewQuestion}
                    />

                    {newOptions.map((option, index) => (
                        <TextInput
                            key={index}
                            placeholder={`Option ${index + 1}`}
                            style={styles.inputQuiz}
                            value={option}
                            onChangeText={text => {
                                const updatedOptions = [...newOptions];
                                updatedOptions[index] = text;
                                setNewOptions(updatedOptions);
                            }}
                        />
                    ))}

                    <TextInput
                        placeholder="Correct Answer"
                        style={styles.inputQuiz}
                        value={correctAnswer}
                        onChangeText={setCorrectAnswer}
                    />

                    <Button title="Add" color="#c4210b" onPress={handleAddNewQuestion} />
                    <br/>
                    <Button title="Close" color="#c4210b" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
});



const DoubtSolver = React.memo(() => {
    const [chats, setChats] = useState([
        { type: 'sender', message: 'Hello, I have a doubt!' },
        { type: 'receiver', message: 'Sure, what is your doubt?' }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [userC, setuserC] = useState("");
    const [modalC, setModalC] = useState("");
    const [loading, setLoading] = useState(false);  // For typing indicator
    const navigation = useNavigation();
    const { name } = useLocalSearchParams();

    const week = Array.isArray(name) ? name[0] : name;
    const { courseName } = useTeacherContext();

    // Create a ref for the ScrollView
    const scrollViewRef = useRef(null);

    const match = week.match(/Week (\d+)/i);
    let weekNumber;

    if (match) {
        weekNumber = match[1]; // Get the week number from the match
    } else {
        console.error("Invalid week format");
        return;
    }

    console.log(weekNumber, courseName)

    const SolveDoubt = async () => {
        const url = `http://34.45.174.70:80/solve_doubt?user_context=${userC?.trim()}&model_context=${modalC?.trim()}&prompt=${newMessage}&course_name=${courseName?.trim()}&week=${weekNumber}`;

        setLoading(true); // Start typing indicator
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                setuserC(data.user_context);
                setModalC(data.model_context);
                setChats((prev) => [
                    ...prev.slice(0, -1), // Remove "typing..." message
                    { type: 'receiver', message: data.model_response } // Add response
                ]);
            } else {
                Alert.alert('Error', data.message || 'Something went wrong, please try again later.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server.');
            console.error('Error:', error);
        } finally {
            setLoading(false);  // Stop typing indicator
        }
    };

    const sendMessage = () => {
        if (newMessage.trim()) {
            setChats((prev) => [
                ...prev,
                { type: 'sender', message: newMessage },
                { type: 'receiver', message: 'Typing...' }  // Add typing indicator
            ]);
            SolveDoubt();
            setNewMessage('');

            // Scroll to the end after sending the message
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);  // Delay for smooth scroll
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: "Doubt Solver",
                    headerTitleStyle: {
                        color: "black",
                        fontSize: 20,
                        fontWeight: 700,
                        width: 230,
                        numberOfLines: 1,  // Limit to one line
                        ellipsizeMode: "tail",
                    },
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: "black",
                    headerShown: true,
                }}
            />
            <ScrollView
                style={styles.chatContainer}
                ref={scrollViewRef}  // Attach ref to ScrollView
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })} // Scroll when content changes
                showsVerticalScrollIndicator={false}
            >
                {chats.map((chat, index) => (
                    <View
                        key={index}
                        style={[styles.messageContainer, chat.type === 'receiver' ? styles.sender : styles.receiver]}
                    >
                        <Text style={styles.message}>{chat.message}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type your message..."
                    returnKeyType="send"
                    onSubmitEditing={sendMessage}
                />
                <Button title="Send" onPress={sendMessage} color="#a81400" />
            </View>
        </View>
    );
});




const Subtopic = () => {
    const Tab = createBottomTabNavigator()

    return (

        <NavigationContainer independent={true}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === 'Notes') {
                            iconName = 'information-circle-outline'; // Ionicons name for Login
                        } else if (route.name === 'Subtopics') {
                            iconName = 'bookmark'; // Ionicons name for Signup
                        } else if (route.name === "Quiz") {
                            iconName = "help"
                        } else if (route.name === "Doubt") {
                            iconName = "code"
                        }
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: "#a81400",
                    headerShown: false,
                    tabBarStyle: {
                        paddingTop: 10,
                        paddingBottom: 6,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: 'bold',
                    },
                })}
            >

                <Tab.Screen name="Notes" component={WeekNotes} />
                <Tab.Screen name="Subtopics" component={sub} />
                <Tab.Screen name="Quiz" component={quiz} />
                <Tab.Screen name="Doubt" component={DoubtSolver} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 0,
        padding: 10,
        backgroundColor: '#f0e6e6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 5,
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: "center",
        marginVertical: 5,
    },
    pickerWrapper: {
        flex: 1,
        marginHorizontal: 5,
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerShadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 10,
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
        padding: 10,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    picker: {
        height: 30,
        width: 150,
        color: '#333',
        border: 0,
    },
    pickerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,  // Space between title and picker
        color: '#333',
        zIndex: 2
    },
    activeTab: {
        backgroundColor: '#c4210b', // Active tab color
        borderColor: '#c4210b',
        borderWidth: 2,
    },
    scrollView: {
        flex: 1,
        marginBottom: 16,
        borderColor: 'black',
        borderWidth: 2,
        padding: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    subtopicContainer: {
        padding: 10,
        borderRadius: 5,
        width: 300,
        numberOfLines: 1,  // Limit to one line
        ellipsizeMode: "tail",
        elevation: 3,
    },
    subtopicText: {
        numberOfLines: 1,  // Limit to one line
        ellipsizeMode: "tail",
        fontSize: 16,
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    video: {
        alignSelf: 'center',
        margin: 20,
        padding: 20
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionText: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
    },
    optionButton: {
        padding: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 8,
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: "#d3ffd2", // Highlight selected option
    },
    wrongOption: {
        backgroundColor: "#ffbebe", // Highlight selected option
    },
    optionText: {
        fontSize: 16,
    },
    feedbackText: {
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 10,
        color: "green", // You can change color for correct/wrong feedback
    },
    wrongText: {
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 10,
        color: "red", // You can change color for correct/wrong feedback
    },
    chatContainer: {
        flex: 1,
        marginBottom: 10,
    },
    messageContainer: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        maxWidth: '70%',
    },
    sender: {
        backgroundColor: '#d1f7c4',
        alignSelf: 'flex-start',
    },
    receiver: {
        backgroundColor: '#cce0ff',
        alignSelf: 'flex-end',
    },
    message: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: "white",
        borderRadius: 5,
        marginRight: 10,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0e6e6',
    },
    backButton: {
        marginRight: 15,
        marginLeft: 15,
    },
    addButton: {
        backgroundColor: '#c4210b',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 20,
    },
    addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    modalContainerQuiz: { flex: 1, padding: 20, justifyContent: 'center' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    inputQuiz: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
});

export default Subtopic;
