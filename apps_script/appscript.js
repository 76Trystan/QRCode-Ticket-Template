function doGet(e) {
  // Check if ticket ID is provided
  var ticketId = e.parameter.id;
  if (!ticketId) {
    return HtmlService.createHtmlOutput("<h2>No ticket ID provided!</h2>");
  }

  // Spreadsheet setup
  var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID"; // Replace with your sheet ID
  var SHEET_NAME = "Tickets"; // Adjust if needed
  var COL_TICKET_ID = 1; // Column A
  var COL_NAME = 2;      // Column B
  var COL_STATUS = 4;    // Column D

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  // Lock for atomic access
  var lock = LockService.getDocumentLock();
  if (!lock.tryLock(5000)) { // Wait up to 5 seconds
    return HtmlService.createHtmlOutput("<h2>Server busy, please try again!</h2>");
  }

  try {
    // Get all data
    var data = sheet.getDataRange().getValues();

    // Find the row with the ticket ID
    var rowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][COL_TICKET_ID - 1]) === ticketId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return HtmlService.createHtmlOutput("<h2>Ticket not found!</h2>");
    }

    // Check status
    var statusCell = sheet.getRange(rowIndex + 1, COL_STATUS);
    var status = statusCell.getValue();

    if (status === "Checked In") {
      return HtmlService.createHtmlOutput("<h2>Ticket already used!</h2>");
    }

    // Mark as checked in
    statusCell.setValue("Checked In");

    // Sanitize user name to prevent XSS
    var userName = String(data[rowIndex][COL_NAME - 1])
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return HtmlService.createHtmlOutput("<h2>Ticket valid! Welcome, " + userName + "!</h2>");

  } finally {
    lock.releaseLock(); // Always release lock
  }
}
