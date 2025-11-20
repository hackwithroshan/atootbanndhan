import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  excerpt: string;
  content: string; // for the full blog post
  imageUrl: string;
  category: string;
  author: string; // Simplified for now
  seoTags: string[];
}

const BlogPostSchema: Schema = new Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, default: 'Admin' },
  seoTags: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);