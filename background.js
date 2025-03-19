let jobData = {
    jobTitle: null,
    companyName: null,
    companyLocation: null, // NEW
    recruiterName: null,
    recruiterLinkedIn: null,
    recruiterEmail: null,
    website: null,
    networking: null, // NEW
    comments: null, // NEW
    applicationStatus: "Applied",
    appliedDate: new Date().toLocaleDateString()
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveSelection") {
        if (message.url === null && message.text !== null) {
            try {
                const updatedData = JSON.parse(message.text);
                jobData = { ...jobData, ...updatedData };
                sendResponse({ status: "Data updated from input fields" });
            } catch (e) {
                console.error("Error parsing input field data:", e);
                sendResponse({ status: "Error parsing data" });
            }
        } else {
            processSelection(message.text, message.url);
            sendResponse({ status: "Data received" });
        }
    } else if (message.action === "getJobData") {
        sendResponse({ jobData });
    } else if (message.action === "sendToSheets") {
        saveToSheets(message.jobData, (success) => {
            if (success) {
                resetJobData();
                sendResponse({ status: "success" });
            } else {
                sendResponse({ status: "error" });
            }
        });
        return true; // Indicates that the response will be sent asynchronously
    } else if (message.action === "updateStatus") {
        updateStatusInSheets(message.jobTitle, message.companyName, message.status, (success) => {
            if (success) {
                sendResponse({ status: "success" });
            } else {
                sendResponse({ status: "error" });
            }
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});

function updateStatusInSheets(jobTitle, companyName, status, callback) {
    fetch("MY_WEBAPP_URL/updateStatus", {
        method: "POST",
        body: JSON.stringify({ jobTitle, companyName, status }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.text())
    .then(data => {
        console.log("Status updated:", data);
        callback(true); // Call the callback with success
    })
    .catch(error => {
        console.error("Error:", error);
        callback(false); // Call the callback with failure
    });
}

function processSelection(selectedText, url) {
    if (!jobData.jobTitle) {
        jobData.jobTitle = selectedText;
        jobData.website = getWebsiteName(url);
    } else if (!jobData.companyName) {
        jobData.companyName = selectedText;
    } else if (!jobData.companyLocation) {
        jobData.companyLocation = selectedText;
    } else if (!jobData.recruiterEmail && isEmail(selectedText)) {
        jobData.recruiterEmail = selectedText;
    } else if (!jobData.recruiterLinkedIn && isLinkedInURL(selectedText)) {
        jobData.recruiterLinkedIn = selectedText;
    } else if (!jobData.recruiterName) {
        jobData.recruiterName = selectedText;
    } else if (!jobData.networking) {
        jobData.networking = selectedText;
    } else if (!jobData.comments) {
        jobData.comments = selectedText;
    }
}

function resetJobData() {
    jobData = {
        jobTitle: null,
        companyName: null,
        companyLocation: null,
        recruiterName: null,
        recruiterLinkedIn: null,
        recruiterEmail: null,
        website: null,
        networking: null,
        comments: null,
        applicationStatus: "Applied",
        appliedDate: new Date().toLocaleDateString()
    };
}

function saveToSheets(data, callback) {
    fetch("MY_WEBAPP_URL", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.text())
    .then(data => {
        console.log("Saved:", data);
        callback(true);
    })
    .catch(error => {
        console.error("Error:", error);
        callback(false);
    });
}

function getWebsiteName(url) {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\n]+)/);
    return match && match[1] ? match[1] : "Unknown";
}

function isLinkedInURL(text) {
    return text.includes("linkedin.com/in/");
}

function isEmail(text) {
    return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
}

chrome.commands.onCommand.addListener((command) => {
    if (command === "show_social_media_page") {
      // Open the popup if it's not already open
      chrome.action.openPopup(() => {
        // Send a message to the popup script to show the social media page
        chrome.runtime.sendMessage({ action: "showSocialMediaPage" });
      });
    }
  });
