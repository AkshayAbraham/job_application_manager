let originalJobData = {};
let hasUserEdited = false;

// Function to show a custom error notification
function showErrorNotification(message) {
    const notification = document.getElementById("customNotification");
    const notificationMessage = document.getElementById("notificationMessage");

    // Set the message and style
    notificationMessage.textContent = message;
    notification.classList.add("error");

    // Show the notification
    notification.classList.remove("hidden");

    // Hide the notification after 2 seconds
    setTimeout(() => {
        notification.classList.add("hidden");
        notification.classList.remove("error");
    }, 2000);
}

function updateDataDisplay(jobData) {
    document.getElementById("jobTitle").value = jobData.jobTitle || "";
    document.getElementById("companyName").value = jobData.companyName || "";
    document.getElementById("companyLocation").value = jobData.companyLocation || "";
    document.getElementById("recruiterName").value = jobData.recruiterName || "";
    document.getElementById("recruiterLinkedIn").value = jobData.recruiterLinkedIn || "";
    document.getElementById("recruiterEmail").value = jobData.recruiterEmail || "";
    document.getElementById("website").value = jobData.website || "";
    document.getElementById("networking").value = jobData.networking || "";
    document.getElementById("comments").value = jobData.comments || "";

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
        networking: document.getElementById("networking").value,
        comments: document.getElementById("comments").value,
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
        networking: document.getElementById("networking").value,
        comments: document.getElementById("comments").value,
        applicationStatus: "Applied",
        appliedDate: new Date().toLocaleDateString()
    };

    chrome.runtime.sendMessage({ action: "sendToSheets", jobData: updatedJobData }, (response) => {
        console.log("Response from background:", response);
        if (response.status === "success") {
            updateDataDisplay(updatedJobData);
            showSuccessNotification("Data sent successfully!");
        } else {
            showErrorNotification("Error sending data to Google Sheets.");
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
        networking: document.getElementById("networking").value,
        comments: document.getElementById("comments").value,
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

document.getElementById("addAppTab").addEventListener("click", function() {
    document.getElementById("addApplicationSection").style.display = "block";
    document.getElementById("updateStatusSection").style.display = "none";
    this.classList.add("active");
    document.getElementById("updateStatusTab").classList.remove("active");
});

document.getElementById("updateStatusTab").addEventListener("click", function() {
    document.getElementById("addApplicationSection").style.display = "none";
    document.getElementById("updateStatusSection").style.display = "block";
    this.classList.add("active");
    document.getElementById("addAppTab").classList.remove("active");
});

document.getElementById("updateStatusButton").addEventListener("click", () => {
    const jobTitle = document.getElementById("updateJobTitle").value;
    const companyName = document.getElementById("updateCompanyName").value;
    const status = document.getElementById("updateStatus").value;

    if (!jobTitle || !companyName) {
        showErrorNotification("Please enter both Job Title and Company Name.");
        return;
    }

    chrome.runtime.sendMessage({
        action: "updateStatus",
        jobTitle,
        companyName,
        status
    }, (response) => {
        if (response.status === "success") {
            showSuccessNotification("Status updated successfully!");
            // Clear the temporary data after successful update
            chrome.storage.local.remove("temporaryUpdateData", () => {
                console.log("Temporary data cleared.");
                // Clear the input fields
                document.getElementById("updateJobTitle").value = "";
                document.getElementById("updateCompanyName").value = "";
                document.getElementById("updateStatus").value = "Applied";
            });
        } else {
            showErrorNotification("Error updating status.");
        }
    });
});

// Function to restore data from chrome.storage
function restoreTemporaryData() {
    chrome.storage.local.get(["temporaryUpdateData"], (result) => {
        if (result.temporaryUpdateData) {
            document.getElementById("updateJobTitle").value = result.temporaryUpdateData.jobTitle || "";
            document.getElementById("updateCompanyName").value = result.temporaryUpdateData.companyName || "";
            document.getElementById("updateStatus").value = result.temporaryUpdateData.status || "Applied";
        }
    });
}

// Function to save data to chrome.storage
function saveTemporaryData() {
    const temporaryUpdateData = {
        jobTitle: document.getElementById("updateJobTitle").value,
        companyName: document.getElementById("updateCompanyName").value,
        status: document.getElementById("updateStatus").value
    };
    chrome.storage.local.set({ temporaryUpdateData }, () => {
        console.log("Data saved temporarily:", temporaryUpdateData);
    });
}

// Restore data when the popup is opened
document.addEventListener("DOMContentLoaded", restoreTemporaryData);

// Save data when the user interacts with the input fields
document.getElementById("updateJobTitle").addEventListener("input", saveTemporaryData);
document.getElementById("updateCompanyName").addEventListener("input", saveTemporaryData);
document.getElementById("updateStatus").addEventListener("change", saveTemporaryData);

function showSuccessNotification(message) {
    const notification = document.getElementById("customNotification");
    const overlay = document.getElementById("overlay");
    const notificationMessage = document.getElementById("notificationMessage");

    // Set the message and icon
    notificationMessage.textContent = message;

    // Show the overlay and notification instantly
    overlay.style.display = "block";
    notification.style.display = "flex"; // Use flex to maintain alignment

    // Hide the overlay and notification after 2 seconds
    setTimeout(() => {
        overlay.style.display = "none";
        notification.style.display = "none";
    }, 4000);
}