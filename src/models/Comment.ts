import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  articleId: mongoose.Types.ObjectId;
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string;
  content: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userImage: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
CommentSchema.index({ articleId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ isApproved: 1 });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
