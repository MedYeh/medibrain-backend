// controllers/pageController.js
import Page from '../models/Page.js';

// buildSectionTree: takes flat array, returns nested children
const buildSectionTree = (sections) => {
  const map = new Map();
  sections.forEach(s => map.set(s.frontendId, { ...s, children: [] }));

  const roots = [];
  sections.forEach(s => {
    const node = map.get(s.frontendId);
    if (s.parentId != null && map.has(s.parentId)) {
      map.get(s.parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRec = nodes => {
    nodes.sort((a,b)=>a.order - b.order);
    nodes.forEach(n => n.children && sortRec(n.children));
  };
  sortRec(roots);
  return roots;
};

const createPage = async (req, res) => {
  try {
    // sections arrive as JSON-string in req.body.sections
    const { title, category, description } = req.body;
    let flat = [];
    if (req.body.sections) {
      flat = JSON.parse(req.body.sections);
    }
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category required' });
    }

    // for each flat section, merge in any file
    const sectionsWithFrontendId = flat.map(s => {
      const base = {
        frontendId:    s.frontendId,
        type:          s.type,
        title:         s.title || '',
        contentDelta:  s.contentDelta || null,
        backgroundColor:s.backgroundColor || '#f3f4f6',
        highlightColor: s.highlightColor || '#4b5563',
        parentId:      s.parentId != null ? s.parentId : null,
        order:         s.order,
      };

      if (s.type === 'image') {
        // multer puts all files into req.files array
        // our client named each file field "image_<frontendId>"
        const key = `image_${s.frontendId}`;
        const file = (req.files || []).find(f => f.fieldname === key);
        if (file) {
          base.filename    = file.originalname;
          base.data        = file.buffer;
          base.contentType = file.mimetype;
        }
      }
      return base;
    });

    const nested = buildSectionTree(sectionsWithFrontendId);
    const page = new Page({
      title, category,
      description: description || '',
      sections: nested
    });

    const saved = await page.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPages = async (req, res) => {
  try {
    const pages = await Page.find()
      .select('-sections')
      .sort({ createdAt: -1 });
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// const getPageById = async (req, res) => {
//   try {
//     const page = await Page.findById(req.params.id);
//     if (!page) return res.status(404).json({ message: 'Not found' });
//     res.json(page);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// 
const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Not found' });

    // Convert binary image data to base64
    const convertImages = (sections) => {
      return sections.map(section => {
        if (section.type === 'image' && section.data) {
          const base64 = section.data.toString('base64');
          section.imageData = `data:${section.contentType};base64,${base64}`;
          delete section.data; // Optional: remove binary data to reduce response size
        }
        return section;
      });
    };

    page.sections = convertImages(page.sections);
    res.json(page);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
export { createPage, getPages, getPageById };