const video = document.getElementById("video");
const countdownEl = document.getElementById("countdown");
const counterEl = document.getElementById("counter");
const startCaptureBtn = document.getElementById("start-capture-btn");
function stopCapture() {
    clearInterval(countdownInterval); // Stop countdown timer
    countdownSound.pause();  // Stop the sound
    countdownSound.currentTime = 0; // Reset sound position

    isCapturing = false;
    startCaptureBtn.disabled = false;
    stopCaptureBtn.disabled = true;
}

const shutterOverlay = document.createElement("div");
shutterOverlay.style.position = "absolute";
shutterOverlay.style.top = "0";
shutterOverlay.style.left = "0";
shutterOverlay.style.width = "100%";
shutterOverlay.style.height = "100%";
shutterOverlay.style.background = "white";
shutterOverlay.style.opacity = "0";
shutterOverlay.style.transition = "opacity 0.2s ease-out";
shutterOverlay.style.pointerEvents = "none";
document.body.appendChild(shutterOverlay);

const shutterSound = new Audio("shutter.mp3");
const countdownSound = new Audio("countdown.mp3");

const capturedPhotos = [];
let capturedCount = 0;
let countdownInterval;
let isCapturing = false; // Track if capturing is in progress
let timeLeft = 0; // Store remaining countdown time when stopped

// Adjust constraints for mobile
const isMobile = window.innerWidth <= 600;
const videoConstraints = {
    video: {
        facingMode: "user", // Use front camera on mobile
        width: isMobile ? { ideal: 480 } : { ideal: 664 },
        height: isMobile ? { ideal: 664 } : { ideal: 480 }
    }
};

// Fix for mobile Chrome black screen issue
video.setAttribute("playsinline", true);
video.setAttribute("autoplay", true);
video.setAttribute("muted", true);

// Start webcam
navigator.mediaDevices.getUserMedia(videoConstraints)
    .then(stream => {
        video.srcObject = stream;
        video.play();
    })
    .catch(err => console.error("Camera access denied", err));

// Start Capture Button Click Event
startCaptureBtn.addEventListener("click", () => {
    if (!isCapturing) {
        capturePhotoWithCountdown();
    } else {
        resumeCapture();
    }
    isCapturing = true;
    startCaptureBtn.disabled = true;
    stopCaptureBtn.disabled = false;
});

// Stop Capture Button Click Event
stopCaptureBtn.addEventListener("click", () => {
    stopCapture();
});

// Countdown and capture photo
function capturePhotoWithCountdown() {
    if (capturedCount >= 4) {
        redirectToDownload();
        return;
    }

    const countdownSelect = document.getElementById("countdown-select");
    timeLeft = parseInt(countdownSelect.value); // Get user-selected time

    countdownEl.textContent = timeLeft;
    counterEl.textContent = `${capturedCount}/4`;
    countdownSound.play();

    countdownInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            capturePhoto();
        } else {
            timeLeft--;
            countdownEl.textContent = timeLeft;
            countdownSound.play();

            if (timeLeft === 1) {
                triggerShutterAnimation();
            }
        }
    }, 1000);
}

// Stop the Capture Process (Pause)
function stopCapture() {
    clearInterval(countdownInterval); // Stop countdown
    isCapturing = false;
    startCaptureBtn.disabled = false;
    stopCaptureBtn.disabled = true;
}

// Resume Capture from where it stopped
function resumeCapture() {
    countdownEl.textContent = timeLeft;
    countdownInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            capturePhoto();
        } else {
            timeLeft--;
            countdownEl.textContent = timeLeft;
            countdownSound.play();

            if (timeLeft === 1) {
                triggerShutterAnimation();
            }
        }
    }, 1000);

    startCaptureBtn.disabled = true;
    stopCaptureBtn.disabled = false;
}

// Capture photo
function capturePhoto() {
    const canvas = document.createElement("canvas");
    canvas.width = isMobile ? 480 : 664;
    canvas.height = isMobile ? 664 : 480;
    const ctx = canvas.getContext("2d");

    // Flip canvas horizontally for front camera
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedPhotos.push(canvas.toDataURL("image/png"));
    capturedCount++;
    counterEl.textContent = `${capturedCount}/4`;

    // Stop capturing if we reach 4 photos
    if (capturedCount >= 4) {
        redirectToDownload();
    } else {
        // Continue to next photo
        capturePhotoWithCountdown();
    }
}

// Shutter animation
function triggerShutterAnimation() {
    shutterOverlay.style.opacity = "1";
    shutterSound.play();
    setTimeout(() => {
        shutterOverlay.style.opacity = "0";
    }, 100);
}

// Redirect to download page with captured images
function redirectToDownload() {
    sessionStorage.setItem("capturedPhotos", JSON.stringify(capturedPhotos));
    window.location.href = "download.html";
}
