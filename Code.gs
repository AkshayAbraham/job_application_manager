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

// Function to handle new job applications
function handleNewJobApplication(e) {
    try {
        const sheetId = getSheetId(); // Replace with your actual sheet ID
        const sheetName = "Sheet1"; // Replace with your sheet name

        const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
        if (!sheet) {
            throw new Error("Sheet not found. Please check the sheet name.");
        }

        const data = JSON.parse(e.postData.contents);

        // Append the new job application data to the sheet
        sheet.appendRow([
            data.appliedDate,
            data.jobTitle,
            data.companyName,
            data.companyLocation,
            data.recruiterName,
            data.recruiterLinkedIn,
            data.recruiterEmail,
            data.website,
            data.networking,
            data.comments,
            data.applicationStatus
        ]);

        return ContentService.createTextOutput("Success");
    } catch (error) {
        Logger.log("Error: " + error.message);
        return ContentService.createTextOutput("Error: " + error.message);
    }
}

// Function to handle status updates
function handleUpdateStatus(e) {
    try {
        const sheetId = getSheetId(); // Replace with your actual sheet ID
        const sheet1 = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet1");
        const sheet2 = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet2");

        if (!sheet1 || !sheet2) {
            throw new Error("Sheet not found. Please check the sheet names.");
        }

        const data = JSON.parse(e.postData.contents);
        const { jobTitle, companyName, status } = data;
        const statusChangedDate = new Date().toLocaleDateString(); // Current date

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

                // Update the Status Changed Date in Sheet 1
                sheet1.getRange(i + 1, statusChangedDateColumnIndex || sheet1.getLastColumn()).setValue(statusChangedDate);

                // If status is "Selected for Interview", copy the row to Sheet 2 and change row color
                if (status === "Selected for Interview") {
                    const rowData = values[i];
                    rowData[10] = status; // Update the status in the row data to "Selected for Interview"

                    // Append the row data to Sheet 2 with additional columns
                    sheet2.appendRow([
                        ...rowData.slice(0, 11), // Original row data (columns A to K)
                        statusChangedDate, // Status Changed Date (column L)
                        "", // Rejected Status (column M, empty for now)
                        "" // Rejected Date (column N, empty for now)
                    ]);

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

            for (let i = 1; i < sheet2Values.length; i++) {
                const rowJobTitle = sheet2Values[i][1]; // Job Title is in column B (index 1)
                const rowCompanyName = sheet2Values[i][2]; // Company Name is in column C (index 2)

                if (rowJobTitle === jobTitle && rowCompanyName === companyName) {
                    const rejectedDate = new Date().toLocaleDateString(); // Current date

                    // Update the Rejected Status and Rejected Date in Sheet 2
                    sheet2.getRange(i + 1, 13).setValue("Rejected"); // Rejected Status in column M
                    sheet2.getRange(i + 1, 14).setValue(rejectedDate); // Rejected Date in column N
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

//below are the test functions to check weather the code is working before deployment
function testDoPost() {
  // Sample data to simulate a POST request
  const sampleData = {
    jobTitle: "Software Engineer",
    companyName: "Google",
    recruiterName: "John Doe",
    recruiterLinkedIn: "https://linkedin.com/in/johndoe",
    website: "linkedin.com",
    applicationStatus: "Applied",
    appliedDate: "10/25/2023"
  };

  // Simulate the POST request
  const e = {
    postData: {
      contents: JSON.stringify(sampleData), // Convert sample data to JSON string
      type: "application/json"
    }
  };

  // Call the doPost function with the simulated request
  const result = doPost(e);

  // Log the result
  Logger.log(result.getContent());
}

function testUpdateStatus() {
    // Simulate the payload for updating the status
    const payload = {
        jobTitle: "Software Engineer", // Replace with an existing job title in your sheet
        companyName: "Tech Corp", // Replace with an existing company name in your sheet
        status: "Selected for Interview" // New status to update
    };

    // Convert the payload to a JSON string
    const jsonPayload = JSON.stringify(payload);

    // Simulate a POST request
    const mockRequest = {
        postData: {
            contents: jsonPayload,
            type: "application/json"
        },
        pathInfo: "updateStatus" // Ensure this matches the path in your doPost function
    };

    // Call the doPost function with the mock request
    const response = doPost(mockRequest);

    // Log the response
    Logger.log("Response from doPost: " + response.getContent());
}

function testUpdateStatusMultiple() {
    // Simulate the payload for updating the status
    const payload = {
        jobTitle: "Software Engineer", // Replace with an existing job title in your sheet
        companyName: "Tech Corp", // Replace with an existing company name in your sheet
        status: "Selected for Interview" // New status to update
    };

    // Convert the payload to a JSON string
    const jsonPayload = JSON.stringify(payload);

    // Simulate a POST request
    const mockRequest = {
        postData: {
            contents: jsonPayload,
            type: "application/json"
        },
        pathInfo: "updateStatus" // Ensure this matches the path in your doPost function
    };

    // Call the doPost function with the mock request
    const response = doPost(mockRequest);

    // Log the response
    Logger.log("Response from doPost: " + response.getContent());

    // Verify the updated status in the sheet
    const sheetId = "SHEET_ID"; // Replace with your actual sheet ID
    const sheetName = "Sheet1"; // Replace with your sheet name
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);

    if (!sheet) {
        Logger.log("Sheet not found. Please check the sheet name.");
        return;
    }

    const range = sheet.getDataRange();
    const values = range.getValues();

    // Log all rows with the same job title and company name
    Logger.log("Rows with job title '" + payload.jobTitle + "' and company name '" + payload.companyName + "':");
    for (let i = 1; i < values.length; i++) {
        const rowJobTitle = values[i][1]; // Job Title is in column B (index 1)
        const rowCompanyName = values[i][2]; // Company Name is in column C (index 2)
        const rowStatus = values[i][10]; // Status is in column K (index 10)

        if (rowJobTitle === payload.jobTitle && rowCompanyName === payload.companyName) {
            Logger.log("Row " + i + ": Status = " + rowStatus);
        }
    }
}

function testUpdateStatustest() {
    // Simulate the payload for updating the status
    const payload = {
        jobTitle: "Software Engineer", // Replace with an existing job title in your sheet
        companyName: "Akshay", // Replace with an existing company name in your sheet
        status: "Selected for Interview" // New status to update
    };

    // Convert the payload to a JSON string
    const jsonPayload = JSON.stringify(payload);

    // Simulate a POST request
    const mockRequest = {
        postData: {
            contents: jsonPayload,
            type: "application/json"
        },
        pathInfo: "updateStatus" // Ensure this matches the path in your doPost function
    };

    // Call the doPost function with the mock request
    const response = doPost(mockRequest);

    // Log the response
    Logger.log("Response from doPost: " + response.getContent());

    // Verify the updated status in Sheet 1 and Sheet 2
    const sheetId = "SHEET_ID"; // Replace with your actual sheet ID
    const sheet1 = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet1");
    const sheet2 = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet2");

    if (!sheet1 || !sheet2) {
        Logger.log("Sheet not found. Please check the sheet names.");
        return;
    }

    // Log all rows in Sheet 1 with the same job title and company name
    Logger.log("Rows in Sheet 1 with job title '" + payload.jobTitle + "' and company name '" + payload.companyName + "':");
    const sheet1Range = sheet1.getDataRange();
    const sheet1Values = sheet1Range.getValues();
    for (let i = 1; i < sheet1Values.length; i++) {
        const rowJobTitle = sheet1Values[i][1]; // Job Title is in column B (index 1)
        const rowCompanyName = sheet1Values[i][2]; // Company Name is in column C (index 2)
        const rowStatus = sheet1Values[i][10]; // Status is in column K (index 10)

        if (rowJobTitle === payload.jobTitle && rowCompanyName === payload.companyName) {
            Logger.log("Row " + i + ": Status = " + rowStatus);
        }
    }

    // Log all rows in Sheet 2 with the same job title and company name
    Logger.log("Rows in Sheet 2 with job title '" + payload.jobTitle + "' and company name '" + payload.companyName + "':");
    const sheet2Range = sheet2.getDataRange();
    const sheet2Values = sheet2Range.getValues();
    for (let i = 1; i < sheet2Values.length; i++) {
        const rowJobTitle = sheet2Values[i][1]; // Job Title is in column B (index 1)
        const rowCompanyName = sheet2Values[i][2]; // Company Name is in column C (index 2)
        const rowStatus = sheet2Values[i][10]; // Status is in column K (index 10)
        const statusChangedDate = sheet2Values[i][11]; // Status Changed Date is in column L (index 11)
        const rejectedStatus = sheet2Values[i][12]; // Rejected Status is in column M (index 12)
        const rejectedDate = sheet2Values[i][13]; // Rejected Date is in column N (index 13)

        if (rowJobTitle === payload.jobTitle && rowCompanyName === payload.companyName) {
            Logger.log("Row " + i + ": Status = " + rowStatus + ", Status Changed Date = " + statusChangedDate + ", Rejected Status = " + rejectedStatus + ", Rejected Date = " + rejectedDate);
        }
    }
}


function testUpdateStatus11() {
    // Simulate the payload for updating the status
    const payload = {
        jobTitle: "Software Engineer", // Replace with an existing job title in your sheet
        companyName: "Tech Corp", // Replace with an existing company name in your sheet
        status: "Rejected" // New status to update
    };

    // Convert the payload to a JSON string
    const jsonPayload = JSON.stringify(payload);

    // Simulate a POST request
    const mockRequest = {
        postData: {
            contents: jsonPayload,
            type: "application/json"
        },
        pathInfo: "updateStatus" // Ensure this matches the path in your doPost function
    };

    // Call the doPost function with the mock request
    const response = doPost(mockRequest);

    // Log the response
    Logger.log("Response from doPost: " + response.getContent());

    // Verify the updated status in Sheet 1 and Sheet 2
    const sheetId = "109OwmlyQyvcmYcysWt2dW5TuEDefx9n-vSHVxAzh5jo"; // Replace with your actual sheet ID
    const sheet1 = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet1");
    const sheet2 = SpreadsheetApp.openById(sheetId).getSheetByName("Sheet2");

    if (!sheet1 || !sheet2) {
        Logger.log("Sheet not found. Please check the sheet names.");
        return;
    }

    // Log all rows in Sheet 1 with the same job title and company name
    Logger.log("Rows in Sheet 1 with job title '" + payload.jobTitle + "' and company name '" + payload.companyName + "':");
    const sheet1Range = sheet1.getDataRange();
    const sheet1Values = sheet1Range.getValues();
    for (let i = 1; i < sheet1Values.length; i++) {
        const rowJobTitle = sheet1Values[i][1]; // Job Title is in column B (index 1)
        const rowCompanyName = sheet1Values[i][2]; // Company Name is in column C (index 2)
        const rowStatus = sheet1Values[i][10]; // Status is in column K (index 10)
        const statusChangedDate = sheet1Values[i][11]; // Status Changed Date is in column L (index 11)

        if (rowJobTitle === payload.jobTitle && rowCompanyName === payload.companyName) {
            Logger.log("Row " + i + ": Status = " + rowStatus + ", Status Changed Date = " + statusChangedDate);
        }
    }

    // Log all rows in Sheet 2 with the same job title and company name
    Logger.log("Rows in Sheet 2 with job title '" + payload.jobTitle + "' and company name '" + payload.companyName + "':");
    const sheet2Range = sheet2.getDataRange();
    const sheet2Values = sheet2Range.getValues();
    for (let i = 1; i < sheet2Values.length; i++) {
        const rowJobTitle = sheet2Values[i][1]; // Job Title is in column B (index 1)
        const rowCompanyName = sheet2Values[i][2]; // Company Name is in column C (index 2)
        const rowStatus = sheet2Values[i][10]; // Status is in column K (index 10)
        const statusChangedDate = sheet2Values[i][11]; // Status Changed Date is in column L (index 11)
        const rejectedStatus = sheet2Values[i][12]; // Rejected Status is in column M (index 12)
        const rejectedDate = sheet2Values[i][13]; // Rejected Date is in column N (index 13)

        if (rowJobTitle === payload.jobTitle && rowCompanyName === payload.companyName) {
            Logger.log("Row " + i + ": Status = " + rowStatus + ", Status Changed Date = " + statusChangedDate + ", Rejected Status = " + rejectedStatus + ", Rejected Date = " + rejectedDate);
        }
    }
}
