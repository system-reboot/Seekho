import React, { createContext, useState, useContext } from 'react';

// Create a context with default values

interface TeacherData {
    teacherName?: string;
    courseName?:string;
}

// Define the shape of the context
interface TeacherContextType extends TeacherData {
    setTeacherData: React.Dispatch<React.SetStateAction<TeacherData>>;
}

export const TeacherContext = createContext<TeacherContextType>({
    teacherName: '',
    courseName:'',
    setTeacherData: () => { },
});

export const useTeacherContext = () => {
    const context = useContext(TeacherContext);
    if (!context) {
        throw new Error('useTeacherContext must be used within a TeacherProvider');
    }
    return context;
};


export const TeacherProvider = ({ children }: any) => {
    // State to hold teacher's ID and name
    const [teacherData, setTeacherData] = useState<TeacherData>({
        teacherName: '',
        courseName:''
    });

    return (
        <TeacherContext.Provider value={{ ...teacherData, setTeacherData }}>
            {children}
        </TeacherContext.Provider>
    );
};