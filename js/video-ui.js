/* ========================================================
   🎬 VIDEO COMPRESSOR CONTROLLER (Image Studio)
   ======================================================== */

// Global Video State
let currentVideoFile = null;
let currentVideoMeta = null;
let currentCompressionResult = null;
let activePreset = 'auto'; // 'auto' | 'ultra' | 'balanced' | 'high' | 'target-size' | 'custom'
let activeController = null;
let exportCounter = 1;

// Custom Settings State
let customConfig = {
    resolution: 'auto', // 'auto' | '1080p' | '720p' | '540p' | '480p' | '360p'
    bitrate: 350000,    // in bps
    fps: 'auto',        // 'auto' | 60 | 30 | 24
    audioBitrate: 64000 // in bps
};

let targetSizeMBValue = 10;

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
    initSuiteNavigation();
    initVideoDropzone();
    initHardwareCheck();
});

/* ----------------------------------------------------
   1. MASTER SUITE NAVIGATION (Image Studio vs Video)
   ---------------------------------------------------- */
function initSuiteNavigation() {
    const navImageBtn = document.getElementById("navImageBtn");
    const navVideoBtn = document.getElementById("navVideoBtn");

    if (navImageBtn && navVideoBtn) {
        navImageBtn.addEventListener("click", () => switchSuiteTab('image'));
        navVideoBtn.addEventListener("click", () => switchSuiteTab('video'));
    }
}

function switchSuiteTab(tab) {
    const sectionImages = document.getElementById("sectionImages");
    const sectionVideos = document.getElementById("sectionVideos");
    const navImageBtn = document.getElementById("navImageBtn");
    const navVideoBtn = document.getElementById("navVideoBtn");

    if (tab === 'image') {
        sectionImages.style.display = "block";
        sectionVideos.style.display = "none";
        navImageBtn.classList.add("active");
        navVideoBtn.classList.remove("active", "video-active");
    } else {
        sectionImages.style.display = "none";
        sectionVideos.style.display = "block";
        navImageBtn.classList.remove("active");
        navVideoBtn.classList.add("active", "video-active");
    }
}

/* ----------------------------------------------------
   2. HARDWARE ENCODING DETECTION
   ---------------------------------------------------- */
async function initHardwareCheck() {
    try {
        if (window.VideoCompressorEngine && window.VideoCompressorEngine.detectHardwareEncoding) {
            const hasHw = await window.VideoCompressorEngine.detectHardwareEncoding();
            const pill = document.getElementById("hwPillText");
            if (pill) {
                pill.textContent = hasHw ? "⚡ GPU Hardware VPU Active" : "🚀 WebCodecs Engine Active";
            }
        }
    } catch (e) {
        console.warn("Hardware detection note:", e);
    }
}

/* ----------------------------------------------------
   3. VIDEO DROPZONE & SELECTION
   ---------------------------------------------------- */
function initVideoDropzone() {
    const dropzone = document.getElementById("videoDropzone");
    const fileInput = document.getElementById("videoFileInput");

    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dragover');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer?.files;
        if (files && files.length > 0 && files[0].type.startsWith('video/')) {
            handleVideoSelected(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleVideoSelected(files[0]);
        }
    });
}

function triggerVideoInput() {
    const fileInput = document.getElementById("videoFileInput");
    if (fileInput) fileInput.click();
}

async function triggerDemoVideo() {
    const btn = document.getElementById("btnDemoTest");
    if (btn) btn.textContent = "⏳ Generating Sample...";

    try {
        if (window.VideoCompressorEngine && window.VideoCompressorEngine.createDemoVideo) {
            const demoFile = await window.VideoCompressorEngine.createDemoVideo();
            await handleVideoSelected(demoFile);
        }
    } catch (err) {
        alert("Unable to generate demo video: " + err.message);
    } finally {
        if (btn) btn.textContent = "🎬 Try Sample Demo Video";
    }
}

async function handleVideoSelected(file) {
    currentVideoFile = file;
    currentCompressionResult = null;
    exportCounter = 1;

    // Show loading state in dropzone
    const dropzone = document.getElementById("videoDropzone");
    const origHtml = dropzone.innerHTML;
    dropzone.innerHTML = `<div style="padding: 20px;"><div style="font-size:30px; animation:spin 1s infinite linear;">⚡</div><p style="margin-top:10px; color:#38bdf8; font-weight:700;">Inspecting video metadata with WebCodecs...</p></div>`;

    try {
        if (!window.VideoCompressorEngine) {
            throw new Error("Video compression engine is still loading. Please try again in a moment.");
        }

        const meta = await window.VideoCompressorEngine.analyzeVideo(file);
        currentVideoMeta = meta;

        // Populate video info card
        document.getElementById("videoThumbImg").src = meta.thumbnailUrl || '';
        document.getElementById("videoMetaTitle").textContent = meta.name;
        document.getElementById("videoChipSize").textContent = window.VideoCompressorEngine.formatBytes(meta.size);
        document.getElementById("videoChipDuration").textContent = window.VideoCompressorEngine.formatDuration(meta.duration);
        document.getElementById("videoChipRes").textContent = `${meta.width} × ${meta.height}`;
        document.getElementById("videoChipFps").textContent = `${meta.fps} FPS`;

        // Switch views: hide dropzone, show info card & config block
        dropzone.style.display = "none";
        dropzone.innerHTML = origHtml; // restore original dropzone HTML for reset
        initVideoDropzone(); // rebind events

        document.getElementById("videoInfoCard").style.display = "flex";
        document.getElementById("videoConfigBlock").style.display = "block";
        document.getElementById("videoResultCard").style.display = "none";

        // Setup target size slider bounds
        const maxMB = Math.max(5, Math.ceil(meta.size / (1024 * 1024)));
        const targetSlider = document.getElementById("targetSizeSlider");
        if (targetSlider) {
            targetSlider.max = Math.min(250, maxMB);
            targetSlider.value = Math.min(10, Math.max(2, Math.round(maxMB / 10)));
            syncTargetSliderUI();
        }

        // Apply default preset and update live estimation
        selectVideoPreset('auto');
    } catch (err) {
        alert("Failed to analyze video: " + err.message);
        dropzone.innerHTML = origHtml;
        initVideoDropzone();
    }
}

function resetVideoSelection() {
    currentVideoFile = null;
    currentVideoMeta = null;
    currentCompressionResult = null;
    document.getElementById("videoDropzone").style.display = "block";
    document.getElementById("videoInfoCard").style.display = "none";
    document.getElementById("videoConfigBlock").style.display = "none";
    document.getElementById("videoResultCard").style.display = "none";
    document.getElementById("videoFileInput").value = "";
}

/* ----------------------------------------------------
   4. PRESET SELECTION & CUSTOM CONTROLS
   ---------------------------------------------------- */
function selectVideoPreset(preset) {
    activePreset = preset;

    // Toggle active class on preset cards
    document.querySelectorAll(".preset-card").forEach(card => {
        card.classList.toggle("active", card.getAttribute("data-preset") === preset);
    });

    // Toggle custom panel vs target slider panel
    const customPanel = document.getElementById("customSettingsPanel");
    const targetPanel = document.getElementById("targetSizeCard");

    if (customPanel) customPanel.classList.toggle("open", preset === 'custom');
    if (targetPanel) targetPanel.style.display = (preset === 'target-size') ? 'block' : 'none';

    updateLiveEstimate();
}

function selectCustomChip(category, value, el) {
    // Unselect siblings
    const parent = el.parentElement;
    parent.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
    el.classList.add("active");

    if (category === 'res') customConfig.resolution = value;
    else if (category === 'fps') customConfig.fps = value === 'auto' ? 'auto' : parseInt(value);
    else if (category === 'audio') customConfig.audioBitrate = parseInt(value);

    updateLiveEstimate();
}

function syncCustomBitrate(val) {
    const num = parseInt(val) || 350;
    customConfig.bitrate = num * 1000;
    const slider = document.getElementById("customBitrateSlider");
    const numInput = document.getElementById("customBitrateNum");
    if (slider) slider.value = num;
    if (numInput) numInput.value = num;
    updateLiveEstimate();
}

function syncTargetSliderUI() {
    const slider = document.getElementById("targetSizeSlider");
    const display = document.getElementById("targetSizeDisplay");
    if (slider && display) {
        targetSizeMBValue = parseFloat(slider.value) || 10;
        display.textContent = `${targetSizeMBValue} MB`;
    }
    updateLiveEstimate();
}

/* ----------------------------------------------------
   5. REAL-TIME LIVE ESTIMATION CALCULATION
   ---------------------------------------------------- */
function getActiveSettings() {
    if (!currentVideoMeta) return null;

    if (activePreset === 'custom') {
        let maxDim = 1280;
        if (customConfig.resolution === '1080p') maxDim = 1920;
        else if (customConfig.resolution === '720p') maxDim = 1280;
        else if (customConfig.resolution === '540p') maxDim = 960;
        else if (customConfig.resolution === '480p') maxDim = 854;
        else if (customConfig.resolution === '360p') maxDim = 640;

        const { width, height } = window.VideoCompressorEngine.calculateScaledDimensions(
            currentVideoMeta.width,
            currentVideoMeta.height,
            maxDim
        );

        const targetFps = customConfig.fps === 'auto'
            ? Math.min(30, currentVideoMeta.fps || 30)
            : customConfig.fps;

        return {
            mode: 'custom',
            targetWidth: width,
            targetHeight: height,
            targetFps,
            targetVideoBitrate: customConfig.bitrate,
            targetAudioBitrate: customConfig.audioBitrate,
            hardwareAcceleration: 'prefer-hardware'
        };
    }

    if (activePreset === 'target-size') {
        return window.VideoCompressorEngine.getCompressionPreset(
            currentVideoMeta,
            'target-size',
            targetSizeMBValue
        );
    }

    // Auto, Ultra, Balanced, High presets
    return window.VideoCompressorEngine.getCompressionPreset(currentVideoMeta, activePreset);
}

function updateLiveEstimate() {
    if (!currentVideoMeta || !window.VideoCompressorEngine) return;

    const settings = getActiveSettings();
    if (!settings) return;

    const estimatedBytes = window.VideoCompressorEngine.estimateOutputSize(settings, currentVideoMeta.duration);
    const savingsBytes = Math.max(0, currentVideoMeta.size - estimatedBytes);
    const savingsPercent = Math.min(99, Math.max(0, ((savingsBytes / currentVideoMeta.size) * 100).toFixed(1)));

    const estSizeText = window.VideoCompressorEngine.formatBytes(estimatedBytes);
    document.getElementById("estOutputSize").textContent = `~${estSizeText}`;
    document.getElementById("estSavings").textContent = `-${savingsPercent}% Space`;
}

/* ----------------------------------------------------
   6. COMPRESSION EXECUTION & PROGRESS
   ---------------------------------------------------- */
async function startVideoCompression() {
    if (!currentVideoMeta || !window.VideoCompressorEngine) return;

    const settings = getActiveSettings();
    if (!settings) return;

    // Show progress modal
    const modal = document.getElementById("videoProgressModal");
    modal.style.display = "flex";

    activeController = new window.VideoCompressorEngine.CompressionController();

    const circleBar = document.getElementById("progressCircleBar");
    const percentLabel = document.getElementById("progressPercentLabel");
    const statSpeed = document.getElementById("progressSpeed");
    const statEta = document.getElementById("progressEta");
    const statStatus = document.getElementById("progressStatus");

    // Circumference of r=58 circle is ~364.4
    const circumference = 2 * Math.PI * 58;
    circleBar.style.strokeDasharray = `${circumference}`;
    circleBar.style.strokeDashoffset = `${circumference}`;

    const updateProgressUI = (p) => {
        const offset = circumference - (p.percent / 100) * circumference;
        circleBar.style.strokeDashoffset = `${offset}`;
        percentLabel.textContent = `${p.percent}%`;
        statSpeed.textContent = `${p.currentSpeed}x`;
        statEta.textContent = p.etaSeconds > 0 ? `~${p.etaSeconds}s` : 'Finishing...';

        if (p.percent < 15) {
            statStatus.textContent = "Initializing WebCodecs & Hardware VPU...";
        } else if (p.percent < 90) {
            statStatus.textContent = "Transcoding audio & video frames...";
        } else {
            statStatus.textContent = "Packaging MP4 container & headers...";
        }
    };

    try {
        const result = await window.VideoCompressorEngine.compressVideo(
            currentVideoMeta,
            settings,
            updateProgressUI,
            activeController
        );

        currentCompressionResult = result;
        modal.style.display = "none";
        showVideoResult(result);
    } catch (err) {
        modal.style.display = "none";
        if (err.message && err.message.includes('cancelled')) {
            // User cancelled
        } else {
            alert("Compression Error: " + err.message);
        }
    } finally {
        activeController = null;
    }
}

function cancelCurrentCompression() {
    if (activeController) {
        activeController.abort();
    }
    const modal = document.getElementById("videoProgressModal");
    if (modal) modal.style.display = "none";
}

/* ----------------------------------------------------
   7. RESULTS DISPLAY & EXPORT NAMING (<name>-1.mp4)
   ---------------------------------------------------- */
function showVideoResult(result) {
    const resultCard = document.getElementById("videoResultCard");
    const player = document.getElementById("videoResultPlayer");

    player.src = result.url;

    document.getElementById("resOrigSize").textContent = window.VideoCompressorEngine.formatBytes(currentVideoMeta.size);
    document.getElementById("resCompSize").textContent = window.VideoCompressorEngine.formatBytes(result.size);
    document.getElementById("resSavings").textContent = `-${result.savedPercent}%`;

    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function downloadCompressedVideo() {
    if (!currentCompressionResult || !currentVideoMeta) return;

    // Naming rule: <original_name>-1.mp4 (e.g. video00987-1.mp4)
    const originalName = currentVideoMeta.name || "video";
    const dotIdx = originalName.lastIndexOf('.');
    const baseName = dotIdx !== -1 ? originalName.substring(0, dotIdx) : originalName;
    const ext = currentCompressionResult.format || 'mp4';

    const outputFileName = `${baseName}-${exportCounter}.${ext}`;
    exportCounter++;

    const a = document.createElement('a');
    a.href = currentCompressionResult.url;
    a.download = outputFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
