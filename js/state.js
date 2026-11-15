/* ========================================================
   🌟 GLOBAL STATE, CONSTANTS & APP INITIALIZATION
   ======================================================== */
let appMode = 'merger'; 
let images = { 1: null, 2: null };
let rotations = { 1: 0, 2: 0 };
let baseFileNames = { 1: "photo_1", 2: "photo_2" }; 
let finalMergedCanvas = null;
let currentPreviewUrl = null;
let selectedBorderColor = "#ffffff";

// `previewW` mathematically locks text scale ratio perfectly.
let watermarkConfigs = {
    1: { text: "", font: "Arial", size: 45, color: "#ffffff", bgColor: "none", pctX: 0.5, pctY: 0.85, active: false, previewW: 300 },
    2: { text: "", font: "Arial", size: 45, color: "#ffffff", bgColor: "none", pctX: 0.5, pctY: 0.85, active: false, previewW: 300 }
};

let currentEditingImgIdx = null; 
let tempModalSelectedColor = "#ffffff"; 

let isDraggingText = false;
let dragStartX = 0; let dragStartY = 0;
let textPctX = 0.5; let textPctY = 0.85;

const studioColors = [
    "#ffffff", "#000000", "#ef4444", "#10b981", "#3b82f6", "#eab308",
    "#f97316", "#ec4899", "#d946ef", "#8b5cf6", "#a855f7", "#6366f1",
    "#06b6d4", "#0ea5e9", "#14b8a6", "#64748b", "#94a3b8", "#f87171"
];

let grids = { 1: { x: 0, y: 0, w: 100, h: 100 }, 2: { x: 0, y: 0, w: 100, h: 100 } };
let activeSession = { idx: null, type: null, startX: 0, startY: 0, initialGrid: {} };
let pendingCompression = false; let ticking = false;
let userPreferences = { savedFormat: "ask" };
let lastTapMap = { 1: 0, 2: 0 };

window.addEventListener("DOMContentLoaded", () => {
    // Restore persistent user format preference if saved
    try {
        const saved = localStorage.getItem("image_studio_saved_format");
        if (saved) {
            userPreferences.savedFormat = saved;
            const defSelect = document.getElementById("defaultFormat");
            if (defSelect) defSelect.value = saved;
        }
    } catch(e) {}

    buildBorderSwatches("borderSwatches");
    buildModalColorSwatches();
    setupDragDropPasteEngine(1);
    setupDragDropPasteEngine(2);
    attachTextDragListeners();
    document.getElementById("swapBtn").onclick = swapImages;
});
