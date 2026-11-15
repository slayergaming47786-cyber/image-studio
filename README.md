# 🌟 Image Studio

<div align="center">

![Image Studio Banner](https://img.shields.io/badge/Image_Studio-Media_Suite-10b981?style=for-the-badge&logo=html5&logoColor=white)
<br/>

[![Platform](https://img.shields.io/badge/Platform-100%25%20Static%20HTML%2FCSS%2FJS-38bdf8?style=flat-square)](https://github.com/slayergaming47786-cyber/image-studio)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device%20%7C%20Offline-10b981?style=flat-square)](#-100-privacy--offline-processing)
[![Zero Build](https://img.shields.io/badge/Zero_Build-No_Node_Required-a855f7?style=flat-square)](#-how-to-host--deploy)

**High-performance, 100% on-device image merger, watermark editor, and hardware-accelerated video compressor.**  
Works completely offline in your browser with **zero server uploads**, zero data tracking, and zero build setup.

</div>

---

## ⚡ Key Highlights

- **Pure HTML, CSS & Modern JS**: No Node.js, no bundlers, and no compile step required. Simply download and open `index.html` or upload to any static host!
- **🎬 Hardware-Accelerated Video Compressor**: Uses browser **WebCodecs & MediaCodec/VPU** hardware acceleration to shrink multi-hundred megabyte videos down to ~5–12 MB in seconds.
- **🖼️ Pro Studio Image Tools**:
  - **Studio Merger**: Combine two photos side-by-side or stacked with custom border colors, swatches, and pixel-precise thickness sliders.
  - **Single Photo Crop**: Aspect ratio presets (`1:1`, `4:3`, `16:9`, `Passport 3:4`, `Freeform`) with 8-point interactive handles.
  - **Interactive Watermark**: Freely drag, resize, change fonts, and customize text background ribbons on your photos.
  - **Pinpoint KB/MB Image Compressor**: Specify exact target size (e.g. 500 KB or 2 MB) for government portals, passports, or email attachments.
- **🎬 Smart Video Compression Presets**:
  - `Smart Auto`: Crisp 720p HD with ~90% space reduction.
  - `Ultra Saver`: Super compact 480p cinema rate (~180 kbps) for weak cellular networks.
  - `Balanced`: 720p HD @ 30 FPS (~450 kbps) for presentations and social stories.
  - `High Quality`: 1080p FHD @ 30 FPS (~1.0 Mbps) for crisp archival.
  - `Target Size`: Drag the megabyte slider to strictly cap output size.
  - `Custom Settings`: Full manual control over Resolution chips, Bitrate slider (100–4000 kbps), Framerate, and Audio bitrates.
- **Dynamic File Naming**: Exported files automatically preserve original names with unique numeric suffixes (e.g. `video00987-1.mp4`).

---

## 🚀 How to Host & Deploy

Since Image Studio is built with **pure static HTML, CSS, and JS**, hosting takes less than 30 seconds:

### Option 1: GitHub Pages (1-Click)
1. Fork or push this repository to your GitHub account.
2. In the repository settings, go to **Settings** ➔ **Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose Branch: `main`, Folder: `/(root)`, and click **Save**.
5. Your site is live instantly!

### Option 2: Download ZIP & Host Anywhere
1. Click **Code** ➔ **Download ZIP** on GitHub.
2. Extract the files on your computer.
3. Upload the extracted folder directly to:
   - **Cloudflare Pages** (Direct Upload)
   - **Netlify Drop** (Drag & Drop)
   - **cPanel / Apache / Nginx** (`public_html/`)
   - **Hostinger / GoDaddy / Firebase Hosting**

### Option 3: Local Offline Usage
Double-click `index.html` to open it in Chrome, Brave, Edge, or Firefox. No web server required!

---

## 📁 Repository Structure

```
image-studio/
├── index.html                   # Unified studio interface
├── background.png               # Glassmorphism dark background
├── css/
│   ├── base.css                 # Glassmorphism theme, typography, containers
│   ├── controls.css             # Buttons, swatches, inputs, side menu
│   ├── workspace.css            # Canvas layers, crop grid, drag handles
│   ├── modals-preview.css       # Watermark modal, format selection modal
│   └── video.css                # Video compressor controls, cards, progress modal
├── js/
│   ├── state.js                 # Global image state & canvas context
│   ├── ui-controls.js           # Mode switching, swatches, thickness sliders
│   ├── workspace-crop.js        # Canvas drawing & interactive crop engine
│   ├── watermark.js             # Draggable watermark overlay renderer
│   ├── merger-compressor.js     # Image merge pipeline & binary search compressor
│   ├── video-engine.bundle.js   # Standalone WebCodecs & Mediabunny compression engine
│   └── video-ui.js              # Video UI controller, presets, and download handler
├── LICENSE                      # MIT License
└── README.md                    # Project documentation
```

---

## 🔒 100% Privacy & Offline Processing

Image Studio is designed with an uncompromising commitment to privacy:
- **0% Server Upload**: All compression and editing algorithms run strictly inside your browser's local memory and GPU.
- **Works Without Internet**: Once loaded, you can turn off Wi-Fi or enable Airplane Mode, and every feature continues to work seamlessly.
- **Zero Tracking**: No Google Analytics, no tracking pixels, and no telemetry scripts.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use, modify, and distribute for personal or commercial projects.
