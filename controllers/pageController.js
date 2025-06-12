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

// controllers/pageController.js

const getPageById = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        // --- THIS IS THE FIX ---
        // A simpler, more robust recursive function to convert images.
        const convertImages = (sections) => {
            return sections.map(section => {
                // If it's an image section with binary data...
                if (section.type === 'image' && section.data && section.contentType) {
                    // Directly convert the buffer to a base64 string.
                    const base64 = section.data.toString('base64');
                    // Create the full data URI for the <img> src attribute.
                    section.imageData = `data:${section.contentType};base64,${base64}`;
                }
                
                // Important: We no longer delete `section.data` here. Let the client get what it needs.
                
                // Recursively process any children.
                if (section.children && section.children.length > 0) {
                    section.children = convertImages(section.children);
                }
                
                return section;
            });
        };

        // Convert the Mongoose document to a plain JavaScript object to modify it.
        const pageObj = page.toObject();
        // Run the conversion on the sections.
        pageObj.sections = convertImages(pageObj.sections);

        res.json(pageObj);

    } catch (err) {
        console.error("Error in getPageById:", err);
        res.status(500).json({ message: 'Server error while fetching page' });
    }
};
 const searchPages = async (req, res) => {
    try {
        const searchTerm = req.query.term;
        if (!searchTerm) {
            return res.status(400).json({ message: "Search term is required" });
        }

        const pages = await Page.find(
            { $text: { $search: searchTerm } },
            { score: { $meta: "textScore" } } // Optional: score results by relevance
        )
        .select('-sections') // Exclude heavy section data
        .sort({ score: { $meta: "textScore" } }); // Sort by relevance

        res.json(pages);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Server error during search." });
    }
};
// ... make sure getPageById is exported along with your other functions
export { createPage, getPages, getPageById, updatePage, deletePage,searchPages };