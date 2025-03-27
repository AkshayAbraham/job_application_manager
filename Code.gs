function doPost(e) {
    const path = e.pathInfo;

    if (path === "updateStatus") {
        return handleUpdateStatus(e); // Handle status updates
    } else {
        return handleNewJobApplication(e); // Handle new job applications
    }
}

// Function to get the sheet ID from script properties
function getSheetId() {
    const scriptProperties = PropertiesService.getScriptProperties();
    const sheetId = scriptProperties.getProperty('SHEET_ID');
    if (!sheetId) {
        throw new Error('Sheet ID not found in script properties');
    }
    return sheetId;
}

// Helper function to format date as DD/MM/YYYY and ensure it's a date object
function formatDate(dateString) {
    if (!dateString) return new Date(); // If no date provided, use current date
    
    // Try parsing different date formats
    let date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // If parsing fails, try with different formats
        const parts = dateString.split(/[-/]/);
        if (parts.length === 3) {
            // Try DD/MM/YYYY format
            date = new Date(parts[2], parts[1] - 1, parts[0]);
        }
    }
    
    // If still not valid, use current date
    if (isNaN(date.getTime())) {
        date = new Date();
    }
    
    return date;
}

// Function to handle new job applications
function handleNewJobApplication(e) {
    try {
        const sheetId = getSheetId();
        const sheetName = "Sheet1";

        const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
        if (!sheet) {
            throw new Error("Sheet not found. Please check the sheet name.");
        }

        const data = JSON.parse(e.postData.contents);

        // Format dates properly
        const appliedDate = formatDate(data.appliedDate);
        
        // Append the new job application data to the sheet
        const newRow = sheet.getLastRow() + 1;
        sheet.getRange(newRow, 1).setValue(appliedDate).setNumberFormat("dd/MM/yyyy"); // Applied Date
        sheet.getRange(newRow, 2).setValue(data.jobTitle);
        sheet.getRange(newRow, 3).setValue(data.companyName);
        sheet.getRange(newRow, 4).setValue(data.companyLocation);
        sheet.getRange(newRow, 5).setValue(data.recruiterName);
        sheet.getRange(newRow, 6).setValue(data.recruiterLinkedIn);
        sheet.getRange(newRow, 7).setValue(data.recruiterEmail);
        sheet.getRange(newRow, 8).setValue(data.website);
        sheet.getRange(newRow, 9).setValue(data.networking);
        sheet.getRange(newRow, 10).setValue(data.comments);
        sheet.getRange(newRow, 11).setValue(data.applicationStatus);

        return ContentService.createTextOutput("Success");
    } catch (error) {
        Logger.log("Error: " + error.message);
        return ContentService.createTextOutput("Error: " + error.message);
    }
}

// Function to handle status updates
function handleUpdateStatus(e) {
    try {
        const sheetId = getSheetId();
        const sheet1 = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet1");
        const sheet2 = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet2");

        if (!sheet1 || !sheet2) {
            throw new Error("Sheet not found. Please check the sheet names.");
        }

        const data = JSON.parse(e.postData.contents);
        const { jobTitle, companyName, status } = data;
        const statusChangedDate = new Date(); // Current date as Date object

        const range = sheet1.getDataRange();
        const values = range.getValues();

        // Add a new column in Sheet 1 for Status Changed Date if it doesn't exist
        const sheet1Headers = sheet1.getRange(1, 1, 1, sheet1.getLastColumn()).getValues()[0];
        let statusChangedDateColumnIndex = sheet1Headers.indexOf("Status Changed Date") + 1;

        if (statusChangedDateColumnIndex === 0) {
            // If the column doesn't exist, add it
            statusChangedDateColumnIndex = sheet1.getLastColumn() + 1;
            sheet1.getRange(1, statusChangedDateColumnIndex).setValue("Status Changed Date");
        }

        // Loop through the sheet to find matching rows
        let foundNonRejectedRow = false;

        for (let i = 1; i < values.length; i++) {
            const rowJobTitle = values[i][1]; // Job Title is in column B (index 1)
            const rowCompanyName = values[i][2]; // Company Name is in column C (index 2)
            const rowStatus = values[i][10]; // Status is in column K (index 10)

            // Check if the row matches the job title and company name
            if (rowJobTitle === jobTitle && rowCompanyName === companyName) {
                // Skip rows with status "Rejected"
                if (rowStatus === "Rejected") {
                    continue; // Skip this row
                }

                // Update the status of the first non-rejected row in Sheet 1
                sheet1.getRange(i + 1, 11).setValue(status); // Update status in column K

                // Update the Status Changed Date in Sheet 1 with proper date format
                sheet1.getRange(i + 1, statusChangedDateColumnIndex || sheet1.getLastColumn())
                    .setValue(statusChangedDate)
                    .setNumberFormat("dd/MM/yyyy");

                // If status is "Selected for Interview", copy the row to Sheet 2 and change row color
                if (status === "Selected for Interview") {
                    const rowData = values[i];
                    rowData[10] = status; // Update the status in the row data to "Selected for Interview"

                    // Append the row data to Sheet 2 with additional columns
                    const newRow = sheet2.getLastRow() + 1;
                    sheet2.getRange(newRow, 1, 1, 11).setValues([rowData.slice(0, 11)]);
                    
                    // Set status changed date with proper format
                    sheet2.getRange(newRow, 12).setValue(statusChangedDate).setNumberFormat("dd/MM/yyyy");
                    
                    // Initialize empty rejected status and date
                    sheet2.getRange(newRow, 13).setValue("");
                    sheet2.getRange(newRow, 14).setValue("");

                    // Change row color in Sheet1 (light green for interview selection)
                    const rowRange = sheet1.getRange(i + 1, 1, 1, sheet1.getLastColumn()); // Entire row
                    rowRange.setBackground("#b7e1cd"); // Light green
                }

                foundNonRejectedRow = true;
                break; // Stop after updating the first non-rejected row
            }
        }

        if (!foundNonRejectedRow) {
            throw new Error("No non-rejected row found for the given job title and company name.");
        }

        // If status is "Rejected", update the corresponding row in Sheet 2 (if it exists)
        if (status === "Rejected") {
            const sheet2Range = sheet2.getDataRange();
            const sheet2Values = sheet2Range.getValues();
            const rejectedDate = new Date(); // Current date as Date object

            for (let i = 1; i < sheet2Values.length; i++) {
                const rowJobTitle = sheet2Values[i][1]; // Job Title is in column B (index 1)
                const rowCompanyName = sheet2Values[i][2]; // Company Name is in column C (index 2)

                if (rowJobTitle === jobTitle && rowCompanyName === companyName) {
                    // Update the Rejected Status and Rejected Date in Sheet 2 with proper date format
                    sheet2.getRange(i + 1, 13).setValue("Rejected"); // Rejected Status in column M
                    sheet2.getRange(i + 1, 14)
                        .setValue(rejectedDate)
                        .setNumberFormat("dd/MM/yyyy"); // Rejected Date in column N
                    break;
                }
            }
        }

        return ContentService.createTextOutput("Success");
    } catch (error) {
        Logger.log("Error: " + error.message);
        return ContentService.createTextOutput("Error: " + error.message);
    }
}