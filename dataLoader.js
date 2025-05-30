export async function loadVocab(url, isAmalgamate, vocabData, amalgamateVocab, vocabSelect, amalgamateSelect, loadingIndicator, startButton, defaultVocabData) {
  console.log(`Loading vocab from ${url}, isAmalgamate: ${isAmalgamate}`);
  loadingIndicator.classList.remove('hidden');
  startButton.disabled = true;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const result = Papa.parse(text, { header: true });
    const data = result.data.filter(row => row.Term && row.Definition);
    console.log(`Parsed ${data.length} terms from ${url}`);

    if (isAmalgamate) {
      return { vocab: data, amalgamateSetName: new URL(url).pathname.split('/').pop() };
    } else {
      return { vocab: data, vocabSetName: new URL(url).pathname.split('/').pop() };
    }
  } catch (error) {
    console.error(`Error loading vocab from ${url}:`, error);
    return isAmalgamate ? { vocab: [], amalgamateSetName: 'None' } : { vocab: defaultVocabData, vocabSetName: 'Default' };
  } finally {
    loadingIndicator.classList.add('hidden');
    startButton.disabled = false;
  }
}

export function populateVocabDropdown(vocabSelect, amalgamateSelect) {
  console.log('Populating vocab dropdowns');
  const vocabSets = [
    { name: 'Default Vocabulary', url: '' },
    { name: 'Sample Set 1', url: 'https://example.com/vocab1.csv' },
    { name: 'Sample Set 2', url: 'https://example.com/vocab2.csv' }
  ];

  vocabSelect.innerHTML = '';
  amalgamateSelect.innerHTML = '';

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

  const noneOption = document.createElement('option');
  noneOption.value = '';
  noneOption.textContent = 'None';
  amalgamateSelect.insertBefore(noneOption, amalgamateSelect.firstChild);
  amalgamateSelect.value = '';
}