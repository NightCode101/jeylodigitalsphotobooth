const finalCanvas = document.getElementById("finalCanvas");
const ctx = finalCanvas.getContext("2d");
const downloadBtn = document.getElementById("download-btn");
const colorButtons = document.querySelectorAll(".color-btn");

let selectedFrameColor = "img/design_color/gobi_beige.png"; // Default frame

let capturedPhotos = JSON.parse(sessionStorage.getItem("capturedPhotos")) || [];

if (capturedPhotos.length === 0) {
    console.error("No photos found in sessionStorage.");
}

// Canvas dimensions
const canvasWidth = 1200;
const imageHeight = 800;
const spacing = 50;
const framePadding = 50;
const logoSpace = 500;

finalCanvas.width = canvasWidth;
finalCanvas.height = framePadding + (imageHeight + spacing) * capturedPhotos.length + logoSpace;

// Function to draw the collage
function drawCollage() {
    const background = new Image();
    background.src = selectedFrameColor;

    background.onload = () => {
        ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(background, 0, 0, finalCanvas.width, finalCanvas.height);

        capturedPhotos.forEach((photo, index) => {
            const img = new Image();
            img.src = photo;

            img.onload = () => {
                const x = framePadding;
                const y = framePadding + index * (imageHeight + spacing);
                ctx.drawImage(img, x, y, canvasWidth - 2 * framePadding, imageHeight);
            };

            img.onerror = () => console.error(`Failed to load image ${index + 1}`);
        });

        // Draw the logo immediately after the background
        drawLogo();
    };

    background.onerror = () => console.error("Failed to load background image.");
}

const logoMappings = {
    "img/design_color/black.jpg": "img/logo1.png",
};

// Function to draw the logo
function drawLogo() {
    const logo = new Image();
    
    // Check if selected frame has a specific logo
    const customLogo = logoMappings[selectedFrameColor] || "img/logo.png";  
    logo.src = customLogo;

    logo.onload = () => {
        const logoWidth = 500;
        const logoHeight = 150;
        const logoX = (canvasWidth - logoWidth) / 2;
        const logoY = finalCanvas.height - logoSpace + 150;
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
    };

    logo.onerror = () => console.error("Failed to load logo image.");
}
// Change frame color and redraw instantly
colorButtons.forEach(button => {
    button.addEventListener("click", (event) => {
        selectedFrameColor = event.target.getAttribute("data-color");
        drawCollage(); // This will also call drawLogo()
    });
});

// Download the final image
downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = finalCanvas.toDataURL("image/png");
    link.download = "jeylodigitals-photobooth.png";
    link.click();
});

// Initial drawing
drawCollage();
