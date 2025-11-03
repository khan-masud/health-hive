document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('search-symptom');
    const symptomButtonsContainer = document.getElementById('symptom-buttons');
    const selectedSymptomsContainer = document.getElementById('selected-symptoms');
    const diseaseResultsContainer = document.getElementById('disease-results');
    const checkSymptomsBtn = document.getElementById('check-symptoms-btn');

    let symptomsList = [];
    let diseases = [];

    // Fetch symptoms and diseases from the backend
    async function fetchData() {
        try {
            const symptomsResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SYMPTOMS));
            symptomsList = await symptomsResponse.json();

            const diseasesResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.DISEASES));
            diseases = await diseasesResponse.json();

            renderSymptoms(symptomsList);
        } catch (error) {
            console.error('ডাটা আনতে সমস্যা হয়েছে:', error);
        }
    }

    // Render symptoms as buttons
    function renderSymptoms(symptoms) {
        symptomButtonsContainer.innerHTML = '';
        symptoms.forEach(symptom => {
            const button = document.createElement('button');
            button.classList.add('symptom-btn');
            button.textContent = symptom;
            button.onclick = () => toggleSymptomSelection(symptom, button);
            symptomButtonsContainer.appendChild(button);
        });
    }

    // Toggle symptom selection
    function toggleSymptomSelection(symptom, button) {
        if (button.classList.contains('selected')) {
            button.classList.remove('selected');
            removeSelectedSymptom(symptom);
        } else {
            const currentSelectedCount = selectedSymptomsContainer.querySelectorAll('.selected-symptom-btn').length;
            if (currentSelectedCount >= 15 ) {
                alert('সর্বোচ্চ ১৫টি লক্ষণ সিলেক্ট করতে পারবে!');
                return;
            }
            button.classList.add('selected');
            addSelectedSymptom(symptom);
        }
    }

    // Add selected symptom to the selected symptoms container
    function addSelectedSymptom(symptom) {
        const button = document.createElement('button');
        button.classList.add('selected-symptom-btn');
        button.textContent = symptom;
        button.onclick = () => deselectSymptom(symptom);
        selectedSymptomsContainer.appendChild(button);
    }

    // Remove selected symptom from the selected symptoms container
    function removeSelectedSymptom(symptom) {
        const buttons = selectedSymptomsContainer.querySelectorAll('.selected-symptom-btn');
        buttons.forEach(button => {
            if (button.textContent === symptom) {
                selectedSymptomsContainer.removeChild(button);
            }
        });
    }

    // Deselect symptom from button list
    function deselectSymptom(symptom) {
        const buttons = symptomButtonsContainer.querySelectorAll('.symptom-btn');
        buttons.forEach(button => {
            if (button.textContent === symptom) {
                button.classList.remove('selected');
            }
        });
        removeSelectedSymptom(symptom);
    }

    // Handle check symptoms button click
    checkSymptomsBtn.addEventListener('click', () => {
        const selectedSymptoms = Array.from(selectedSymptomsContainer.querySelectorAll('.selected-symptom-btn'))
                                     .map(button => button.textContent);

        // Validation: Check if at least 3 symptoms are selected
        if (selectedSymptoms.length < 3) {
            alert('অনুগ্রহ করে কমপক্ষে ৩টি লক্ষণ নির্বাচন করুন!');
            diseaseResultsContainer.innerHTML = '<p style="color: #ff6f61; text-align: center; font-weight: 600;">⚠️ কমপক্ষে ৩টি লক্ষণ সিলেক্ট করুন...</p>';
            return;
        }

        diseaseResultsContainer.innerHTML = '';
        const matchedDiseases = diseases.filter(disease =>
            calculateMatchingPercentage(disease.symptoms, selectedSymptoms) > 1 // Filter out <1%
        ).map(disease => ({
            ...disease,
            matchingPercentage: calculateMatchingPercentage(disease.symptoms, selectedSymptoms)
        }));

        matchedDiseases.sort((a, b) => b.matchingPercentage - a.matchingPercentage);

        if (matchedDiseases.length === 0) {
            diseaseResultsContainer.textContent = 'ম্যাচিং কোনো রোগ পাওয়া যায়নি।';
        } else {
            matchedDiseases.forEach(renderDiseaseResult);
        }
    });

    // Calculate matching percentage
    function calculateMatchingPercentage(diseaseSymptoms, selectedSymptoms) {
        const matchingSymptoms = diseaseSymptoms.filter(symptom => selectedSymptoms.includes(symptom));
        return ((matchingSymptoms.length / diseaseSymptoms.length) * 100).toFixed(2);
    }

    // Render individual disease result
    function renderDiseaseResult(disease) {
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('disease-result');
        resultDiv.innerHTML = `
            <div class="disease-header">
                <span class="disease-name">${disease.name}</span>
                <span class="matching-percentage">${disease.matchingPercentage}%</span>
            </div>
            <div class="disease-details">
                <strong>রোগ নিশ্চিত করতে নিচের সাজেস্ট করা মেডিকেল টেস্ট গুলো করুন!</strong>
            </div>
            <div class="disease-tests">
                <strong style="float: left; margin-top: 1px; font-size: 16px;"><span class="material-symbols-outlined medical-test-icon">medical_services</span>সাজেস্টেড মেডিকেল টেস্ট সমূহঃ</strong><span class="medical-test-names">${disease.tests || 'কোনো মেডিকেল টেস্ট করানোর প্রয়োজন নেই</span>'}
            </div>
            <div class="disease-buttons">
                <button class="find-doctor-btn">বিশেষজ্ঞ ডাক্তার খুঁজুন</button>
                <button class="treatment-btn">
                    <a href="disease.html?id=${disease.id}" target="_blank">প্রাথমিক চিকিৎসা</a>
                </button>
            </div>
        `;
        diseaseResultsContainer.appendChild(resultDiv);

        const findDoctorBtn = resultDiv.querySelector('.find-doctor-btn');
        findDoctorBtn.addEventListener('click', function () {
            const englishDiseaseName = diseaseTranslation[disease.name] || disease.name;
            const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(englishDiseaseName + ' doctor near me')}`;
            window.open(googleMapsUrl, '_blank');
        });
    }

    // Disease name translations from Bangla to English
    const diseaseTranslation = {
        "ফ্লু বা ইনফ্লুয়েঞ্জা": "flu",
        "করোনাভাইরাস বা কোভিড - ১৯": "coronavirus",
        "ডেঙ্গু": "dengue",
        "ক্যান্সার": "cancer",
        "ডায়াবেটিস": "diabetes",
        "হার্ট অ্যাটাক": "heart",
        "জন্ডিস (হেপাটাইটিস-বি)": "hepatitis-b",
        "ডায়রিয়া": "diarrhea",
        "ম্যালেরিয়া": "malaria",
        "সাধারণ সর্দি জ্বর" : "fever"
    };

    // Search functionality for symptoms
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const filteredSymptoms = symptomsList.filter(symptom => symptom.includes(query));
        renderSymptoms(filteredSymptoms);
    });

    fetchData();
});
