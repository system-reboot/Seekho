import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TextInput, TouchableOpacity, Button, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useNavigation, useNavigationContainerRef } from 'expo-router';
import { useTeacherContext } from '@/context/TeacherId';
import { Picker } from '@react-native-picker/picker';
import { MarkdownView } from 'react-native-markdown-view'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
// @ts-expect-error
import Ionicons from 'react-native-vector-icons/Ionicons';
import App from './Videoplayer';
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
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="black" />
                        </TouchableOpacity>
                    ),
                    headerTintColor: "black",
                    headerShown: true,
                }}
            />
            <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapper}>
                    <View style={styles.innerShadow} />
                    <View style={styles.content}>
                        <Text style={styles.pickerTitle}>Select Level</Text> {/* Title for the first picker */}
                        <Picker
                            selectedValue={selectedLevel}
                            onValueChange={(itemValue) => setSelectedLevel(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Undergrad" value="undergrad" />
                            <Picker.Item label="Teenager" value="teenagers" />
                            <Picker.Item label="Expert" value="experts" />
                        </Picker>
                    </View >
                </View>
                <View style={styles.pickerWrapper}>
                    <View style={styles.innerShadow} />
                    <View style={styles.content}>
                        <Text style={styles.pickerTitle}>Select Language</Text> {/* Title for the second picker */}
                        <Picker
                            selectedValue={selectedLanguage}
                            onValueChange={(itemValue: any) => handleChange(itemValue)}
                            style={styles.picker}
                        >
                            {languageMap.map((label, value) => (
                                <Picker.Item key={value} label={label.charAt(0).toUpperCase() + label.slice(1)} value={value} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>



            {/* Scrollable content based on selected level */}
            <ScrollView style={styles.scrollView}>
                <MarkdownView>
                    {!loading ? data && data[selectedLevel] : "loading..."}
                </MarkdownView>
            </ScrollView>
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
    const [selectedLevel, setSelectedLevel] = useState()
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

        const url = `http://34.45.174.70:80/fetch_video?course_name=${courseName}&week=${weekNumber}&topic_name=${subtopic.trim()}`;
        setLoading(true)
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


            const extractYouTubeVideoID = (url) => {
                const urlObj = new URL(url);
                return urlObj.searchParams.get('v');
            };

            setVideos(extractYouTubeVideoID(videoData.video_url));
            console.log(videoData)
            setIsModalVisible(true); // Show the modal after fetching video details
        } catch (error) {
            console.error('Error fetching video:', error);
        } finally {

            setLoading(false)
            setIsModalVisible(true); // Show the modal
        }
    };

    const closeModal = () => {
        setIsModalVisible(false); // Close the modal
    };



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


    console.log(videos)
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
            <ScrollView >
                {subtopics.filter((subtopic: any) => subtopic.trim() !== '').map((subtopic: any, index: any) => (
                    <>
                        <TouchableOpacity key={index + subtopic} onPress={() => handleSubtopicPress(subtopic)}>
                            <View style={styles.innerShadow} />
                            <View style={styles.content}>
                                <View style={styles.subtopicContainer}>
                                    <Text style={styles.subtopicText}>{subtopic}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <br />
                    </>
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
                        <Text style={styles.modalText}>Selected Subtopic: {selectedSubtopic}</Text>
                        <Text style={styles.modalText}>Choose Audio:</Text>
                        <Picker
                            selectedValue={selectedLevel}
                            onValueChange={(itemValue) => {
                                setSelectedLevel(itemValue)
                            }}
                            style={styles.picker}
                        >
                            <Picker.Item label="English" value="english" />
                            <Picker.Item label="Hindi" value="hindi" />
                            <Picker.Item label="Bengali" value="bengali" />
                        </Picker>
                        <br />
                        {/* Replace with actual video URL if needed */}
                        <App videoId={videos} />
                        <br />
                        <Button title="Close" onPress={closeModal} color={"#a81400"} />
                    </View>
                </View>
            </Modal>
        </View>
    );
})


const quiz = React.memo(() => {
    const { name } = useLocalSearchParams();

    const week = Array.isArray(name) ? name[0] : name;
    const [loading, setLoading] = useState(true);
    const [quizData, setData] = useState<any>();
    const { courseName } = useTeacherContext();
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

                console.log(data)

                if (response.ok) {
                    setData(data)
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
    }, [])

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <Stack.Screen options={{
                    headerTitle: "loading...",
                    headerShown: true,
                }} />

                <ActivityIndicator size="large" color="#c4210b" />
            </View>
        );
    }

    return (
        <View>
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
            <ScrollView style={styles.container}>
                {quizData?.questions && Object.keys(quizData.questions).map((key) => {
                    return (
                        <View key={key} style={styles.questionContainer}>
                            <Text style={styles.questionText}>{`${key}. ${quizData.questions[key]}`}</Text>
                            {/* {quizData.options[key].map((option: any, index: any) => (
                        <Text key={index} style={styles.optionText}>{option}</Text>
                    ))} */}
                            {/* <Text style={styles.answerText}>{`Correct Answer: ${quizData.answers[key]}`}</Text> */}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    )
})


const DoubtSolver = React.memo(() => {
    const [chats, setChats] = useState([
        { type: 'sender', message: 'Hello, I have a doubt!' },
        { type: 'receiver', message: 'Sure, what is your doubt?' }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [userC, setuserC] = useState("")
    const [modalC, setModalC] = useState("")
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation()


    const SolveDoubt = async () => {

        const url = `http://34.45.174.70:80/solve_doubt?user_context=${userC.trim()}&model_context=${modalC}&prompt=${newMessage}`;

        setLoading(true);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            console.log(data)

            if (response.ok) {
                setuserC(data.user_context);
                setModalC(data.model_context);
                setChats((prev) => [...prev, { type: 'receiver', message: data.model_response }]);
            } else {
                Alert.alert('Error', data.message || 'Something went wrong, please try again later.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to connect to the server.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }




    const sendMessage = () => {
        if (newMessage.trim()) {
            setChats((prev) => [...prev, { type: 'sender', message: newMessage }]);
            SolveDoubt();
            setNewMessage('');
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
            <ScrollView style={styles.chatContainer}>
                {chats.map((chat, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageContainer,
                            chat.type === 'receiver' ? styles.sender : styles.receiver
                        ]}
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
                />
                <Button title="Send" onPress={sendMessage} color="#a81400" />
            </View>
        </View>
    );
})


const Subtopic = () => {
    const Tab = createBottomTabNavigator()

    return (

        <NavigationContainer independent={true}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === 'notes') {
                            iconName = 'information-circle-outline'; // Ionicons name for Login
                        } else if (route.name === 'subtopic') {
                            iconName = 'bookmark'; // Ionicons name for Signup
                        } else if (route.name === "quiz") {
                            iconName = "help"
                        } else if (route.name === "doubt") {
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

                <Tab.Screen name="notes" component={WeekNotes} />
                <Tab.Screen name="subtopic" component={sub} />
                <Tab.Screen name="quiz" component={quiz} />
                <Tab.Screen name="doubt" component={DoubtSolver} />
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
        justifyContent: 'space-between',
        marginVertical: 10,
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
    },
    picker: {
        width: '100%',
        height: 40,
        color: '#333',
        borderRadius: 10,
    },
    pickerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,  // Space between title and picker
        color: '#333',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    subtopicText: {
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
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    questionText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    optionText: {
        marginLeft: 10,
        fontSize: 14,
    },
    answerText: {
        marginTop: 5,
        fontStyle: 'italic',
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
        backgroundColor:"white",
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
});

export default Subtopic;
