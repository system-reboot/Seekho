import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import WeekCard from '@/components/WeekCard';
import { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
// @ts-expect-error
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTeacherContext } from '@/context/TeacherId';



export default function CourseDetails() {

    const Tab = createBottomTabNavigator()
    const { name } = useLocalSearchParams();
    const [courseList, setCourseList] = useState<any>()
    const [loading, setLoading] = useState(true);
    const [week, setWeeks] = useState<any>([])
    const [subtopic, setSubTopic] = useState<any>([])
    const [header, setHeader] = useState()
    const { teacherName } = useTeacherContext()

    console.log(teacherName)
    const navigation = useNavigation(); // Get navigation instance


    useEffect(() => {
        if (courseList) {

            const data = courseList && Object.keys(courseList["content_layout"])

            if (data.length > 0) {
                const dataChanged = data.map((item: any) => {
                    return {
                        "week": item,
                    }
                })
                setWeeks(dataChanged)
            }

        }

    }, [courseList])


    useEffect(() => {
        (async () => {


            const url = `http://34.45.174.70:80/courses/?teacher_id=${teacherName}`;


            try {
                const response = await fetch(url, {
                    method: 'GET', // Use GET since we are passing parameters in the URL
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                console.log(data)

                const filterData: any = data.filter((item: any) => item._id.$oid === name)
                console.log(filterData)
                const getKeys: any = Object.keys(filterData[0])
                setHeader(getKeys[1]);
                const getContext = Object.keys(filterData[0][getKeys[1]])
                setCourseList(filterData[0][getKeys[1]][getContext[0]])
                setSubTopic(filterData[0][getKeys[1]][getContext[0]]["content_layout"])


            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        })()
    }, [teacherName])

    function Description() {

        if (loading) {
            return (
                <View style={styles.loaderContainer}>
                    <Stack.Screen options={{
                        headerTitle: "loading...",
                        headerStyle: {
                            backgroundColor: '#a81400',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                        headerShown: true
                    }} />
                    <ActivityIndicator size="large" color="#c4210b" />
                </View>
            );
        }


        return (
            <>
                <View style={styles.container}>
                    <Stack.Screen options={{
                        headerTitle: `${header?.toUpperCase()} Course`,
                        headerTitleStyle: {
                            color: "black",
                            fontSize: 20,
                            fontWeight: 700,
                        },
                        headerStyle: {
                            backgroundColor: "white",
                        },
                        headerTintColor: "black", // Change back button color here
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="black" />
                            </TouchableOpacity>
                        ),
                        headerShown: true,
                    }} />

                    <ScrollView style={styles.scrollContainer}>
                        <View style={styles.section}>
                            <Text style={styles.header}>Description</Text>
                            <Text style={styles.content}>{courseList?.description}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.header}>Grading Policy</Text>
                            {courseList && courseList.grading_policy && courseList?.grading_policy?.split('*').map((item: any, index: any) => {
                                // Trim the item to remove leading/trailing spaces
                                const trimmedItem = item.trim();
                                // Check if the trimmed item is not empty
                                if (trimmedItem) {
                                    return (
                                        <Text key={index} style={styles.content}>
                                            • {trimmedItem}
                                        </Text>
                                    );
                                }
                                return null; // Return null for empty items
                            })}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.header}>Prerequisites</Text>
                            {courseList && courseList.pre_requisites && courseList?.pre_requisites.split('*').map((item: any, index: any) => {
                                // Trim the item to remove leading/trailing spaces
                                const trimmedItem = item.trim();
                                // Check if the trimmed item is not empty
                                if (trimmedItem) {
                                    return (
                                        <Text key={index} style={styles.content}>
                                            • {trimmedItem}
                                        </Text>
                                    );
                                }
                                return null; // Return null for empty items
                            })}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.header}>References</Text>
                            {courseList && courseList.references && courseList?.references.split('*').map((item: any, index: any) => {
                                // Trim the item to remove leading/trailing spaces
                                const trimmedItem = item.trim();
                                // Check if the trimmed item is not empty
                                if (trimmedItem) {
                                    return (
                                        <Text key={index} style={styles.content}>
                                            • {trimmedItem}
                                        </Text>
                                    );
                                }
                                return null; // Return null for empty items
                            })}
                        </View>

                    </ScrollView>
                </View>
            </>

        )
    }

    function Weeks() {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{
                    headerTitle: header + "Week Wise",
                    headerStyle: {
                        backgroundColor: '#a81400',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerShown: true,
                    
                }} />
                <ScrollView>
                    {
                        week.map((weekData: any, index: any) => (
                            <WeekCard
                                key={index}
                                week={weekData.week}
                                subTopic={subtopic[weekData.week]}
                            />
                        ))
                    }
                </ScrollView>
            </View >
        )
    }




    return (

        <NavigationContainer independent={true}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === 'overview') {
                            iconName = 'information-circle-outline'; // Ionicons name for Login
                        } else if (route.name === 'week') {
                            iconName = 'calendar-outline'; // Ionicons name for Signup
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

                <Tab.Screen name="overview" component={Description} />
                {!loading && <Tab.Screen name="week" component={Weeks} />}
            </Tab.Navigator>
        </NavigationContainer>
    );
}



const styles = StyleSheet.create({
    backButton: {
        padding: 10,
    },
    container: {
        flex: 1,
        padding: 20,

    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    courseName: {
        fontSize: 18,
    },
    scrollContainer: {
        flex: 1,
    },
    section: {
        marginBottom: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    content: {
        fontSize: 14,
        lineHeight: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
