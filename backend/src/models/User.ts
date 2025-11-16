import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  birthDate?: string;
  learningGoal?: string;
  role: 'user' | 'admin';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Beginner';
  isEmailVerified: boolean;
  accountStatus: 'active' | 'disabled';
  isOnline: boolean;
  lastSeen: Date;
  learningGoals: string[];
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
    voicePreference?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  };
  streakCount: number;
  totalStudyHours: number;
  voiceChat?: {
    minutesUsedThisMonth: number;
    totalMinutesUsed: number;
    lastResetDate: Date;
    isEnabled: boolean;
  };
  pendingPayments?: Array<{
    orderCode: number;
    courseId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
    failedReason?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    trim: true
  },
  birthDate: {
    type: String,
    trim: true
  },
  learningGoal: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Beginner'],
    default: 'Beginner'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  accountStatus: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: null
  },
  learningGoals: [{
    type: String
  }],
  preferences: {
    language: {
      type: String,
      default: 'vi'
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    voicePreference: {
      type: String,
      enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
      default: 'alloy'
    }
  },
  streakCount: {
    type: Number,
    default: 0
  },
  totalStudyHours: {
    type: Number,
    default: 0
  },
  voiceChat: {
    minutesUsedThisMonth: {
      type: Number,
      default: 0
    },
    totalMinutesUsed: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    },
    isEnabled: {
      type: Boolean,
      default: true
    }
  },
  pendingPayments: [{
    orderCode: {
      type: Number,
      required: true
    },
    courseId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    failedReason: {
      type: String
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete (ret as any).password;
    return ret;
  }
});

export const User = mongoose.model<IUser>('User', userSchema);
