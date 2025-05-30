export async function loadVocab(url, isAmalgamate, vocabData, amalgamateVocab, vocabSelect, amalgamateSelect, loadingIndicator, startButton, defaultVocabData) {
  console.log(`Loading vocab from ${url}, isAmalgamate: ${isAmalgamate}`);
  if (!url) {
    console.log('No URL provided, returning empty vocab');
    return isAmalgamate ? { vocab: [], amalgamateSetName: 'None' } : { vocab: defaultVocabData, vocabSetName: 'Default' };
  }

  loadingIndicator.classList.remove('hidden');
  startButton.disabled = true;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const result = Papa.parse(text, {
      header: true,
      transformHeader: header => {
        // Normalize headers to match expected schema
        if (header.toLowerCase() === 'term') return 'Term';
        if (header.toLowerCase() === 'definition') return 'Definition';
        return header;
      }
    });
    const data = result.data.filter(row => row.Term && row.Definition);
    console.log(`Parsed ${data.length} terms from ${url}`);
    const setName = new URL(url).pathname.split('/').pop().replace('.csv', '');
    return isAmalgamate ? { vocab: data, amalgamateSetName: setName } : { vocab: data, vocabSetName: setName };
  } catch (error) {
    console.error(`Error loading vocab from ${url}:`, error);
    alert(`Failed to load ${url}. Using default vocabulary.`);
    return isAmalgamate ? { vocab: [], amalgamateSetName: 'None' } : { vocab: defaultVocabData, vocabSetName: 'Default' };
  } finally {
    loadingIndicator.classList.add('hidden');
    startButton.disabled = false;
  }
}

export function populateVocabDropdown(vocabSelect, amalgamateSelect) {
  console.log('Populating vocab dropdowns');
  // List of CSV files in vocab-sets folder (update this list with your actual files)
  const vocabSets = [
    { name: 'Guitar Techniques', url: '/vocab-sets/Guitar_Techniques.csv' },
    // Add more CSV files here, e.g.:
    // { name: 'Music Theory', url: '/vocab-sets/Music_Theory.csv' },
    // { name: 'Scales', url: '/vocab-sets/Scales.csv' },
  ];

  vocabSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';
  amalgamateSelect.innerHTML = '<option value="" disabled selected>Loading...</option>';

  vocabSets.forEach(set => {
    const option = document.createElement('option');
    option.value = set.url;
    option.textContent = set.name;
    vocabSelect.appendChild(option);
    const amalgamateOption = document.createElement('option');
    amalgamateOption.value = set.url;
    amalgamateOption.textContent = set.name;
    amalgamateSelect.appendChild(amalgamateOption);
  });

  // Add "None" option for amalgamateSelect
  const noneOption = document.createElement('option');
  noneOption.value = '';
  noneOption.textContent = 'None';
  amalgamateSelect.insertBefore(noneOption, amalgamateSelect.firstChild);
  amalgamateSelect.value = '';

  // Remove "Loading..." placeholder after population
  vocabSelect.querySelector('option[value=""]').remove();
  amalgamateSelect.querySelector('option[value=""]').remove();
  vocabSelect.insertBefore(noneOption.cloneNode(true), vocabSelect.firstChild);
  vocabSelect.value = vocabSets[0]?.url || '';
}