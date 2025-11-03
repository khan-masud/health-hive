const uploadForm = document.getElementById("uploadForm");
const resultDiv = document.getElementById("result");
const imageInput = document.getElementById("image");
const dropzone = document.getElementById("dropzone");
const camera = document.getElementById("camera");
const cameraPopup = document.getElementById("cameraPopup");
const captureButton = document.getElementById("captureButton");
const overlay = document.getElementById("overlay");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const preview = document.getElementById("imagePreview");

// Handle file drop event
dropzone.addEventListener("click", openFileSelector);
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.style.borderColor = "#28a745";
});
dropzone.addEventListener("dragleave", () => {
  dropzone.style.borderColor = "#007bff";
});
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  imageInput.files = e.dataTransfer.files;
  updatePreview(file); // Show preview
});

// Open file selector for image
function openFileSelector() {
  imageInput.click();
}

// When an image is selected via the file input
imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    updatePreview(file); // Show preview
  }
});

// Open camera for image capture
function openCamera() {
  overlay.style.display = "block";
  cameraPopup.style.display = "block";

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  const videoConstraints = isMobile
    ? { video: { facingMode: "environment" } }
    : { video: { facingMode: "user" } };

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia(videoConstraints)
      .then((stream) => {
        camera.srcObject = stream;
      })
      .catch((error) => {
        console.error("Error accessing the camera:", error);
        alert("Unable to access the camera. Please check your camera permissions.");
      });
  } else {
    alert("Camera not supported on this device.");
  }
}

// Capture image from camera
captureButton.addEventListener("click", () => {
  context.drawImage(camera, 0, 0, canvas.width, canvas.height);
  const imageDataUrl = canvas.toDataURL("image/jpeg");
  const imageBlob = dataURLtoBlob(imageDataUrl);
  const file = new File([imageBlob], "skin.jpg", { type: "image/jpeg" });
  imageInput.files = createFileList(file);
  updatePreview(file); // Show preview
  closeCameraPopup();
});

// Close camera popup and overlay
function closeCameraPopup() {
  overlay.style.display = "none";
  cameraPopup.style.display = "none";
  camera.srcObject.getTracks().forEach((track) => track.stop());
}

// Convert data URL to Blob
function dataURLtoBlob(dataURL) {
  const [metadata, base64] = dataURL.split(",");
  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uintArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uintArray[i] = byteString.charCodeAt(i);
  }
  return new Blob([uintArray], { type: "image/jpeg" });
}

// Create a FileList from a single file
function createFileList(file) {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  return dataTransfer.files;
}

// Update preview with the selected image
function updatePreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result; // Display the image preview
    preview.style.display = "block"; // Make sure the preview is visible
  };
  reader.readAsDataURL(file);
}

// Handle form submission
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  const imageFile = imageInput.files[0];
  const promptText = document.getElementById("promptText").value;

  if (!imageFile) {
    resultDiv.innerHTML = `<p style="color: red;">দয়া করে একটি ইমেজ দিন...</p>`;
    return;
  }

  formData.append("image", imageFile);
  formData.append("prompt", promptText);

  resultDiv.innerHTML = `
  <center>
    <div class="loading-animation"></div>
    <p>অ্যানালাইসিস করা হচ্ছে! অনুগ্রহ করে অপেক্ষা করুন...</p>
  </center>`;

  try {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.IMAGE_TO_DISEASE), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      resultDiv.innerHTML = `<p style="color: red;">Error: ${errorData.error || "Unknown error occurred."}</p>`;
      return;
    }

    const responseData = await response.json();

    if (responseData.analysisResult) {
      resultDiv.innerHTML = `<p>${responseData.analysisResult}</p>`;
    } else {
      resultDiv.innerHTML = `<p style="color: red;">Error: Response is missing the analysis result.</p>`;
    }
  } catch (error) {
    resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
});

overlay.addEventListener("click", closeCameraPopup);
