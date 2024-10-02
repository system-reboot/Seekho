import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ImageBackground } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { router } from 'expo-router';
import { useTeacherContext } from '@/context/TeacherId';
import { Switch } from 'react-native-paper';

// @ts-expect-error
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Icon

const Tab = createBottomTabNavigator();

function LoginScreen() {

    const [username, setName] = useState();
    const [password, setPassword] = useState();
    const [isSwitchOn, setIsSwitchOn] = React.useState(true);

    const { setTeacherData } = useTeacherContext()
    const onToggleSwitch = () => setIsSwitchOn(isSwitchOn);

    const userType = isSwitchOn ? "teacher" : "user";

    const url = `http://34.45.174.70:80/login?username=${username}&password=${password}&user_type=${userType}`;

    const handleLogin = async () => {
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
        }
    };

    const handleGuest = () => {
        router.push("/(tabs)/(user)/")
    }

    return (

        <View style={styles.container}>
            <View style={styles.outerContainer}>
                <Text style={styles.header}>Login</Text>
                <TextInput style={styles.input} placeholder="Name" onChangeText={(newText: any) => setName(newText)}
                />
                <TextInput style={styles.input} placeholder="Password" onChangeText={(newText: any) => setPassword(newText)} secureTextEntry />
                <View style={styles.box}>
                    <Text>student</Text>
                    <Switch value={isSwitchOn} onValueChange={onToggleSwitch} color='#a81400' />
                    <Text>teacher</Text>
                    <br />
                </View>
                <Button title="Login" onPress={handleLogin} color={"#a81400"} />
            </View>
        </View>

    );
}


function SignupScreen({ navigation }: { navigation: any }) {

    const [username, setName] = useState();
    const [password, setPassword] = useState();
    const [isSwitchOn, setIsSwitchOn] = React.useState(true);

    const onToggleSwitch = () => setIsSwitchOn(isSwitchOn);

    const userType = isSwitchOn ? "teacher" : "user";

    const url = `http://34.45.174.70:80/signup?username=${username}&password=${password}&user_type=${userType}`;


    const handleSignup = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please fill out all fields');
            return;
        }

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
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.outerContainer}>
                <Text style={styles.header}>Signup</Text>
                <TextInput style={styles.input} placeholder="Name" onChangeText={(newText: any) => setName(newText)}
                />
                <TextInput style={styles.input} placeholder="Password" onChangeText={(newText: any) => setPassword(newText)} secureTextEntry />
                <View style={styles.box}>
                    <Text>student</Text>
                    <Switch value={isSwitchOn} onValueChange={onToggleSwitch} color='#a81400' />
                    <Text>teacher</Text>
                    <br />
                </View>
                <Button title="Signup" onPress={handleSignup} color={"#a81400"} />
            </View>
        </View>

    );
}

export default function Login() {
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
                    headerTitle: "SEEKHO",
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
    background: {
        flex: 1, // Ensure the image fills the screen
        justifyContent: 'center', // Adjust this as needed
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: "#a81400",
        margin: 10,
        borderRadius: 5,
    },
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
    header: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    box: {
        display: "flex",
        flexDirection: "row",
        gap: 10,
        padding: 10
    }
});
