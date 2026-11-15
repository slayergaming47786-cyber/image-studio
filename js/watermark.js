/* ========================================================
   🌟 CUSTOM WATERMARK MODAL & 1:1 CANVAS TEXT RENDERER
   ======================================================== */
function openWatermarkWindow(idx) {
    if(!images[idx]) return alert("Please load an image first!");
    currentEditingImgIdx = idx;
    const config = watermarkConfigs[idx];
    const canvas = document.getElementById("canvas" + idx);
    const targetImg = document.getElementById("wmViewportTargetImg");
    targetImg.src = canvas.toDataURL();

    document.getElementById("modalWmText").value = config.text;
    document.getElementById("modalWmFont").value = config.font;
    document.getElementById("modalWmSizeSlider").value = config.size;
    document.getElementById("modalWmSizeNum").value = config.size;
    document.getElementById("modalWmBgChoice").value = config.bgColor;
    tempModalSelectedColor = config.color;
    textPctX = config.pctX;
    textPctY = config.pctY;

    const swatches = document.getElementById("modalColorSwatches").querySelectorAll(".swatch-circle");
    swatches.forEach(sw => {
        sw.classList.remove("active");
        if(sw.style.backgroundColor === hexToRgbStyleString(tempModalSelectedColor)) sw.classList.add("active");
    });
    document.getElementById("wmColorBox").classList.remove("open");
    document.getElementById("wmModal").style.display = "flex";
    targetImg.onload = () => { updateModalLivePreviewUI(); };
}

/* 🌟 PERFECTED 1:1 REAL SIZE MATCH RENDERER */
function updateModalLivePreviewUI() {
    const text = document.getElementById("modalWmText").value.trim() || "Watermark Pro";
    const font = document.getElementById("modalWmFont").value;
    const size = parseInt(document.getElementById("modalWmSizeNum").value) || 45;
    const bgChoice = document.getElementById("modalWmBgChoice").value;
    const node = document.getElementById("wmMovableText");
    const container = document.getElementById("wmViewportContainer");

    node.innerText = text;
    node.style.fontFamily = font;
    node.style.color = tempModalSelectedColor;
    node.style.backgroundColor = (bgChoice === "none") ? "transparent" : bgChoice;

    // Display size strictly locks mathematically with UI rendering frame mapping
    node.style.fontSize = size + "px";

    node.style.left = `${Math.round(container.clientWidth * textPctX)}px`;
    node.style.top = `${Math.round(container.clientHeight * textPctY)}px`;
    node.style.transform = "translate(-50%, -50%)";
}

function attachTextDragListeners() {
    const node = document.getElementById("wmMovableText");
    const container = document.getElementById("wmViewportContainer");

    const startDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        isDraggingText = true;
        document.getElementById("modalWmText").blur(); // Dismisses keyboard if swiping inside preview window!
        const touch = e.touches ? e.touches[0] : e;
        const rect = node.getBoundingClientRect();
        dragStartX = touch.clientX - (rect.left + rect.width / 2);
        dragStartY = touch.clientY - (rect.top + rect.height / 2);
    };

    const doDrag = (e) => {
        if (!isDraggingText) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        const containerRect = container.getBoundingClientRect();
        let targetX = Math.max(0, Math.min(touch.clientX - containerRect.left - dragStartX, containerRect.width));
        let targetY = Math.max(0, Math.min(touch.clientY - containerRect.top - dragStartY, containerRect.height));
        textPctX = targetX / containerRect.width;
        textPctY = targetY / containerRect.height;
        node.style.left = `${targetX}px`;
        node.style.top = `${targetY}px`;
    };

    const stopDrag = () => { isDraggingText = false; };

    node.addEventListener("mousedown", startDrag);
    node.addEventListener("touchstart", startDrag, { passive: false });
    window.addEventListener("mousemove", doDrag);
    window.addEventListener("touchmove", doDrag, { passive: false });
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);
}

function saveAndApplyWatermarkState() {
    if(!currentEditingImgIdx) return;
    const idx = currentEditingImgIdx;
    watermarkConfigs[idx].text = document.getElementById("modalWmText").value.trim();
    watermarkConfigs[idx].font = document.getElementById("modalWmFont").value;
    watermarkConfigs[idx].size = parseInt(document.getElementById("modalWmSizeNum").value) || 45;
    watermarkConfigs[idx].color = tempModalSelectedColor;
    watermarkConfigs[idx].bgColor = document.getElementById("modalWmBgChoice").value;
    watermarkConfigs[idx].pctX = textPctX;
    watermarkConfigs[idx].pctY = textPctY;
    watermarkConfigs[idx].active = watermarkConfigs[idx].text !== "";
    
    // Crucial for 1:1 match equation parameter tracking bounds
    watermarkConfigs[idx].previewW = document.getElementById("wmViewportContainer").clientWidth;

    const triggerBtn = document.getElementById("wmBtn" + idx);
    if(watermarkConfigs[idx].active) {
        triggerBtn.innerText = "📝 Edit Watermark (Active)";
        triggerBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
    } else {
        triggerBtn.innerText = "📝 Add Watermark";
        triggerBtn.style.background = "linear-gradient(135deg, #4f46e5, #3b82f6)";
    }
    document.getElementById("wmModal").style.display = "none";
    currentEditingImgIdx = null;
    updateMainWorkspaceLiveTextOverlay(idx);
    mergeAndPreview(); 
}

function updateMainWorkspaceLiveTextOverlay(idx) {
    const node = document.getElementById("mainLiveText" + idx);
    const config = watermarkConfigs[idx];
    if(!config.active || !images[idx]) { node.style.display = "none"; return; }
    node.innerText = config.text;
    node.style.fontFamily = config.font;
    node.style.color = config.color;
    node.style.backgroundColor = (config.bgColor === "none") ? "transparent" : config.bgColor;
    
    const wrapper = document.getElementById("canvasContainer" + idx);
    const mappedSize = config.size * (wrapper.clientWidth / config.previewW);
    node.style.fontSize = Math.max(10, Math.round(mappedSize)) + "px";
    
    node.style.left = `${config.pctX * 100}%`;
    node.style.top = `${config.pctY * 100}%`;
    node.style.display = "block";
}

function closeWatermarkWindowWithoutSaving() {
    document.getElementById("wmModal").style.display = "none";
    currentEditingImgIdx = null;
}

/* 🌟 MATHEMATICAL 1:1 FONT RENDER RATIO ENGINE */
function drawPhotoSpecificText(ctx, idx, startX, startY, frameW, frameH) {
    const config = watermarkConfigs[idx];
    if (!config.active || !config.text) return;
    
    const cropX = grids[idx].x; const cropY = grids[idx].y;
    const cropW = grids[idx].w; const cropH = grids[idx].h;
    const canvasElement = document.getElementById("canvas" + idx);
    const imgX_pixels = canvasElement.width * config.pctX;
    const imgY_pixels = canvasElement.height * config.pctY;

    const relativeX_in_crop = imgX_pixels - cropX;
    const relativeY_in_crop = imgY_pixels - cropY;
    const renderX = startX + (relativeX_in_crop / cropW) * frameW;
    const renderY = startY + (relativeY_in_crop / cropH) * frameH;

    const originalFontSize = config.size * (canvasElement.width / config.previewW);
    const finalFontSize = originalFontSize * (frameW / cropW);

    ctx.save();
    
    // Safety check clipping matrix so text cannot bleed onto other photos if dragged out of bounds
    ctx.beginPath();
    ctx.rect(startX, startY, frameW, frameH);
    ctx.clip();
    
    ctx.font = `bold ${finalFontSize}px ${config.font}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center"; 
    
    if(config.bgColor !== "none") {
        const textWidth = ctx.measureText(config.text).width;
        ctx.fillStyle = config.bgColor;
        const padX = 10 * (finalFontSize / config.size);
        const padY = 4 * (finalFontSize / config.size);
        ctx.fillRect(renderX - (textWidth / 2) - padX, renderY - (finalFontSize / 2) - padY, textWidth + (padX * 2), finalFontSize + (padY * 2));
    }
    ctx.fillStyle = config.color;
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowBlur = (config.bgColor === "none") ? (6 * (finalFontSize / config.size)) : 0; 
    ctx.fillText(config.text, renderX, renderY);
    ctx.restore();
}
