// ... (all previous code up to generateCertificate remains unchanged)

function generateCertificate() {
  const name = prompt('Enter your name for the certificate:');
  if (!name) return;
  const safeName = name.replace(/[\{\}\\\$%#&~_]/g, ''); // Sanitize input
  const wpm = calculateWPM();
  const accuracy = calculateAccuracy();
  const certificateContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}
\\usepackage{titling}
\\usepackage{noto}

\\title{KappType Certificate}
\\author{}
\\date{}

\\begin{document}

\\maketitle
\\vspace{2cm}

\\begin{center}
  \\Large{\\textbf{Certificate of Achievement}}
  \\vspace{1cm}
  \\normalsize{This certifies that}
  \\vspace{0.5cm}
  \\Large{\\textbf{${safeName}}}
  \\vspace{0.5cm}
  \\normalsize{has successfully completed a session in KappType with the following results:}
  \\vspace{1cm}
  \\begin{tabular}{ll}
    Typing Speed: & ${wpm} WPM \\\\
    Accuracy: & ${accuracy}\\% \\\\
    Wave Reached: & ${wave} \\\\
    Total Time: & ${totalTime} seconds \\\\
    Missed Terms: & ${missedWords.length > 0 ? missedWords.join(', ') : 'None'} \\\\
    Score: & ${score} \\\\
  \\end{tabular}
  \\vspace{2cm}
  \\normalsize{Awarded on ${new Date().toLocaleDateString()}}
\\end{center}

\\end{document}
  `;

  // Download .tex file as fallback
  const blob = new Blob([certificateContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'certificate.tex';
  a.click();
  URL.revokeObjectURL(url);

  alert('Certificate .tex file downloaded. Upload it to your Overleaf project (https://www.overleaf.com/project) to compile it into a PDF, or check your GitHub repository (https://github.com/kappter/KappType) for the synced version.');
}

// ... (all code after generateCertificate remains unchanged)