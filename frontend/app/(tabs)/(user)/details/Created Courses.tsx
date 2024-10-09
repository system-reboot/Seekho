import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTeacherContext } from '@/context/TeacherId';
import { Ionicons } from '@expo/vector-icons'; // Import Icon

export default function RootLayout() {
    const [courseList, setCourseList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { teacherName, setTeacherData } = useTeacherContext();
    const [showArrow, setShowArrow] = useState(false); // State to control arrow visibility

    const handlePress = (item: string) => {
        const courseName = Object.keys(item)[1];
        setTeacherData((prev) => ({
            ...prev,
            courseName: courseName
        }));

        // @ts-expect-error
        router.push(`/details/${item._id.$oid}`, { relativeToDirectory: true });
    };

    const url = `http://34.45.174.70:80/courses/?teacher_id=${teacherName}`;

    useEffect(() => {
        (async () => {

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // console.log(respose)
                const data = await response.json();
                setCourseList(data);

            } catch (error) {
                Alert.alert('Error', 'Failed to connect to the server.');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Function to detect when scrolling
    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        // If user is not at bottom, show the down arrow
        setShowArrow(!isAtBottom);
    };

    const renderCourseCard = ({ item }: { item: any }) => {

        const keys = Object.keys(item);

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    onPress={() => handlePress(item)}
                >
                    <View style={styles.innerShadow} />
                    <View style={styles.content}>
                        <Text style={styles.courseName}>{keys[1].toUpperCase()}</Text>
                        <Text style={styles.courseWeeks}>Instructor: {item.teacher_id}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <Stack.Screen options={{
                    headerTitle: `loading... `,
                    headerTitleStyle: {
                        color: "black",
                        fontSize: 20,
                        fontWeight: 700,
                    },
                    headerStyle: {
                        backgroundColor: "white",

                    },
                    headerTintColor: "black",
                    headerShown: true,
                }} />
                <ActivityIndicator size="large" color="#c4210b" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: `Course Developed By ${teacherName} `,
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

            <FlatList
                data={courseList}
                renderItem={renderCourseCard}
                keyExtractor={(item) => (item._id.$oid)}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll} // Add scroll listener here
                scrollEventThrottle={16} // Improves performance when scrolling
            />

            {/* Conditionally render down arrow if more items exist below */}
            {showArrow && (
                <View style={styles.arrowContainer}>
                    <Ionicons name="caret-down" size={30} color="#d24e3dc4" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor:"#f0e6e6"
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        // backgroundColor: '#f9f9f9',
        padding: 16,
        marginBottom: 10,
        elevation: 2, // Shadow effect for Android
        position: 'relative',
        borderRadius: 20,
        // borderColor: "#a81400",
        // borderWidth: 3,
        overflow: 'hidden', // Ensures inner shadow doesn't overflow
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
        shadowOffset: { width:0, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        zIndex: 1,
    },
    content: {
        position: 'relative', // Ensure the content appears above the shadow
        zIndex: 2,
        margin:20,
    },
    courseName: {
        fontSize: 15,
        fontWeight: '500',
    },
    courseWeeks: {
        fontSize: 14,
        color: '#777',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:"#f0e6e6"
    },
    arrowContainer: {
        position: 'absolute',
        bottom: 20, // Position near the bottom of the screen
        alignSelf: 'center', // Center horizontally
    },
});
