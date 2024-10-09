import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ImageBackground, ActivityIndicator, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { useTeacherContext } from '@/context/TeacherId';
import { Switch } from 'react-native-paper';
import { LinearGradient } from "expo-linear-gradient"


// @ts-expect-error
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Icon
import { ScrollView } from 'react-native';

const Tab = createBottomTabNavigator();


function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isTeacher, setIsTeacher] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { setTeacherData } = useTeacherContext()
    const userType = isTeacher ? "teacher" : "user";


    const url = `http://34.45.174.70:80/login?username=${username}&password=${password}&user_type=${userType}`;


    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill out all fields');
            return;
        }

        setLoading(true);
        if (!username || !password) {
            Alert.alert('Error', 'Please fill out all fields');
            return;
        }

        console.log("yes")
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            console.log(data)
            if (response.ok) {
                setTeacherData({
                    teacherName: username
                })

                if (data.message === 'Login successful') {
                    Alert.alert('Success', data.message);
                    router.push("/(tabs)/(user)/")
                } else {
                    Alert.alert('Error', data.message);
                }
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




    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loaderContainer}>
                    <Stack.Screen options={{
                        headerTitle: "loading...",
                        headerShown: true,
                    }} />
                    <ActivityIndicator size="large" color="#a81400" />
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerTitle: "Seekho", headerShown: true }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.formContainer}>
                        <Text style={styles.header}>Welcome Back</Text>
                        <Text style={styles.subHeader}>Sign in to continue</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Student</Text>
                            <Switch
                                value={isTeacher}
                                onValueChange={setIsTeacher}
                                color='#a81400'
                            />
                            <Text style={styles.switchLabel}>Teacher</Text>
                        </View>

                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Text style={styles.forgotPassword}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


function SignupScreen({ navigation }: { navigation: any }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isTeacher, setIsTeacher] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const userType = isTeacher ? "teacher" : "user";

    const url = `http://34.45.174.70:80/signup?username=${username}&password=${password}&user_type=${userType}`;

    const handleSignup = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill out all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await response.json();

            if (response.ok) {
                if (data.message === 'User created successfully') {
                    Alert.alert('Success', data.message);
                    navigation.navigate("Login");
                } else {
                    Alert.alert('Error', data.message);
                }
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

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loaderContainer}>
                    <Stack.Screen options={{
                        headerTitle: "loading...",
                        headerShown: true,
                    }} />
                    <ActivityIndicator size="large" color="#a81400" />
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerTitle: "Seekho", headerShown: true }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.formContainer}>
                        <Text style={styles.header}>Create Account</Text>
                        <Text style={styles.subHeader}>Sign up to get started</Text>

                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Student</Text>
                            <Switch
                                value={isTeacher}
                                onValueChange={setIsTeacher}
                                color='#a81400'
                            />
                            <Text style={styles.switchLabel}>Teacher</Text>
                        </View>

                        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                            <Text style={styles.signupButtonText}>Sign Up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.loginLink}>Already have an account? Log in</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export default function Login() {

    const CoolHeader = () => (
        <LinearGradient
            colors={['white', 'white']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerContainer}
        >
            <Image
                source={{ uri: 'https://cdn.discordapp.com/attachments/1277183421483057264/1293616447062278257/Logo.png?ex=670805b3&is=6706b433&hm=991c635348246c0abf69e270fe190810329ec6c8cf7321bc718433741e0edb1d&' }}
                style={styles.logo}
                resizeMode="contain"
            />
            {/* <Text style={styles.headerText}>SEEKHO</Text>
            <View style={styles.underline} /> */}
        </LinearGradient>
    );


    return (
        <NavigationContainer independent={true}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === 'Login') {
                            iconName = 'log-in-outline'; // Ionicons name for Login
                        } else if (route.name === 'Signup') {
                            iconName = 'person-add-outline'; // Ionicons name for Signup
                        }
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: "#a81400",
                    header: () => <CoolHeader />,
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
                <Tab.Screen name="Login" component={LoginScreen} />
                <Tab.Screen name="Signup" component={SignupScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0e6e6', // Light red background color
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    formContainer: {
        width: '90%',
        maxWidth: 400,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    logo: {
        width: 150,
        height: 150,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 20,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    switchLabel: {
        marginHorizontal: 10,
        fontSize: 16,
        color: '#666',
    },
    loginButton: {
        backgroundColor: '#a81400',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        textAlign: 'center',
        marginTop: 20,
        color: '#a81400',
        fontSize: 16,
    },
    background: {
        flex: 1, // Ensure the image fills the screen
        justifyContent: 'center', // Adjust this as needed
    },
    // container: {
    //     flex: 1,
    //     justifyContent: 'center',
    //     backgroundColor: "#a81400",
    //     margin: 10,
    //     borderRadius: 5,
    // },
    outerContainer: {
        padding: 20,
        marginVertical: "auto",
        justifyContent: 'center',
        backgroundColor: "#f6f6f6f1",
        margin: 10,
        borderRadius: 5,
        // Shadow properties for iOS
        shadowColor: "#000", // Shadow color
        shadowOffset: {
            width: 0, // Horizontal offset
            height: 2, // Vertical offset
        },
        shadowOpacity: 0.1, // Opacity of the shadow
        shadowRadius: 4, // Radius of the shadow
        // Elevation for Android
        elevation: 5,  // Elevation level
    },
    innerContainer: {
        flex: 1,
        borderRadius: 5,
        backgroundColor: "#f6f6f6f1",
        // Create the inner shadow effect
        shadowColor: '#000', // Shadow color
        shadowOffset: {
            width: 0,
            height: -2, // Move shadow upward for inner effect
        },
        shadowOpacity: 0.2, // Increase opacity for inner shadow
        shadowRadius: 4, // Radius of the shadow
    },
    box: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
        padding: 10
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupButton: {
        backgroundColor: '#a81400',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    signupButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginLink: {
        textAlign: 'center',
        marginTop: 20,
        color: '#a81400',
        fontSize: 16,
    },
    headerContainer: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 2,
    },
    underline: {
        width: 40,
        height: 3,
        backgroundColor: 'white',
        marginTop: 5,
    },
});
