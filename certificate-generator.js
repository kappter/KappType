export function generateCertificate(score, wave, correctTermsCount, wpm) {
  console.log('Generating certificate with:', { score, wave, correctTermsCount, wpm });

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#00c4b4';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Title
  ctx.font = 'bold 40px Orbitron';
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.fillText('KappType Achievement Certificate', canvas.width / 2, 100);

  // Stats
  ctx.font = '24px Roboto';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, 200);
  ctx.fillText(`Wave: ${wave}`, canvas.width / 2, 250);
  ctx.fillText(`Terms Completed: ${correctTermsCount}`, canvas.width / 2, 300);
  ctx.fillText(`Recent WPM: ${wpm}`, canvas.width / 2, 350);

  // Date
  const date = new Date().toLocaleDateString();
  ctx.font = '18px Roboto';
  ctx.fillText(`Date: ${date}`, canvas.width / 2, 450);

  // Download
  const link = document.createElement('a');
  link.download = `KappType_Certificate_${date}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();

  console.log('Certificate generated and downloaded');
}