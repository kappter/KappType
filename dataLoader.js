export async function loadVocab(url, isAmalgamate, vocabData, amalgamateVocab, vocabSelect, amalgamateSelect, loadingIndicator, startButton) {
  console.log(`Loading vocab from ${url}, isAmalgamate: ${isAmalgamate}`);
  if (!url) {
    console.log('No URL provided, returning empty vocab');
    return isAmalgamate ? { vocab: [], amalgamateSetName: 'None' } : { vocab: [], vocabSetName: 'Default' };
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
        if (header.toLowerCase() === 'term') return 'Term';
        if (header.toLowerCase() === 'definition') return 'Definition';
        return header;
      }
    });
    const data = result.data.filter(row => row.Term && row.Definition);
    console.log(`Parsed ${data.length} terms from ${url}`);
    const setName = new URL(url, window.location.origin).pathname.split('/').pop().replace(/\.csv$/, '');
    return isAmalgamate ? { vocab: data, amalgamateSetName: setName } : { vocab: data, vocabSetName: setName };
  } catch (error) {
    console.error(`Error loading vocab from ${url}:`, error);
    alert(`Failed to load ${url}. Please try another set.`);
    return isAmalgamate ? { vocab: [], amalgamateSetName: 'None' } : { vocab: [], vocabSetName: 'Default' };
  } finally {
    loadingIndicator.classList.add('hidden');
    startButton.disabled = false;
  }
}

export function populateVocabDropdown(vocabSelect, amalgamateSelect) {
  console.log('Populating vocab dropdowns');
  const vocabSets = [
    { name: 'ARRL Ham Radio Extra License', url: '/vocab-sets/ARRL_Ham_Radio_Extra_License-Terms_Definitions.csv' },
    { name: 'ARRL Ham Radio General License', url: '/vocab-sets/ARRL_Ham_Radio_General_License-Terms_Definitions.csv' },
    { name: 'ARRL Ham Radio Technician License', url: '/vocab-sets/ARRL_Ham_Radio_Technician_License-Terms_Definitions.csv' }, // Fixed dash
    { name: 'Computer Programming 2', url: '/vocab-sets/Computer_Programming_2-Terms_Definitions.csv' }, // Confirmed dash
    { name: 'Computer Usage Terms', url: '/vocab-sets/Computer_Usage_Terms.csv' },
    { name: 'Digital Media', url: '/vocab-sets/Digital_Media_2_Terms_and_Definitions.csv' },
    { name: 'ECS Hardware & OS', url: '/vocab-sets/ECS_Hardware_OS_DataStorage_Terms_Definitions.csv' },
    { name: 'Exploring Computer Science', url: '/vocab-sets/Exploring_Computer_Science_Vocabulary.csv' },
    { name: 'Financial Management Tips', url: '/vocab-sets/Financial_Management_Tips.csv' },
    { name: 'Game Development Fundamentals 1', url: '/vocab-sets/Game_Development_Fundamentals_1-Terms_Definitions.csv' },
    { name: 'Game Development Fundamentals 2', url: '/vocab-sets/Game_Development_Fundamentals-2-Terms_Definitions.csv' },
    { name: 'Game Development Terms 2020s', url: '/vocab-sets/Game_Development_Terms_2020s.csv' },
    { name: 'Guitar Techniques', url: '/vocab-sets/Guitar_Techniques.csv' },
    { name: 'Music Theory', url: '/vocab-sets/Music_Theory-Terms_Definitions.csv' },
    { name: 'OOP Programming', url: '/vocab-sets/OOP_Programming_Terms.csv' },
    { name: 'Photography Terms', url: '/vocab-sets/Photography_Terms.csv' },
    { name: 'Rare English Words', url: '/vocab-sets/Rare_English_Words.csv' },
    { name: 'Social Media Photography', url: '/vocab-sets/Social_Media_Photography_Terms.csv' },
    { name: 'Study Skills High School', url: '/vocab-sets/Study_Skills_High_School.csv' },
    { name: 'Summer Job Preparation', url: '/vocab-sets/Summer_Job_Preparation-Terms_Definitions.csv' },
    { name: 'Utah Computer Programming 1', url: '/vocab-sets/Utah_Computer_Programming_1-Terms_Definitions.csv' },
    { name: 'Web Development', url: '/vocab-sets/Web_Development-Terms_Definitions.csv' },
    { name: 'Yearbook Design', url: '/vocab-sets/Yearbook_Design_Terms.csv' },
    { name: 'Advanced Computer Programming', url: '/vocab-sets/advanced_computer_programming_vocab.csv' },
    { name: 'Common Appetizers USA', url: '/vocab-sets/common_appetizers_usa.csv' },
    { name: 'Common US Entrees', url: '/vocab-sets/common_us_entrees.csv' },
    { name: 'Common US Side Dishes', url: '/vocab-sets/common_us_side_dishes.csv' },
    { name: 'Idioms', url: '/vocab-sets/idioms.csv' },
    { name: 'Psychology Terms 1', url: '/vocab-sets/psych_terms_1.csv' },
    { name: 'Psychology Terms 2', url: '/vocab-sets/psych_terms_2.csv' },
    { name: 'Psychology Terms 3', url: '/vocab-sets/psych_terms_3.csv' },
    { name: 'Psychology Terms 4', url: '/vocab-sets/psych_terms_4.csv' },
    { name: 'Unusual Adjectives', url: '/vocab-sets/unusual_adjectives.csv' },
    { name: 'Unusual Verbs', url: '/vocab-sets/unusual_verbs.csv' },
    { name: 'Utah Video Production', url: '/vocab-sets/utah_video_production_terms_Final.csv' },
    { name: 'American History 1', url: '/vocab-sets/American_History_1_Terms.csv' },
    { name: 'American History 2', url: '/vocab-sets/American_History_2_Terms.csv' },
    { name: 'World Geography', url: '/vocab-sets/World_Geography_Terms.csv' },
    { name: 'Biology Basics', url: '/vocab-sets/Biology_Basics_Terms.csv' },
    { name: 'Chemistry Fundamentals', url: '/vocab-sets/Chemistry_Fundamentals_Terms.csv' },
    { name: 'Physics Terms', url: '/vocab-sets/Physics_Terms.csv' },
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

  const noneOption = document.createElement('option');
  noneOption.value = '';
  noneOption.textContent = 'None';
  amalgamateSelect.insertBefore(noneOption, amalgamateSelect.firstChild);
  amalgamateSelect.value = '';

  vocabSelect.querySelector('option[value=""]').remove();
  amalgamateSelect.querySelector('option[value=""]').remove();
  vocabSelect.insertBefore(noneOption.cloneNode(true), vocabSelect.firstChild);
  vocabSelect.value = vocabSets[0]?.url || '';
}
