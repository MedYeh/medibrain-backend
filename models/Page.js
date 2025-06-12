// models/Page.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// Define SectionSchema up front (recursive)
const SectionSchema = new Schema({
  frontendId:    { type: Number, required: true }, 
  type:          { type: String, required: true, enum: ['expandable','raw_text','info_box','image'] },
  title:         { type: String, default: '' },
  contentDelta:  { type: Schema.Types.Mixed, default: null },

  // image fields (only populated when type==='image')
  filename:      { type: String, default: null },
  data:          { type: Buffer },
  contentType:   { type: String, default: null },

  // styling properties
  backgroundColor:{ type: String, default: '#f3f4f6' },
  highlightColor: { type: String, default: '#4b5563' },
  titleTextColor: { type: String, default: '#ffffff' },
  borderWidth:    { type: Number, default: 0 },
  borderStyle:    { type: String, default: 'solid' },
  borderColor:    { type: String, default: '#e0f2fe' },
  width:          { type: String, default: '100%' },
  alignment:      { type: String, default: 'center' },
  isExpanded:     { type: Boolean, default: true },

  // hierarchy properties
  parentId:      { type: Number, default: null },
  order:         { type: Number, required: true },

  // recursive children
  children:      [ /* will be set below */ ]
});

// now that SectionSchema exists, enable recursion:
SectionSchema.add({ children: [SectionSchema] });

const PageSchema = new Schema({
  title:       { type: String, required: true, trim: true },
  category:    { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  sections:    { type: [SectionSchema], default: [] },
}, { timestamps: true });
PageSchema.index({ title: 'text', description: 'text', category: 'text' });

export default model('Page', PageSchema);