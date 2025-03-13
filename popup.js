let originalJobData = {};
let hasUserEdited = false;

function updateDataDisplay(jobData) {
    document.getElementById("jobTitle").value = jobData.jobTitle || "";
    document.getElementById("companyName").value = jobData.companyName || "";
    document.getElementById("companyLocation").value = jobData.companyLocation || ""; // NEW
    document.getElementById("recruiterName").value = jobData.recruiterName || "";
    document.getElementById("recruiterLinkedIn").value = jobData.recruiterLinkedIn || "";
    document.getElementById("recruiterEmail").value = jobData.recruiterEmail || "";
    document.getElementById("website").value = jobData.website || "";
    document.getElementById("networking").value = jobData.networking || ""; // NEW
    document.getElementById("comments").value = jobData.comments || ""; // NEW

    // Update the originalJobData to reflect the current state
    originalJobData = { ...jobData };
    hasUserEdited = false;

    // Enable/disable the "Send to Sheets" button based on required fields
    if (document.getElementById("jobTitle").value && document.getElementById("companyName").value && document.getElementById("recruiterName").value) {
        document.getElementById("sendButton").disabled = false;
    } else {
        document.getElementById("sendButton").disabled = true;
    }

    // Ensure the "Save Selection" button is disabled initially
    document.getElementById("saveButton").disabled = true;
}

function checkEdits() {
    const currentJobData = {
        jobTitle: document.getElementById("jobTitle").value,
        companyName: document.getElementById("companyName").value,
        companyLocation: document.getElementById("companyLocation").value,
        recruiterName: document.getElementById("recruiterName").value,
        recruiterLinkedIn: document.getElementById("recruiterLinkedIn").value,
        recruiterEmail: document.getElementById("recruiterEmail").value,
        website: document.getElementById("website").value,
        networking:document.getElementById("networking").value,
        comments:document.getElementById("comments").value,
    };

    // Check if the current data differs from the original data
    const isEdited = JSON.stringify(originalJobData) !== JSON.stringify(currentJobData);
    if (isEdited) {
        hasUserEdited = true;
    }

    // Enable the "Save Selection" button only if the user has manually edited the input fields
    document.getElementById("saveButton").disabled = !hasUserEdited;
}

document.getElementById("sendButton").addEventListener("click", () => {
    const updatedJobData = {
        jobTitle: document.getElementById("jobTitle").value,
        companyName: document.getElementById("companyName").value,
        companyLocation: document.getElementById("companyLocation").value,
        recruiterName: document.getElementById("recruiterName").value,
        recruiterLinkedIn: document.getElementById("recruiterLinkedIn").value,
        recruiterEmail: document.getElementById("recruiterEmail").value,
        website: document.getElementById("website").value,
        networking:document.getElementById("networking").value,
        comments:document.getElementById("comments").value,
        applicationStatus: "Applied",
        appliedDate: new Date().toLocaleDateString()
    };

    chrome.runtime.sendMessage({ action: "sendToSheets", jobData: updatedJobData }, (response) => {
        console.log("Response from background:", response);
        if (response.status === "success") {
            alert("Data sent to Google Sheets!");
            updateDataDisplay(updatedJobData);
        } else {
            alert("Error sending data to Google Sheets.");
        }
    });
});

document.getElementById("saveButton").addEventListener("click", () => {
    const updatedJobData = {
        jobTitle: document.getElementById("jobTitle").value,
        companyName: document.getElementById("companyName").value,
        companyLocation: document.getElementById("companyLocation").value,
        recruiterName: document.getElementById("recruiterName").value,
        recruiterLinkedIn: document.getElementById("recruiterLinkedIn").value,
        recruiterEmail: document.getElementById("recruiterEmail").value,
        website: document.getElementById("website").value,
        networking:document.getElementById("networking").value,
        comments:document.getElementById("comments").value,
    };

    chrome.runtime.sendMessage({ action: "saveSelection", text: JSON.stringify(updatedJobData), url: null }, (response) => {
        console.log("Response from background:", response);
        chrome.runtime.sendMessage({ action: "getJobData" }, (response) => {
            if (response.jobData) {
                updateDataDisplay(response.jobData);
            }
        });
    });
});

function getSelectedText() {
    return window.getSelection().toString();
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;

    chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: getSelectedText
    }, (results) => {
        if (results && results[0].result) {
            chrome.runtime.sendMessage({
                action: "saveSelection",
                text: results[0].result,
                url: tabs[0].url
            }, (response) => {
                console.log("Response from background:", response);
                chrome.runtime.sendMessage({ action: "getJobData" }, (response) => {
                    if (response.jobData) {
                        updateDataDisplay(response.jobData);
                    }
                });
            });
        } else {
            chrome.runtime.sendMessage({ action: "getJobData" }, (response) => {
                if (response.jobData) {
                    updateDataDisplay(response.jobData);
                }
            });
        }
    });
});

// Add event listeners to input fields to detect manual edits
document.querySelectorAll('#dataDisplay input').forEach(input => {
    input.addEventListener('input', checkEdits);
});