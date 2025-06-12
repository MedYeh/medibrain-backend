// controllers/pageController.js
import Page from '../models/Page.js';

// Helper function to build the nested section tree from a flat array
const buildSectionTree = (sections) => {
    // ... (This function is the same as you provided, no changes needed)
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

// controllers/pageController.js

// ... (keep all your other imports and functions like buildSectionTree)

// 1. REPLACE your old processSections with this new version
const processSections = (flatSections, files, existingPage = null) => {
    // --- THIS IS NEW ---
    // Create a map of existing images for quick lookup if we are editing.
    const existingImageMap = new Map();
    if (existingPage) {
        const flatten = (sections) => {
            for (const section of sections) {
                if (section.type === 'image' && section.data) {
                    existingImageMap.set(section.frontendId, {
                        filename: section.filename,
                        data: section.data,
                        contentType: section.contentType,
                    });
                }
                if (section.children?.length) flatten(section.children);
            }
        };
        flatten(existingPage.sections);
    }
    // --- END NEW ---

    return flatSections.map(s => {
        const base = {
            frontendId: s.frontendId,
            type: s.type,
            title: s.title || '',
            contentDelta: s.contentDelta || null,
            // ... (all your other base properties)
            backgroundColor: s.backgroundColor, highlightColor: s.highlightColor, titleTextColor: s.titleTextColor,
            borderWidth: s.borderWidth, borderStyle: s.borderStyle, borderColor: s.borderColor,
            width: s.width, alignment: s.alignment, isExpanded: s.isExpanded, parentId: s.parentId, order: s.order,
        };

        if (s.type === 'image') {
            const key = `image_${s.frontendId}`;
            const file = (files || []).find(f => f.fieldname === key);
            
            if (file) {
                // A new file was uploaded, use it.
                base.filename = file.originalname;
                base.data = file.buffer;
                base.contentType = file.mimetype;
            } else if (existingImageMap.has(s.frontendId)) {
                // --- THIS IS THE FIX ---
                // No new file, so preserve the old image data from the database.
                const existingImage = existingImageMap.get(s.frontendId);
                base.filename = existingImage.filename;
                base.data = existingImage.data;
                base.contentType = existingImage.contentType;
            }
        }
        return base;
    });
};

// 2. UPDATE how you call processSections in createPage
const createPage = async (req, res) => {
    try {
        const { title, category, description } = req.body;
        let flat = req.body.sections ? JSON.parse(req.body.sections) : [];
        if (!title || !category) return res.status(400).json({ message: 'Title and category required' });
        
        // No change here, we just don't pass an existing page.
        const sectionsWithData = processSections(flat, req.files);
        
        const nestedSections = buildSectionTree(sectionsWithData);
        const page = new Page({ title, category, description: description || '', sections: nestedSections });
        const savedPage = await page.save();
        res.status(201).json(savedPage);
    } catch (err) {
        console.error("Error creating page:", err);
        res.status(500).json({ message: 'Server error while creating page' });
    }
};

// 3. UPDATE how you call processSections in updatePage
const updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, description } = req.body;
        let flat = req.body.sections ? JSON.parse(req.body.sections) : [];

        const existingPage = await Page.findById(id);
        if (!existingPage) return res.status(404).json({ message: 'Page not found.' });

        // Pass the existingPage to our new helper function
        const sectionsWithData = processSections(flat, req.files, existingPage);

        const nestedSections = buildSectionTree(sectionsWithData);
        const updateData = { title, category, description: description || '', sections: nestedSections };
        const updatedPage = await Page.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(updatedPage);
    } catch (err) {
        console.error("Error updating page:", err);
        res.status(500).json({ message: 'Server error while updating page.' });
    }
};

// ... (make sure to export your functions)

// NEW: Function to delete a page
const deletePage = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await Page.findByIdAndDelete(id);
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }
        res.status(200).json({ message: 'Page deleted successfully' });
    } catch (err) {
        console.error("Error deleting page:", err);
        res.status(500).json({ message: 'Server error while deleting page' });
    }
};


const getPages = async (req, res) => {
    // ... (This function is the same, no changes needed)
    try {
        const pages = await Page.find().select('-sections').sort({ createdAt: -1 });
        res.json(pages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPageById = async (req, res) => {
    // ... (This function is the same, no changes needed)
    try {
        const page = await Page.findById(req.params.id);
        if (!page) return res.status(404).json({ message: 'Not found' });
        
        const convertImages = (sections) => {
          return sections.map(section => {
            if (section.type === 'image' && section.data) {
              const base64 = Buffer.from(section.data).toString('base64');
              section.imageData = `data:${section.contentType};base64,${base64}`;
              delete section.data;
            }
            if (section.children && section.children.length > 0) {
              section.children = convertImages(section.children);
            }
            return section;
          });
        };

        const pageObj = page.toObject();
        pageObj.sections = convertImages(pageObj.sections);

        res.json(pageObj);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export { createPage, getPages, getPageById, updatePage, deletePage };