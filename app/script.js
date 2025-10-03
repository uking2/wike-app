document.addEventListener('DOMContentLoaded', () => {
    // --- SUPABASE SETUP ---
    // IMPORTANT: Replace with your actual Supabase project URL and Anon Key
    const SUPABASE_URL = 'https://hehfnsaoibkvwdolcfkg.supabase.co'; // e.g., 'https://your-project-id.supabase.co'
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlaGZuc2FvaWJrdndkb2xjZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTc5MDUsImV4cCI6MjA3Mzc3MzkwNX0.aDpemN2HIGpORC-tZiQp0iIqXv7L4tO8zXvDCjygvbs';

    let supabase;
    try {
        if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            console.warn("Supabase credentials are not set. Cloud storage will be disabled.");
        } else {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (e) {
        console.error("Error initializing Supabase:", e);
        supabase = null;
    }

    const editorContainer = document.getElementById('editor-container');
    const mainContent = document.getElementById('main-content');
    
    let canvasBaseWidth = 800;
    let canvasBaseHeight = 600;

    const canvas = new fabric.Canvas('c', {
        width: canvasBaseWidth, height: canvasBaseHeight, backgroundColor: '#ffffff', preserveObjectStacking: true,
    });

    // --- CUSTOM MODALS & NOTIFICATIONS ---
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalBody = document.getElementById('confirm-modal-body');
    const confirmBtn = document.getElementById('confirm-modal-confirm');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    let confirmCallback = null;

    const showConfirm = (message, onConfirm) => {
        confirmModalBody.textContent = message;
        confirmCallback = onConfirm;
        confirmModal.classList.remove('hidden');
    };

    const hideConfirm = () => {
        confirmModal.classList.add('hidden');
        confirmCallback = null;
    };

    confirmBtn.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
        }
        hideConfirm();
    });

    cancelBtn.addEventListener('click', hideConfirm);
    
    const notificationToast = document.getElementById('notification-toast');
    const notificationMessage = document.getElementById('notification-message');
    let notificationTimeout;

    const showNotification = (message, duration = 3000) => {
        notificationMessage.textContent = message;
        notificationToast.classList.remove('hidden', 'opacity-0');
        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            notificationToast.classList.add('opacity-0');
            setTimeout(() => notificationToast.classList.add('hidden'), 300);
        }, duration);
    };

    // --- COLLAPSIBLE PANELS ---
    const topObjectControls = document.getElementById('top-object-controls');
    const toolPanelsContainer = document.getElementById('tool-panels-container');
    const propertiesPanel = document.getElementById('properties-panel');
    const rightPanelResizer = document.getElementById('right-panel-resizer');
    let isLeftPanelOpen = false;

    editorContainer.style.gridTemplateColumns = '80px 0px 1fr 0px';
    toolPanelsContainer.classList.add('hidden');

    const setLeftPanelOpen = (isOpen) => {
        isLeftPanelOpen = isOpen;
        const columns = editorContainer.style.gridTemplateColumns.split(' ');
        if (isOpen) {
            columns[1] = '320px';
            toolPanelsContainer.classList.remove('hidden');
        } else {
            columns[1] = '0px';
            toolPanelsContainer.classList.add('hidden');
            document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
        }
        editorContainer.style.gridTemplateColumns = columns.join(' ');
        setTimeout(() => resizeCanvas(), 300);
    };

    const setRightPanelOpen = (isOpen) => {
        const columns = editorContainer.style.gridTemplateColumns.split(' ');
        let rightPanelWidth = parseInt(columns[3], 10);
        if(isNaN(rightPanelWidth) || rightPanelWidth <= 0) {
            rightPanelWidth = 320; // Default width
        }

        if (isOpen) {
            columns[3] = `${rightPanelWidth}px`;
            propertiesPanel.classList.remove('opacity-0');
        } else {
            columns[3] = '0px';
            propertiesPanel.classList.add('opacity-0');
        }
        editorContainer.style.gridTemplateColumns = columns.join(' ');
        setTimeout(() => resizeCanvas(), 300);
    };
    
    // --- PANEL RESIZING LOGIC ---
    const resizeRightPanel = (e) => {
        const columns = editorContainer.style.gridTemplateColumns.split(' ');
        let newWidth = window.innerWidth - e.clientX;

        if (newWidth < 240) newWidth = 240;
        if (newWidth > 600) newWidth = 600;

        columns[3] = `${newWidth}px`;
        editorContainer.style.gridTemplateColumns = columns.join(' ');
    };

    const stopResizeRightPanel = () => {
        window.removeEventListener('mousemove', resizeRightPanel);
        window.removeEventListener('mouseup', stopResizeRightPanel);
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        resizeCanvas();
    };

    rightPanelResizer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', resizeRightPanel);
        window.addEventListener('mouseup', stopResizeRightPanel);
    });


    // --- RESPONSIVE CANVAS ---
    const resizeCanvas = () => {
        const containerWidth = mainContent.clientWidth - 32; // p-4
        const containerHeight = mainContent.clientHeight - 32; // p-4
        const canvasAspectRatio = canvasBaseWidth / canvasBaseHeight;

        let newWidth = containerWidth;
        let newHeight = newWidth / canvasAspectRatio;

        if (newHeight > containerHeight) {
            newHeight = containerHeight;
            newWidth = newHeight * canvasAspectRatio;
        }

        canvas.setWidth(newWidth);
        canvas.setHeight(newHeight);
        canvas.calcOffset();
        canvas.renderAll();
    };
    
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    window.addEventListener('resize', debounce(resizeCanvas, 150));
    
    // --- STATE MANAGEMENT ---
    let pages = [canvas.toJSON()];
    let currentPageIndex = 0;
    let history = [[]];
    let historyIndex = [-1];
    let historyLock = false;
    let clipboard = null;
    
    const saveState = () => {
        if (historyLock) return;
        const json = canvas.toJSON();
        history[currentPageIndex].splice(historyIndex[currentPageIndex] + 1);
        history[currentPageIndex].push(json);
        historyIndex[currentPageIndex]++;
        updateHistoryButtons();
    };

    const loadState = (state, cb) => {
        historyLock = true;
        canvas.loadFromJSON(state, () => {
            canvas.renderAll();
            historyLock = false;
            if (cb) cb();
        });
    };

    const undo = () => {
        if (historyIndex[currentPageIndex] > 0) {
            historyIndex[currentPageIndex]--;
            loadState(history[currentPageIndex][historyIndex[currentPageIndex]], updatePropertiesPanel);
            updateHistoryButtons();
        }
    };

    const redo = () => {
        if (historyIndex[currentPageIndex] < history[currentPageIndex].length - 1) {
            historyIndex[currentPageIndex]++;
            loadState(history[currentPageIndex][historyIndex[currentPageIndex]], updatePropertiesPanel);
            updateHistoryButtons();
        }
    };

    const updateHistoryButtons = () => {
        document.getElementById('undo-btn').disabled = historyIndex[currentPageIndex] <= 0;
        document.getElementById('redo-btn').disabled = historyIndex[currentPageIndex] >= history[currentPageIndex].length - 1;
    };
    document.getElementById('undo-btn').onclick = undo;
    document.getElementById('redo-btn').onclick = redo;

    // --- PAGE MANAGEMENT ---
    const pageIndicator = document.getElementById('page-indicator');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');
    const deletePageBtn = document.getElementById('delete-page-btn');

    const saveCurrentPage = () => pages[currentPageIndex] = canvas.toJSON();

    const loadPage = (index) => {
        canvas.loadFromJSON(pages[index], () => {
            canvas.renderAll();
            updatePageIndicator();
            updateHistoryButtons();
        });
    };

    const updatePageIndicator = () => {
        pageIndicator.textContent = `Page ${currentPageIndex + 1} / ${pages.length}`;
        prevPageBtn.disabled = currentPageIndex === 0;
        nextPageBtn.disabled = currentPageIndex === pages.length - 1;
        deletePageBtn.disabled = pages.length <= 1;
    };
    
    const deletePage = () => {
        if (pages.length <= 1) {
            showNotification("Cannot delete the last page.");
            return;
        }

        const pageToDeleteNum = currentPageIndex + 1;
        showConfirm(`Are you sure you want to delete Page ${pageToDeleteNum}? This cannot be undone.`, () => {
            pages.splice(currentPageIndex, 1);
            history.splice(currentPageIndex, 1);
            historyIndex.splice(currentPageIndex, 1);

            if (currentPageIndex >= pages.length) {
                currentPageIndex = pages.length - 1;
            }

            loadPage(currentPageIndex);
            showNotification(`Page ${pageToDeleteNum} was deleted.`);
        });
    };

    document.getElementById('add-page-btn').addEventListener('click', () => {
        saveCurrentPage();
        pages.push({ version: fabric.version, objects: [], background: '#ffffff' });
        history.push([]);
        historyIndex.push(-1);
        currentPageIndex = pages.length - 1;
        loadPage(currentPageIndex);
        saveState();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPageIndex > 0) { saveCurrentPage(); currentPageIndex--; loadPage(currentPageIndex); }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPageIndex < pages.length - 1) { saveCurrentPage(); currentPageIndex++; loadPage(currentPageIndex); }
    });

    deletePageBtn.addEventListener('click', deletePage);

    // --- CLEAR CANVAS ---
    document.getElementById('clear-canvas-btn').addEventListener('click', () => {
        showConfirm('Are you sure you want to clear everything from this page?', () => {
            canvas.getObjects().forEach(obj => canvas.remove(obj));
            canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
            canvas.discardActiveObject().renderAll();
            saveState();
        });
    });

    // --- RESIZE MODAL LOGIC ---
    const resizeModal = document.getElementById('resize-modal');
    const customWidthInput = document.getElementById('custom-width');
    const customHeightInput = document.getElementById('custom-height');

    const openResizeModal = () => {
        customWidthInput.value = canvasBaseWidth;
        customHeightInput.value = canvasBaseHeight;
        resizeModal.classList.remove('hidden');
    };
    const closeResizeModal = () => resizeModal.classList.add('hidden');

    document.getElementById('resize-btn').addEventListener('click', openResizeModal);
    document.getElementById('close-resize-modal').addEventListener('click', closeResizeModal);
    document.getElementById('cancel-resize-btn').addEventListener('click', closeResizeModal);

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            customWidthInput.value = e.target.dataset.width;
            customHeightInput.value = e.target.dataset.height;
        });
    });

    document.getElementById('confirm-resize-btn').addEventListener('click', () => {
        const newWidth = parseInt(customWidthInput.value, 10);
        const newHeight = parseInt(customHeightInput.value, 10);
        if (newWidth > 0 && newHeight > 0) {
            canvasBaseWidth = newWidth;
            canvasBaseHeight = newHeight;
            resizeCanvas();
            saveState();
        }
        closeResizeModal();
    });

    // --- UI & THEME ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        themeToggleBtn.innerHTML = document.documentElement.classList.contains('dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    document.querySelectorAll('.sidebar-icon-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const clickedButton = e.currentTarget;

            if (clickedButton.id === 'templates-btn') {
                 window.location.href = '/templtes/temp.html';
                 return;
                 showNotification("Templates panel opened.");
            }
            
            const isActive = clickedButton.classList.contains('active');

            if (isActive && isLeftPanelOpen) {
                setLeftPanelOpen(false);
            } else {
                if (!isLeftPanelOpen) {
                    setLeftPanelOpen(true);
                }
                
                document.querySelectorAll('.sidebar-icon-btn').forEach(b => b.classList.remove('active'));
                clickedButton.classList.add('active');
                
                document.querySelectorAll('.sidebar-panel').forEach(p => {
                    p.classList.toggle('hidden', p.id !== clickedButton.dataset.panel);
                });
            }
        });
    });
    
    // --- TEMPLATE DATA & LOGIC ---
    const templates_raw = []; // Dummy array, replace with actual data if needed.
    const templates = templates_raw.map(t => ({...t, tags: (t.category.replace(/[^a-zA-Z\s]/g, "") + " " + t.name).toLowerCase() }));

    const templatesModal = document.getElementById('templates-modal');
    const closeTemplatesModalBtn = document.getElementById('close-templates-modal');

    closeTemplatesModalBtn.addEventListener('click', () => templatesModal.classList.add('hidden'));

    const populateTemplates = (filter = '') => {
        const templatesContainer = document.getElementById('templates-grid-modal');
        templatesContainer.innerHTML = ''; 

        const filteredTemplates = templates.filter(t => t.tags.includes(filter.toLowerCase()));

        const categories = filteredTemplates.reduce((acc, template) => {
            const category = template.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(template);
            return acc;
        }, {});

        for (const categoryName in categories) {
            const title = document.createElement('h3');
            title.className = 'col-span-full text-xl font-bold text-gray-800 dark:text-gray-200 mt-4 first:mt-0';
            title.textContent = categoryName;
            templatesContainer.appendChild(title);

            categories[categoryName].forEach(template => {
                const templateDiv = document.createElement('div');
                templateDiv.className = 'template-item';
                templateDiv.dataset.templateId = template.id;
                
                const img = document.createElement('img');
                img.className = 'template-preview';
                
                const nameDiv = document.createElement('div');
                nameDiv.className = 'template-name';
                nameDiv.textContent = template.name;
                                                
                templateDiv.appendChild(img);
                templateDiv.appendChild(nameDiv);
                
                templatesContainer.appendChild(templateDiv);

                setTimeout(() => {
                    const tempCanvas = new fabric.StaticCanvas(null, { width: template.canvas.width, height: template.canvas.height });
                    tempCanvas.loadFromJSON({ objects: template.objects }, () => {
                       img.src = tempCanvas.toDataURL({ format: 'png', multiplier: 200 / template.canvas.width });
                       tempCanvas.dispose();
                    });
                }, 0);
                
                templateDiv.addEventListener('click', () => applyTemplateToCanvas(template));
            });
        }
    };

    const applyTemplateToCanvas = (template) => {
         showConfirm('This will replace the current page content. Are you sure?', () => {
            canvas.clear();
            
            canvasBaseWidth = template.canvas.width;
            canvasBaseHeight = template.canvas.height;
            resizeCanvas();
            
            canvas.loadFromJSON({ objects: template.objects }, () => {
                canvas.renderAll();
                saveState();
                templatesModal.classList.add('hidden');
            });
        });
    };

    document.getElementById('template-search').addEventListener('input', (e) => populateTemplates(e.target.value));
    
    // --- DYNAMIC CONTENT ---
    const textStylesGrid = document.getElementById('text-styles-grid');
    const textStyles = [
        { text: 'SALE', fontFamily: 'Anton', fill: '#EF4444' },
        { text: 'DREAM', fontFamily: 'Pacifico', fill: '#EC4899' },
        { text: 'GLOW', fontFamily: 'Bebas Neue', fill: '#10B981', stroke: '#fff', strokeWidth: 2 },
        { text: 'Ocean', fontFamily: 'Lobster', fill: '#0EA5E9' },
    ];
    textStyles.forEach(style => {
        const btn = document.createElement('button');
        btn.className = 'w-full h-16 rounded-md flex items-center justify-center font-bold text-2xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300';
        btn.textContent = style.text;
        btn.style.fontFamily = style.fontFamily;
        btn.onclick = () => {
            const text = new fabric.Textbox(style.text, { ...style, fontSize: 80, width: 300 });
            canvas.add(text).centerObject(text).renderAll();
        }
        textStylesGrid.appendChild(btn);
    });

    
    const shapesGrid = document.getElementById('shapes-grid');
    const framesGrid = document.getElementById('frames-grid');
    const elements = {
        shapes: [
            { type: 'Rect', options: { width: 100, height: 100 } }, { type: 'Circle', options: { radius: 50 } }, { type: 'Triangle', options: { width: 100, height: 100 } },
            { path: 'M 50,0 61.8,38.2 100,38.2 69.1,61.8 80.9,100 50,76.4 19.1,100 30.9,61.8 0,38.2 38.2,38.2 Z' },
            { path: 'M 0 20 L 20 0 L 80 0 L 100 20 L 100 80 L 80 100 L 20 100 L 0 80 Z'}, { path: 'M 50 0 L 100 50 L 50 100 L 0 50 Z'},
            { path: 'M90,40 C90,60 50,95 50,95 C50,95 10,60 10,40 C10,20 30,10 50,30 C70,10 90,20 90,40 Z' },
            { path: 'M5,5 h90 v70 h-20 l-15,15 v-15 h-55 z' },
            { path: 'M 20,10 L 80,50 L 20,90 Z' },
            { path: 'M 10 30 H 30 L 40 20 H 60 L 70 30 H 90 V 80 H 10 Z' },
            { type: 'Rect', options: { width: 100, height: 100, rx:10, ry:10 }}, 
            { type: 'Circle', options: { radius: 50 }}, 
            { path: 'M 0,0 100,0 75,100 25,100 Z' }, 

        ],
        frames: [
            // Social Media & App Logos
            { isLogo: true, color: '#1877F2', viewBox: '0 0 24 24', path: 'M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29h-3.128V11.12h3.128V8.625c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.588h-3.12V24h5.713c.734 0 1.325-.59 1.325-1.325v-21.35C24 .59 23.41 0 22.675 0z' }, // Facebook
            { isLogo: true, color: '#C13584', viewBox: '0 0 24 24', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163m0-1.646c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.072-4.948-.072zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z' }, // Instagram
            { isLogo: true, color: '#000000', viewBox: '0 0 24 24', path: 'M18.901 1.153h3.59l-8.26 9.395L24 22.846h-7.22l-5.63-7.44-6.44 7.44H.86l8.72-10.007L0 1.154h7.33l5.05 6.635L18.901 1.153zm-1.61 19.7h2.55l-10.87-14.95h-2.73L17.29 20.853z' }, // X (Twitter)
            { isLogo: true, color: '#FF0000', viewBox: '0 0 24 24', path: 'M21.582 6.186A2.693 2.693 0 0019.96 4.9C18.25 4.5 12 4.5 12 4.5s-6.25 0-7.96.4a2.693 2.693 0 00-1.622 1.286C2 7.84 2 12 2 12s0 4.16.418 5.814a2.693 2.693 0 001.622 1.286c1.71.4 7.96.4 7.96.4s6.25 0 7.96-.4a2.693 2.693 0 001.622-1.286C22 16.16 22 12 22 12s0-4.16-.418-5.814zM10 15.5v-7l6 3.5-6 3.5z' }, // YouTube
            { isLogo: true, color: '#0A66C2', viewBox: '0 0 24 24', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' }, // LinkedIn
            { isLogo: true, color: '#25D366', viewBox: '0 0 24 24', path: 'M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.12c-1.48 0-2.91-.4-4.19-1.18l-.3-.18-3.12.82.83-3.04-.2-.31c-.86-1.35-1.32-2.88-1.32-4.48 0-4.54 3.69-8.23 8.24-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.54-3.69 8.23-8.23 8.23zm4.52-6.14c-.25-.12-1.47-.72-1.7-.82-.23-.09-.39-.12-.56.12-.17.25-.64.82-.79.98-.15.17-.29.18-.54.06s-1.05-.39-2-1.23c-.74-.66-1.23-1.48-1.38-1.73s-.03-.38.11-.51c.13-.12.29-.31.44-.46s.21-.25.31-.42c.1-.17.05-.31-.01-.42s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.44.06-.68.29-.24.24-.92.9-1.12 2.18-.2 1.28.62 2.52.71 2.69.09.17 1.81 2.76 4.4 3.87 2.59 1.1 2.59.74 3.05.68.46-.06 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.07-.1-.23-.17-.48-.29z' }, // WhatsApp
            { isLogo: true, color: '#000000', viewBox: '0 0 24 24', path: 'M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.59v3.11c-1.84.08-3.63-.74-4.56-2.22d0-2.56v4.98c0 4.73-3.6 8.69-8.31 8.69-4.73 0-8.59-3.87-8.59-8.69 0-4.63 3.6-8.44 8.12-8.69v3.11c-2.72.33-4.55 3.03-4.55 5.59 0 3.08 2.58 5.59 5.76 5.59s5.76-2.51 5.76-5.59V.02z' }, // TikTok
            { isLogo: true, color: '#E60023', viewBox: '0 0 24 24', path: 'M12 .2C5.48.2.2 5.48.2 12s5.28 11.8 11.8 11.8 11.8-5.28 11.8-11.8S18.52.2 12 .2zm-1.12 17.51c-1.13.25-2.26.1-3.23-.42-.31-.17-.4-.54-.2-.84.2-.3.59-.4.89-.25.83.45 1.83.56 2.78.27.13-.04.28.08.32.22.04.14-.08.29-.22.32zm1.83-3.18c-1.1.2-2.19-.24-2.82-1.05-.72-.9-.8-2.12-.22-3.18s1.65-1.77 2.78-1.8c1.3-.04 2.53.84 2.87 2.08.34 1.25-.13 2.68-1.22 3.48-.3.22-.61.4-.95.45-.1.01-.21-.02-.28-.11-.06-.08-.06-.2 0-.28.32-.22.6-.5.84-.79.8-.93 1.09-2.2.53-3.28-.56-1.08-1.76-1.73-2.95-1.6-1.3.13-2.42.93-2.88 2.1-.47 1.18-.32 2.55.4 3.56.63.85 1.58 1.3 2.62 1.22.14-.01.27.1.28.24.01.14-.1.27-.24.28zm1.53-7.53c-.3-1.4-1.36-2.53-2.77-2.83-1.4-.3-2.88.1-3.92 1.12-1.04 1.02-1.52 2.44-1.34 3.86.17 1.42 1.02 2.7 2.22 3.36.24.13.53.07.7-.13s.23-.51.06-.72c-1.02-.6-1.7-1.7-1.84-2.87-.16-1.2.2-2.4 1.02-3.28s1.95-1.26 3.12-1.02c1.17.24 2.06 1.15 2.33 2.32.27 1.16-.1 2.38-.9 3.22-.2.22-.2.58.02.8.22.22.58.2.8.02 1.1-1.13 1.6-2.73 1.34-4.32z' } // Pinterest
        ]
    };
    const populateElements = (type, grid) => {
        grid.innerHTML = ''; // Clear previous elements
        elements[type].forEach(el => {
            const elDiv = document.createElement('div');
            elDiv.className = 'w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 p-1';
            if(el.type === 'Rect') elDiv.innerHTML = `<div class="w-10 h-10 bg-gray-500" style="border-radius: ${el.options.rx ? '4px' : '0'}"></div>`;
            else if(el.type === 'Circle') elDiv.innerHTML = `<div class="w-10 h-10 bg-gray-500 rounded-full"></div>`;
            else if(el.type === 'Triangle') elDiv.innerHTML = `<div style="width: 0; height: 0; border-left: 20px solid transparent; border-right: 20px solid transparent; border-bottom: 40px solid #a1a1aa;"></div>`;
            else {
                const viewBox = el.viewBox || '0 0 100 100';
                const fill = el.isLogo ? 'white' : '#a1a1aa';
                const background = el.isLogo ? el.color : 'transparent';
                elDiv.style.backgroundColor = background;
                elDiv.innerHTML = `<svg viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" width="40" height="40"><path d="${el.path}" fill="${fill}"/></svg>`;
            }
            elDiv.onclick = () => addElement(type, el);
            grid.appendChild(elDiv);
        });
    };
    const addElement = (type, elData) => {
        const defaultFill = type === 'shapes' ? '#4338ca' : '#e5e7eb';
        const options = { 
            left: 100, 
            top: 100, 
            fill: elData.isLogo ? elData.color : defaultFill, 
            stroke: type === 'frames' && !elData.isLogo ? '#9ca3af' : undefined, 
            strokeWidth: type === 'frames' && !elData.isLogo ? 2 : 0 
        };
        let obj;
        if (elData.type) { obj = new fabric[elData.type]({ ...options, ...elData.options }); }
        else { 
            obj = new fabric.Path(elData.path, { ...options }); 
            obj.scaleToWidth(120); 
        }
        canvas.add(obj).centerObject(obj);
        canvas.setActiveObject(obj);
        canvas.renderAll();
    };
    populateElements('shapes', shapesGrid);
    populateElements('frames', framesGrid);

    document.getElementById('add-heading-btn').addEventListener('click', () => {
        const text = new fabric.Textbox('Heading', { fontSize: 60, fontFamily: 'Inter', fontWeight: 'bold', width: 300 });
        canvas.add(text);
        text.center();
        canvas.setActiveObject(text);
        canvas.renderAll();
    });
    document.getElementById('add-subheading-btn').addEventListener('click', () => {
        const text = new fabric.Textbox('Subheading', { fontSize: 40, fontFamily: 'Inter', fontWeight: '600', width: 300 });
        canvas.add(text);
        text.center();
        canvas.setActiveObject(text);
        canvas.renderAll();
    });
    document.getElementById('add-body-btn').addEventListener('click', () => {
        const text = new fabric.Textbox('Lorem ipsum dolor sit amet.', { fontSize: 20, fontFamily: 'Inter', width: 300 });
        canvas.add(text);
        text.center();
        canvas.setActiveObject(text);
        canvas.renderAll();
    });
    
    const fonts = ['Inter', 'Arial', 'Verdana', 'Lobster', 'Pacifico', 'Playfair Display', 'Roboto Mono', 'Anton', 'Bebas Neue', 'Montserrat', 'Oswald', 'Georgia', 'Impact'];
    const fontFamilySelect = document.getElementById('font-family');
    fonts.forEach(f => fontFamilySelect.innerHTML += `<option style="font-family: '${f}'" value="${f}">${f}</option>`);


    // --- PROPERTIES PANEL ---
    const textContextHeader = document.getElementById('text-context-header');
    const propSections = document.querySelectorAll('.prop-section');
    const noSelectionDiv = document.getElementById('no-selection');
    const propsContent = document.getElementById('props-content');

    const updatePropertiesPanel = () => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            topObjectControls.classList.remove('hidden');
            topObjectControls.classList.add('flex');
            
            updateGeneralControls(activeObject);
            
            if (activeObject.type.includes('text')) {
                textContextHeader.classList.remove('hidden');
                setTimeout(() => textContextHeader.classList.remove('opacity-0', '-translate-y-full'), 10);
                updateTextControls(activeObject);
                setRightPanelOpen(false);
            } else {
                textContextHeader.classList.add('opacity-0', '-translate-y-full');
                setTimeout(() => textContextHeader.classList.add('hidden'), 200);

                const hasPanelContent = ['rect', 'circle', 'triangle', 'path', 'line'].includes(activeObject.type);
                if (hasPanelContent) {
                    setRightPanelOpen(true);
                    propsContent.classList.remove('hidden');
                    noSelectionDiv.classList.add('hidden');
                    propSections.forEach(s => s.classList.add('hidden'));
                    updateShapeControls(activeObject);
                } else {
                    setRightPanelOpen(false);
                }
            }
        } else {
            topObjectControls.classList.add('hidden');
            topObjectControls.classList.remove('flex');
            setRightPanelOpen(false);
            textContextHeader.classList.add('opacity-0', '-translate-y-full');
            setTimeout(() => textContextHeader.classList.add('hidden'), 200);
        }
    };

    const updateGeneralControls = (obj) => {
        document.getElementById('opacity').value = obj.get('opacity');
        document.getElementById('lock-object').innerHTML = obj.lockMovementX ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-lock-open"></i>';
    };
    
    const updateTextControls = (obj) => {
        document.getElementById('font-family').value = obj.get('fontFamily');
        document.getElementById('font-size').value = obj.get('fontSize');
        document.getElementById('font-color').value = obj.get('fill');
        
        document.getElementById('font-bold').classList.toggle('active', obj.get('fontWeight') === 'bold');
        document.getElementById('font-italic').classList.toggle('active', obj.get('fontStyle') === 'italic');
        document.getElementById('font-underline').classList.toggle('active', obj.get('underline'));
        
        document.querySelectorAll('[id^="text-align-"]').forEach(btn => btn.classList.remove('active'));
        const alignTarget = document.getElementById(`text-align-${obj.get('textAlign')}`);
        if(alignTarget) alignTarget.classList.add('active');
    };
    
    const updateShapeControls = (obj) => {
        if (['rect', 'circle', 'triangle', 'path', 'line'].includes(obj.type)) {
            document.getElementById('fill-stroke-props').classList.remove('hidden');
            document.getElementById('fill-color').value = typeof obj.get('fill') === 'string' ? obj.get('fill') : '#000000';
            document.getElementById('stroke-color').value = obj.get('stroke') || '#000000';
            document.getElementById('stroke-width').value = obj.get('strokeWidth');
        }
    };

    const addPropListener = (elementId, event, prop, isNumeric = false) => {
        const el = document.getElementById(elementId);
        if(el){
            el.addEventListener(event, (e) => {
                canvas.getActiveObjects().forEach(obj => {
                    let value = e.target.value;
                    if (isNumeric) value = parseFloat(value);
                    obj.set(prop, value);
                });
                canvas.renderAll();
            });
        }
    };
    addPropListener('font-family', 'change', 'fontFamily');
    addPropListener('font-size', 'input', 'fontSize', true);
    addPropListener('font-color', 'input', 'fill');
    
    addPropListener('fill-color', 'input', 'fill');
    addPropListener('stroke-color', 'input', 'stroke');
    addPropListener('stroke-width', 'input', 'strokeWidth', true);
    addPropListener('opacity', 'input', 'opacity', true);

    // --- EVENT LISTENERS ---
    canvas.on('object:modified', saveState).on('object:added', saveState).on('object:removed', saveState)
          .on('selection:created', updatePropertiesPanel).on('selection:updated', updatePropertiesPanel)
          .on('selection:cleared', updatePropertiesPanel);
    
    const toggleTextStyle = (prop, value1, value2) => {
        canvas.getActiveObjects().forEach(obj => {
            const current = obj.get(prop);
            obj.set(prop, current === value1 ? value2 : value1);
        });
        canvas.renderAll();
        updateTextControls(canvas.getActiveObject());
        saveState();
    };

    document.getElementById('font-bold').addEventListener('click', () => toggleTextStyle('fontWeight', 'bold', 'normal'));
    document.getElementById('font-italic').addEventListener('click', () => toggleTextStyle('fontStyle', 'italic', 'normal'));
    document.getElementById('font-underline').addEventListener('click', () => toggleTextStyle('underline', true, false));

    const setTextAlign = (align) => {
        canvas.getActiveObjects().forEach(obj => obj.set('textAlign', align));
        canvas.renderAll();
        updateTextControls(canvas.getActiveObject());
        saveState();
    };

    document.getElementById('text-align-left').addEventListener('click', () => setTextAlign('left'));
    document.getElementById('text-align-center').addEventListener('click', () => setTextAlign('center'));
    document.getElementById('text-align-right').addEventListener('click', () => setTextAlign('right'));

    document.getElementById('bring-forward').addEventListener('click', () => { canvas.getActiveObjects().forEach(o => o.bringForward()); canvas.renderAll(); saveState(); });
    document.getElementById('send-backward').addEventListener('click', () => { canvas.getActiveObjects().forEach(o => o.sendBackwards()); canvas.renderAll(); saveState(); });
    document.getElementById('delete-object').addEventListener('click', () => { canvas.getActiveObjects().forEach(o => canvas.remove(o)); canvas.discardActiveObject().renderAll(); });
    document.getElementById('lock-object').addEventListener('click', () => {
        canvas.getActiveObjects().forEach(obj => {
            const isLocked = !obj.lockMovementX;
            obj.set({ lockMovementX: isLocked, lockMovementY: isLocked, lockScalingX: isLocked, lockScalingY: isLocked, lockRotation: isLocked, hasControls: !isLocked });
        });
        updatePropertiesPanel();
        canvas.renderAll();
        saveState();
    });
    
    document.getElementById('image-upload-input').addEventListener('change', e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (f) => {
             fabric.Image.fromURL(f.target.result, i => {
                 i.scaleToWidth(300);
                 canvas.add(i).centerObject(i);
             });
        };
        if(file) reader.readAsDataURL(file);
    });
    
    document.getElementById('bg-color-input').addEventListener('input', e => {
         canvas.setBackgroundColor(e.target.value, () => canvas.renderAll());
         saveState();
    });

    // --- QR CODE GENERATION ---
    const qrGenerateBtn = document.getElementById('qr-generate-btn');
    const qrInput = document.getElementById('qr-input');
    let isGeneratingQR = false;
    
    qrGenerateBtn.addEventListener('click', () => {
        const text = qrInput.value.trim();
        if (!text) {
            showNotification("Please enter text or a URL for the QR code.");
            return;
        }

        if (isGeneratingQR) return;
        isGeneratingQR = true;

        const btnText = qrGenerateBtn.querySelector('.btn-text');
        const spinner = qrGenerateBtn.querySelector('.loading-spinner');
        
        qrGenerateBtn.disabled = true;
        btnText.textContent = 'Generating...';
        spinner.classList.remove('hidden');

        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(text)}`;

        fabric.Image.fromURL(qrApiUrl, (img) => {
            img.scaleToWidth(200);
            canvas.add(img).centerObject(img).setActiveObject(img);
            canvas.renderAll();
            saveState();
            showNotification("QR Code added to canvas!");

            // Reset button
            qrGenerateBtn.disabled = false;
            btnText.textContent = 'Generate & Add to Canvas';
            spinner.classList.add('hidden');
            isGeneratingQR = false;
        }, { crossOrigin: 'anonymous' }, 
        (err) => {
             showNotification("Failed to generate QR code. Please try again.");
             // Reset button
             qrGenerateBtn.disabled = false;
             btnText.textContent = 'Generate & Add to Canvas';
             spinner.classList.add('hidden');
             isGeneratingQR = false;
        });
    });

    // --- AI IMAGE GENERATION ---
    const aiGenerateBtn = document.getElementById('ai-generate-btn');
    const aiPromptInput = document.getElementById('ai-prompt');
    const aiStyleSelect = document.getElementById('ai-style');
    let isGenerating = false;

    aiGenerateBtn.addEventListener('click', () => {
        const prompt = aiPromptInput.value.trim();
        const style = aiStyleSelect.value;
        
        if (!prompt) {
            showNotification("Please enter a description for your image.");
            return;
        }

        if (isGenerating) return;
        isGenerating = true;

        const btnText = aiGenerateBtn.querySelector('.btn-text');
        const spinner = aiGenerateBtn.querySelector('.loading-spinner');
        
        aiGenerateBtn.disabled = true;
        btnText.textContent = 'Generating...';
        spinner.classList.remove('hidden');

        const enhancedPrompt = `${prompt}, ${style} style, high quality, detailed`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${Date.now()}&nologo=true`;

        fabric.Image.fromURL(imageUrl, (img) => {
            img.scaleToWidth(400);
            canvas.add(img).centerObject(img).setActiveObject(img);
            canvas.renderAll();
            saveState();
            showNotification("AI Image added to canvas!");

            // Reset button
            aiGenerateBtn.disabled = false;
            btnText.textContent = 'Generate Image';
            spinner.classList.add('hidden');
            isGenerating = false;
        }, { crossOrigin: 'anonymous' }, 
        (err) => {
             showNotification("Failed to generate AI image. Please try again.");
             // Reset button
             aiGenerateBtn.disabled = false;
             btnText.textContent = 'Generate Image';
             spinner.classList.add('hidden');
             isGenerating = false;
        });
    });

    // --- Context Menu Logic ---
    const contextMenu = document.getElementById('context-menu');
    const ctxFill = document.getElementById('ctx-fill-color');
    const ctxStroke = document.getElementById('ctx-stroke-color');
    const ctxStrokeWidth = document.getElementById('ctx-stroke-width');

    const hideContextMenu = () => contextMenu.classList.add('hidden');
    window.addEventListener('click', hideContextMenu, true); // Use capture to hide on any click
    contextMenu.addEventListener('click', (e) => e.stopPropagation());

    canvas.on('mouse:down', (e) => {
        if (e.button === 3 && e.target) {
            e.e.preventDefault();
            hideContextMenu();
            
            const target = e.target;
            canvas.setActiveObject(target).renderAll();

            if (['rect', 'circle', 'triangle', 'path', 'line'].includes(target.type)) {
                ctxFill.value = target.get('fill') || '#000000';
                ctxStroke.value = target.get('stroke') || '#000000';
                ctxStrokeWidth.value = target.get('strokeWidth') || 0;
                
                contextMenu.style.left = `${e.e.clientX}px`;
                contextMenu.style.top = `${e.e.clientY}px`;
                contextMenu.classList.remove('hidden');
            }
        }
    });
    
    const applyContextChange = (prop, value) => {
        const obj = canvas.getActiveObject();
        if (obj) {
            obj.set(prop, value);
            canvas.renderAll();
        }
    };

    ctxFill.addEventListener('input', (e) => applyContextChange('fill', e.target.value));
    ctxStroke.addEventListener('input', (e) => applyContextChange('stroke', e.target.value));
    ctxStrokeWidth.addEventListener('input', (e) => applyContextChange('strokeWidth', parseInt(e.target.value, 10)));
    
    ctxFill.addEventListener('change', saveState);
    ctxStroke.addEventListener('change', saveState);
    ctxStrokeWidth.addEventListener('change', saveState);


    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable) return;
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'z': e.preventDefault(); undo(); break;
                case 'y': e.preventDefault(); redo(); break;
                case 'c': e.preventDefault(); canvas.getActiveObject()?.clone(c => clipboard = c); break;
                case 'v': e.preventDefault(); if (clipboard) clipboard.clone(c => { canvas.add(c.set({left: c.left + 10, top: c.top + 10})); clipboard = c; }); break;
            }
        }
        if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); document.getElementById('delete-object').click(); }
    });

    document.getElementById('zoom-slider').addEventListener('input', (e) => { canvas.setZoom(parseFloat(e.target.value)); canvas.renderAll(); });

    const exportBtn = document.getElementById('export-btn');
    const exportOptions = document.getElementById('export-options');
    exportBtn.addEventListener('click', () => exportOptions.classList.toggle('hidden'));
    document.addEventListener('click', (e) => { if (!exportBtn.contains(e.target)) exportOptions.classList.add('hidden'); });
    
    // --- EXPORT & UPLOAD LOGIC ---

    // Helper function to convert Data URL to Blob for uploading
    const dataURLtoBlob = (dataurl) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    const exportAndUploadPNG = async () => {
        const format = 'png';
        const ext = 'png';
        const quality = 1.0;
        const title = document.getElementById('document-title').textContent.trim().replace(/\s+/g, '-');
        const fileName = `${title}-${Date.now()}.${ext}`;

        // 1. Get Data URL from canvas
        const dataURL = canvas.toDataURL({ format, quality });

        // 2. Trigger local download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = fileName;
        link.click();
        showNotification("Download started...");

        // 3. Upload to Supabase (if configured)
        if (!supabase) {
             console.log("Supabase not configured, skipping cloud upload.");
             showNotification("Cloud storage not set up.", 4000);
             return;
        }

        try {
            showNotification("Uploading to cloud...", 2000);
            const blob = dataURLtoBlob(dataURL);
            const file = new File([blob], fileName, { type: `image/${format}` });

            // First, upload the file to storage
            const { data, error } = await supabase.storage
                .from('wike') // Your bucket name
                .upload(`editor/${fileName}`, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error; // This will be caught by the catch block
            }

            console.log('Supabase storage upload successful:', data);

            // --- NEW: Insert metadata into Supabase SQL table ---
            const { data: publicUrlData } = supabase
                .storage
                .from('wike') // Your bucket name again
                .getPublicUrl(data.path);

            const designData = {
                document_title: title,
                file_name: fileName,
                storage_path: data.path, // 'path' comes from the successful storage upload response
                public_url: publicUrlData.publicUrl
            };

            const { error: dbError } = await supabase
                .from('designs') // The name of your new table
                .insert([designData]);

            if (dbError) {
                // If the DB insert fails, you might want to consider deleting the stored file
                console.error('Error saving metadata to database:', dbError);
                showNotification(`Cloud save failed on DB insert: ${dbError.message}`);
            } else {
                showNotification("Successfully saved to cloud and database!");
            }
            // --- END NEW CODE ---

        } catch (error) {
            console.error('Error in export and upload process:', error.message);
            showNotification(`Cloud save failed: ${error.message}`);
        }
    };
    
    const downloadJPG = () => {
        const dataURL = canvas.toDataURL({ format: 'jpeg', quality: 1.0 });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${document.getElementById('document-title').textContent}.jpg`;
        link.click();
    };

    const downloadPDF = () => {
        const { jsPDF } = window.jspdf;
        const imgData = canvas.toDataURL({ format: 'jpeg', quality: 1.0 });
        const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? 'l' : 'p', unit: 'px', format: [canvasBaseWidth, canvasBaseHeight] });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvasBaseWidth, canvasBaseHeight);
        pdf.save(`${document.getElementById('document-title').textContent}.pdf`);
    };

    document.getElementById('export-png').addEventListener('click', (e) => { e.preventDefault(); exportAndUploadPNG(); });
    document.getElementById('export-jpg').addEventListener('click', (e) => { e.preventDefault(); downloadJPG(); });
    document.getElementById('export-pdf').addEventListener('click', (e) => { e.preventDefault(); downloadPDF(); });


    // --- INITIAL LOAD ---
    resizeCanvas();
    populateTemplates();
    saveState();
    updatePageIndicator();
    setLeftPanelOpen(false);
    setRightPanelOpen(false);
});
