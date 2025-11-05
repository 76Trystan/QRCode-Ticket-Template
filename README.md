# QR-Code Ticket Confirmation Template

This is a simple HTML template page for a ticket purchase completion email. It demonstrates a purchase completion confirmation page including a ticket ID and a QR code for entry. This is meant to be attachable to any excel/sheets list.

## Overview

When a user completes a ticket purchase, this page displays:

- A personalized greeting.
- The event name.
- The unique ticket ID.
- A QR code that can be scanned at the event.
- A confirmation message from the event team.

## Ticket Scanning Instructions (For Event Staff)

To check in attendees using iPhones & Google Sheets:

## Requirements

- A Google Sheet with ticket data
- Any QR Scanner App
- Basic Google account access for deploying the script
- Signed into google account you will be accessing from

---

## Google Sheet Setup

Your Google Sheet should roughly have the following columns:

| Ticket ID | Name     | Email            | Status       |
|-----------|----------|------------------|--------------|
| 12345     | Name1    | name1@email.com  | (Leave blank) |
| 67890     | Name2    | name2@email.com  | (Leave blank) |

- **Ticket ID**: Unique ID for each ticket.
- **Status**: Will be marked as "Checked In" when scanned.

---

## Apps Script Setup

1. Open your Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Delete any existing code and paste in the code below.

```javascript
function doGet(e) {
  var ticketId = e.parameter.id;
  if (!ticketId) {
    return HtmlService.createHtmlOutput("<h2>No ticket ID provided!</h2>");
  }
  
  var lock = LockService.getDocumentLock(); // Lock sheet for atomic access
  lock.waitLock(2000); // Wait up to 2 seconds for other processes to finish
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Tickets"); // Sheet name // change as needed
    var data = sheet.getDataRange().getValues();


    // these columns can be adjusted based on your sheet structure
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == ticketId) { // Ticket ID in column A
        var status = data[i][3]; // Status in column D
        if (status == "Checked In") {
          return HtmlService.createHtmlOutput("<h2>Ticket already used!</h2>");
        } else {
          sheet.getRange(i+1, 4).setValue("Checked In");
          return HtmlService.createHtmlOutput("<h2>Ticket valid! Welcome, " + data[i][1] + "</h2>");
        }
      }
    }
    return HtmlService.createHtmlOutput("<h2>Ticket not found!</h2>");
    
  } finally {
    lock.releaseLock(); // Always release lock
  }
}
```
4. Click Deploy -> New Deployment -> Web App
5. Set Execute: Me
6. Set Who can access: Anyone with a link
7. Click Deploy and copy the deploy ID and paste it into the section in the HTML below called "DEPLOY_ID"

> Tip: Make sure the scanner has good lighting and the QR code is fully visible for faster scanning.

## File

- `ticket_confirmation.html` — The main HTML file containing the ticket confirmation page.

## Usage

1. Open `ticket_confirmation.html` in a web browser to see a sample ticket confirmation page.
2. In a ticketing system (like UniOne), copy the **HTML body content** (without `<html>`, `<head>`, or `<body>` tags) into the **purchase completion HTML tab**.
3. Replace static values with dynamic placeholders if your system supports them:
   - `John` → `{first_name}`
   - `ABC123XYZ` → `{ticket_id}`

### Example Body Content for Completion Email

```html
<h2>Your Ticket Confirmation – Insert Event Name</h2>

<p>Hi {first_name},</p>
<p>Thank you for purchasing a ticket to <strong>Inset Event Name</strong>!</p>

<div style="margin:20px 0; padding:15px; background:#fff; border:1px solid #ccc; border-radius:8px;">
  <p><strong>Ticket ID:</strong> {ticket_id}</p>
</div>

<div style="margin:20px 0; text-align:center;">
  <p>Please present this QR code to the events team at the door for entry:</p>
  <img 
    src="hhttps://script.google.com/macros/s/DEPLOY_ID/exec?id={{ticket_id}}"
    alt="Ticket QR Code">
</div>

<p>We look forward to seeing you there!</p>
<p>– The Events Team</p>
