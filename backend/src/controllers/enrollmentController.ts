import { Request, Response } from 'express';
import type { IEnrollment } from '../models/Enrollment.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course';
import { Progress } from '../models/Progress';
import mongoose from 'mongoose';

export const enrollInCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    if (!courseId) {
      res.status(400).json({ message: 'Course ID is required' });
      return;
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      res.status(400).json({ message: 'Already enrolled in this course' });
      return;
    }

    // Create enrollment
    const enrollment = new Enrollment({
      userId,
      courseId,
      status: 'active',
      progress: {
        completedLessons: [],
        completedVocabulary: [],
        completedGrammar: [],
        completionPercentage: 0
      },
      quiz: {
        attempts: 0,
        bestScore: 0
      },
      achievements: []
    });

    await enrollment.save();

    // Update course students count
    await Course.findByIdAndUpdate(courseId, { 
      $inc: { studentsCount: 1 } 
    });

    // Initialize user progress if not exists
    let userProgress = await Progress.findOne({ userId });
    if (!userProgress) {
      userProgress = new Progress({
        userId,
        vocabulary: { learned: 0, target: 1000, recentWords: [] },
        listening: { hoursCompleted: 0, target: 18, recentSessions: [] },
        testsCompleted: { completed: 0, target: 50, recentTests: [] },
        studyStreak: { current: 0, target: 30, lastStudyDate: new Date() },
        weeklyActivity: [],
        totalStudyTime: 0,
        level: 'A1',
        achievements: []
      });
    }

    await userProgress.save();

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('courseId', 'title description type level duration instructor lessonsCount')
      .populate('userId', 'fullName email');

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment: populatedEnrollment
    });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserEnrollments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const enrollments = await Enrollment.find({ userId })
      .populate('courseId', 'title description type level duration instructor lessonsCount thumbnail studentsCount')
      .sort({ enrolledAt: -1 });

    res.json({
      enrollments,
      totalCourses: enrollments.length,
      activeCourses: enrollments.filter((e: IEnrollment) => e.status === 'active').length,
      completedCourses: enrollments.filter((e: IEnrollment) => e.status === 'completed').length
    });

  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLessonProgress = async (req: Request, res: Response) => {
  try {
    const { courseId, lessonId, lessonType } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    // Update lesson progress based on type
    let updated = false;
    
    if (lessonType === 'vocabulary' && !enrollment.progress.completedVocabulary.includes(lessonId)) {
      enrollment.progress.completedVocabulary.push(lessonId);
      updated = true;
    } else if (lessonType === 'grammar' && !enrollment.progress.completedGrammar.includes(lessonId)) {
      enrollment.progress.completedGrammar.push(lessonId);
      updated = true;
    } else if (lessonType === 'lesson' && !enrollment.progress.completedLessons.includes(lessonId)) {
      enrollment.progress.completedLessons.push(lessonId);
      updated = true;
    }

    if (updated) {
      enrollment.lastAccessedAt = new Date();
      
      // Get course to calculate completion percentage
      const course = await Course.findById(courseId);
      if (course) {
        const totalItems = (course.vocabulary?.length || 0) + 
                          (course.grammar?.length || 0) + 
                          (course.lessonsCount || 0);
        const completedItems = enrollment.progress.completedVocabulary.length + 
                              enrollment.progress.completedGrammar.length + 
                              enrollment.progress.completedLessons.length;
        
        enrollment.progress.completionPercentage = totalItems > 0 ? 
          Math.round((completedItems / totalItems) * 100) : 0;

        // Update course status if completed
        if (enrollment.progress.completionPercentage >= 100) {
          enrollment.status = 'completed';
        }
      }

      await enrollment.save();

      // Update user's overall progress
      const userProgress = await Progress.findOne({ userId });
      if (userProgress) {
        // Update vocabulary progress
        if (lessonType === 'vocabulary') {
          const course = await Course.findById(courseId);
          if (course && course.vocabulary) {
            const vocabItem = course.vocabulary.find(v => v.id === lessonId);
            if (vocabItem && !userProgress.vocabulary.recentWords.some((w: any) => w.word === vocabItem.word)) {
              userProgress.vocabulary.recentWords.push({
                word: vocabItem.word,
                meaning: vocabItem.meaning,
                example: vocabItem.example || '',
                learnedAt: new Date(),
                reviewCount: 0,
                masteryLevel: 50
              });
              userProgress.vocabulary.learned = userProgress.vocabulary.recentWords.length;
            }
          }
        }

        // Update study streak - không có longest field nữa
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastStudyDate = userProgress.studyStreak.lastStudyDate;
        const lastStudyDay = new Date(lastStudyDate);
        lastStudyDay.setHours(0, 0, 0, 0);
        
        if (lastStudyDay.getTime() !== today.getTime()) {
          const daysDiff = Math.floor((today.getTime() - lastStudyDay.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            // Consecutive day
            userProgress.studyStreak.current += 1;
          } else if (daysDiff > 1) {
            // Streak broken
            userProgress.studyStreak.current = 1;
          }
          
          userProgress.studyStreak.lastStudyDate = today;
        }

        // Update weekly activity
        const today2 = new Date();
        const weekString = `${today2.getFullYear()}-W${Math.ceil(today2.getDate() / 7)}`;
        const dayString = today2.toISOString().split('T')[0];
        
        let currentWeekActivity = userProgress.weeklyActivity.find((wa: any) => wa.week === weekString);
        
        if (!currentWeekActivity) {
          userProgress.weeklyActivity.push({
            week: weekString,
            days: [{
              day: dayString,
              hours: 0.5, // Assume 30 min per lesson
              activities: [lessonType]
            }],
            totalHours: 0.5
          });
        } else {
          const existingDay = (currentWeekActivity as any).days.find((d: any) => d.day === dayString);
          if (existingDay) {
            existingDay.hours += 0.5;
            if (!existingDay.activities.includes(lessonType)) {
              existingDay.activities.push(lessonType);
            }
          } else {
            (currentWeekActivity as any).days.push({
              day: dayString,
              hours: 0.5,
              activities: [lessonType]
            });
          }
          (currentWeekActivity as any).totalHours += 0.5;
        }

        await userProgress.save();
      }

      res.json({
        message: 'Lesson progress updated successfully',
        enrollment: {
          completionPercentage: enrollment.progress.completionPercentage,
          status: enrollment.status,
          completedItems: {
            vocabulary: enrollment.progress.completedVocabulary.length,
            grammar: enrollment.progress.completedGrammar.length,
            lessons: enrollment.progress.completedLessons.length
          }
        }
      });
    } else {
      res.json({
        message: 'Lesson already completed',
        enrollment: {
          completionPercentage: enrollment.progress.completionPercentage,
          status: enrollment.status
        }
      });
    }

  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCourseProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const enrollment = await Enrollment.findOne({ userId, courseId })
      .populate('courseId', 'title description type level vocabulary grammar lessonsCount');

    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    res.json({
      enrollment,
      progress: {
        completionPercentage: enrollment.progress.completionPercentage,
        completedVocabulary: enrollment.progress.completedVocabulary,
        completedGrammar: enrollment.progress.completedGrammar,
        completedLessons: enrollment.progress.completedLessons,
        lastAccessedAt: enrollment.lastAccessedAt
      },
      quiz: enrollment.quiz,
      achievements: enrollment.achievements
    });

  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
