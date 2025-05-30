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
      ${escapeTex(term)} & ${escapeTex(status)} \\\\
      \\hline
    `;
  }
  if (!termsTableRows) termsTableRows = 'No terms covered. \\\\ \\hline';

  const certificateContent = `
\\documentclass{article}
\\usepackage{geometry}
\\usepackage{booktabs}
\\geometry{a4paper, margin=1in}
\\begin{document}
\\begin{center}
\\textbf{\\Large KappType Performance Report}\\\\
\\vspace{0.5cm}
\\textbf{\\large Certificate of Achievement}\\\\
\\vspace{0.5cm}
This certifies that \\textbf{${escapeTex(safeName)}} has completed a session in KappType with the following results:
\\end{center}
\\vspace{0.3cm}
\\begin{itemize}
  \\item Prompt Type: ${escapeTex(promptTypeText)}
  \\item Typing Speed: ${wpm} WPM
  \\item Character Accuracy: ${charAccuracy}\\%
  \\item Term Accuracy: ${termAccuracy}\\%
  \\item Wave Reached: ${wave}
  \\item Total Time: ${escapeTex(durationStr)}
  \\item Score: ${score}
\\end{itemize}
\\vspace{0.3cm}
\\textbf{Terms Covered}\\\\
\\begin{tabular}{|l|l|}
  \\hline
  \\textbf{Term} & \\textbf{Status} \\\\
  \\hline
  ${termsTableRows}
\\end{tabular}\\\\
\\vspace{0.3cm}
Total Terms Covered: ${termsCoveredCount} out of ${totalTerms}\\\\
${allTermsCompleted ? 'Congratulations! All terms in the set were covered.' : 'Not all terms were covered in this session.'}\\\\
Session Start: ${escapeTex(startDate)}\\\\
Session End: ${escapeTex(endDate)}\\\\
Awarded on: ${escapeTex(new Date().toLocaleString())}
\\end{document}
  `;

  const blob = new Blob([certificateContent], { type: 'text/x-tex' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kapp-type-report.tex';
  a.click();
  URL.revokeObjectURL(url);
  alert('Performance report downloaded as a .tex file. Compile it in Overleaf (https://www.overleaf.com/) to generate a PDF.');
}

export function escapeHtml(str) {
  if (!str) return 'None';
  return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '\'');
}

export function escapeTex(str) {
  if (!str) return 'None';
  return str.replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/\$/g, '\\$').replace(/#/g, '\\#').replace(/_/g, '\\_')
    .replace(/{/g, '\\{').replace(/}/g, '\\}').replace(/~/g, '\\textasciitilde{}').replace(/\^/g, '\\textasciicircum{}')
    .replace(/\\/g, '\\textbackslash{}');
}