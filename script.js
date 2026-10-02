// DOM Elements
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileInfo = document.getElementById('fileInfo');
const primaryColor = document.getElementById('primaryColor');
const secondaryColor = document.getElementById('secondaryColor');
const gradientToggle = document.getElementById('gradientToggle');
const secondaryColorPicker = document.getElementById('secondaryColorPicker');
const downloadBtn = document.getElementById('downloadBtn');
const previewCanvas = document.getElementById('previewCanvas');
const currentYear = document.getElementById('currentYear');
const fileSize = document.getElementById('fileSize');

// Set current year in footer
currentYear.textContent = new Date().getFullYear();

// Canvas context
const ctx = previewCanvas.getContext('2d');

// State
let uploadedLogo = null;

// Event Listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--ght-palette-hudu-primary)';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});

gradientToggle.addEventListener('change', (e) => {
    secondaryColorPicker.style.display = e.target.checked ? 'flex' : 'none';
    generateWallpaper();
});

[primaryColor, secondaryColor].forEach(input => {
    input.addEventListener('input', generateWallpaper);
});

// Add event listener for download button
downloadBtn.addEventListener('click', downloadWallpaper);

// File handling
function handleFile(file) {
    if (!file) return;

    if (!['image/png', 'image/svg+xml'].includes(file.type)) {
        fileInfo.textContent = 'Please upload a PNG or SVG file.';
        fileInfo.className = 'file-info file-info-alert';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Check if image has transparency
            if (file.type === 'image/png') {
                checkTransparency(img);
            }
            uploadedLogo = img;
            generateWallpaper();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    fileInfo.textContent = `File selected: ${file.name}`;
    fileInfo.className = 'file-info';
}

// Check for transparency in PNG
function checkTransparency(img) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    let hasTransparency = false;
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
            hasTransparency = true;
            break;
        }
    }
    
    if (!hasTransparency) {
        fileInfo.textContent = 'Heads up: this image does not have a transparent background.';
        fileInfo.className = 'file-info file-info-alert';
    }
}

// Generate wallpaper
function generateWallpaper() {
    if (!uploadedLogo) return;

    // Show canvas
    previewCanvas.style.display = 'block';

    // Clear canvas
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Draw background
    if (gradientToggle.checked) {
        const gradient = ctx.createRadialGradient(
            previewCanvas.width / 2,
            previewCanvas.height / 2,
            0,
            previewCanvas.width / 2,
            previewCanvas.height / 2,
            previewCanvas.width / 2
        );
        gradient.addColorStop(0, primaryColor.value);
        gradient.addColorStop(1, secondaryColor.value);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = primaryColor.value;
    }
    ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

    // Calculate logo size (max 50% of canvas width/height)
    const maxWidth = previewCanvas.width * 0.5;
    const maxHeight = previewCanvas.height * 0.5;
    const scale = Math.min(
        maxWidth / uploadedLogo.width,
        maxHeight / uploadedLogo.height
    );
    const logoWidth = uploadedLogo.width * scale;
    const logoHeight = uploadedLogo.height * scale;

    // Draw logo in center
    ctx.drawImage(
        uploadedLogo,
        (previewCanvas.width - logoWidth) / 2,
        (previewCanvas.height - logoHeight) / 2,
        logoWidth,
        logoHeight
    );

    // Show download button and update file size
    downloadBtn.style.display = 'block';
    updateFileSize();
}

// Update file size
function updateFileSize() {
    previewCanvas.toBlob((blob) => {
        const size = blob.size;
        const sizeInMB = (size / (1024 * 1024)).toFixed(1);
        fileSize.textContent = ` (${sizeInMB} MB)`;
    }, 'image/jpeg', 0.9);
}

// Download wallpaper
function downloadWallpaper() {
    const link = document.createElement('a');
    link.download = 'wallpaper.jpg';
    link.href = previewCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
} 