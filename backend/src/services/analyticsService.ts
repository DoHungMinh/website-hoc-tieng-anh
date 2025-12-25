import { User, IUser } from '../models/User';
import { Progress, IProgress } from '../models/Progress';
import { Assessment, IAssessment } from '../models/Assessment';
import { IELTSExam } from '../models/IELTSExam';

export class AnalyticsService {

  // Get comprehensive user learning data
  async getUserLearningData(userId: string): Promise<{
    user: IUser;
    progress: IProgress;
    recentAssessments: IAssessment[];
    stats: any;
  }> {
    try {
      // Fetch user data
      const user = await User.findById(userId).lean();
      if (!user) {
        throw new Error('User not found');
      }

      // Fetch or create progress
      let progress = await Progress.findOne({ userId }).lean();
      if (!progress) {
        progress = await this.createDefaultProgress(userId);
      }

      // Fetch recent assessments (last 5)
      const recentAssessments = await Assessment.find({ userId })
        .sort({ completedAt: -1 })
        .limit(5)
        .lean();

      // Calculate additional stats
      const stats = await this.calculateUserStats(userId, progress as unknown as IProgress, recentAssessments as unknown as IAssessment[]);

      return {
        user: user as unknown as IUser,
        progress: progress as unknown as IProgress,
        recentAssessments: recentAssessments as unknown as IAssessment[],
        stats
      };
    } catch (error) {
      console.error('Error fetching user learning data:', error);
      throw error;
    }
  }

  // Get post-assessment analysis data
  async getPostAssessmentData(userId: string, assessmentId: string): Promise<{
    user: IUser;
    assessment: IAssessment;
    progress: IProgress;
    comparison: any;
  }> {
    try {
      const user = await User.findById(userId).lean();
      const assessment = await Assessment.findById(assessmentId).lean();
      const progress = await Progress.findOne({ userId }).lean();

      if (!user || !assessment) {
        throw new Error('User or Assessment not found');
      }

      // Compare with previous assessments
      const comparison = await this.compareWithPreviousAssessments(userId, assessment as unknown as IAssessment);

      return {
        user: user as unknown as IUser,
        assessment: assessment as unknown as IAssessment,
        progress: progress as unknown as IProgress,
        comparison
      };
    } catch (error) {
      console.error('Error fetching post-assessment data:', error);
      throw error;
    }
  }

  // Get learning recommendations data
  async getRecommendationData(userId: string): Promise<{
    user: IUser;
    progress: IProgress;
    learningPath: any;
    nextActivities: any[];
  }> {
    try {
      const user = await User.findById(userId).lean();
      const progress = await Progress.findOne({ userId }).lean();

      if (!user) {
        throw new Error('User not found');
      }

      // Generate learning path recommendations
      const learningPath = await this.generateLearningPath(user as unknown as IUser, progress as unknown as IProgress);
      const nextActivities = await this.suggestNextActivities(user as unknown as IUser, progress as unknown as IProgress);

      return {
        user: user as unknown as IUser,
        progress: progress as unknown as IProgress,
        learningPath,
        nextActivities
      };
    } catch (error) {
      console.error('Error fetching recommendation data:', error);
      throw error;
    }
  }

  // Calculate user statistics
  private async calculateUserStats(
    userId: string,
    progress: IProgress,
    assessments: IAssessment[]
  ): Promise<any> {
    const completedAssessments = assessments.filter(a => a.status === 'completed');

    // Calculate average scores
    const avgScore = completedAssessments.length > 0
      ? completedAssessments.reduce((sum: number, a: any) => sum + (a.results?.percentage || 0), 0) / completedAssessments.length
      : 0;

    // Calculate improvement trend
    const improvementTrend = this.calculateImprovementTrend(completedAssessments);

    // Study frequency
    const studyFrequency = this.calculateStudyFrequency(progress);

    return {
      totalAssessments: completedAssessments.length,
      averageScore: Math.round(avgScore),
      improvementTrend,
      studyFrequency,
      strongestSkill: this.identifyStrongestSkill(completedAssessments),
      weakestSkill: this.identifyWeakestSkill(completedAssessments),
      studyConsistency: this.calculateStudyConsistency(progress),
      nextMilestone: this.calculateNextMilestone(progress)
    };
  }

  // Create default progress for new users
  private async createDefaultProgress(userId: string): Promise<any> {
    const defaultProgress = new Progress({
      userId,
      vocabulary: { learned: 0, target: 100, recentWords: [] },
      listening: { hoursCompleted: 0, target: 20, recentSessions: [] },
      testsCompleted: { completed: 0, target: 10, recentTests: [] },
      studyStreak: { current: 0, target: 7, lastStudyDate: new Date() },
      weeklyActivity: [],
      totalStudyTime: 0,
      level: 'A1',
      achievements: []
    });

    const saved = await defaultProgress.save();
    return saved.toObject();
  }

  // Compare with previous assessments
  private async compareWithPreviousAssessments(userId: string, currentAssessment: IAssessment): Promise<any> {
    const previousAssessments = await Assessment.find({
      userId,
      _id: { $ne: currentAssessment._id },
      status: 'completed',
      type: currentAssessment.type
    })
      .sort({ completedAt: -1 })
      .limit(3)
      .lean();

    if (previousAssessments.length === 0) {
      return { isFirstAttempt: true };
    }

    const latest = previousAssessments[0];
    const currentScore = currentAssessment.results?.percentage || 0;
    const previousScore = latest.results?.percentage || 0;

    return {
      isFirstAttempt: false,
      scoreChange: currentScore - previousScore,
      improvement: currentScore > previousScore,
      previousAttempts: previousAssessments.length,
      bestScore: Math.max(...previousAssessments.map((a: any) => a.results?.percentage || 0)),
      averageScore: previousAssessments.reduce((sum: number, a: any) => sum + (a.results?.percentage || 0), 0) / previousAssessments.length
    };
  }

  // Generate learning path
  private async generateLearningPath(user: IUser, progress: IProgress): Promise<any> {
    const currentLevel = user.level;
    const goals = user.learningGoals;

    // Analyze gaps in current level
    const gaps = this.identifyLearningGaps(progress);

    // Suggest next level progression
    const nextLevel = this.getNextLevel(currentLevel);

    return {
      currentLevel,
      nextLevel,
      completionPercentage: this.calculateLevelCompletionPercentage(progress),
      gaps,
      recommendedFocus: this.getRecommendedFocus(gaps),
      estimatedTimeToNextLevel: this.estimateTimeToNextLevel(progress, currentLevel)
    };
  }

  // Suggest next activities
  private async suggestNextActivities(user: IUser, progress: IProgress): Promise<any[]> {
    const activities = [];

    // Based on learning gaps
    const gaps = this.identifyLearningGaps(progress);

    if (gaps.vocabulary) {
      activities.push({
        type: 'vocabulary',
        priority: 'high',
        title: 'Luyện từ vựng',
        description: `Bạn cần học thêm ${gaps.vocabulary.needed} từ để đạt mục tiêu`,
        estimatedTime: 30,
        difficulty: user.level
      });
    }

    if (gaps.listening) {
      activities.push({
        type: 'listening',
        priority: 'medium',
        title: 'Luyện nghe',
        description: `Cần thêm ${gaps.listening.needed} giờ luyện nghe`,
        estimatedTime: 45,
        difficulty: user.level
      });
    }

    if (gaps.assessment) {
      activities.push({
        type: 'assessment',
        priority: 'low',
        title: 'Kiểm tra tiến độ',
        description: 'Làm bài kiểm tra để đánh giá khả năng hiện tại',
        estimatedTime: 60,
        difficulty: user.level
      });
    }

    return activities.slice(0, 3); // Return top 3 recommendations
  }

  // Helper methods
  private calculateImprovementTrend(assessments: IAssessment[]): string {
    if (assessments.length < 2) return 'insufficient_data';

    const recent = assessments.slice(0, 3);
    const older = assessments.slice(3, 6);

    const recentAvg = recent.reduce((sum, a) => sum + (a.results?.percentage || 0), 0) / recent.length;
    const olderAvg = older.length > 0
      ? older.reduce((sum, a) => sum + (a.results?.percentage || 0), 0) / older.length
      : recentAvg;

    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  private calculateStudyFrequency(progress: IProgress): string {
    const daysPerWeek = progress.weeklyActivity.length > 0
      ? progress.weeklyActivity[0].days.length
      : 0;

    if (daysPerWeek >= 6) return 'very_high';
    if (daysPerWeek >= 4) return 'high';
    if (daysPerWeek >= 2) return 'medium';
    return 'low';
  }

  private identifyStrongestSkill(assessments: IAssessment[]): string {
    if (assessments.length === 0) return 'unknown';

    const skills = ['grammar', 'vocabulary', 'reading', 'listening'];
    const skillAvgs = skills.map(skill => {
      const scores = assessments
        .map(a => a.results?.skillBreakdown[skill as keyof typeof a.results.skillBreakdown]?.percentage || 0)
        .filter(score => score > 0);

      return {
        skill,
        average: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
      };
    });

    return skillAvgs.reduce((max, current) => current.average > max.average ? current : max).skill;
  }

  private identifyWeakestSkill(assessments: IAssessment[]): string {
    if (assessments.length === 0) return 'unknown';

    const skills = ['grammar', 'vocabulary', 'reading', 'listening'];
    const skillAvgs = skills.map(skill => {
      const scores = assessments
        .map(a => a.results?.skillBreakdown[skill as keyof typeof a.results.skillBreakdown]?.percentage || 0)
        .filter(score => score > 0);

      return {
        skill,
        average: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
      };
    });

    return skillAvgs.reduce((min, current) => current.average < min.average ? current : min).skill;
  }

  private calculateStudyConsistency(progress: IProgress): number {
    return Math.min(progress.studyStreak.current / progress.studyStreak.target, 1) * 100;
  }

  private calculateNextMilestone(progress: IProgress): any {
    const vocabProgress = progress.vocabulary.learned / progress.vocabulary.target;
    const listeningProgress = progress.listening.hoursCompleted / progress.listening.target;
    const testProgress = progress.testsCompleted.completed / progress.testsCompleted.target;

    const milestones = [
      { type: 'vocabulary', progress: vocabProgress, target: progress.vocabulary.target },
      { type: 'listening', progress: listeningProgress, target: progress.listening.target },
      { type: 'tests', progress: testProgress, target: progress.testsCompleted.target }
    ];

    return milestones.reduce((closest, current) =>
      current.progress < 1 && current.progress > closest.progress ? current : closest
    );
  }

  private identifyLearningGaps(progress: IProgress): any {
    const gaps: any = {};

    if (progress.vocabulary.learned < progress.vocabulary.target) {
      gaps.vocabulary = {
        current: progress.vocabulary.learned,
        target: progress.vocabulary.target,
        needed: progress.vocabulary.target - progress.vocabulary.learned
      };
    }

    if (progress.listening.hoursCompleted < progress.listening.target) {
      gaps.listening = {
        current: progress.listening.hoursCompleted,
        target: progress.listening.target,
        needed: progress.listening.target - progress.listening.hoursCompleted
      };
    }

    if (progress.testsCompleted.completed < progress.testsCompleted.target) {
      gaps.assessment = {
        current: progress.testsCompleted.completed,
        target: progress.testsCompleted.target,
        needed: progress.testsCompleted.target - progress.testsCompleted.completed
      };
    }

    return gaps;
  }

  private getNextLevel(currentLevel: string): string {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentLevel;
  }

  private calculateLevelCompletionPercentage(progress: IProgress): number {
    const vocabCompletion = Math.min(progress.vocabulary.learned / progress.vocabulary.target, 1);
    const listeningCompletion = Math.min(progress.listening.hoursCompleted / progress.listening.target, 1);
    const testCompletion = Math.min(progress.testsCompleted.completed / progress.testsCompleted.target, 1);

    return Math.round((vocabCompletion + listeningCompletion + testCompletion) / 3 * 100);
  }

  private getRecommendedFocus(gaps: any): string[] {
    const focus = [];

    if (gaps.vocabulary && gaps.vocabulary.needed > 20) {
      focus.push('vocabulary');
    }

    if (gaps.listening && gaps.listening.needed > 5) {
      focus.push('listening');
    }

    if (gaps.assessment && gaps.assessment.needed > 2) {
      focus.push('assessment');
    }

    return focus.length > 0 ? focus : ['review'];
  }

  private estimateTimeToNextLevel(progress: IProgress, currentLevel: string): number {
    const totalStudyTime = progress.totalStudyTime;
    const levelHours = {
      'A1': 90, 'A2': 180, 'B1': 350, 'B2': 500, 'C1': 700, 'C2': 1000
    };

    const currentLevelHours = levelHours[currentLevel as keyof typeof levelHours] || 100;
    const remaining = Math.max(currentLevelHours - totalStudyTime, 0);

    // Assuming 3 hours/week study rate
    return Math.ceil(remaining / 3);
  }
}
