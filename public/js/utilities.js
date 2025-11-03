// Update copyright year dynamically
function copyrightYear() {
  const currentYear = new Date().getFullYear();
  const copyrightElements = document.querySelectorAll('.copyright-year');
  copyrightElements.forEach(element => {
    element.textContent = currentYear;
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', copyrightYear);

function navDropDown() {
  // Select all dropdown elements
  const dropdowns = document.querySelectorAll('.dropdown-content');
  
  // Toggle the "show" class for each dropdown element
  dropdowns.forEach(dropdown => {
      dropdown.classList.toggle("show");
  });

   // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
}

function toggleMobileMenu() {
  const menu = document.querySelector(".mobile-menu");
  if (menu.style.display === "flex") {
      menu.style.display = "none";
  } else {
      menu.style.display = "flex";
  }
}


// Initialize the disease slider
let diseaseSlider = null;

// Global function for slider navigation (called from HTML buttons)
function moveSlide(direction) {
  if (diseaseSlider) {
    if (direction > 0) {
      diseaseSlider.next();
    } else {
      diseaseSlider.previous();
    }
  }
}

// Initialize slider when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  diseaseSlider = createSlider({
    containerSelector: '.slider-container',
    sliderSelector: '.slider',
    slideSelector: '.slide',
    autoplaySpeed: 3000,
  });
});

function createSlider({ containerSelector, sliderSelector, slideSelector, autoplaySpeed = 3000 }) {
  let currentSlide = 0;
  let autoplayInterval;

  const container = document.querySelector(containerSelector);
  const slider = document.querySelector(sliderSelector);
  const slides = document.querySelectorAll(slideSelector);

  if (!container || !slider || slides.length === 0) {
    console.error('Invalid selectors or no slides found!');
    return;
  }

  function updateSlides() {
    slides.forEach((slide, index) => {
      slide.classList.remove('active');
      slide.style.opacity = '0.5';
      slide.style.transform = 'scale(0.8)';

      if (index === currentSlide) {
        slide.classList.add('active');
        slide.style.opacity = '1';
        slide.style.transform = 'scale(1)';
      }
    });

    const slideWidth = window.innerWidth <= 768 ? 100 : 80; // Adjust for mobile and desktop
    const offset = -currentSlide * (slideWidth + (window.innerWidth <= 768 ? 0 : 5)); // Add margin on desktop
    slider.style.transform = `translateX(${offset}%)`;
  }

  function moveSlide(direction) {
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    updateSlides();
  }

  function startAutoplay() {
    autoplayInterval = setInterval(() => moveSlide(1), autoplaySpeed);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // Event Listeners
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);
  window.addEventListener('resize', updateSlides);

  // Initialize Slider
  updateSlides();
  startAutoplay();

  // Expose controls
  return {
    next: () => moveSlide(1),
    previous: () => moveSlide(-1),
    stop: stopAutoplay,
    start: startAutoplay,
    update: updateSlides,
  };
}


// Show long tips in homepage
let longTips = [];
let tipsDiv = document.getElementById('tips-id');

async function loadTips() {
    const longTipsResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LONG_TIPS));
    longTips = await longTipsResponse.json();
    
    showLongTips(longTips);

};
loadTips();

function showLongTips(tips) {
  // Clear existing content
  tipsDiv.innerHTML = '';

  tips.forEach((tip, index) => {
      let html = `
          <div class="tip-slide ${index === 0 ? 'active' : ''}">
              ${tip}
          </div>`;
      tipsDiv.innerHTML += html;
  });
  initSimpleSlider();
}

function initSimpleSlider() {
  let currentIndex = 0;
  const slides = document.querySelectorAll('.tip-slide');
  const totalSlides = slides.length;

  function updateSlides() {
      slides.forEach((slide, index) => {
          slide.classList.remove('active');
          if (index === currentIndex) {
              slide.classList.add('active');
          }
      });
  }

  function moveSlide(direction) {
      currentIndex = (currentIndex + direction + totalSlides) % totalSlides;
      updateSlides();
  }
  setInterval(() => moveSlide(1), 7000);
}




