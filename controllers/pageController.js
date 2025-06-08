// controllers/pageController.js
import Page from '../models/Page.js';

// Helper function to build the nested tree from the flat array sent by the frontend
const buildSectionTree = (sections) => {
    const sectionMap = {};

    // Map each section by its temporary frontend ID
    sections.forEach(section => {
        sectionMap[section.frontendId] = { ...section, children: [] };
    });

    const tree = [];

    sections.forEach(section => {
        if (section.parentId && sectionMap[section.parentId]) {
            // Add as child to parent
            sectionMap[section.parentId].children.push(sectionMap[section.frontendId]);
        } else {
            // Root section
            tree.push(sectionMap[section.frontendId]);
        }
    });

    // Recursively sort children by `order`
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

// @desc    Create a new page
// @route   POST /api/pages
// @access  Private
const createPage = async (req, res) => {
    try {
        const { title, category, description, sections: flatSections } = req.body;

        const sectionsWithFrontendId = flatSections.map(s => ({
            ...s,
            frontendId: s.id,
        }));

        const nestedSections = buildSectionTree(sectionsWithFrontendId);

        const newPage = new Page({
            title,
            category,
            description,
            sections: nestedSections,
        });

        const savedPage = await newPage.save();
        res.status(201).json(savedPage);
        console.log("sucess");
    } catch (error) {
        console.error('Error creating page:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all pages (metadata only)
// @route   GET /api/pages
// @access  Public
const getPages = async (req, res) => {
    try {
        const pages = await Page.find().select('-sections').sort({ createdAt: -1 });
        res.status(200).json(pages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a single page by ID with full content
// @route   GET /api/pages/:id
// @access  Public
const getPageById = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }
        res.status(200).json(page);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export {
    createPage,
    getPages,
    getPageById,
};
