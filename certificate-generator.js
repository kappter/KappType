export function generateCertificate(pageLoadTime, sessionStartTime, sessionEndTime, score, wave, promptSelect, vocabData, amalgamateVocab, coveredTerms, lastWPM, totalChars, correctChars) {
  console.log('Generating certificate:', { score, wave, lastWPM });

  const name = prompt('Enter your name for the certificate:');
  if (!name || name.trim() === '') {
    alert('Please enter a valid name to generate the certificate.');
    return;
  }

  const safeName = escapeHtml(name);
  const charAccuracy = calculateAccuracy(totalChars, correctChars);
  const termAccuracy = calculateTermAccuracy(coveredTerms);
  const promptTypeText = escapeHtml(promptSelect.options[promptSelect.selectedIndex]?.text || 'Unknown');
  const totalTerms = vocabData.length + amalgamateVocab.length;
  const termsCoveredCount = coveredTerms.size;
  const allTermsCompleted = termsCoveredCount === totalTerms;

  const now = new Date();
  const elapsedSincePageLoad = performance.now() - pageLoadTime;
  const pageLoadDate = new Date(now.getTime() - elapsedSincePageLoad);
  let startDate = 'N/A', endDate = 'N/A';
  if (sessionStartTime !== 0) startDate = new Date(pageLoadDate.getTime() + sessionStartTime).toLocaleString();
  if (sessionEndTime !== 0) endDate = new Date(pageLoadDate.getTime() + sessionEndTime).toLocaleString();
  else endDate = new Date().toLocaleString();
  const durationMs = (sessionEndTime || performance.now()) - (sessionStartTime || performance.now());
  const durationSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;
  const durationStr = `${hours}h ${minutes}m ${seconds}s`;

  let termsTableRows = '';
  for (const [term, status] of coveredTerms.entries()) {
    termsTableRows += `
      <tr>
        <td>${escapeHtml(term)}</td>
        <td>${escapeHtml(status)}</td>
      </tr>
    `;
  }
  if (!termsTableRows) termsTableRows = '<tr><td colspan="2">No terms covered.</td></tr>';

  const certificateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KappType Certificate</title>
  <style>
    @page {
      size: 8.5in 11in;
      margin: 0.5in;
    }
    body {
      font-family: 'Arial', sans-serif;
      width: 8.25in;
      height: 11in;
      margin: 0 auto;
      padding: 0.5in;
      background: #f4f4f4;
      color: #333;
      box-sizing: border-box;
    }
    .certificate {
      background: #fff;
      border: 5px solid #007bff;
      border-radius: 10px;
      padding: 20px;
      height: 100%;
      text-align: center;
      box-shadow: 0 0 20px rgba(0,0,0,0.2);
    }
    .title {
      font-family: 'Georgia', serif;
      font-size: 36px;
      color: #007bff;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .recipient {
      font-size: 28px;
      font-weight: bold;
      margin: 20px 0;
    }
    .stats {
      font-size: 18px;
      margin: 20px 0;
      text-align: left;
      display: inline-block;
    }
    .stats p {
      margin: 5px 0;
    }
    .table-container {
      margin: 20px 0;
      max-height: 200px;
      overflow-y: auto;
    }
    table {
      background-color: #007bff;
      color: #fff;
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px;
      border: 1px solid #ddd;
    }
    th {
      background-color: #0056b3;
    }
    td {
      background-color: #fff;
      color: #333;
    }
    .summary {
      font-size: 18px;
      margin: 20px 0;
    }
    .dates {
      font-size: 16px;
      margin-top: 20px;
    }
    .print-button {
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 10px 20px;
      background: #007bff;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    @media print {
      .print-button {
        display: none;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .certificate {
        border: none;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="printCertificate()">Print Certificate</button>
  <div class="certificate">
    <h1 class="title">KappType Performance Report</h1>
    <h2 class="subtitle">Certificate of Achievement</h2>
    <p>This certifies that</p>
    <div class="recipient">${safeName}</div>
    <p>has completed a session in KappType with the following results:</p>
    <div class="stats">
      <p><strong>Prompt Type:</strong> ${promptTypeText}</p>
      <p><strong>Recent WPM:</strong> ${lastWPM}</p>
      <p><strong>Character Accuracy:</strong> ${charAccuracy}%</p>
      <p><strong>Term Accuracy:</strong> ${termAccuracy}%</p>
      <p><strong>Wave Reached:</strong> ${wave}</p>
      <p><strong>Total Time:</strong> ${durationStr}</p>
      <p><strong>Score:</strong> ${score}</p>
    </div>
    <div class="terms-covered">
      <h3>Terms Covered</h3>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Term</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${termsTableRows}
          </tbody>
        </table>
      </div>
    </div>
    <div class="summary">
      <p>Total Terms Covered: ${termsCoveredCount} out of ${totalTerms}</p>
      <p>${allTermsCompleted ? 'Congratulations! All terms in the set were covered.' : 'Not all terms were covered in this session.'}</p>
    </div>
    <div class="dates">
      <p><strong>Session Start:</strong> ${startDate}</p>
      <p><strong>Session End:</strong> ${endDate}</p>
      <p><strong>Awarded on:</strong> ${new Date().toLocaleString()}</p>
    </div>
  </div>
  <script>
    function printCertificate() {
      window.print();
    }
  </script>
</body>
</html>
  `;

  const blob = new Blob([certificateHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url);
  if (!newWindow) {
    alert('Please allow pop-ups to view the certificate.');
  }
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) return 0;
  return Math.round((correctChars / totalChars) * 100);
}

export function calculateTermAccuracy(coveredTerms) {
  if (coveredTerms.size === 0) return 0;
  const correctCount = Array.from(coveredTerms.values()).filter(status => status === 'Correct').length;
  return Math.round((correctCount / coveredTerms.size) * 100);
}