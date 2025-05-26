// dataLoader.js
export function populateVocabDropdown(vocabSelect, amalgamateSelect) {
  const baseUrl = 'https://raw.githubusercontent.com/kappter/vocab-sets/main/';
  const files = [
    'Exploring_Computer_Science_Vocabulary', 'Periodic_Table_Elements', 'Study_Skills_High_School',
    // ... (rest of the files list)
    'common_us_side_dishes'
  ];
  vocabSelect.innerHTML = '<option value="">[Embedded Vocabulary - 53 Computer Science Terms]</option>';
  amalgamateSelect.innerHTML = '<option value="">[None]</option>';
  files.forEach(file => {
    const option1 = document.createElement('option');
    option1.value = baseUrl + file + '.csv';
    option1.textContent = file;
    vocabSelect.appendChild(option1);
    const option2 = document.createElement('option');
    option2.value = baseUrl + file + '.csv';
    option2.textContent = file;
    amalgamateSelect.appendChild(option2);
  });
}

export function validateCsvUrl(url) {
  return url.includes('github.com') || url.endsWith('.csv') || url.startsWith('/');
}

export function loadVocab(csvUrl, isAmalgamate, vocabData, amalgamateVocab, vocabSelect, amalgamateSelect, loadingIndicator, startButton) {
  return new Promise((resolve) => {
    const targetArray = isAmalgamate ? amalgamateVocab : vocabData;
    const setName = isAmalgamate ? amalgamateSelect.options[amalgamateSelect.selectedIndex].textContent : vocabSelect.options[vocabSelect.selectedIndex].textContent;
    targetArray.length = 0;

    if (!csvUrl) {
      if (!isAmalgamate) {
        vocabData = [...defaultVocabData];
        vocabSetName = setName || 'Embedded Vocabulary - 53 Computer Science Terms';
      } else amalgamateSetName = '';
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      resolve();
      return;
    }

    // ... (rest of loadVocab logic, simplified for brevity)
    // Implement full fetch and Papa.parse logic here
  });
}

export function loadCustomVocab(file, isAmalgamate, vocabData, amalgamateVocab, loadingIndicator, startButton) {
  return new Promise((resolve) => {
    const targetArray = isAmalgamate ? amalgamateVocab : vocabData;
    const setName = file.name.replace(/\.csv$/, '');
    targetArray.length = 0;

    // ... (rest of loadCustomVocab logic, simplified for brevity)
    // Implement full Papa.parse logic here
  });
}
