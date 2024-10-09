import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import WeekCard from '@/components/WeekCard';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
// @ts-expect-error
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTeacherContext } from '@/context/TeacherId';

export default function CourseDetails() {
    const Tab = createBottomTabNavigator();
    const { name } = useLocalSearchParams();
    const [courseList, setCourseList] = useState<any>();
    const [loading, setLoading] = useState(true);
    const [week, setWeeks] = useState<any>([]);
    const [subtopic, setSubTopic] = useState<any>([]);
    const [header, setHeader] = useState();
    const { teacherName } = useTeacherContext();
    const navigation = useNavigation();

    useEffect(() => {
        if (courseList) {
            const data = courseList && Object.keys(courseList["content_layout"]);
            if (data.length > 0) {
                const dataChanged = data.map((item: any) => ({
                    week: item,
                }));
                setWeeks(dataChanged);
            }
        }
    }, [courseList]);

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
                const filterData: any = data.filter((item: any) => item._id.$oid === name);
                const getKeys: any = Object.keys(filterData[0]);
                setHeader(getKeys[1]);
                const getContext = Object.keys(filterData[0][getKeys[1]]);
                setCourseList(filterData[0][getKeys[1]][getContext[0]]);
                setSubTopic(filterData[0][getKeys[1]][getContext[0]]["content_layout"]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, [teacherName]);

    function Description() {
        if (loading) {
            return (
                <View style={styles.loaderContainer}>
                    <Stack.Screen
                        options={{
                            headerTitle: `loading... `,
                            headerTitleStyle: {
                                color: "black",
                                fontSize: 20,
                                fontWeight: 700,
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

        return (
            <>
                <View style={styles.container}>
                    <Stack.Screen
                        options={{
                            headerTitle: `${header}`,
                            headerTitleStyle: {
                                color: "black",
                                fontSize: 20,
                                fontWeight: 700,
                            },
                            headerStyle: {
                                backgroundColor: "white",
                            },
                            headerTintColor: "black",
                            headerLeft: () => (
                                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                    <Ionicons name="arrow-back" size={24} color="black" />
                                </TouchableOpacity>
                            ),
                            headerShown: true,
                        }}
                    />

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={styles.header}>Description</Text>
                            <Text style={styles.content}>{courseList?.description}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.header}>Grading Policy</Text>
                            {courseList && courseList.grading_policy && courseList.grading_policy.split('*').map((item: any, index: any) => {
                                const trimmedItem = item.trim();
                                if (trimmedItem) {
                                    return (
                                        <Text key={index} style={styles.content}>
                                            • {trimmedItem}
                                        </Text>
                                    );
                                }
                                return null;
                            })}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.header}>Prerequisites</Text>
                            {courseList && courseList.pre_requisites && courseList.pre_requisites.split('*').map((item: any, index: any) => {
                                const trimmedItem = item.trim();
                                if (trimmedItem) {
                                    return (
                                        <Text key={index} style={styles.content}>
                                            • {trimmedItem}
                                        </Text>
                                    );
                                }
                                return null;
                            })}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.header}>References</Text>
                            {courseList && courseList.references && courseList.references.split('*').map((item: any, index: any) => {
                                const trimmedItem = item.trim();
                                if (trimmedItem) {
                                    return (
                                        <Text key={index} style={styles.content}>
                                            • {trimmedItem}
                                        </Text>
                                    );
                                }
                                return null;
                            })}
                        </View>

                    </ScrollView>
                </View>
            </>
        );
    }


    function Weeks() {
        return (
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        headerTitle: `${header} Week Wise `,
                        headerTitleStyle: {
                            color: "black",
                            fontSize: 20,
                            fontWeight: 700,
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
                    {week.map((weekData: any, index: any) => (
                        <WeekCard
                            key={index}
                            week={weekData.week}
                            subTopic={subtopic[weekData.week]}
                        />
                    ))}
                </ScrollView>


            </View >
        );
    }

    return (
        <NavigationContainer independent={true}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;
                        if (route.name === 'Overview') {
                            iconName = 'information-circle-outline'; // Ionicons name for Login
                        } else if (route.name === 'Week') {
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
                <Tab.Screen name="Overview" component={Description} />
                {!loading && <Tab.Screen name="Week" component={Weeks} />}
            </Tab.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    list: {
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#f0e6e6',
        padding: 20,
    },
    section: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#000000c3",
        backgroundColor:"white",
        padding: 10,
        borderRadius: 10,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    content: {
        fontSize: 14,
        lineHeight: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:"#f0e6e6"
    },
    backButton: {
        marginRight: 15,
        marginLeft: 15,
    },
});
