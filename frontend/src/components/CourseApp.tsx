import React, { useState } from 'react';
import CoursesPage from './CoursesPage';
import CourseDetail from './CourseDetail';
import { useCourses, Course } from '../hooks/useCourses';

type ViewType = 'main' | 'vocabulary' | 'grammar' | 'detail';

const CourseApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { getCourseById, enrollCourse } = useCourses();

  const handleCourseTypeSelect = (type: 'vocabulary' | 'grammar') => {
    setCurrentView(type);
  };

  const handleCourseSelect = (courseId: string) => {
    const course = getCourseById(courseId);
    if (course) {
      setSelectedCourse(course);
      setCurrentView('detail');
    }
  };

  const handleBack = () => {
    if (currentView === 'detail') {
      setCurrentView(selectedCourse?.type || 'main');
      setSelectedCourse(null);
    } else {
      setCurrentView('main');
    }
  };

  const handleEnroll = async (courseId: string) => {
    const result = await enrollCourse(courseId);
    
    if (result.success) {
      // Show success message and redirect to course content
      alert(result.message);
      // In real app, redirect to course learning page
    } else {
      alert(result.message);
    }
  };

  // Main courses page
  if (currentView === 'main') {
    return (
      <CoursesPage 
        onCourseTypeSelect={handleCourseTypeSelect}
      />
    );
  }

  // Course list by type
  if (currentView === 'vocabulary' || currentView === 'grammar') {
    return (
      <CoursesPage 
        selectedType={currentView}
        onCourseTypeSelect={handleCourseTypeSelect}
        onCourseSelect={handleCourseSelect}
        onBack={handleBack}
      />
    );
  }

  // Course detail page
  if (currentView === 'detail' && selectedCourse) {
    return (
      <CourseDetail 
        course={selectedCourse}
        onBack={handleBack}
        onEnroll={handleEnroll}
      />
    );
  }

  return null;
};

export default CourseApp;
