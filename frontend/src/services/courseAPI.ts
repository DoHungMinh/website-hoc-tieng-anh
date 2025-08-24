const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface Course {
  _id?: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  duration: string;
  price: number;
  originalPrice?: number;
  instructor: string;
  status: 'draft' | 'active' | 'archived';
  thumbnail?: string;
  studentsCount: number;
  lessonsCount: number;
  vocabulary?: Array<{
    id: string;
    word: string;
    pronunciation?: string;
    meaning: string;
    example?: string;
  }>;
  grammar?: Array<{
    id: string;
    rule: string;
    structure?: string;
    explanation: string;
    example: string;
  }>;
  requirements: string[];
  benefits: string[];
  curriculum: Array<{
    module: string;
    lessons: string[];
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseFilters {
  search?: string;
  type?: string;
  level?: string;
  status?: string;
  page?: number;
  limit?: number;
}

class CourseAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Admin methods
  async getCourses(filters: CourseFilters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/courses?${queryParams}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return response.json();
  }

  async getCourseById(id: string) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }

    return response.json();
  }

  async createCourse(courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>) {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData)
    });

    if (!response.ok) {
      throw new Error('Failed to create course');
    }

    return response.json();
  }

  async updateCourse(id: string, courseData: Partial<Course>) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData)
    });

    if (!response.ok) {
      throw new Error('Failed to update course');
    }

    return response.json();
  }

  async deleteCourse(id: string) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete course');
    }

    return response.json();
  }

  async updateCourseStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update course status');
    }

    return response.json();
  }

  async getCourseStats() {
    const response = await fetch(`${API_BASE_URL}/courses/stats`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course stats');
    }

    return response.json();
  }

  // Public methods for users
  async getPublicCourses(filters: Pick<CourseFilters, 'type' | 'level'> = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/courses/public?${queryParams}`);

    if (!response.ok) {
      throw new Error('Failed to fetch public courses');
    }

    return response.json();
  }

  async getPublicCourseById(id: string) {
    const response = await fetch(`${API_BASE_URL}/courses/public/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch course details');
    }

    return response.json();
  }
}

export const courseAPI = new CourseAPI();
