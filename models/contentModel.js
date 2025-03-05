// models/contentModel.js
import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  label: String,
  content: String, // We'll store the rich text as HTML
});

const pageSchema = new mongoose.Schema({
  title: String,
  sections: [sectionSchema],
});

const Page = mongoose.model('Page', pageSchema);
export default Page;
