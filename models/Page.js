import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const SectionSchema = new Schema();

SectionSchema.add({
  frontendId: { type: Number }, // Temporary ID from frontend
  type: { type: String, required: true, enum: ['expandable', 'raw_text', 'info_box'] },
  title: { type: String, default: '' },
  contentDelta: { type: Schema.Types.Mixed, default: null },
  backgroundColor: { type: String, default: '#f3f4f6' },
  highlightColor: { type: String, default: '#4b5563' },
  parentId: { type: Number, default: null }, // For frontend nesting logic
  order: { type: Number, required: true },
  children: [SectionSchema], // Recursive structure
});

const PageSchema = new Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  sections: [SectionSchema],
}, { timestamps: true });

export default model('Page', PageSchema);