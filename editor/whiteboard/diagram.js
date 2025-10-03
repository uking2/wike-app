document.addEventListener('DOMContentLoaded', () => {

    // --- SUPABASE INTEGRATION ---
    // IMPORTANT: To enable saving to Supabase, do the following:
    // 1. Replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' with your project credentials.
    // 2. In your Supabase project, go to Storage and create a new bucket named 'diagram-exports'. Make it public for simplicity.
    // 3. Go to the SQL Editor in Supabase and run the following command to create the data table:
    /*
        CREATE TABLE diagrams (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          diagram_name TEXT NOT NULL,
          img_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
    */
    const SUPABASE_URL = 'https://hehfnsaoibkvwdolcfkg.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlaGZuc2FvaWJrdndkb2xjZmtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTc5MDUsImV4cCI6MjA3Mzc3MzkwNX0.aDpemN2HIGpORC-tZiQp0iIqXv7L4tO8zXvDCjygvbs';
    let supabase = null;
    const BUCKET_NAME = 'wike';

    try {
        if (SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("Supabase client initialized.");
            fetchAndRenderDiagrams(); // Fetch data on load
        } else {
             console.warn("Supabase credentials are not set. Cloud features will be disabled.");
        }
    } catch (error) {
        console.error("Error initializing Supabase:", error.message);
    }

    // --- NOTIFICATION UTILITY ---
    const notificationEl = document.getElementById('notification');
    const notificationMessageEl = document.getElementById('notification-message');
    let notificationTimeout;

    const showNotification = (message, isError = false) => {
        clearTimeout(notificationTimeout);
        notificationMessageEl.textContent = message;
        notificationEl.classList.remove('bg-red-500', 'bg-slate-800');
        notificationEl.classList.add(isError ? 'bg-red-500' : 'bg-slate-800');
        notificationEl.classList.add('show');
        
        notificationTimeout = setTimeout(() => {
            notificationEl.classList.remove('show');
        }, 3000);
    };

    // --- UTILITY STYLES ---
    const toolbarBtnStyle = 'p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative';
    const contextMenuItemStyle = 'w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700';
    document.querySelectorAll('.toolbar-btn').forEach(btn => btn.className = toolbarBtnStyle);
    document.querySelectorAll('.context-menu-item').forEach(btn => btn.className = contextMenuItemStyle);
    document.querySelectorAll('.tooltip').forEach(el => {
        el.className = 'tooltip absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-200 text-white dark:text-black text-xs px-2 py-1 rounded-md whitespace-nowrap';
    });
    
    lucide.createIcons();

    // --- THEME ---
    const themeToggle = document.getElementById('theme-toggle');
    const lightIcon = document.querySelector('.light-icon');
    const darkIcon = document.querySelector('.dark-icon');
    const docElement = document.documentElement;

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            docElement.classList.add('dark');
            docElement.classList.remove('light');
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        } else {
            docElement.classList.remove('dark');
            docElement.classList.add('light');
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
        }
    };
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = docElement.classList.contains('dark') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- CANVAS INITIALIZATION ---
    const canvasWrapper = document.querySelector('.canvas-container-wrapper');
    const canvasEl = document.getElementById('main-canvas');
    let canvas = new fabric.Canvas(canvasEl, {
        width: canvasWrapper.clientWidth,
        height: canvasWrapper.clientHeight,
        fireRightClick: true,
        stopContextMenu: true,
    });

    const resizeCanvas = () => {
        canvas.setWidth(canvasWrapper.clientWidth);
        canvas.setHeight(canvasWrapper.clientHeight);
        canvas.renderAll();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // --- STATE MANAGEMENT (Undo/Redo) ---
    let undoStack = [];
    let redoStack = [];
    let isProcessingState = false;

    const saveState = () => {
        if (isProcessingState) return;
        redoStack = []; // Clear redo stack on new action
        undoStack.push(JSON.stringify(canvas.toDatalessJSON()));
        if (undoStack.length > 30) undoStack.shift(); // Limit history
    };

    const updateState = (state) => {
        isProcessingState = true;
        canvas.loadFromJSON(state, () => {
            canvas.renderAll();
            isProcessingState = false;
        });
    };
    
    document.getElementById('undo').addEventListener('click', () => {
        if (undoStack.length > 1) {
            const currentState = undoStack.pop();
            redoStack.push(currentState);
            const prevState = undoStack[undoStack.length - 1];
            updateState(prevState);
        }
    });

    document.getElementById('redo').addEventListener('click', () => {
        if (redoStack.length > 0) {
            const nextState = redoStack.pop();
            undoStack.push(nextState);
            updateState(nextState);
        }
    });

    canvas.on('object:modified', saveState);
    canvas.on('object:added', saveState);
    canvas.on('object:removed', saveState);
    saveState(); // Initial state


    // --- SHAPE LIBRARY ---
    const shapeLibrary = document.getElementById('shape-library');
    const shapes = {
        'General': [
            { name: 'Text', type: 'text', icon: 'type' },
            { name: 'Rectangle', type: 'rect', icon: 'rectangle-horizontal' },
            { name: 'Circle', type: 'circle', icon: 'circle' },
            { name: 'Triangle', type: 'triangle', icon: 'triangle' },
            { name: 'Diamond', type: 'diamond', icon: 'diamond' },
        ],
        'Connectors & Arrows': [
            { name: 'Line', type: 'line', icon: 'minus' },
            { name: 'Arrow', type: 'arrow', icon: 'arrow-up-right' },
            { name: 'Double Arrow', type: 'double-arrow', icon: 'move' },
            { name: 'Dashed Arrow', type: 'arrow', icon: 'arrow-up-right', options: { strokeDashArray: [5, 5] } },
        ],
        'Flowchart': [
            { name: 'Process', type: 'rect', icon: 'rectangle-horizontal', options: { rx: 0, ry: 0, stroke: '#3b82f6', fill: '#dbeafe' } },
            { name: 'Terminator', type: 'rect', icon: 'rectangle-horizontal', options: { rx: 20, ry: 20, stroke: '#10b981', fill: '#d1fae5' } },
            { name: 'Decision', type: 'diamond', icon: 'diamond', options: { stroke: '#f59e0b', fill: '#fef3c7' } },
            { name: 'Data (I/O)', type: 'parallelogram', icon: 'italic', options: { stroke: '#8b5cf6', fill: '#ede9fe' } },
        ],
        'UML': [
            { name: 'Actor', type: 'actor', icon: 'user-round' },
            { name: 'Use Case', type: 'ellipse', icon: 'circle-ellipsis', options: { rx: 70, ry: 40, stroke: '#3b82f6', fill: 'white' } },
            { name: 'Class', type: 'class', icon: 'layout-list' },
        ],
    };

    Object.entries(shapes).forEach(([category, items]) => {
        const categoryEl = document.createElement('div');
        categoryEl.className = 'p-2';
        categoryEl.innerHTML = `<h3 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">${category}</h3>`;
        const gridEl = document.createElement('div');
        gridEl.className = 'grid grid-cols-2 gap-2';

        items.forEach(item => {
            const shapeEl = document.createElement('div');
            shapeEl.className = 'shape p-2 border dark:border-slate-700 rounded-md flex flex-col items-center justify-center cursor-pointer text-center';
            shapeEl.draggable = true;
            shapeEl.dataset.type = item.type;
            shapeEl.dataset.options = JSON.stringify(item.options || {});
            shapeEl.innerHTML = `<i data-lucide="${item.icon}" class="w-8 h-8 mb-1"></i><span class="text-xs">${item.name}</span>`;
            gridEl.appendChild(shapeEl);
        });
        categoryEl.appendChild(gridEl);
        shapeLibrary.appendChild(categoryEl);
    });
    lucide.createIcons();

    // --- CUSTOM ARROW SHAPE ---
    const Arrow = fabric.util.createClass(fabric.Line, {
        type: 'arrow',
        initialize: function(element, options) {
            options || (options = {});
            this.callSuper('initialize', element, options);
        },
        _render: function(ctx) {
            this.callSuper('_render', ctx);
            if (this.width === 0 || this.height === 0 || !this.visible) return;
            const x1 = -this.width / 2, y1 = -this.height / 2, x2 = this.width / 2, y2 = this.height / 2;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            
            ctx.save();
            ctx.translate(x2, y2);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-10, -5);
            ctx.lineTo(-10, 5);
            ctx.closePath();
            ctx.fillStyle = this.stroke;
            ctx.fill();
            ctx.restore();

             if (this.isDouble) {
                 ctx.save();
                 ctx.translate(x1, y1);
                 ctx.rotate(angle + Math.PI);
                 ctx.beginPath();
                 ctx.moveTo(0, 0);
                 ctx.lineTo(-10, -5);
                 ctx.lineTo(-10, 5);
                 ctx.closePath();
                 ctx.fillStyle = this.stroke;
                 ctx.fill();
                 ctx.restore();
             }
        }
    });

    // --- SHAPE CREATION & DRAG-AND-DROP ---
    let draggedShape = null;
    shapeLibrary.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('shape')) {
            draggedShape = {
                type: e.target.dataset.type,
                options: JSON.parse(e.target.dataset.options),
            };
        }
    });

    canvasWrapper.addEventListener('dragover', (e) => e.preventDefault());

    canvasWrapper.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedShape) {
            const pointer = canvas.getPointer(e);
            createShape(draggedShape.type, { ...draggedShape.options, left: pointer.x, top: pointer.y });
            draggedShape = null;
        }
    });
    
    const createShape = (type, options = {}) => {
        let shape;
        const defaultOptions = {
            left: 100, top: 100,
            fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2,
            originX: 'center', originY: 'center',
            cornerColor: '#3b82f6',
            borderColor: '#3b82f6',
            transparentCorners: false,
        };
        const finalOptions = { ...defaultOptions, ...options };

        switch (type) {
            case 'rect':
                shape = new fabric.Rect({ width: 100, height: 60, ...finalOptions });
                break;
            case 'circle':
                shape = new fabric.Circle({ radius: 40, ...finalOptions });
                break;
            case 'triangle':
                shape = new fabric.Triangle({ width: 80, height: 70, ...finalOptions });
                break;
            case 'line':
                shape = new fabric.Line([0, 0, 100, 0], { ...finalOptions });
                break;
            case 'arrow':
                shape = new Arrow([0, 0, 100, 0], { ...finalOptions });
                break;
            case 'double-arrow':
                shape = new Arrow([0, 0, 100, 0], { isDouble: true, ...finalOptions });
                break;
            case 'text':
                shape = new fabric.IText('Your Text', { fontSize: 20, fontWeight: 'normal', fontFamily: 'Arial', ...finalOptions });
                break;
            case 'diamond':
                shape = new fabric.Polygon([
                    {x: 50, y: 0}, {x: 100, y: 50}, {x: 50, y: 100}, {x: 0, y: 50}
                ], { ...finalOptions, objectCaching: false });
                break;
            case 'parallelogram':
                 shape = new fabric.Polygon([
                     {x: 0, y: 0}, {x: 120, y: 0}, {x: 100, y: 50}, {x: -20, y: 50}
                 ], { ...finalOptions, width: 120, height: 50 });
                 break;
            case 'actor':
                const head = new fabric.Circle({ radius: 15, fill: 'white', stroke: 'black', strokeWidth: 2, top: 0, left: 17.5 });
                const body = new fabric.Line([32.5, 30, 32.5, 70], { stroke: 'black', strokeWidth: 2 });
                const arms = new fabric.Line([10, 50, 55, 50], { stroke: 'black', strokeWidth: 2 });
                const leg1 = new fabric.Line([32.5, 70, 10, 100], { stroke: 'black', strokeWidth: 2 });
                const leg2 = new fabric.Line([32.5, 70, 55, 100], { stroke: 'black', strokeWidth: 2 });
                shape = new fabric.Group([head, body, arms, leg1, leg2], { ...finalOptions, objectCaching: false });
                break;
            case 'class':
                const rect = new fabric.Rect({ width: 150, height: 100, fill: 'white', stroke: 'black', strokeWidth: 2 });
                const line1 = new fabric.Line([0, 35, 150, 35], { stroke: 'black', strokeWidth: 1 });
                const title = new fabric.IText('ClassName', { top: 8, left: 75, fontSize: 16, textAlign: 'center', originX: 'center' });
                shape = new fabric.Group([rect, line1, title], { ...finalOptions, subTargetCheck: true });
                break;
            case 'ellipse':
                shape = new fabric.Ellipse({ rx: 60, ry: 35, ...finalOptions });
                break;
        }
        if(shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
        }
    };

    // --- MODAL & TOOLBAR ACTIONS ---
    const confirmationModal = document.getElementById('confirmation-modal');
    const modalConfirmBtn = document.getElementById('modal-confirm');
    const modalCancelBtn = document.getElementById('modal-cancel');
    let confirmCallback = null;

    const showConfirmation = (message, onConfirm) => {
        document.getElementById('modal-message').textContent = message;
        confirmationModal.classList.remove('hidden');
        confirmCallback = onConfirm;
    };

    modalConfirmBtn.addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        confirmationModal.classList.add('hidden');
    });

    modalCancelBtn.addEventListener('click', () => {
        confirmationModal.classList.add('hidden');
        confirmCallback = null;
    });

    document.getElementById('new-diagram').addEventListener('click', () => {
        showConfirmation('Are you sure you want to start a new diagram? Any unsaved changes will be lost.', () => {
            canvas.clear();
            undoStack = [];
            redoStack = [];
            saveState();
        });
    });

    // Helper function to convert Data URL to Blob
    const dataURLtoBlob = (dataurl) => {
        const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    };

    const exportDiagram = async (format) => {
        const originalBg = canvas.backgroundColor;
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();

        try {
            if (format === 'pdf') {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: canvas.width > canvas.height ? 'l' : 'p',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                const imgData = canvas.toDataURL({ format: 'png', quality: 1 });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save("diagram.pdf");
            } else {
                const dataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `diagram.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } finally {
            canvas.backgroundColor = originalBg;
            canvas.renderAll();
        }
    };

    document.getElementById('export-png').addEventListener('click', () => exportDiagram('png'));
    document.getElementById('export-pdf').addEventListener('click', () => exportDiagram('pdf'));


    // --- ZOOM & PAN ---
    const zoomLevelEl = document.getElementById('zoom-level');

    const updateZoomLevel = (zoom) => {
        zoomLevelEl.textContent = `${Math.round(zoom * 100)}%`;
    };
    
    canvas.on('mouse:wheel', function(opt) {
        const delta = opt.e.deltaY;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
        updateZoomLevel(zoom);
    });

    document.getElementById('zoom-in').addEventListener('click', () => {
        let newZoom = canvas.getZoom() * 1.2;
        canvas.setZoom(newZoom);
        updateZoomLevel(newZoom);
    });
    document.getElementById('zoom-out').addEventListener('click', () => {
        let newZoom = canvas.getZoom() / 1.2;
        canvas.setZoom(newZoom);
        updateZoomLevel(newZoom);
    });
    document.getElementById('fit-to-screen').addEventListener('click', () => {
        canvas.setZoom(1);
        canvas.viewportTransform[4] = 0;
        canvas.viewportTransform[5] = 0;
        canvas.requestRenderAll();
        updateZoomLevel(1);
    });

    canvas.on('mouse:down', function(opt) {
        const evt = opt.e;
        if (evt.altKey === true) {
            this.isDragging = true;
            this.selection = false;
            this.lastPosX = evt.clientX;
            this.lastPosY = evt.clientY;
        }
    });
    canvas.on('mouse:move', function(opt) {
        if (this.isDragging) {
            const e = opt.e;
            const vpt = this.viewportTransform;
            vpt[4] += e.clientX - this.lastPosX;
            vpt[5] += e.clientY - this.lastPosY;
            this.requestRenderAll();
            this.lastPosX = e.clientX;
            this.lastPosY = e.clientY;
        }
    });
    canvas.on('mouse:up', function(opt) {
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
    });

    // --- CONTEXT MENU ---
    const contextMenu = document.getElementById('context-menu');
    let contextTarget = null;
    
    canvas.on('mouse:down', function(opt) {
        if (opt.button === 3) {
            contextTarget = opt.target;
            if (contextTarget) {
                contextMenu.style.left = `${opt.e.clientX}px`;
                contextMenu.style.top = `${opt.e.clientY}px`;
                contextMenu.style.display = 'block';

                const flipButton = contextMenu.querySelector('[data-action="flip-arrow"]');
                const arrowTypes = ['arrow'];
                if (flipButton) {
                    if (arrowTypes.includes(contextTarget.type)) {
                        flipButton.style.display = 'flex';
                    } else {
                        flipButton.style.display = 'none';
                    }
                }
            }
        } else {
            contextMenu.style.display = 'none';
        }
    });

    window.addEventListener('click', () => contextMenu.style.display = 'none');

    contextMenu.addEventListener('click', (e) => {
        const action = e.target.closest('button')?.dataset.action;
        if (action && contextTarget) {
            let stateShouldBeSaved = false;
            switch(action) {
                case 'bring-to-front':
                    canvas.bringToFront(contextTarget);
                    stateShouldBeSaved = true;
                    break;
                case 'bring-forward':
                    canvas.bringForward(contextTarget);
                    stateShouldBeSaved = true;
                    break;
                case 'send-backward':
                    canvas.sendBackwards(contextTarget);
                    stateShouldBeSaved = true;
                    break;
                case 'send-to-back':
                    canvas.sendToBack(contextTarget);
                    stateShouldBeSaved = true;
                    break;
                case 'flip-arrow':
                    // For line-based arrows, we swap the coordinates
                    if (contextTarget.type === 'arrow' && contextTarget.x1 !== undefined) {
                       const { x1, y1, x2, y2 } = contextTarget;
                       contextTarget.set({ x1: x2, y1: y2, x2: x1, y2: y1 });
                    }
                    stateShouldBeSaved = true;
                    break;
                case 'duplicate':
                    contextTarget.clone((cloned) => {
                        cloned.set({
                            left: cloned.left + 10,
                            top: cloned.top + 10,
                        });
                        canvas.add(cloned);
                        canvas.setActiveObject(cloned);
                    });
                    // State is saved by object:added event
                    break;
                case 'delete': 
                    if (canvas.getActiveObjects().length > 1) {
                        canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
                    } else {
                       canvas.remove(contextTarget);
                    }
                    canvas.discardActiveObject();
                    // State is saved by object:removed event
                    break;
            }
            
            contextMenu.style.display = 'none';
            canvas.renderAll();
            
            if (stateShouldBeSaved) {
                saveState();
            }
        }
    });
    
    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', (e) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.isEditing) return;

        if ((e.key === 'Delete' || e.key === 'Backspace') && activeObject) {
            if (canvas.getActiveObjects().length > 1) {
                canvas.getActiveObjects().forEach(obj => canvas.remove(obj));
            } else {
               canvas.remove(activeObject);
            }
            canvas.discardActiveObject().renderAll();
            e.preventDefault();
        }

        if(e.ctrlKey || e.metaKey) {
            if(e.key === 'z') { document.getElementById('undo').click(); e.preventDefault(); }
            if(e.key === 'y') { document.getElementById('redo').click(); e.preventDefault(); }
        }
    });

    // --- PROPERTIES PANEL ---
    const propertiesPanel = document.getElementById('properties-panel');
    const textProperties = document.getElementById('text-properties');
    const fontFamilySelect = document.getElementById('font-family');
    const textColorInput = document.getElementById('text-color');
    const fontSizeInput = document.getElementById('font-size');
    const fontBoldBtn = document.getElementById('font-bold');
    const fontItalicBtn = document.getElementById('font-italic');

    const getActiveTextObject = (target) => {
        if (!target) return null;
        if (target.type === 'i-text') {
            return target;
        }
        if (target.type === 'group' && target._objects) {
            return target._objects.find(obj => obj.type === 'i-text');
        }
        return null;
    };

    const updatePropertiesPanel = () => {
        const activeObject = canvas.getActiveObject();
        const textObject = getActiveTextObject(activeObject);

        if (textObject) {
            propertiesPanel.classList.remove('hidden');
            textProperties.classList.remove('hidden');

            fontFamilySelect.value = textObject.fontFamily || 'Arial';
            textColorInput.value = new fabric.Color(textObject.fill).toHex();
            fontSizeInput.value = textObject.fontSize;
            
            fontBoldBtn.classList.toggle('bg-blue-500', textObject.fontWeight === 'bold');
            fontBoldBtn.classList.toggle('text-white', textObject.fontWeight === 'bold');
            fontItalicBtn.classList.toggle('bg-blue-500', textObject.fontStyle === 'italic');
            fontItalicBtn.classList.toggle('text-white', textObject.fontStyle === 'italic');

        } else {
            propertiesPanel.classList.add('hidden');
            textProperties.classList.add('hidden');
        }
    };

    const applyTextProperty = (prop, value) => {
        const activeObject = canvas.getActiveObject();
        const textObject = getActiveTextObject(activeObject);
        if (textObject) {
            textObject.set(prop, value);
            if (activeObject.type === 'group') {
                activeObject.addWithUpdate();
            }
            canvas.renderAll();
            saveState();
        }
    };

    fontFamilySelect.addEventListener('change', (e) => applyTextProperty('fontFamily', e.target.value));
    textColorInput.addEventListener('input', (e) => applyTextProperty('fill', e.target.value));
    fontSizeInput.addEventListener('input', (e) => {
        const size = parseInt(e.target.value, 10);
        if (!isNaN(size)) {
            applyTextProperty('fontSize', size);
        }
    });
    fontBoldBtn.addEventListener('click', () => {
        const textObject = getActiveTextObject(canvas.getActiveObject());
        if (textObject) {
            const isBold = textObject.fontWeight === 'bold';
            applyTextProperty('fontWeight', isBold ? 'normal' : 'bold');
            updatePropertiesPanel();
        }
    });
    fontItalicBtn.addEventListener('click', () => {
        const textObject = getActiveTextObject(canvas.getActiveObject());
        if (textObject) {
            const isItalic = textObject.fontStyle === 'italic';
            applyTextProperty('fontStyle', isItalic ? 'normal' : 'italic');
            updatePropertiesPanel();
        }
    });

    canvas.on('selection:created', updatePropertiesPanel);
    canvas.on('selection:updated', updatePropertiesPanel);
    canvas.on('selection:cleared', updatePropertiesPanel);
    canvas.on('text:changed', saveState);

    // --- DATA EDITOR & CLOUD SAVE ---
    const dataEditorPanel = document.getElementById('data-editor-panel');
    const toggleDataEditorBtn = document.getElementById('toggle-data-editor');
    const refreshDataBtn = document.getElementById('refresh-data-btn');
    const diagramsTableBody = document.getElementById('diagrams-table-body');
    const nameModal = document.getElementById('diagram-name-modal');
    const nameInput = document.getElementById('diagram-name-input');
    const saveCloudBtn = document.getElementById('save-cloud-btn');

    toggleDataEditorBtn.addEventListener('click', () => {
        dataEditorPanel.classList.toggle('hidden');
        resizeCanvas();
    });

    refreshDataBtn.addEventListener('click', fetchAndRenderDiagrams);

    async function fetchAndRenderDiagrams() {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('diagrams')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            renderDiagramsTable(data);
        } catch (error) {
            console.error('Error fetching diagrams:', error.message);
            showNotification(`Error fetching data: ${error.message}`, true);
        }
    }

    function renderDiagramsTable(diagrams) {
        diagramsTableBody.innerHTML = '';
        if (diagrams.length === 0) {
            diagramsTableBody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-slate-500">No diagrams saved yet.</td></tr>`;
            return;
        }
        diagrams.forEach(d => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${d.id}</td>
                <td title="${d.diagram_name}">${d.diagram_name}</td>
                <td><a href="${d.img_url}" target="_blank" title="${d.img_url}">Link</a></td>
            `;
            diagramsTableBody.appendChild(row);
        });
    }

    saveCloudBtn.addEventListener('click', () => {
        if (!supabase) {
            showNotification('Supabase is not configured.', true);
            return;
        }
        nameModal.classList.remove('hidden');
        nameInput.focus();
    });

    document.getElementById('modal-name-cancel').addEventListener('click', () => {
        nameModal.classList.add('hidden');
        nameInput.value = '';
    });

    document.getElementById('modal-name-save').addEventListener('click', async () => {
        const diagramName = nameInput.value.trim();
        if (!diagramName) {
            showNotification('Please enter a diagram name.', true);
            return;
        }

        const originalBg = canvas.backgroundColor;
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();

        try {
            // 1. Prepare data
            const dataUrl = canvas.toDataURL({ format: 'png', quality: 1 });
            const blob = dataURLtoBlob(dataUrl);
            const fileName = `diagrams/diagram-${Date.now()}.png`;

            showNotification('Uploading to cloud...');
        
            // 2. Upload image to Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fileName, blob);
            if (uploadError) throw uploadError;

            // 3. Get public URL
            const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(fileName);

            // 4. Insert record into database table
            const { error: insertError } = await supabase
                .from('diagrams')
                .insert([{ diagram_name: diagramName, img_url: urlData.publicUrl }]);
            if (insertError) throw insertError;

            showNotification('Successfully saved to the cloud!');
            nameModal.classList.add('hidden');
            nameInput.value = '';
            fetchAndRenderDiagrams(); // Refresh the table
        } catch (error) {
            console.error('Cloud save failed:', error.message);
            showNotification(`Cloud save failed: ${error.message}`, true);
        } finally {
            // Ensure the background is always reset
            canvas.backgroundColor = originalBg;
            canvas.renderAll();
        }
    });

});

