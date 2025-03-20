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

  chrome.commands.onCommand.addListener((command) => {
    console.log(`Command received: ${command}`);
    if (command === "save_job_data") {
        console.log("Hotkey pressed: Ctrl+Shift+Z");

        // Get the currently active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                console.error("No active tab found");
                return;
            }

            const activeTab = tabs[0];

            // Execute a script to get the selected text
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                func: () => window.getSelection().toString()
            }, (selection) => {
                if (chrome.runtime.lastError) {
                    console.error("Error executing script:", chrome.runtime.lastError);
                    return;
                }

                const selectedText = selection[0]?.result;
                console.log("Selected text:", selectedText);

                if (selectedText) {
                    // Inject a styled alert box with dropdown
                    chrome.scripting.executeScript({
                        target: { tabId: activeTab.id },
                        func: (selectedText) => {
                            // Remove any existing popup
                            document.getElementById("selectionPopup")?.remove();

                            // Create container
                            const popup = document.createElement("div");
                            popup.id = "selectionPopup";
                            popup.innerHTML = `
                                <style>
                                    .popup-container {
                                        all: unset; /* Reset all inherited styles */
                                        position: fixed;
                                        top: 10px;
                                        left: 50%;
                                        transform: translateX(-50%);
                                        background: #1E1E1E;
                                        color: white;
                                        padding: 20px;
                                        border-radius: 12px;
                                        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
                                        z-index: 10000;
                                        font-family: Arial, sans-serif !important;
                                        width: 320px;
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        text-align: center;
                                    }
                                    .popup-text {
                                        font-size: 16px;
                                        font-weight: bold;
                                        margin-bottom: 12px;
                                    }
                                    .popup-select {
                                        width: 100%;
                                        padding: 10px;
                                        margin-bottom: 12px;
                                        border-radius: 8px;
                                        border: 1px solid #ccc;
                                        background: #fff;
                                        color: black;
                                        font-size: 14px;
                                    }
                                    .popup-buttons {
                                        display: flex;
                                        gap: 12px;
                                        width: 100%;
                                    }
                                    .popup-button {
                                        flex: 1;
                                        padding: 10px;
                                        font-size: 14px;
                                        border: none;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: bold;
                                        text-align: center;
                                    }
                                    .save-btn {
                                        background: #007bff;
                                        color: white;
                                    }
                                    .save-btn:hover {
                                        background: #0056b3;
                                    }
                                    .cancel-btn {
                                        background: #DC3545;
                                        color: white;
                                    }
                                    .cancel-btn:hover {
                                        background: #A71D2A;
                                    }
                                </style>
                                <div class="popup-container">
                                    <div class="popup-text">The selected text is "<span style="color: #00A8E8;">${selectedText}</span>"</div>
                                    <select class="popup-select" id="dataType">
                                        <option value="jobTitle">Job Title</option>
                                        <option value="companyName">Company Name</option>
                                    </select>
                                    <div class="popup-buttons">
                                        <button class="popup-button save-btn" id="saveBtn">Save</button>
                                        <button class="popup-button cancel-btn" id="cancelBtn">Cancel</button>
                                    </div>
                                </div>
                            `;

                            document.body.appendChild(popup);

                            return new Promise((resolve) => {
                                document.getElementById("saveBtn").addEventListener("click", () => {
                                    const type = document.getElementById("dataType").value;
                                    document.body.removeChild(popup);
                                    resolve({ type, value: selectedText });
                                });

                                document.getElementById("cancelBtn").addEventListener("click", () => {
                                    document.body.removeChild(popup);
                                    resolve(null); // Cancel operation
                                });
                            });
                        },
                        args: [selectedText]
                    }, (result) => {
                        if (chrome.runtime.lastError) {
                            console.error("Error executing script:", chrome.runtime.lastError);
                            return;
                        }

                        if (result && result[0]?.result) {
                            const { type, value } = result[0].result;
                            console.log(`Saving ${type}: ${value}`);

                            // Save the selected text to chrome.storage.local
                            chrome.storage.local.get({ savedData: {} }, (data) => {
                                const savedData = data.savedData;
                                savedData[type] = value;
                                chrome.storage.local.set({ savedData }, () => {
                                    console.log(`Saved ${type}: ${value}`);
                                });
                            });
                        }
                    });
                }
            });
        });
    }
});
