// certificate.js
export function generateCertificate(pageLoadTime, sessionStartTime, sessionEndTime, score, wave, promptSelect, vocabData, amalgamateVocab, coveredTerms, calculateWPM, calculateAccuracy, calculateTermAccuracy) {
  const name = prompt('Enter your name for the report:');
  if (!name || name.trim() === '') {
    alert('Please enter a valid name to generate the report.');
    return;
  }
  const safeName = escapeHtml(name);
  const wpm = calculateWPM(sessionStartTime, sessionEndTime, score);
  const charAccuracy = calculateAccuracy(totalChars, correctChars);
  const termAccuracy = calculateTermAccuracy(coveredTerms);
  const promptTypeText = escapeHtml(promptSelect.options[promptSelect.selectedIndex]?.text || 'Unknown');
  const totalTerms = vocabData.length + (amalgamateVocab.length > 0 ? amalgamateVocab.length : 0);
  const termsCoveredCount = coveredTerms.size;
  const allTermsCompleted = termsCoveredCount === totalTerms;

  const now = new Date();
  const elapsedSincePageLoad = performance.now() - pageLoadTime;
  const pageLoadDate = new Date(now.getTime() - elapsedSincePageLoad);
  let startDate = 'N/A', endDate = 'N/A';
  if (sessionStartTime !== null) startDate = new Date(pageLoadDate.getTime() + sessionStartTime).toLocaleString();
  if (sessionEndTime !== null) endDate = new Date(pageLoadDate.getTime() + sessionEndTime).toLocaleString();
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
      <tr><td>${escapeHtml(term)}</td><td>${escapeHtml(status)}</td></tr>`;
  }
  if (!termsTableRows) termsTableRows = '<tr><td colspan="2">No terms covered.</td></tr>';

  const certificateContent = `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KappType Performance Report</title><style>body{font-family:Arial,sans-serif;margin:40px;line-height:1.6;text-align:center;}h1{color:#333;}.certificate{border:2px solid #333;padding:20px;max-width:800px;margin:0 auto;background-color:#f9f9f9;}table{width:100%;border-collapse:collapse;margin:20px 0;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background-color:#f2f2f2;}.stats{margin:20px 0;text-align:left;display:inline-block;}.stats p{margin:5px 0;}.completion-status{font-weight:bold;color:${allTermsCompleted?'green':'red'};}@media print{body{margin:0;}.certificate{border:none;background-color:white;}}</style></head><body><div class="certificate"><h1>KappType Performance Report</h1><h2>Certificate of Achievement</h2><p>This certifies that <strong>${safeName}</strong> has completed a session in KappType with the following results:</p><div class="stats"><p><strong>Prompt Type:</strong> ${promptTypeText}</p><p><strong>Typing Speed:</strong> ${wpm} WPM</p><p><strong>Character Accuracy:</strong> ${charAccuracy}%</p><p><strong>Term Accuracy:</strong> ${termAccuracy}%</p><p><strong>Wave Reached:</strong> ${wave}</p><p><strong>Total Time:</strong> ${durationStr}</p><p><strong>Score:</strong> ${score}</p></div><h3>Terms Covered</h3><table><thead><tr><th>Term</th><th>Status</th></tr></thead><tbody>${termsTableRows}</tbody></table><p><strong>Total Terms Covered:</strong> ${termsCoveredCount} out of ${totalTerms}</p><p class="completion-status">${allTermsCompleted?'Congratulations! All terms in the set were covered.':'Not all terms were covered in this session.'}</p><p><strong>Session Start:</strong> ${startDate}</p><p><strong>Session End:</strong> ${endDate}</p><p><strong>Awarded on:</strong> ${new Date().toLocaleString()}</p></div></body></html>`;

  const blob = new Blob([certificateContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kapp-type-report.html';
  a.click();
  URL.revokeObjectURL(url);
  alert('Performance report downloaded as an HTML file. Open it in a browser to view or print it (use Ctrl+P or Cmd+P to print).');
}

export function escapeHtml(str) {
  if (!str) return 'None';
  return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '\'');
}
