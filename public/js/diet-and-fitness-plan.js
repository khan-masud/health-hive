document.addEventListener('DOMContentLoaded', function () {
    const nextButtons = document.querySelectorAll('.next-button');
    const previousButtons = document.querySelectorAll('.previous-button');
    const formSteps = document.querySelectorAll('.form-step');
    const navSteps = document.querySelectorAll('.nav-step');
    const form = document.getElementById('multi-step-form');
    const resultDiv = document.getElementById("result");
  
    let currentStep = 0;
  
    // Function to show the current step in the form
    function showStep(step) {
      formSteps.forEach((formStep, index) => {
        formStep.classList.remove('active');
        navSteps[index].classList.remove('active');
        if (index === step) {
          formStep.classList.add('active');
          navSteps[index].classList.add('active');
        }
      });
  
      initializeDropdowns();
    }
  
    // Function to initialize dropdown event listeners
    function initializeDropdowns() {
      document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.removeEventListener('change', handleDropdownChange);
        
        dropdown.addEventListener('change', handleDropdownChange);
      });
    }
  
    // Handle dropdown change events for all dropdowns
    function handleDropdownChange(event) {
      const dropdown = event.target;
      const targetId = dropdown.getAttribute('data-target'); 
      console.log('Dropdown value changed:', dropdown.value);
      console.log('Target conditional input ID:', targetId);
  
      const conditionalInputContainer = document.getElementById(targetId);
  

      if (conditionalInputContainer) {
        if (dropdown.value === 'yes') {
          conditionalInputContainer.style.display = 'block'; 
        } else {
          conditionalInputContainer.style.display = 'none'; 
        }
      }
    }
  
    // Function to validate required fields in the current step
    function validateStep() {
      const currentFormStep = formSteps[currentStep];
      const requiredFields = currentFormStep.querySelectorAll('[required]');
      
      for (let field of requiredFields) {
        if (!field.value.trim()) {
          field.classList.add('error'); 
          return false; 
        } else {
          field.classList.remove('error'); 
        }
      }
      return true; 
    }
  
    // Event listeners for next buttons
    nextButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (validateStep()) {
          if (currentStep < formSteps.length - 1) {
            currentStep++;
            showStep(currentStep);
          }
        } else {
          alert('Please fill out all required fields before proceeding.');
        }
      });
    });
  
    // Event listeners for previous buttons
    previousButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep--;
          showStep(currentStep);
        }
      });
    });
  
    // Function to collect form data into a JSON object
    function getFormData() {
      const formData = new FormData(form);
      const dataObject = {};
  
      formData.forEach((value, key) => {
        const keys = key.split('.');
        keys.reduce((acc, part, index) => {
          if (index === keys.length - 1) {
            acc[part] = value;
          } else {
            if (!acc[part]) acc[part] = {};
            return acc[part];
          }
        }, dataObject);
      });
  
      return dataObject;
    }
  
    // Submit the form data as JSON when the final step is submitted
    form.addEventListener('submit', async (event) => {
      event.preventDefault();  
      
      const data = getFormData(); 
      
      console.log('Form Data (JSON):', JSON.stringify(data)); 

      resultDiv.innerHTML = `
      <center>
          <div class="loading-animation"></div>
          <p>অ্যানালাইসিস করা হচ্ছে! অনুগ্রহ করে অপেক্ষা করুন...</p>
      </center>
      `;
      
      try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.DIET_FITNESS), {
          method: "POST",
          body: JSON.stringify(data), 
          headers: {
            "Content-Type": "application/json", 
          },
        });
        
        
        // Ensure the response is valid
        if (!response.ok) {
          const errorData = await response.json();
          resultDiv.innerHTML = `<p style="color: red;">Error: ${errorData.error || 'Unknown error occurred.'}</p>`;
          return;
        }
        
        const responseData = await response.json();
        
        // Extract and display analysis result
        if (responseData.analysisResult) {
          resultDiv.innerHTML = `
            <p>${responseData.analysisResult}</p>
          `;
        } else {
          resultDiv.innerHTML = `<p style="color: red;">Error: Response is missing the analysis result.</p>`;
        }
        } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    });
  
    // Initial display of the first step
    showStep(currentStep);
  
    // Dropdown event listener for conditional inputs
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('change', function () {
        const dropdownValue = this.value;
        const targetId = this.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
  
        console.log("Dropdown value changed:", dropdownValue);
        console.log("Target conditional input ID:", targetId);
  
        if (dropdownValue === "yes" && targetElement) {
          targetElement.style.display = "block";
        } else if (dropdownValue !== "yes" && targetElement) {
          targetElement.style.display = "none"; 
        }
      });
    });
  });
  