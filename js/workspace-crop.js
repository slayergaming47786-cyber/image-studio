/* ========================================================
   🌟 WORKSPACE, UPLOAD, ROTATION, SWAP & CROP GRID ENGINE
   ======================================================== */
function triggerFileInput(idx) {
    const fileEl = document.getElementById("file" + idx);
    if (fileEl) fileEl.click();
}

function setupDragDropPasteEngine(idx) {
    const box = document.getElementById("imgBox" + idx);
    if (!box) return;
    box.addEventListener('dragover', (e) => { e.preventDefault(); box.classList.add('dragover'); });
    box.addEventListener('dragleave', () => box.classList.remove('dragover'));
    box.addEventListener('drop', (e) => {
        e.preventDefault(); box.classList.remove('dragover');
        if (e.dataTransfer && e.dataTransfer.files.length > 0) {
            document.getElementById("file" + idx).files = e.dataTransfer.files;
            processLoadedFileObject(e.dataTransfer.files[0], idx);
        }
    });
}

// Global Clipboard Paste Support (Ctrl+V anywhere on page)
window.addEventListener('paste', (e) => {
    // Only process if user is in Image Studio section and not typing in an input
    const sectionImages = document.getElementById("sectionImages");
    if (!sectionImages || sectionImages.style.display === "none") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                let targetIdx = 1;
                if (appMode === 'merger' && images[1] && !images[2]) targetIdx = 2;
                processLoadedFileObject(file, targetIdx);
                break;
            }
        }
    }
});

const file1El = document.getElementById("file1");
const file2El = document.getElementById("file2");
if (file1El) file1El.addEventListener("change", e => handleFileSelect(e, 1));
if (file2El) file2El.addEventListener("change", e => handleFileSelect(e, 2));

function handleFileSelect(e, idx) {
    const file = e.target.files[0];
    if (file) processLoadedFileObject(file, idx);
}

function processLoadedFileObject(file, idx) {
    if (file.name) {
        const dotIdx = file.name.lastIndexOf('.');
        baseFileNames[idx] = dotIdx !== -1 ? file.name.substring(0, dotIdx) : file.name;
    } else {
        baseFileNames[idx] = `photo_${idx}`;
    }

    const img = new Image();
    img.onload = () => {
        images[idx] = img;
        rotations[idx] = 0;
        const wmBtn = document.getElementById("wmBtn" + idx);
        if (wmBtn) wmBtn.style.display = "inline-block";
        initWorkspace(idx);
    };
    img.src = URL.createObjectURL(file);
}

function rotateImage(idx) {
    if (!images[idx]) return alert("Please upload an image first!");
    rotations[idx] = (rotations[idx] + 90) % 360;
    initWorkspace(idx);
}

function triggerFullCropShortcut(event, idx) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    if (!images[idx]) return;
    const canvas = document.getElementById("canvas" + idx);
    grids[idx].x = 0; grids[idx].y = 0; grids[idx].w = canvas.width; grids[idx].h = canvas.height;
    window.requestAnimationFrame(() => { 
        updateGridUI(idx); 
        if (finalMergedCanvas) mergeAndPreview(); 
    });
}

function initWorkspace(idx) {
    const canvas = document.getElementById("canvas" + idx);
    const wrapper = document.getElementById("wrapper" + idx);
    const gridEl = document.getElementById("grid" + idx);
    const img = images[idx];
    if (!img) return;

    const isRotated = (rotations[idx] === 90 || rotations[idx] === 270);
    const width = isRotated ? img.height : img.width;
    const height = isRotated ? img.width : img.height;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotations[idx] * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    wrapper.style.display = "block";
    gridEl.style.display = "block";

    const autoFitCheck = document.getElementById("globalAutoFitCheck");
    if (autoFitCheck && autoFitCheck.checked) {
        grids[idx].x = 0; grids[idx].y = 0; grids[idx].w = width; grids[idx].h = height;
    } else {
        grids[idx].w = Math.round(width * 0.6);
        grids[idx].h = Math.round(height * 0.6);
        grids[idx].x = Math.round((width - grids[idx].w) / 2);
        grids[idx].y = Math.round((height - grids[idx].h) / 2);
    }

    applyAspectRatioPreset();
    updateGridUI(idx);
    attachInteractionListeners(idx);
    updateMainWorkspaceLiveTextOverlay(idx);
}

function applyAspectRatioPreset() {
    const ratioType = document.getElementById("aspectRatio").value;
    if (ratioType === "free") return;
    let targetRatio = 1;
    if (ratioType === "1:1") targetRatio = 1;
    else if (ratioType === "4:3") targetRatio = 4 / 3;
    else if (ratioType === "16:9") targetRatio = 16 / 9;
    else if (ratioType === "passport") targetRatio = 3 / 4;

    let loops = (appMode === 'merger') ? [1, 2] : [1];
    loops.forEach(idx => {
        if (!images[idx]) return;
        const canvas = document.getElementById("canvas" + idx);
        let nw = grids[idx].w;
        let nh = Math.round(nw / targetRatio);
        if (nh > canvas.height) { nh = canvas.height; nw = Math.round(nh * targetRatio); }
        if (nw > canvas.width) { nw = canvas.width; nh = Math.round(nw / targetRatio); }
        grids[idx].w = nw;
        grids[idx].h = nh;
        if (grids[idx].x + nw > canvas.width) grids[idx].x = canvas.width - nw;
        if (grids[idx].y + nh > canvas.height) grids[idx].y = canvas.height - nh;
        updateGridUI(idx);
    });
}

function swapImages() {
    let tempImg = images[1]; images[1] = images[2]; images[2] = tempImg;
    let tempRot = rotations[1]; rotations[1] = rotations[2]; rotations[2] = tempRot;
    let tempGrid = grids[1]; grids[1] = grids[2]; grids[2] = tempGrid;
    let tempName = baseFileNames[1]; baseFileNames[1] = baseFileNames[2]; baseFileNames[2] = tempName;
    let tempConfig = watermarkConfigs[1]; watermarkConfigs[1] = watermarkConfigs[2]; watermarkConfigs[2] = tempConfig;

    [1, 2].forEach(i => {
        const triggerBtn = document.getElementById("wmBtn" + i);
        if (images[i]) {
            triggerBtn.style.display = "inline-block";
            if (watermarkConfigs[i].active) {
                triggerBtn.innerText = "📝 Edit Watermark (Active)";
                triggerBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
            } else {
                triggerBtn.innerText = "📝 Add Watermark";
                triggerBtn.style.background = "linear-gradient(135deg, #4f46e5, #3b82f6)";
            }
        } else {
            triggerBtn.style.display = "none";
        }
        updateMainWorkspaceLiveTextOverlay(i);
    });

    if (images[1]) initWorkspace(1); else document.getElementById("wrapper1").style.display = "none";
    if (images[2]) initWorkspace(2); else document.getElementById("wrapper2").style.display = "none";
    if (finalMergedCanvas) mergeAndPreview();
}

function updateGridUI(idx) {
    const canvas = document.getElementById("canvas" + idx);
    const gridEl = document.getElementById("grid" + idx);
    if (!canvas || !gridEl) return;

    const scaleX = 100 / canvas.width;
    const scaleY = 100 / canvas.height;
    gridEl.style.left = (grids[idx].x * scaleX) + "%";
    gridEl.style.top = (grids[idx].y * scaleY) + "%";
    gridEl.style.width = (grids[idx].w * scaleX) + "%";
    gridEl.style.height = (grids[idx].h * scaleY) + "%";
    
    const shadowBox = document.getElementById("shadowBox" + idx);
    if (shadowBox) {
        shadowBox.style.left = gridEl.style.left;
        shadowBox.style.top = gridEl.style.top;
        shadowBox.style.width = gridEl.style.width;
        shadowBox.style.height = gridEl.style.height;
    }
}

function attachInteractionListeners(idx) {
    const wrapperNode = document.getElementById("canvasContainer" + idx);
    const gridEl = document.getElementById("grid" + idx); 
    if (!wrapperNode || !gridEl) return;

    // Use direct property handler to prevent accumulating duplicate listeners
    wrapperNode.onpointerup = (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapMap[idx];
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault(); e.stopPropagation();
            const canvas = document.getElementById("canvas" + idx);
            grids[idx].x = 0; grids[idx].y = 0; grids[idx].w = canvas.width; grids[idx].h = canvas.height;
            window.requestAnimationFrame(() => { 
                updateGridUI(idx); 
                if (finalMergedCanvas) mergeAndPreview(); 
            });
            lastTapMap[idx] = 0;
            return;
        }
        lastTapMap[idx] = currentTime;
    };

    const startHandler = (e) => {
        const touch = e.touches ? e.touches[0] : e;
        const target = e.target;
        activeSession.idx = idx;
        activeSession.startX = touch.clientX;
        activeSession.startY = touch.clientY;
        activeSession.initialGrid = { ...grids[idx] };
        if (target.classList.contains("handle")) {
            activeSession.type = "resize";
            activeSession.handle = target.dataset.handle;
        } else {
            activeSession.type = "drag";
        }
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
    };

    gridEl.onmousedown = startHandler;
    gridEl.ontouchstart = startHandler;
}

const moveHandler = (e) => {
    if (!activeSession.idx || !activeSession.type) return;
    if (e.cancelable) e.preventDefault();
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateGridPositions(e);
            ticking = false;
        });
        ticking = true;
    }
};

function updateGridPositions(e) {
    const idx = activeSession.idx;
    if (!idx) return;
    const canvas = document.getElementById("canvas" + idx);
    const wrapper = document.getElementById("canvasContainer" + idx);
    const rect = wrapper.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches ? e.touches[0] : e;
    const dx = (touch.clientX - activeSession.startX) * scaleX;
    const dy = (touch.clientY - activeSession.startY) * scaleY;
    const init = activeSession.initialGrid;
    const ratioType = document.getElementById("aspectRatio").value;
    const isAspectLocked = ratioType !== "free";
    let aspect = init.w / init.h;

    if (activeSession.type === "drag") {
        let nx = Math.max(0, Math.min(init.x + dx, canvas.width - init.w));
        let ny = Math.max(0, Math.min(init.y + dy, canvas.height - init.h));
        grids[idx].x = Math.round(nx);
        grids[idx].y = Math.round(ny);
    } else if (activeSession.type === "resize") {
        const handle = activeSession.handle;
        let nx = init.x; let ny = init.y; let nw = init.w; let nh = init.h;
        if (!isAspectLocked) {
            if (handle === "br") { nw = Math.max(30, Math.min(init.w + dx, canvas.width - init.x)); nh = Math.max(30, Math.min(init.h + dy, canvas.height - init.y)); }
            else if (handle === "bl") { let maxW = init.x + init.w; nx = Math.max(0, Math.min(init.x + dx, maxW - 30)); nw = maxW - nx; nh = Math.max(30, Math.min(init.h + dy, canvas.height - init.y)); }
            else if (handle === "tr") { nw = Math.max(30, Math.min(init.w + dx, canvas.width - init.x)); let maxH = init.y + init.h; ny = Math.max(0, Math.min(init.y + dy, maxH - 30)); nh = maxH - ny; }
            else if (handle === "tl") { let maxW = init.x + init.w; nx = Math.max(0, Math.min(init.x + dx, maxW - 30)); nw = maxW - nx; let maxH = init.y + init.h; ny = Math.max(0, Math.min(init.y + dy, maxH - 30)); nh = maxH - ny; }
            else if (handle === "t") { let maxH = init.y + init.h; ny = Math.max(0, Math.min(init.y + dy, maxH - 30)); nh = maxH - ny; }
            else if (handle === "b") { nh = Math.max(30, Math.min(init.h + dy, canvas.height - init.y)); }
            else if (handle === "l") { let maxW = init.x + init.w; nx = Math.max(0, Math.min(init.x + dx, maxW - 30)); nw = maxW - nx; }
            else if (handle === "r") { nw = Math.max(30, Math.min(init.w + dx, canvas.width - init.x)); }
        } else {
            if (handle === "br" || handle === "r" || handle === "b") {
                nw = Math.max(30, init.w + dx); nh = Math.round(nw / aspect);
                if (init.x + nw > canvas.width) { nw = canvas.width - init.x; nh = Math.round(nw / aspect); }
                if (init.y + nh > canvas.height) { nh = canvas.height - init.y; nw = Math.round(nh * aspect); }
            } else if (handle === "tl" || handle === "l" || handle === "t") {
                let maxW = init.x + init.w; let maxH = init.y + init.h;
                nw = Math.max(30, init.w - dx); nh = Math.round(nw / aspect);
                let pX = maxW - nw; let pY = maxH - nh;
                if (pX < 0) { pX = 0; nw = maxW; nh = Math.round(nw / aspect); pY = maxH - nh; }
                if (pY < 0) { pY = 0; nh = maxH; nw = Math.round(nh * aspect); pX = maxW - nw; }
                nx = pX; ny = pY;
            } else if (handle === "tr") {
                let maxH = init.y + init.h;
                nw = Math.max(30, init.w + dx);
                if (init.x + nw > canvas.width) nw = canvas.width - init.x;
                nh = Math.round(nw / aspect);
                let pY = maxH - nh;
                if (pY < 0) { pY = 0; nh = maxH; nw = Math.round(nh * aspect); }
                ny = pY;
            } else if (handle === "bl") {
                let maxW = init.x + init.w;
                nw = Math.max(30, init.w - dx);
                let pX = maxW - nw;
                if (pX < 0) pX = 0;
                nh = Math.round(nw / aspect);
                if (init.y + nh > canvas.height) { nh = canvas.height - init.y; nw = Math.round(nh * aspect); pX = maxW - nw; }
                nx = pX;
            }
        }
        grids[idx].x = Math.round(nx);
        grids[idx].y = Math.round(ny);
        grids[idx].w = Math.round(nw);
        grids[idx].h = Math.round(nh);
    }
    updateGridUI(idx);
}

const endHandler = () => {
    if (activeSession.idx && finalMergedCanvas) {
        mergeAndPreview();
    }
    activeSession.idx = null;
    activeSession.type = null;
};

window.addEventListener("mousemove", moveHandler, { passive: false });
window.addEventListener("touchmove", moveHandler, { passive: false });
window.addEventListener("mouseup", endHandler);
window.addEventListener("touchend", endHandler);
