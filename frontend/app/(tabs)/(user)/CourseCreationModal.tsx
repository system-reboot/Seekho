import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, Animated } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTeacherContext } from '@/context/TeacherId';
import { router } from 'expo-router';

interface CourseCreationModalProps {
  visible: boolean;
  onClose: () => void;
}



export default function CourseCreationModal({ visible, onClose }: CourseCreationModalProps) {
  const [courseName, setCourseName] = useState('');
  const [content, setContent] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const { teacherName } = useTeacherContext();



  const onCreateCourse = async (courseName: string, content: string, context: string) => {
    try {
        const url = `http://34.45.174.70:80/generate_layout?content=${content}&context=${context}&course_name=${courseName}&teacher_id=${teacherName}`;
  
        console.log(content, context, courseName, teacherName);
  
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
  
        const data = await response.json();
  
        if (response.ok) {
            Alert.alert('Success', data.message);
            router.push("/details/Created Courses");
        } else {
            throw new Error('Something went wrong');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
  };

  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCreateCourse = async () => {
    setLoading(true);
    try {
      await onCreateCourse(courseName, content, context);
      setCourseName('');
      setContent('');
      setContext('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#a81400" />
          </View>
        ) : (
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#0000009a" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create New Course</Text>

            <TextInput
              style={styles.input}
              placeholder="Course Name"
              value={courseName}
              onChangeText={setCourseName}
            />
            <TextInput
              style={styles.input}
              placeholder="Content"
              value={content}
              onChangeText={setContent}
            />
            <TextInput
              style={styles.input}
              placeholder="Context"
              value={context}
              onChangeText={setContext}
            />

            <TouchableOpacity
              onPress={handleCreateCourse}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleValue }] }]}>
                <LinearGradient
                  colors={['#ff6b6b', '#a81400']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradient}
                >
                  <Feather name="zap" color="white" size={24} style={styles.icon} />
                  <Text style={styles.buttonText}>Create Course</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buttonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
});