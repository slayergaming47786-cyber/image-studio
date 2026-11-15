/* ========================================================
   🌟 UI CONTROLS, SIDE MENU, ACCORDIONS & SWATCH BUILDERS
   ======================================================== */
function toggleAccordion(id) {
    const box = document.getElementById(id);
    if (box) box.classList.toggle("open");
}

function buildBorderSwatches(containerId) {
    const container = document.getElementById(containerId); 
    if (!container) return;
    container.innerHTML = "";
    studioColors.forEach(color => {
        const circle = document.createElement("div"); 
        circle.className = "swatch-circle"; 
        circle.style.backgroundColor = color;
        if (color === "#ffffff") circle.classList.add("active");
        circle.onclick = () => {
            container.querySelectorAll(".swatch-circle").forEach(c => c.classList.remove("active"));
            circle.classList.add("active"); 
            selectedBorderColor = color; 
            if (finalMergedCanvas) mergeAndPreview();
        };
        container.appendChild(circle);
    });
}

function buildModalColorSwatches() {
    const container = document.getElementById("modalColorSwatches"); 
    if (!container) return;
    container.innerHTML = "";
    studioColors.forEach(color => {
        const circle = document.createElement("div"); 
        circle.className = "swatch-circle"; 
        circle.style.backgroundColor = color;
        circle.onpointerdown = () => {
            const wmTextInput = document.getElementById("modalWmText");
            if (wmTextInput) wmTextInput.blur(); // Dismiss keyboard on mobile
        };
        circle.onclick = () => {
            container.querySelectorAll(".swatch-circle").forEach(c => c.classList.remove("active"));
            circle.classList.add("active"); 
            tempModalSelectedColor = color; 
            updateModalLivePreviewUI();
        };
        container.appendChild(circle);
    });
}

function hexToRgbStyleString(hex) {
    if (hex === "#ffffff") return "rgb(255, 255, 255)"; 
    if (hex === "#000000") return "rgb(0, 0, 0)";
    let c = parseInt(hex.substring(1), 16); 
    return `rgb(${(c >> 16) & 255}, ${(c >> 8) & 255}, ${c & 255})`;
}

function switchAppMode(mode) {
    appMode = mode;
    document.getElementById("modeMerger").classList.toggle("active", mode === 'merger');
    document.getElementById("modeSingle").classList.toggle("active", mode === 'single');
    document.getElementById("swapBtn").style.display = (mode === 'merger') ? 'block' : 'none';
    document.getElementById("imgBox2").style.display = (mode === 'merger') ? 'block' : 'none';
    document.getElementById("mergeLayoutGroup").style.display = (mode === 'merger') ? 'block' : 'none';
    
    const compileBtn = document.getElementById("compileBtn");
    if (compileBtn) {
        compileBtn.textContent = (mode === 'merger') ? "Compile & Merge Images" : "Render & Preview Photo";
    }

    if (images[1]) initWorkspace(1); else document.getElementById("wrapper1").style.display = "none";
    if (mode === 'merger' && images[2]) initWorkspace(2); else document.getElementById("wrapper2").style.display = "none";
    document.getElementById("previewBlock").style.display = "none";
}

function toggleSideMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById("sideMenu"); 
    if (menu) menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

window.addEventListener("click", e => {
    const menu = document.getElementById("sideMenu"); 
    const btn = document.querySelector(".menu-btn");
    if (menu && menu.style.display === "block" && !menu.contains(e.target) && e.target !== btn) {
        menu.style.display = "none";
    }
});

function syncThicknessValues(source) {
    const slider = document.getElementById("borderThicknessSlider"); 
    const num = document.getElementById("borderThicknessNum");
    if (source === 'slider') num.value = parseFloat(slider.value).toFixed(1);
    else { 
        let val = parseFloat(num.value); 
        if (isNaN(val) || val < 0) val = 0; 
        if (val > 50) val = 50; 
        slider.value = val; 
    }
    if (finalMergedCanvas) mergeAndPreview();
}

function updateDefaultFormatChoice() {
    userPreferences.savedFormat = document.getElementById("defaultFormat").value;
    try {
        localStorage.setItem("image_studio_saved_format", userPreferences.savedFormat);
    } catch(e) {}
}
