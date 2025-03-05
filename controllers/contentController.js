// controllers/contentController.js
import Page from '../models/contentModel.js';

// GET /content
export const getContent = async (req, res) => {
  try {
    // For simplicity, we assume there's only one "Page" document
    let page = await Page.findOne({});
    if (!page) {
      // If none found, create an empty page
      page = new Page({
        title: 'New Admin Page',
        sections: [],
      });
      await page.save();
    }
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /content
export const saveContent = async (req, res) => {
  try {
    const { title, sections } = req.body;

    // For simplicity, update or create the single Page document
    let page = await Page.findOne({});
    if (!page) {
      page = new Page({ title, sections });
    } else {
      page.title = title;
      page.sections = sections;
    }

    await page.save();
    res.json({ success: true, page });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
