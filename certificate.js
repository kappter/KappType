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
  if (sessionStartTime !== null) startDate = new Date(pageLoadDate.getTime() + sessionStartTime).toLocaleString();
  if (sessionEndTime !== null) endDate = new Date(pageLoadDate.getTime() + sessionEndTime).toLocaleString();
  else endDate = new Date().toLocaleString();
  const durationMs = (sessionEndTime || performance.now()) - (sessionStartTime || performance.now());
  const durationSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;
  const durationStr = `${hours}h ${minutes}m ${seconds}s`;

  // Initialize jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set fonts and colors
  doc.setFont('Helvetica');
  doc.setFontSize(20);
  doc.setTextColor(0, 100, 100); // Cyan-like color

  // Title
  doc.text('KappType Performance Report', 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Certificate of Achievement', 105, 30, { align: 'center' });

  // Certificate text
  doc.setFontSize(12);
  doc.text(`This certifies that ${safeName} has completed a session in KappType with the following results:`, 20, 50);

  // Results
  const results = [
    `Prompt Type: ${promptTypeText}`,
    `Typing Speed: ${lastWPM} WPM`,
    `Character Accuracy: ${charAccuracy}%`,
    `Term Accuracy: ${termAccuracy}%`,
    `Wave Reached: ${wave}`,
    `Total Time: ${durationStr}`,
    `Score: ${score}`
  ];
  let y = 70;
  results.forEach(line => {
    doc.text(line, 20, y);
    y += 10;
  });

  // Terms Covered Table
  doc.setFontSize(14);
  doc.text('Terms Covered', 20, y);
  y += 10;
  doc.setFontSize(10);
  doc.setDrawColor(0);
  doc.setFillColor(200, 200, 200);
  doc.rect(20, y, 170, 8, 'F');
  doc.text('Term', 22, y + 6);
  doc.text('Status', 150, y + 6);
  y += 8;

  let termsTableRows = [];
  for (const [term, status] of coveredTerms.entries()) {
    termsTableRows.push([term, status]);
  }
  if (termsTableRows.length === 0) {
    doc.text('No terms covered.', 22, y + 6);
    y += 10;
  } else {
    termsTableRows.forEach(([term, status]) => {
      doc.text(term, 22, y + 6);
      doc.text(status, 150, y + 6);
      doc.line(20, y + 8, 190, y + 8);
      y += 10;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });
  }

  // Summary
  doc.setFontSize(12);
  doc.text(`Total Terms Covered: ${termsCoveredCount} out of ${totalTerms}`, 20, y);
  y += 10;
  doc.text(
    allTermsCompleted ? 'Congratulations! All terms in the set were covered.' : 'Not all terms were covered in this session.',
    20,
    y
  );
  y += 10;
  doc.text(`Session Start: ${startDate}`, 20, y);
  y += 10;
  doc.text(`Session End: ${endDate}`, 20, y);
  y += 10;
  doc.text(`Awarded on: ${new Date().toLocaleString()}`, 20, y);

  // Save the PDF
  doc.save('kapp-type-report.pdf');
  alert('Performance report downloaded as a PDF.');
}

export function escapeHtml(str) {
  if (!str) return 'None';
  return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '\'');
}

export function calculateAccuracy(totalChars, correctChars) {
  if (totalChars === 0) return 0;
  return Math.round((correctChars / totalChars) * 100);
}

export function calculateTermAccuracy(coveredTerms) {
  if (coveredTerms.size === 0) return 0;
  const correctCount = Array.from(coveredTerms.values()).filter(status => status === 'Correct').length;
  return Math.round((correctCount / coveredTerms.size) * 100);
}