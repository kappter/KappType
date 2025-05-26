export function populateVocabDropdown(vocabSelect, amalgamateSelect) {
  console.log('populateVocabDropdown started');
  if (!vocabSelect || !amalgamateSelect) {
    console.error('Dropdown elements missing:', { vocabSelect: !!vocabSelect, amalgamateSelect: !!amalgamateSelect });
    return;
  }

  const baseUrl = 'https://raw.githubusercontent.com/kappter/vocab-sets/main/';
  // Verified files (update after checking https://github.com/kappter/vocab-sets)
  const files = [
    'Study_Skills_High_School',
    'Exploring_Computer_Science_Vocabulary',
    'Periodic_Table_Elements'
  ];

  console.log('Clearing dropdowns');
  vocabSelect.innerHTML = '<option value="">[Default Vocabulary]</option>';
  amalgamateSelect.innerHTML = '<option value="">[None]</option>';

  console.log('Populating dropdowns with', files.length, 'files');
  files.forEach((file, index) => {
    const option1 = document.createElement('option');
    option1.value = baseUrl + file + '.csv';
    option1.textContent = file;
    vocabSelect.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = baseUrl + file + '.csv';
    option2.textContent = file;
    amalgamateSelect.appendChild(option2);

    console.log(`Added ${file} to dropdowns`);
  });

  console.log('populateVocabDropdown completed');
  if (typeof Papa === 'undefined') {
    console.warn('Papa Parse not loaded. CSV parsing may be limited.');
  }
}

export function validateCsvUrl(url) {
  return url.includes('github.com') || url.endsWith('.csv') || url.startsWith('/');
}

export function loadVocab(csvUrl, isAmalgamate, vocabData, amalgamateVocab, vocabSelect, amalgamateSelect, loadingIndicator, startButton, defaultVocabData) {
  console.log(`loadVocab started for ${csvUrl || 'default vocabulary'}, isAmalgamate: ${isAmalgamate}`);
  return new Promise((resolve) => {
    const targetArray = isAmalgamate ? amalgamateVocab : vocabData;
    const setName = isAmalgamate ? amalgamateSelect.options[amalgamateSelect.selectedIndex]?.textContent : vocabSelect.options[vocabSelect.selectedIndex]?.textContent;
    targetArray.length = 0;

    if (!csvUrl) {
      if (!isAmalgamate) {
        vocabData.push(...defaultVocabData);
        console.log('Using default vocabulary:', vocabData.length, 'terms');
        resolve({ vocab: vocabData, vocabSetName: setName || 'Default Vocabulary', amalgamateSetName: '' });
      } else {
        console.log('No amalgamate vocabulary selected');
        resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    if (window.location.protocol === 'file:') {
      console.warn('Cannot load CSV via file:// protocol');
      alert('Cannot load external CSV files when running via file://. Please host the app on a local server (e.g., python -m http.server) or use default vocabulary.');
      if (!isAmalgamate) {
        vocabData.push(...defaultVocabData);
        resolve({ vocab: vocabData, vocabSetName: 'Default Vocabulary', amalgamateSetName: '' });
      } else {
        resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    if (!validateCsvUrl(csvUrl)) {
      console.warn('Invalid CSV URL:', csvUrl);
      alert('Invalid CSV URL. Using default vocabulary.');
      if (!isAmalgamate) {
        vocabData.push(...defaultVocabData);
        resolve({ vocab: vocabData, vocabSetName: 'Default Vocabulary', amalgamateSetName: '' });
      } else {
        resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
      }
      loadingIndicator.classList.add('hidden');
      startButton.disabled = false;
      return;
    }

    if (typeof Papa === 'undefined') {
      console.warn('Papa Parse not loaded');
      alert('CSV parsing library not loaded. Using default vocabulary.');
      if (!isAmalgamate) {
        vocabData.push(...defaultVocabData);
        resolve({ vocab: vocabData, vocabSetName: 'Default Vocabulary', amalgamateSetName: '' });
      } else {
        resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
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
            const filteredData = results.data
              .map(row => ({
                Term: row.Term || row.term || '',
                Definition: row.Definition || row.definition || ''
              }))
              .filter(row => row.Term && row.Definition);
            if (filteredData.length === 0) {
              console.warn(`No valid terms in ${csvUrl}`);
              alert(`No valid terms found in CSV at ${csvUrl}. Using default vocabulary.`);
              if (!isAmalgamate) {
                vocabData.push(...defaultVocabData);
                resolve({ vocab: vocabData, vocabSetName: 'Default Vocabulary', amalgamateSetName: '' });
              } else {
                resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
              }
            } else {
              targetArray.push(...filteredData);
              console.log(`Loaded ${filteredData.length} terms from ${csvUrl}`);
              if (isAmalgamate) {
                resolve({ vocab: targetArray, vocabSetName: '', amalgamateSetName: setName || '' });
              } else {
                resolve({ vocab: targetArray, vocabSetName: setName || '', amalgamateSetName: '' });
              }
            }
            loadingIndicator.classList.add('hidden');
            startButton.disabled = false;
          },
          error: (error) => {
            clearTimeout(timeoutId);
            console.error(`Papa Parse error for ${csvUrl}:`, error);
            alert(`Failed to parse CSV at ${csvUrl}: ${error.message}. Using default vocabulary.`);
            if (!isAmalgamate) {
              vocabData.push(...defaultVocabData);
              resolve({ vocab: vocabData, vocabSetName: 'Default Vocabulary', amalgamateSetName: '' });
            } else {
              resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
            }
            loadingIndicator.classList.add('hidden');
            startButton.disabled = false;
          }
        });
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.error(`Fetch error for ${csvUrl}:`, error);
        alert(`Failed to load CSV at ${csvUrl}: ${error.message}. Using default vocabulary.`);
        if (!isAmalgamate) {
          vocabData.push(...defaultVocabData);
          resolve({ vocab: vocabData, vocabSetName: 'Default Vocabulary', amalgamateSetName: '' });
        } else {
          resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
      });
  });
}

export function loadCustomVocab(file, isAmalgamate, vocabData, amalgamateVocab, loadingIndicator, startButton, defaultVocabData) {
  console.log(`loadCustomVocab started for file: ${file.name}`);
  return new Promise((resolve) => {
    const targetArray = isAmalgamate ? amalgamateVocab : vocabData;
    const setName = file.name.replace(/\.csv$/, '');
    targetArray.length = 0;

    if (typeof Papa === 'undefined') {
      console.warn('Papa Parse not loaded');
      alert('CSV parsing library not loaded. Using default vocabulary.');
      if (!isAmalgamate) {
        vocabData.push(...defaultVocabData);
        resolve({ vocab: vocabData, vocabSetName: 'Default Vocabulary', amalgamateSetName: '' });
      } else {
        resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
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
        const filteredData = results.data
          .map(row => ({
            Term: row.Term || row.term || '',
            Definition: row.Definition || row.definition || ''
          }))
          .filter(row => row.Term && row.Definition);
        if (filteredData.length === 0) {
          console.warn('No valid terms in uploaded CSV');
          alert('No valid terms found in uploaded CSV. Using default vocabulary.');
          if (!isAmalgamate) {
            vocabData.push(...defaultVocabData);
            resolve({ vocab: vocabData, vocabSetName: 'Default Vocabulary', amalgamateSetName: '' });
          } else {
            resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
          }
        } else {
          targetArray.push(...filteredData);
          console.log(`Loaded ${filteredData.length} terms from uploaded CSV`);
          if (isAmalgamate) {
            resolve({ vocab: targetArray, vocabSetName: '', amalgamateSetName: setName });
          } else {
            resolve({ vocab: targetArray, vocabSetName: setName, amalgamateSetName: '' });
          }
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
      },
      error: (error) => {
        console.error('Papa Parse error for uploaded file:', error);
        alert(`Failed to parse uploaded CSV: ${error.message}. Using default vocabulary.`);
        if (!isAmalgamate) {
          vocabData.push(...defaultVocabData);
          resolve({ vocab: vocabData, vocabSetName: 'Default Vocabulary', amalgamateSetName: '' });
        } else {
          resolve({ vocab: [], vocabSetName: '', amalgamateSetName: '' });
        }
        loadingIndicator.classList.add('hidden');
        startButton.disabled = false;
      }
    });
  });
}