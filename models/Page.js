// models/Page.js (ESM version using import)
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const SectionSchema = new Schema(); // Forward declare

SectionSchema.add({
  type: { type: String, required: true, enum: ['expandable', 'raw_text', 'info_box'] },
  title: { type: String },
  contentDelta: { type: Schema.Types.Mixed, default: null },
  backgroundColor: { type: String },
  highlightColor: { type: String },
  order: { type: Number, required: true },
  children: [SectionSchema] // Recursive structure
});

const PageSchema = new Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  sections: [SectionSchema]
}, { timestamps: true });

export default model('Page', PageSchema);
