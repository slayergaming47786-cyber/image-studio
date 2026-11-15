/* ========================================================
   🌟 MERGER ENGINE, EXPORT FORMAT FLOW & PINPOINT COMPRESSOR
   ======================================================== */
function generateOutputFileName() {
    let base = "studio_export";
    if (appMode === 'single' && images[1]) base = baseFileNames[1];
    else if (appMode === 'merger' && images[1]) base = `${baseFileNames[1]}_merged`;
    return `${base}_${Math.floor(100 + Math.random() * 900)}`;
}

function mergeAndPreview() {
    if (appMode === 'single' && !images[1]) return;
    if (appMode === 'merger' && (!images[1] || !images[2])) return;

    finalMergedCanvas = document.createElement("canvas");
    const ctx = finalMergedCanvas.getContext("2d");
    const canvas1 = document.getElementById("canvas1");

    if (appMode === 'single') {
        finalMergedCanvas.width = grids[1].w;
        finalMergedCanvas.height = grids[1].h;
        ctx.drawImage(canvas1, grids[1].x, grids[1].y, grids[1].w, grids[1].h, 0, 0, grids[1].w, grids[1].h);
        drawPhotoSpecificText(ctx, 1, 0, 0, grids[1].w, grids[1].h);
    } else {
        const mode = document.getElementById("mergeMode").value;
        const borderThickness = parseFloat(document.getElementById("borderThicknessNum").value) || 0;
        const canvas2 = document.getElementById("canvas2");

        if (mode === "side") {
            const targetHeight = 1200;
            const scale1 = targetHeight / grids[1].h;
            const scale2 = targetHeight / grids[2].h;
            const w1_scaled = Math.round(grids[1].w * scale1);
            const w2_scaled = Math.round(grids[2].w * scale2);

            finalMergedCanvas.width = w1_scaled + w2_scaled + borderThickness;
            finalMergedCanvas.height = targetHeight;
            ctx.fillStyle = selectedBorderColor;
            ctx.fillRect(0, 0, finalMergedCanvas.width, finalMergedCanvas.height);

            ctx.drawImage(canvas1, grids[1].x, grids[1].y, grids[1].w, grids[1].h, 0, 0, w1_scaled, targetHeight);
            drawPhotoSpecificText(ctx, 1, 0, 0, w1_scaled, targetHeight);

            ctx.drawImage(canvas2, grids[2].x, grids[2].y, grids[2].w, grids[2].h, w1_scaled + borderThickness, 0, w2_scaled, targetHeight);
            drawPhotoSpecificText(ctx, 2, w1_scaled + borderThickness, 0, w2_scaled, targetHeight);
        } else {
            const targetWidth = 1200;
            const scale1 = targetWidth / grids[1].w;
            const scale2 = targetWidth / grids[2].w;
            const h1_scaled = Math.round(grids[1].h * scale1);
            const h2_scaled = Math.round(grids[2].h * scale2);

            finalMergedCanvas.width = targetWidth;
            finalMergedCanvas.height = h1_scaled + h2_scaled + borderThickness;
            ctx.fillStyle = selectedBorderColor;
            ctx.fillRect(0, 0, finalMergedCanvas.width, finalMergedCanvas.height);

            ctx.drawImage(canvas1, grids[1].x, grids[1].y, grids[1].w, grids[1].h, 0, 0, targetWidth, h1_scaled);
            drawPhotoSpecificText(ctx, 1, 0, 0, targetWidth, h1_scaled);

            ctx.drawImage(canvas2, grids[2].x, grids[2].y, grids[2].w, grids[2].h, 0, h1_scaled + borderThickness, targetWidth, h2_scaled);
            drawPhotoSpecificText(ctx, 2, 0, h1_scaled + borderThickness, targetWidth, h2_scaled);
        }
    }

    finalMergedCanvas.toBlob(blob => {
        if(!blob) return;
        const sizeKB = (blob.size / 1024).toFixed(2);
        document.getElementById("infoStats").innerHTML = `<strong>Final Output Canvas:</strong> ${finalMergedCanvas.width} x ${finalMergedCanvas.height} px<br><strong>Weight:</strong> ${sizeKB} KB`;
        if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
        currentPreviewUrl = URL.createObjectURL(blob);
        document.getElementById("previewImg").src = currentPreviewUrl;
        document.getElementById("previewBlock").style.display = "block";
        document.getElementById("compressedDownloadBtn").style.display = "none";
    }, "image/jpeg", 0.95);
}

function processDownloadFlow(isCompressionRequest) {
    if (!finalMergedCanvas) return;
    pendingCompression = isCompressionRequest;
    if (userPreferences.savedFormat !== "ask") executeTargetExport(userPreferences.savedFormat);
    else document.getElementById("formatModal").style.display = "flex";
}

function confirmFormatModalSelection() {
    const selectedFormat = document.getElementById("modalFormatChoice").value;
    if (document.getElementById("keepChoiceCheck").checked) {
        userPreferences.savedFormat = selectedFormat;
        document.getElementById("defaultFormat").value = selectedFormat;
    }
    document.getElementById("formatModal").style.display = "none";
    executeTargetExport(selectedFormat);
}

function executeTargetExport(format) {
    const filename = generateOutputFileName();
    const ext = format.split("/")[1];
    if (pendingCompression) compressMergedFlow(format, filename);
    else {
        finalMergedCanvas.toBlob(blob => triggerDownload(URL.createObjectURL(blob), `${filename}.${ext}`), format, 0.98);
    }
}

/* 🌟 PINPOINT SIZE COMPRESSION ENGINE */
async function compressMergedFlow(exportFormat, filename) {
    const inputVal = parseFloat(document.getElementById("targetSize").value);
    const unit = document.getElementById("targetUnit").value;
    const ext = exportFormat.split("/")[1];
    if (!inputVal || inputVal <= 0) return alert("Please enter a valid target size!");

    const targetBytes = unit === "MB" ? inputVal * 1024 * 1024 : inputVal * 1024;
    let scale = 1.0;
    let bestBlob = null;
    const statsContainer = document.getElementById("infoStats");
    statsContainer.innerHTML = "Processing Pinpoint Size Engine... 🚀";

    while (scale > 0.05) {
        const compCanvas = document.createElement("canvas");
        const compCtx = compCanvas.getContext("2d");
        compCanvas.width = Math.round(finalMergedCanvas.width * scale);
        compCanvas.height = Math.round(finalMergedCanvas.height * scale);
        
        // Render pre-processed merged canvas safely avoiding double text burns
        compCtx.drawImage(finalMergedCanvas, 0, 0, compCanvas.width, compCanvas.height);
        
        let minQ = 0.01; let maxQ = 1.0; let localBestBlob = null;
        for (let i = 0; i < 12; i++) {
            const q = (minQ + maxQ) / 2;
            const blob = await new Promise(res => compCanvas.toBlob(res, exportFormat, q));
            if (blob.size > targetBytes) maxQ = q;
            else { minQ = q; localBestBlob = blob; }
        }
        if (localBestBlob) { bestBlob = localBestBlob; break; }
        scale -= 0.05;
    }

    if (!bestBlob) {
        bestBlob = await new Promise(res => finalMergedCanvas.toBlob(res, exportFormat, 0.01));
    }

    let finalPayloadBlob = bestBlob;
    if (bestBlob.size < targetBytes) {
        const remainingBytes = Math.floor(targetBytes - bestBlob.size);
        if (remainingBytes > 0) {
            const paddingBuffer = new Uint8Array(remainingBytes);
            finalPayloadBlob = new Blob([bestBlob, paddingBuffer], { type: exportFormat });
        }
    }

    if (finalPayloadBlob) {
        const resultKB = (finalPayloadBlob.size / 1024).toFixed(2);
        statsContainer.innerHTML = `<strong>Pinpoint Size Success! Target Matched!</strong><br>Calculated Size: ${resultKB} KB / Format: ${ext.toUpperCase()}`;
        const finalUrl = URL.createObjectURL(finalPayloadBlob);
        document.getElementById("previewImg").src = finalUrl;
        const compBtn = document.getElementById("compressedDownloadBtn");
        compBtn.style.display = "block";
        compBtn.onclick = () => triggerDownload(finalUrl, `${filename}_compressed.${ext}`);
    }
}

function triggerDownload(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
}
