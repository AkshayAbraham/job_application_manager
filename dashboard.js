document.addEventListener("DOMContentLoaded", function () {
    // Tab Switching Logic
    const tabs = document.querySelectorAll(".tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            contents[index].classList.add("active");
        });
    });

    // Form Elements
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    const companyNameInput = document.getElementById("companyName");
    const jobTitleInput = document.getElementById("jobTitle");
    const descriptionInput = document.getElementById("description");
    const saveButton = document.getElementById("saveWorkExperience");
    const workExperienceList = document.getElementById("workExperienceList");

    // Social Media Elements
    const platformNameInput = document.getElementById("platformName");
    const socialMediaURLInput = document.getElementById("socialMediaURL");
    const saveSocialMediaButton = document.getElementById("saveSocialMedia");
    const socialMediaList = document.getElementById("socialMediaList");

    // Save Work Experience
    function saveWorkExperience() {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const companyName = companyNameInput.value.trim();
        const jobTitle = jobTitleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!startDate || !endDate || !companyName || !description || !jobTitle) {
            alert("Please fill all fields!");
            return;
        }

        const workExperience = { startDate, endDate, companyName, jobTitle, description };

        chrome.storage.local.get({ workExperiences: [] }, (data) => {
            const workExperiences = data.workExperiences;
            workExperiences.push(workExperience);

            chrome.storage.local.set({ workExperiences }, () => {
                console.log("Work Experience Saved!");
                displayWorkExperiences();
            });
        });

        // Clear Input Fields
        [startDateInput, endDateInput, companyNameInput, jobTitleInput, descriptionInput].forEach(input => input.value = "");
    }

    // Display Work Experiences
    function displayWorkExperiences() {
        chrome.storage.local.get({ workExperiences: [] }, (data) => {
            workExperienceList.innerHTML = "";

            data.workExperiences.forEach((item, index) => {
                const li = document.createElement("li");
                li.classList.add("experience-item"); // Apply new styling
                li.innerHTML = `
                    <div class="experience-header">
                        <i class="fa-solid fa-briefcase"></i>
                        <span class="job-title">${item.jobTitle}</span>
                    </div>
                    <div class="experience-info">
                        <i class="fa-solid fa-building"></i>
                        <span>${item.companyName}</span>
                    </div>
                    <div class="experience-info">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span>${item.startDate} - ${item.endDate}</span>
                    </div>
                    <pre class="formatted-text">${item.description}</pre>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                `;
                workExperienceList.appendChild(li);
            });

            // Attach event listeners to delete buttons
            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", deleteWorkExperience);
            });
        });
    }

    // Delete Work Experience
    function deleteWorkExperience(event) {
        const index = event.target.getAttribute("data-index");

        chrome.storage.local.get({ workExperiences: [] }, (data) => {
            let workExperiences = data.workExperiences;
            workExperiences.splice(index, 1);

            chrome.storage.local.set({ workExperiences }, () => {
                console.log("Work Experience Deleted!");
                displayWorkExperiences();
            });
        });
    }

    function saveSocialMedia() {
        const platformName = platformNameInput.value.trim();
        const socialMediaURL = socialMediaURLInput.value.trim();

        if (!platformName || !socialMediaURL) {
            alert("Please fill all fields!");
            return;
        }

        const socialMedia = { platformName, socialMediaURL };

        chrome.storage.local.get({ socialMediaLinks: [] }, (data) => {
            const socialMediaLinks = data.socialMediaLinks;
            socialMediaLinks.push(socialMedia);

            chrome.storage.local.set({ socialMediaLinks }, () => {
                console.log("Social Media Link Saved!");
                displaySocialMediaLinks();
            });
        });

        [platformNameInput, socialMediaURLInput].forEach(input => input.value = "");
    }

    // Display Social Media Links
    function displaySocialMediaLinks() {
        chrome.storage.local.get({ socialMediaLinks: [] }, (data) => {
            socialMediaList.innerHTML = "";
    
            data.socialMediaLinks.forEach((item, index) => {
                const li = document.createElement("li");
                li.classList.add("social-media-item"); // Apply card styling
                li.innerHTML = `
                    <div class="platform-header">
                        <i class="fa-brands fa-${item.platformName.toLowerCase()}"></i>
                        <span class="job-title">${item.platformName}</span>
                    </div>
                    <div class="platform-info">
                        <i class="fa-solid fa-link"></i>
                        <a href="${item.socialMediaURL}" target="_blank">${item.socialMediaURL}</a>
                    </div>
                    ${item.description ? `<pre class="platform-description">${item.description}</pre>` : ""}
                    <button class="delete-btn" data-index="${index}" data-type="social">Delete</button>
                `;
                socialMediaList.appendChild(li);
            });
    
            document.querySelectorAll(".delete-btn[data-type='social']").forEach(button => {
                button.addEventListener("click", deleteSocialMedia);
            });
        });
    }
    

    // Delete Social Media Link
    function deleteSocialMedia(event) {
        const index = event.target.getAttribute("data-index");

        chrome.storage.local.get({ socialMediaLinks: [] }, (data) => {
            let socialMediaLinks = data.socialMediaLinks;
            socialMediaLinks.splice(index, 1);

            chrome.storage.local.set({ socialMediaLinks }, () => {
                console.log("Social Media Link Deleted!");
                displaySocialMediaLinks();
            });
        });
    }

    // Event Listeners
    saveButton.addEventListener("click", saveWorkExperience);
    saveSocialMediaButton.addEventListener("click", saveSocialMedia);

    // Load Saved Experiences on Page Load
    displayWorkExperiences();
    displaySocialMediaLinks();
});
