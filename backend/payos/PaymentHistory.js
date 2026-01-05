/**
 * PaymentHistory Model
 * Lưu trữ lịch sử giao dịch PayOS
 */

const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  // PayOS data
  orderCode: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'PAID', 'CANCELLED', 'EXPIRED'],
    default: 'PENDING',
    required: true,
    index: true
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Course & User info
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false, // Không bắt buộc khi tạo từ webhook
    index: true
  },
  
  // Level Package info (for level-based purchases)
  level: {
    type: String,
    required: false,
    index: true
  },
  
  levelPackageName: {
    type: String,
    required: false
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Không bắt buộc khi tạo từ webhook
    index: true
  },
  
  courseName: {
    type: String,
    required: false // Không bắt buộc khi tạo từ webhook
  },
  
  userEmail: {
    type: String,
    required: false // Không bắt buộc khi tạo từ webhook
  },
  
  userFullName: {
    type: String,
    required: false // Không bắt buộc khi tạo từ webhook
  },
  
  // Payment details
  paymentMethod: {
    type: String,
    default: 'qr_code'
  },
  
  currency: {
    type: String,
    default: 'VND'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  paidAt: {
    type: Date
  },
  
  cancelledAt: {
    type: Date
  },
  
  expiredAt: {
    type: Date
  },
  
  // Webhook tracking
  webhookReceived: {
    type: Boolean,
    default: false
  },
  
  webhookData: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // PayOS URLs
  checkoutUrl: {
    type: String
  },
  
  qrCode: {
    type: String
  },
  
  // Admin notes
  notes: {
    type: String
  }
  
}, {
  timestamps: true
});

// Indexes for performance
paymentHistorySchema.index({ status: 1, createdAt: -1 });
paymentHistorySchema.index({ userId: 1, createdAt: -1 });
paymentHistorySchema.index({ courseId: 1, createdAt: -1 });
paymentHistorySchema.index({ level: 1, createdAt: -1 });

// Static methods for statistics
paymentHistorySchema.statics.getPaymentStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const totalStats = await this.aggregate([
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0] } },
          avgAmount: { $avg: '$amount' },
          successRate: {
            $avg: {
              $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    return {
      byStatus: stats,
      total: totalStats[0] || {
        totalTransactions: 0,
        totalRevenue: 0,
        avgAmount: 0,
        successRate: 0
      }
    };
  } catch (error) {
    console.error('Error getting payment stats:', error);
    return { byStatus: [], total: { totalTransactions: 0, totalRevenue: 0, avgAmount: 0, successRate: 0 } };
  }
};

paymentHistorySchema.statics.getRecentPayments = async function(limit = 10) {
  try {
    return await this.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('courseId', 'title type level price')
      .populate('userId', 'fullName email');
  } catch (error) {
    console.error('Error getting recent payments:', error);
    return [];
  }
};

const PaymentHistory = mongoose.model('PaymentHistory', paymentHistorySchema);

module.exports = PaymentHistory;