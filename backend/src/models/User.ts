import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'admin';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
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
  };
  streakCount: number;
  totalStudyHours: number;
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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1'
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
    }
  },
  streakCount: {
    type: Number,
    default: 0
  },
  totalStudyHours: {
    type: Number,
    default: 0
  }
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
