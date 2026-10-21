// models/BadgeImage.ts
import mongoose from 'mongoose';
import { BadgeImageDocument } from '@/types/badgeImage';

const badgeImageSchema = new mongoose.Schema<BadgeImageDocument>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  path: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    default: 'badge-template'
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    default: 'unknown'
  }
}, {
  timestamps: { 
    createdAt: 'uploadedAt',
    updatedAt: true 
  }
});

// Create indexes for better query performance
badgeImageSchema.index({ category: 1, uploadedAt: -1 });

// Prevent re-compilation during development
const BadgeImageModel = mongoose.models.BadgeImage || mongoose.model<BadgeImageDocument>('BadgeImage', badgeImageSchema);

export default BadgeImageModel;