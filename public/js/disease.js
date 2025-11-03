// Fetch symptoms and diseases from the backend
let symptomsList = [];
let diseases = [];

    async function fetchData() {
        try {
            const symptomsResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SYMPTOMS));
            symptomsList = await symptomsResponse.json();

            const diseasesResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.DISEASES));
            diseases = await diseasesResponse.json();        renderSymptoms(symptomsList);
    } catch (error) {
        console.error('ডাটা আনতে সমস্যা হয়েছে:', error);
    }
} 

document.addEventListener("DOMContentLoaded", async () => {
    await fetchData();
    
    const diseaseDetailsContainer = document.getElementById('disease-details');
    const urlParams = new URLSearchParams(window.location.search);
    const diseaseId = urlParams.get('id');

    const disease = diseases.find(d => d.id == diseaseId);

    if (disease) {
        diseaseDetailsContainer.innerHTML = `
            <div class="container-heading">
            <h2 class="disease-name">${disease.name}</h2>
            </div>
            <div class="container-body">
            <center><img class="disease-image" alt="${disease.name}" src="${disease.image}"></center>
            <p class="disease-description">${disease.description}</p>
            <h3 class="disease-title">লক্ষণ:</h3>
            <ul class="lists">
                ${disease.symptoms.map(symptom => `<li class="list">${symptom}</li>`).join('')}
            </ul>
            <p class="disease-details">${disease.details}</p>
            <p class="disclaimer-text"><strong>Disclaimer:</strong> এই তথ্য শুধুমাত্র তথ্যের উদ্দেশ্যে। কোনো চিকিৎসাগত পরামর্শের বিকল্প হিসেবে এটি ব্যবহার করা উচিত নয়। সবসময় ডাক্তারের পরামর্শ নিন।</p>
            </div>
        `;
    } else {
        diseaseDetailsContainer.innerHTML = `<p>রোগের বিস্তারিত তথ্য পাওয়া যায়নি।</p>`;
    }
});
