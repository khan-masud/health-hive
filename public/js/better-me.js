let isExercising = false; 
let breathingInterval = null; 
let stageIndex = 0; 
const music = document.getElementById('background-music');
const exerciseButton = document.getElementById('exercise-button');
const breathingCircle = document.querySelector('.breathing-circle');
const statusText = document.querySelector('.status-text');

// Initialize music volume
music.volume = 0.3;

function toggleExercise() {
    if (!isExercising) {
        // Start Exercise
        isExercising = true;
        startBreathingAnimation();
        music.play().catch(error => {
            console.error("Music playback failed:", error);
        });
        exerciseButton.innerText = "বন্ধ করুন";

        // Breathing Stages
        const stages = ['Inhale', 'Hold', 'Exhale'];
        
        // Start Breathing Guidance
        breathingInterval = setInterval(() => {
            statusText.innerText = `${stages[stageIndex]}...`; // Update the text
            speakInstruction(statusText.innerText); // Speak the current stage
            stageIndex = (stageIndex + 1) % stages.length; // Move to the next stage
        }, 4000); // Change stage every 4 seconds
    } else {
        // Stop Exercise
        isExercising = false;
        stopBreathingAnimation();
        
        // Reset circle animation
        breathingCircle.style.transform = 'scale(1)';
        breathingCircle.style.transition = 'transform 1s ease-in-out';
        breathingCircle.style.boxShadow = '0 0 40px rgba(100, 200, 255, 0.6), 0 0 80px rgba(100, 200, 255, 0.4)';
        
        music.pause();
        exerciseButton.innerText = "শুরু করুন";

        // Stop Breathing Guidance
        clearInterval(breathingInterval);
        breathingInterval = null;
        stageIndex = 0; // Reset the stage index

        // Stop Speech Synthesis
        speechSynthesis.cancel();
    }
}

// Toggle Pause/Resume Music
function toggleMusic() {
    if (music.paused) {
        music.play().catch(error => {
            console.error("Music playback failed:", error);
        });
    } else {
        music.pause();
    }
}

// Start Breathing Animation
function startBreathingAnimation() {
    breathingCircle.classList.add('breathing-animation');
}

// Stop Breathing Animation
function stopBreathingAnimation() {
    breathingCircle.classList.remove('breathing-animation');
}

// Volume Controls
function volumeUp() {
    if (music.volume < 1) {
        music.volume = Math.min(music.volume + 0.1, 1); // Limit to 1 (100%)
        console.log("Volume increased to:", music.volume);
    }
}

function volumeDown() {
    if (music.volume > 0) {
        music.volume = Math.max(music.volume - 0.1, 0); // Limit to 0 (0%)
        console.log("Volume decreased to:", music.volume);
    }
}

// // Text-to-Speech for Breathing Instructions (Consolidated)
// function speakInstruction(text) {
//     const toggleButton = document.getElementById('voice-toggle');
//     const selectedVoice = toggleButton.dataset.voice; // Get current voice from data attribute

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 1;

//     // Select voice
//     const voices = window.speechSynthesis.getVoices();
//     utterance.voice = voices.find(voice =>
//         selectedVoice === 'male' ? voice.name.includes('male') : voice.name.includes('female')
//     ) || voices[0];

//     speechSynthesis.speak(utterance);
// }

function speakInstruction(text) {
    const toggleButton = document.getElementById('voice-toggle');
    const selectedVoice = toggleButton.dataset.voice; // Get current voice from data attribute

    // Cancel any ongoing speech before starting a new one
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;

    // Select voice
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(voice =>
        selectedVoice === 'male' ? voice.name.includes('male') : voice.name.includes('female')
    ) || voices[0]; // Fallback to the first available voice

    // Add error handling
    utterance.onerror = function(event) {
        console.error("Speech synthesis error:", event.error);
    };

    speechSynthesis.speak(utterance);
}

let voices = [];

function loadVoices() {
    voices = window.speechSynthesis.getVoices();
}

window.speechSynthesis.onvoiceschanged = loadVoices;

// Call loadVoices on page load
window.onload = () => {
    configureExerciseFromMood(); // Load mood-specific configuration
    loadProgress(); // Ensure progress is initialized
    renderProgressChart();
    loadVoices(); // Load voices on page load
};

// Change Voice (Male/Female Toggle)
function toggleVoice() {
    const toggleButton = document.getElementById('voice-toggle');
    const currentVoice = toggleButton.dataset.voice;

    // Toggle the voice
    const newVoice = currentVoice === 'male' ? 'female' : 'male';
    toggleButton.dataset.voice = newVoice;

    // Update button text to the selected voice
    toggleButton.textContent = newVoice === 'male' ? 'পুরুষ কন্ঠ' : 'মহিলা কন্ঠ';
}

// Start Custom Session with Duration and Speed
function startCustomSession() {
    const durationInput = document.getElementById('duration').value;
    const speedInput = document.getElementById('speed').value;

    const duration = parseInt(durationInput, 10) * 60 * 1000; // Convert minutes to milliseconds
    const speed = parseFloat(speedInput) * 1000; // Convert seconds to milliseconds

    if (!isExercising) {
        // Start Exercise
        isExercising = true;
        startBreathingAnimation();
        music.play().catch(error => {
            console.error("Music playback failed:", error);
        });
        exerciseButton.innerText = "বন্ধ করুন";

        breathingCircle.style.animationDuration = `${speed / 1000}s`;

        const stages = ['Inhale', 'Hold', 'Exhale'];
        let stageIndex = 0;

        // Start Breathing Guidance
        breathingInterval = setInterval(() => {
            statusText.innerText = `${stages[stageIndex]}...`; // Update the text
            speakInstruction(statusText.innerText); // Speak the current stage
            stageIndex = (stageIndex + 1) % stages.length; // Move to the next stage
        }, speed); 
    }

    // Stop after the duration
    setTimeout(() => {
        clearInterval(breathingInterval);
        statusText.innerText = "অভিনন্দন! আপনি সেশনটি শেষ করেছেন!";
    }, duration);
}

function saveProgress() {
    const completedSessions = localStorage.getItem('sessions') || 0;
    localStorage.setItem('sessions', parseInt(completedSessions) + 1);

    // Show achievement if milestones reached
    if (parseInt(completedSessions) + 1 === 5) {
        alert("অভিনন্দন! আপনি ্সর্বমোট ৫টি সেশন শেষ করেছেন!");
    }
}

// Start Custom Breathing Pattern
function startCustomPattern() {
    const inhaleTime = parseInt(document.getElementById('inhale-time').value, 10) * 1000;
    const holdTime = parseInt(document.getElementById('hold-time').value, 10) * 1000;
    const exhaleTime = parseInt(document.getElementById('exhale-time').value, 10) * 1000;

    const stages = [
        { text: "Inhale", duration: inhaleTime },
        { text: "Hold", duration: holdTime },
        { text: "Exhale", duration: exhaleTime },
    ];

    let currentStage = 0;

    if (!isExercising) {
        // Start Exercise
        isExercising = true;
        startBreathingAnimation();
        music.play().catch(error => {
            console.error("Music playback failed:", error);
        });
        exerciseButton.innerText = "বন্ধ করুন";

        breathingCircle.style.animationDuration = `${inhaleTime / 1000}s`;

        function updateStage() {
            if (!isExercising) return; // Stop execution if exercise is stopped

            const stage = stages[currentStage];
            statusText.innerText = stage.text;
            speakInstruction(stage.text);
            breathingCircle.style.animationDuration = `${stage.duration / 1000}s`;

            setTimeout(() => {
                currentStage = (currentStage + 1) % stages.length;
                updateStage(); // Proceed to the next stage
            }, stage.duration);
        }

        updateStage();
    }
}

let chartInstance = null;

function renderProgressChart() {
    const completedSessions = parseInt(localStorage.getItem('sessions')) || 0;
    const remainingSessions = Math.max(0, 10 - completedSessions);

    const ctx = document.getElementById('progress-chart').getContext('2d');

    // Destroy existing chart if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['শেষ', 'বাকি'],
            datasets: [{
                data: [completedSessions, remainingSessions],
                backgroundColor: ['#36a2eb', '#ffce56'], // Blue and Yellow colors
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    enabled: true,
                }
            }
        }
    });
}

// Load breathing mode configuration based on the mood
function configureExerciseFromMood() {
    const urlParams = new URLSearchParams(window.location.search);
    const mood = urlParams.get('mood');

    const modes = {
        anxiety: { inhale: 4, hold: 4, exhale: 8, duration: 6 },
        anger: { inhale: 5, hold: 3, exhale: 7, duration: 7 },
        irritation: { inhale: 4, hold: 2, exhale: 6, duration: 5 },
        sad: { inhale: 3, hold: 3, exhale: 5, duration: 5 },
        fear: { inhale: 4, hold: 6, exhale: 8, duration: 6 },
        sleep: { inhale: 4, hold: 7, exhale: 8, duration: 10 },
    };
    

    if (mood && modes[mood]) {
        const mode = modes[mood];

        // Update default values based on the selected mood
        document.getElementById('inhale-time').value = mode.inhale;
        document.getElementById('hold-time').value = mode.hold;
        document.getElementById('exhale-time').value = mode.exhale;
        document.getElementById('duration').value = mode.duration;

        statusText.innerText = `আপনার মুডঃ ${mood.toUpperCase()}. এক্সারসাইজ শুরু করতে 'প্যাটার্ন শুরু করুন' বাটনে ক্লিক করুন! সব থেকে ভালো ফলাফল পেতে হেডফোন বা ইয়ারফোন ব্যবহার করুন।`;
    } else if (mood) {
        statusText.innerText = `দুঃখিত! আপনি ভুল মুড দিয়েছেন।`;
    }
}

// Combined function to apply all settings at once
function applyAllSettings() {
    const inhaleTime = parseInt(document.getElementById('inhale-time').value, 10) * 1000;
    const holdTime = parseInt(document.getElementById('hold-time').value, 10) * 1000;
    const exhaleTime = parseInt(document.getElementById('exhale-time').value, 10) * 1000;
    const duration = parseInt(document.getElementById('duration').value, 10) * 60 * 1000;

    const stages = [
        { text: "Inhale", duration: inhaleTime, scale: 1.5 },
        { text: "Hold", duration: holdTime, scale: 1.5 },
        { text: "Exhale", duration: exhaleTime, scale: 1 },
    ];

    let currentStage = 0;
    let sessionTimeout;
    let stageTimeout;

    if (!isExercising) {
        // Start Exercise
        isExercising = true;
        breathingCircle.classList.remove('breathing-animation'); // Remove default animation
        music.play().catch(error => {
            console.error("Music playback failed:", error);
        });
        exerciseButton.innerText = "বন্ধ করুন";

        function updateStage() {
            if (!isExercising) {
                clearTimeout(sessionTimeout);
                clearTimeout(stageTimeout);
                breathingCircle.style.transform = 'scale(1)';
                breathingCircle.style.transition = 'none';
                return;
            }

            const stage = stages[currentStage];
            statusText.innerText = stage.text;
            speakInstruction(stage.text);

            // Animate the breathing circle
            breathingCircle.style.transition = `transform ${stage.duration}ms ease-in-out, box-shadow ${stage.duration}ms ease-in-out`;
            breathingCircle.style.transform = `scale(${stage.scale})`;
            
            if (stage.scale > 1) {
                breathingCircle.style.boxShadow = '0 0 60px rgba(100, 200, 255, 0.9), 0 0 120px rgba(100, 200, 255, 0.6)';
            } else {
                breathingCircle.style.boxShadow = '0 0 40px rgba(100, 200, 255, 0.6), 0 0 80px rgba(100, 200, 255, 0.4)';
            }

            stageTimeout = setTimeout(() => {
                currentStage = (currentStage + 1) % stages.length;
                updateStage();
            }, stage.duration);
        }

        updateStage();

        // Stop after the duration
        sessionTimeout = setTimeout(() => {
            isExercising = false;
            clearTimeout(stageTimeout);
            breathingCircle.style.transform = 'scale(1)';
            breathingCircle.style.transition = 'transform 1s ease-in-out';
            breathingCircle.style.boxShadow = '0 0 40px rgba(100, 200, 255, 0.6), 0 0 80px rgba(100, 200, 255, 0.4)';
            music.pause();
            exerciseButton.innerText = "শুরু করুন";
            statusText.innerText = "অভিনন্দন! আপনি সেশনটি শেষ করেছেন!";
            speechSynthesis.cancel();
            saveProgress();
            renderProgressChart();
        }, duration);
    }
}

// Call configureExerciseFromMood on page load
window.onload = () => {
    configureExerciseFromMood(); // Load mood-specific configuration
    loadProgress(); // Ensure progress is initialized
    renderProgressChart();
};

function loadProgress() {
    // Call renderProgressChart to initialize progress
    renderProgressChart();
}