// dataLoader.js
export function populateVocabDropdown(vocabSelect, amalgamateSelect) {
  const baseUrl = 'https://raw.githubusercontent.com/kappter/vocab-sets/main/';
  const files = [
    'Exploring_Computer_Science_Vocabulary', 'Periodic_Table_Elements', 'Study_Skills_High_School',
    // ... (full list of 50+ files)
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

export function loadVocab(csvUrl, isAmalgamate, vocabData, amalgamateVocab, vocabSelect, amalgamateSelect, loadingIndicator, startButton, defaultVocabData) {
  return new Promise((resolve, reject) => {
    const targetArray = isAmalgamate ? amalgamateVocab : vocabData;
    const setName = isAmalgamate ? amalgamateSelect.options[amalgamateSelect.selectedIndex].textContent : vocabSelect.options[vocabSelect.selectedIndex].textContent;
    targetArray.length = 0;

    if (!csvUrl) {
      if (!isAmalgamate) {
        vocabData.length = 0;
        vocabData.push(...defaultVocabData);
        resolve({ vocabSetName: setName || 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
      } else {
        resolve({ vocabSetName: null, amalgamateSetName: '' });
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    if (window.location.protocol === 'file:') {
      alert('Cannot load external CSV files when running via file://. Using embedded vocabulary.');
      if (!isAmalgamate) {
        vocabData.length = 0;
        vocabData.push(...defaultVocabData);
        resolve({ vocabSetName: 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
      } else {
        resolve({ vocabSetName: null, amalgamateSetName: '' });
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    if (!validateCsvUrl(csvUrl)) {
      alert('Invalid CSV URL. Using embedded vocabulary.');
      if (!isAmalgamate) {
        vocabData.length = 0;
        vocabData.push(...defaultVocabData);
        resolve({ vocabSetName: 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
      } else {
        resolve({ vocabSetName: null, amalgamateSetName: '' });
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    if (typeof Papa === 'undefined') {
      alert('Papa Parse library not loaded. Using embedded vocabulary.');
      if (!isAmalgamate) {
        vocabData.length = 0;
        vocabData.push(...defaultVocabData);
        resolve({ vocabSetName: 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
      } else {
        resolve({ vocabSetName: null, amalgamateSetName: '' });
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    loadingIndicator.classList.remove('hidden');
    startButton.disabled = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(csvUrl, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.text();
      })
      .then(data => {
        Papa.parse(data, {
          header: true,
          complete: (results) => {
            clearTimeout(timeoutId);
            targetArray.length = 0;
            const filteredData = results.data.filter(row => row.Term && row.Definition);
            if (filteredData.length === 0) {
              alert(`No valid terms found in the CSV at ${csvUrl}. Using embedded vocabulary.`);
              if (!isAmalgamate) {
                vocabData.length = 0;
                vocabData.push(...defaultVocabData);
                resolve({ vocabSetName: 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
              } else {
                resolve({ vocabSetName: null, amalgamateSetName: '' });
              }
            } else {
              targetArray.push(...filteredData);
              if (isAmalgamate) {
                resolve({ vocabSetName: null, amalgamateSetName: setName });
              } else {
                resolve({ vocabSetName: setName, amalgamateSetName: null });
              }
            }
            loadingIndicator.classList.add('hidden');
            startButton.disabled = false;
          },
          error: (error) => {
            clearTimeout(timeoutId);
            console.error(`Papa Parse error for ${csvUrl}:`, error);
            alert(`Failed to parse CSV at ${csvUrl}. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary.`);
            if (!isAmalgamate) {
              vocabData.length = 0;
              vocabData.push(...defaultVocabData);
              resolve({ vocabSetName: 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
            } else {
              resolve({ vocabSetName: null, amalgamateSetName: '' });
            }
            loadingIndicator.classList.add('hidden');
            startButton.disabled = false;
          }
        });
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.error(`Fetch error for ${csvUrl}:`, error);
        alert(`Failed to load CSV at ${csvUrl}. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary.`);
        if (!isAmalgamate) {
          vocabData.length = 0;
          vocabData.push(...defaultVocabData);
          resolve({ vocabSetName: 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
        } else {
          resolve({ vocabSetName: null, amalgamateSetName: '' });
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
      });
  });
}

export function loadCustomVocab(file, isAmalgamate, vocabData, amalgamateVocab, loadingIndicator, startButton, defaultVocabData) {
  return new Promise((resolve, reject) => {
    const targetArray = isAmalgamate ? amalgamateVocab : vocabData;
    const setName = file.name.replace(/\.csv$/, '');
    targetArray.length = 0;

    if (typeof Papa === 'undefined') {
      alert('Papa Parse library not loaded. Using embedded vocabulary.');
      if (!isAmalgamate) {
        vocabData.length = 0;
        vocabData.push(...defaultVocabData);
        resolve({ vocabSetName: 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
      } else {
        resolve({ vocabSetName: null, amalgamateSetName: '' });
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    loadingIndicator.classList.remove('hidden');
    startButton.disabled = true;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        targetArray.length = 0;
        const filteredData = results.data.filter(row => row.Term && row.Definition);
        if (filteredData.length === 0) {
          alert(`No valid terms found in the uploaded CSV. Using embedded vocabulary.`);
          if (!isAmalgamate) {
            vocabData.length = 0;
            vocabData.push(...defaultVocabData);
            resolve({ vocabSetName: 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
          } else {
            resolve({ vocabSetName: null, amalgamateSetName: '' });
          }
        } else {
          targetArray.push(...filteredData);
          if (isAmalgamate) {
            resolve({ vocabSetName: null, amalgamateSetName: setName });
          } else {
            resolve({ vocabSetName: setName, amalgamateSetName: null });
          }
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
      },
      error: (error) => {
        console.error('Papa Parse error for uploaded file:', error);
        alert(`Failed to parse the uploaded CSV. Error: ${error.message || 'Unknown error'}. Using embedded vocabulary.`);
        if (!isAmalgamate) {
          vocabData.length = 0;
          vocabData.push(...defaultVocabData);
          resolve({ vocabSetName: 'Embedded Vocabulary - 53 Computer Science Terms', amalgamateSetName: '' });
        } else {
          resolve({ vocabSetName: null, amalgamateSetName: '' });
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
      }
    });
  });
}
