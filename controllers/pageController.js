import Page from '../models/Page.js';

// Helper function to build the nested tree from the flat array sent by the frontend
const buildSectionTree = (sections) => {
  const sectionMap = new Map();

  // Map each section by its frontendId
  sections.forEach(section => {
    sectionMap.set(section.frontendId, {
      ...section,
      children: [],
    });
  });

  const tree = [];

  // Build tree by assigning children to their parents
  sections.forEach(section => {
    if (section.parentId && sectionMap.has(section.parentId)) {
      sectionMap.get(section.parentId).children.push(sectionMap.get(section.frontendId));
    } else {
      tree.push(sectionMap.get(section.frontendId));
    }
  });

  // Recursively sort children by order
  const sortChildrenRecursive = (nodes) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortChildrenRecursive(node.children);
      }
    });
  };

  sortChildrenRecursive(tree);
  return tree;
};

const createPage = async (req, res) => {
  try {
    const { title, category, description, sections: flatSections } = req.body;

    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }

    // Transform flat sections to include frontendId and ensure defaults
    const sectionsWithFrontendId = flatSections.map(section => ({
      frontendId: section.frontendId,
      type: section.type,
      title: section.title || '',
      contentDelta: section.contentDelta || null,
      backgroundColor: section.backgroundColor || '#f3f4f6',
      highlightColor: section.highlightColor || '#4b5563',
      parentId: section.parentId || null,
      order: section.order,
    }));

    // Build nested section tree
    const nestedSections = buildSectionTree(sectionsWithFrontendId);

    // Create and save new page
    const newPage = new Page({
      title,
      category,
      description: description || '',
      sections: nestedSections,
    });

    const savedPage = await newPage.save();
    res.status(201).json(savedPage);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPages = async (req, res) => {
  try {
    const pages = await Page.find().select('-sections').sort({ createdAt: -1 });
    res.status(200).json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.status(200).json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { createPage, getPages, getPageById };