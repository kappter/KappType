export async function populateVocabDropdown(vocabSelect, amalgamateSelect) {
  console.log('populateVocabDropdown started');
  console.log('Clearing dropdowns');
  if (vocabSelect) vocabSelect.innerHTML = '<option value="">Select Vocabulary</option>';
  if (amalgamateSelect) amalgamateSelect.innerHTML = '<option value="">Select Amalgamate (Optional)</option>';

  const vocabFiles = [
    'AP_Astronomy_Concepts.csv', 'AP_Computer_Science_A_Concepts.csv', 'AP_Java_Code_Snippets.csv',
    'ARRL_Ham_Radio_Extra_License_Terms_Definitions.csv', 'ARRL_Ham_Radio_General_License_Terms_Definitions.csv',
    'ARRL_Ham_Radio_Technician_License_Terms_Definitions.csv', 'Computer_Programming_2_Terms_Definitions.csv',
    'Computer_Usage_Terms.csv', 'Digital_Media_2_Terms_and_Definitions.csv', 'ECS_Hardware_OS_DataStorage_Terms_Definitions.csv',
    'Exploring_Computer_Science_Vocabulary.csv', 'Financial_Management_Tips.csv', 'Game_Development_Fundamentals-2_Terms_Definitions.csv',
    'Game_Development_Fundamentals_1_Terms_Definitions.csv', 'Game_Development_Terms_2020s.csv', 'Guitar_Techniques.csv',
    'Literary_Techniques.csv', 'Music_Composition_Techniques.csv', 'Music_Theory_Terms_Definitions.csv', 'OOP_Programming_Terms.csv',
    'OS_Navigation_Capabilities.csv', 'Periodic_Table_Elements.csv', 'Photography_Terms.csv', 'Rare_English_Words.csv',
    'Rogets_Abstract_Relations_Terms.csv', 'Rogets_Affections_Terms.csv', 'Rogets_Consolidated_Terms.csv',
    'Rogets_Intellectual_Faculties_Terms.csv', 'Rogets_Matter_Terms.csv', 'Rogets_Space_Terms.csv', 'Rogets_Volition_Terms.csv',
    'Social_Media_Photography_Terms.csv', 'Study_Skills_High_School.csv', 'Summer_Job_Preparation_Terms_Definitions.csv',
    'Utah_Computer_Programming_1_Terms_Definitions.csv', 'Web_Development_Terms_Definitions.csv', 'Yearbook_Design_Terms.csv',
    'advanced_computer_programming_vocab.csv', 'common_appetizers_usa.csv', 'common_us_entrees.csv', 'common_us_side_dishes.csv',
    'idioms.csv', 'psych_terms_1.csv', 'psych_terms_2.csv', 'psych_terms_3.csv', 'psych_terms_4.csv', 'unusual_adjectives.csv',
    'unusual_verbs.csv', 'utah_video_production_terms_Final.csv'
  ];

  console.log(`Populating dropdowns with ${vocabFiles.length} files`);
  vocabFiles.forEach(file => {
    const url = `https://raw.githubusercontent.com/kappter/vocab-sets/main/${file}`;
    if (vocabSelect) {
      const option = document.createElement('option');
      option.value = url;
      option.textContent = file.replace('.csv', '');
      vocabSelect.appendChild(option);
    }
    if (amalgamateSelect) {
      const option = document.createElement('option');
      option.value = url;
      option.textContent = file.replace('.csv', '');
      amalgamateSelect.appendChild(option);
    }
    console.log(`Added ${file} to dropdowns`);
  });

  console.log('populateVocabDropdown completed');
}

export async function loadVocab(vocabUrl, amalgamateUrl) {
  console.log(`loadVocab started for ${vocabUrl}, isAmalgamate: ${amalgamateUrl}`);
  let vocabData = [];

  async function fetchVocab(url) {
    if (!url) return [];
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => row.split(',').map(cell => cell.trim()));
      if (rows.length < 2) {
        throw new Error('CSV is empty or lacks data rows');
      }
      const headers = rows[0];
      const termIndex = headers.indexOf('Term');
      const defIndex = headers.indexOf('Definition');
      if (termIndex === -1 || defIndex === -1) {
        throw new Error('CSV missing Term or Definition columns');
      }
      return rows.slice(1).filter(row => row[termIndex] && row[defIndex]).map(row => ({
        Term: row[termIndex],
        Definition: row[defIndex]
      }));
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  try {
    vocabData = await fetchVocab(vocabUrl);
    if (amalgamateUrl && amalgamateUrl !== vocabUrl) {
      const amalgamateData = await fetchVocab(amalgamateUrl);
      vocabData = [...vocabData, ...amalgamateData];
    }
    if (vocabData.length === 0) {
      throw new Error('No valid vocabulary data loaded');
    }
    console.log(`loadVocab completed with ${vocabData.length} terms`);
    return vocabData;
  } catch (error) {
    console.error('loadVocab failed:', error);
    throw error;
  }
}
