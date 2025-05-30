export async function populateVocabDropdown(vocabSelect, amalgamateSelect) {
  console.log('populateVocabDropdown started');

  try {
    vocabSelect.innerHTML = '<option value="">Select Vocabulary</option>';
    amalgamateSelect.innerHTML = '<option value="">None</option>';

    console.log('Clearing dropdowns');

    const response = await fetch('https://api.github.com/repos/kappter/vocab-sets/contents');
    if (!response.ok) {
      throw new Error(`Failed to fetch vocab sets: ${response.status}`);
    }

    const files = await response.json();
    const vocabFiles = files
      .filter(file => file.name.endsWith('.csv'))
      .map(file => ({
        name: file.name.replace('.csv', ''),
        url: file.download_url
      }));

    console.log(`Populating dropdowns with ${vocabFiles.length} files`);

    vocabFiles.forEach(file => {
      const option = document.createElement('option');
      option.value = file.url;
      option.textContent = file.name;
      vocabSelect.appendChild(option);

      const amalgamateOption = document.createElement('option');
      amalgamateOption.value = file.url;
      amalgamateOption.textContent = file.name;
      amalgamateSelect.appendChild(amalgamateOption);

      console.log(`Added ${file.name} to dropdowns`);
    });

    console.log('populateVocabDropdown completed');
  } catch (error) {
    console.error('Error in populateVocabDropdown:', error);
    vocabSelect.innerHTML = '<option value="">Default Vocabulary</option>';
    amalgamateSelect.innerHTML = '<option value="">None</option>';
  }
}

export async function loadVocab(vocabUrl, isAmalgamate, vocabData, amalgamateVocab, vocabSelect, amalgamateSelect, loadingIndicator, startButton, defaultVocabData) {
  console.log(`loadVocab started for ${vocabUrl}, isAmalgamate: ${isAmalgamate}`);

  loadingIndicator.classList.remove('hidden');
  startButton.disabled = true;

  let vocab = [];
  let setName = 'Default';

  try {
    if (!vocabUrl) {
      console.log('No vocab URL provided, using default vocabulary');
      vocab = defaultVocabData;
      setName = 'Default Vocabulary';
    } else {
      const response = await fetch(vocabUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch vocab from ${vocabUrl}: ${response.status}`);
      }
      const csvText = await response.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            if (results.errors.length > 0) {
              console.error('Papa Parse errors:', results.errors);
              reject(new Error('Failed to parse CSV'));
              return;
            }

            vocab = results.data.filter(row => row.Term && row.Definition);
            setName = vocabUrl.split('/').pop().replace('.csv', '');
            console.log(`Loaded ${vocab.length} terms from ${vocabUrl}`);

            loadingIndicator.classList.add('hidden');
            startButton.disabled = false;

            resolve({ vocab, vocabSetName: setName, amalgamateSetName: isAmalgamate ? setName : '' });
          },
          error: error => {
            console.error('Papa Parse error:', error);
            reject(error);
          }
        });
      });
    }
  } catch (error) {
    console.error('Error loading vocab:', error);
    vocab = defaultVocabData;
    setName = 'Default Vocabulary';
    loadingIndicator.classList.add('hidden');
    startButton.disabled = false;
  }

  loadingIndicator.classList.add('hidden');
  startButton.disabled = false;
  return { vocab, vocabSetName: setName, amalgamateSetName: isAmalgamate ? setName : '' };
}