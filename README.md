# 🚀 Job Application Saver - Chrome Extension

## 📌 Project Overview  
**Job Application Saver** is a Chrome extension designed to help job seekers efficiently track and manage their job applications. The extension allows users to save selected job details directly to a Google Sheet using a hotkey (`Ctrl+Shift+S`). Additionally, users can update the application status within the extension, and changes will be reflected in the Google Sheet.



## 🎯 Aim  
The primary goal of this project is to simplify the job application tracking process by providing an easy-to-use Chrome extension that integrates with Google Sheets, eliminating the need for manual data entry.



## 📝 Features  
- 📌 **Quick Save:** Select job details on a webpage and press `Ctrl+Shift+S` to store them in Google Sheets.  
- 🔄 **Status Updates:** Update the status of an application (e.g., "Interview Scheduled," "Rejected"), and it will be reflected in the sheet.  
- 🎨 **Visual Tracking:** Rows with "Selected for Interview" status will be highlighted in Google Sheets for better visibility.  
- 🚀 **Context Menu Integration:** Right-click on a webpage and use the extension to save job details.  
- 📊 **Google Sheets Integration:** Automatically logs job applications into a structured Google Sheet with predefined columns.  
- 🔒 **Local Storage:** Saves selected text before submission, ensuring users can review their data.  
- 🎨 **Custom UI:** A user-friendly popup interface for managing applications.  
- 🖼 **Extension Icons & Branding:** Integrated icons and logos for better user experience.  



## 🚀 Technologies Used  
- **JavaScript (JS)** – For handling extension logic and Google Apps Script API calls.  
- **Google Apps Script** – To interact with Google Sheets for data storage and retrieval.  
- **HTML & CSS** – For designing the extension's user interface.  
- **Chrome Extensions API** – To integrate features like hotkeys and context menus.  



## 📂 Folder Structure  
```
/job-application-saver-extension 
├── manifest.json # Chrome extension configuration 
├── background.js # Background script for handling requests 
├── popup.html # UI for extension popup 
├── popup.js # JavaScript for popup interactions 
├── styles.css # Styling for popup UI 
├── icons/ # Extension icons (16x16, 48x48, 128x128) 
├── google-apps-script.js # Google Apps Script for handling Sheets integration 
├── README.md # Project documentation
```



## 📜 How to Install  
1. Download or clone the repository.
#### 🔹 Clone via HTTPS  
```sh
git clone https://github.com/AkshayAbraham/job_application_manager.git
```
2. Open **Google Chrome** and go to `chrome://extensions/`.  
3. Enable **Developer Mode** (toggle in the top-right corner).  
4. Click **Load Unpacked** and select the project folder.  
5. The extension icon will appear in the Chrome toolbar.  

---

## ⚙️ How to Use  

### **Saving Job Applications**  
1. Highlight the job details (title, company, recruiter info, etc.) on any webpage.  
2. Press `Ctrl+Shift+S` (or right-click and select **"Save Job Application"** from the context menu).  
3. The details will be sent to your Google Sheet.  

### **Updating Application Status**  
1. Open the extension popup.  
2. Select a job from the list and update its status.  
3. The status will be updated in Google Sheets, and if it's **"Selected for Interview"**, the row will be highlighted.  



## 📅 Future Improvements  
✅ **Enhanced UI:** Improve the extension interface for a better user experience.  
✅ **Filters & Sorting:** Add filters to quickly view specific applications (e.g., "Only Interviews").  
✅ **Automated Notifications:** Send email or browser notifications for upcoming interviews.  
✅ **Multiple Sheet Support:** Allow users to manage applications in different sheets.  
✅ **Integration with Job Portals:** Directly extract job data from LinkedIn, Indeed, etc.  



## 💡 Contribution & Feedback  
Feel free to contribute or suggest improvements! If you encounter any issues, submit a bug report or feature request.  



## 📜 License  
This project is open-source and licensed under the **MIT License**.
