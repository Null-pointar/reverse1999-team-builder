document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const characterListElement = document.getElementById('character-list');
    const teamSlots = document.querySelectorAll('.team-slot');
    const searchBar = document.getElementById('search-bar');
    const damageTypeFiltersContainer = document.getElementById('damage-type-filters');
    const attributeFiltersContainer = document.getElementById('attribute-filters');
    const specialtyFiltersContainer = document.getElementById('specialty-filters');
    const tagFiltersContainer = document.getElementById('tag-filters');
    const menuButton = document.getElementById('menu-button');
    const sidePanelOverlay = document.getElementById('side-panel-overlay');
    const closePanelButton = document.getElementById('close-panel-button');
    const saveTeamForm = document.getElementById('save-team-form');
    const teamNameInput = document.getElementById('team-name-input');
    const teamDescInput = document.getElementById('team-desc-input');
    const savedTeamsList = document.getElementById('saved-teams-list');
    const langButtons = document.querySelectorAll('.lang-button');
    const disclaimerTexts = document.querySelectorAll('.disclaimer-text');

    // --- Global Variables ---
    let allCharacters = [];
    let selectedDamageType = null;
    let selectedAttribute = null;

    // --- Initialization ---
    fetch('characters.json')
        .then(response => response.json())
        .then(characters => {
            allCharacters = characters;
            createDamageTypeFilters();
            createAttributeFilters();
            createSpecialtyFilters();
            createTagFilters();
            applyFilters();
        })
        .catch(error => console.error('Character data failed to load:', error));

    // --- Filter Functions ---
    function applyFilters() {
        const searchTerm = searchBar.value.toLowerCase();
        const selectedTags = Array.from(tagFiltersContainer.querySelectorAll('input:checked')).map(input => input.value);
        const selectedSpecialties = Array.from(specialtyFiltersContainer.querySelectorAll('input:checked')).map(input => input.value);

        const filteredCharacters = allCharacters.filter(character => {
            const nameMatch = character.name.toLowerCase().includes(searchTerm);
            const attributeMatch = !selectedAttribute || character.attribute === selectedAttribute;
            const damageTypeMatch = !selectedDamageType || character.damageType === selectedDamageType;
            const tagMatch = selectedTags.every(tag => character.tags.includes(tag));
            const specialtyMatch = selectedSpecialties.every(spec => character.specialties.includes(spec));
            
            return nameMatch && attributeMatch && damageTypeMatch && tagMatch && specialtyMatch;
        });

        displayCharacters(filteredCharacters);
    }

    // --- Display Functions ---
    function displayCharacters(characters) {
        characterListElement.innerHTML = ''; 
        characters.forEach(character => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.draggable = true;
            card.dataset.id = character.id;
            
            const rarityStars = '★'.repeat(character.rarity || 0);
            const attributeClass = `attr-${character.attribute.toLowerCase()}`;
            const damageTypeClass = `type-${character.damageType.toLowerCase()}`;
            const specialtiesHTML = character.specialties.map(spec => `<span class="specialty-tag">${spec}</span>`).join('');
            
            card.innerHTML = `
                <div class="damage-type ${damageTypeClass}">${character.damageType}</div>
                <div class="attribute ${attributeClass}">${character.attribute}</div>
                <div class="rarity">${rarityStars}</div>
                <div class="specialties">${specialtiesHTML}</div>
                <div class="name">${character.name}</div>
                <div class="tags">${character.tags.join(', ')}</div>
            `;
            
            card.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', character.id));
            characterListElement.appendChild(card);
        });
    }

    // この関数をまるごと置き換え
    function createDamageTypeFilters() {
        const damageTypes = ["Reality", "Mental"];
        damageTypes.forEach(type => {
            const btn = document.createElement('button');
            btn.className = `damage-type-filter type-${type.toLowerCase()}`;
            btn.textContent = type;
            btn.addEventListener('click', () => {
                if (selectedDamageType === type) {
                    selectedDamageType = null;
                    // 親要素からクラスを削除
                    damageTypeFiltersContainer.classList.remove('filter-active');
                } else {
                    selectedDamageType = type;
                    // 親要素にクラスを追加
                    damageTypeFiltersContainer.classList.add('filter-active');
                }
                // ボタンのselectedクラスは親の状態に関わらず更新
                document.querySelectorAll('.damage-type-filter').forEach(b => b.classList.remove('selected'));
                if(selectedDamageType) {
                    btn.classList.add('selected');
                }

                applyFilters();
            });
            damageTypeFiltersContainer.appendChild(btn);
        });
    }

    // この関数をまるごと置き換え
    function createAttributeFilters() {
        const attributes = ["Beast", "Plant", "Star", "Mineral", "Spirit", "Intellect"];
        attributes.forEach(attr => {
            const btn = document.createElement('button');
            btn.className = `attribute-filter attr-${attr.toLowerCase()}`;
            btn.textContent = attr;
            btn.addEventListener('click', () => {
                if (selectedAttribute === attr) {
                    selectedAttribute = null;
                    // 親要素からクラスを削除
                    attributeFiltersContainer.classList.remove('filter-active');
                } else {
                    selectedAttribute = attr;
                    // 親要素にクラスを追加
                    attributeFiltersContainer.classList.add('filter-active');
                }
                // ボタンのselectedクラスは親の状態に関わらず更新
                document.querySelectorAll('.attribute-filter').forEach(b => b.classList.remove('selected'));
                if(selectedAttribute){
                    btn.classList.add('selected');
    }
                applyFilters();
            });
            attributeFiltersContainer.appendChild(btn);
        });
    }

    function createSpecialtyFilters() {
        const allSpecialties = [...new Set(allCharacters.flatMap(c => c.specialties))].sort();
        allSpecialties.forEach(spec => {
            const specElement = document.createElement('div');
            specElement.className = 'tag-filter';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `spec-${spec}`;
            checkbox.value = spec;
            checkbox.addEventListener('change', () => {
                specElement.classList.toggle('checked', checkbox.checked);
                applyFilters();
            });

            const label = document.createElement('label');
            label.htmlFor = `spec-${spec}`;
            label.textContent = spec;

            specElement.appendChild(checkbox);
            specElement.appendChild(label);
            specialtyFiltersContainer.appendChild(specElement);
        });
    }

    function createTagFilters() {
        const allTags = [...new Set(allCharacters.flatMap(c => c.tags))].sort();
        allTags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-filter';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `tag-${tag}`;
            checkbox.value = tag;
            checkbox.addEventListener('change', () => {
                tagElement.classList.toggle('checked', checkbox.checked);
                applyFilters();
            });

            const label = document.createElement('label');
            label.htmlFor = `tag-${tag}`;
            label.textContent = tag;

            tagElement.appendChild(checkbox);
            tagElement.appendChild(label);
            tagFiltersContainer.appendChild(tagElement);
        });
    }

    // --- Team Slot Functions ---
    teamSlots.forEach(slot => {
        // When a drag starts FROM a slot
        slot.addEventListener('dragstart', (event) => {
            if (!slot.dataset.characterId) {
                event.preventDefault(); // Don't allow dragging empty slots
                return;
            }
            // To distinguish from a list drag, we'll use a different data type
            const dragData = JSON.stringify({
                source: 'slot', // A marker to know this came from a slot
                characterId: slot.dataset.characterId,
                sourceSlotIndex: slot.dataset.slotIndex
            });
            event.dataTransfer.setData('application/json', dragData);
            // Add a slight delay to allow the swap logic to work smoothly
            setTimeout(() => {
                slot.classList.add('dragging');
            }, 0);
        });

        // When the drag ends (for any reason)
        slot.addEventListener('dragend', () => {
            slot.classList.remove('dragging');
        });

        // Standard drag-over and drag-leave events
        slot.addEventListener('dragover', e => {
            e.preventDefault();
            if (!slot.classList.contains('dragging')) {
                slot.classList.add('drag-over');
            }
        });
        slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));

        // When something is dropped ONTO a slot
        slot.addEventListener('drop', (event) => {
            event.preventDefault();
            slot.classList.remove('drag-over');
            
            // Try to get data from another slot first
            const slotDataString = event.dataTransfer.getData('application/json');
            
            if (slotDataString) {
                // Case 1: Swapping from another slot
                const sourceData = JSON.parse(slotDataString);
                const sourceSlot = teamSlots[sourceData.sourceSlotIndex];
                
                // If dropping onto itself, do nothing
                if (sourceSlot === slot) return;

                // Get data for the characters being swapped
                const sourceCharacter = allCharacters.find(c => c.id == sourceData.characterId);
                const targetCharacterId = slot.dataset.characterId; // Might be empty
                const targetCharacter = targetCharacterId ? allCharacters.find(c => c.id == targetCharacterId) : null;
                
                // Perform the swap
                fillSlot(slot, sourceCharacter); // Move source character to target
                if (targetCharacter) {
                    fillSlot(sourceSlot, targetCharacter); // Move target character to source
                } else {
                    clearSlot(sourceSlot); // If target was empty, clear the source slot
                }

            } else {
                // Case 2: Dropping from the main character list (original functionality)
                const characterId = event.dataTransfer.getData('text/plain');
                const character = allCharacters.find(c => c.id == characterId);
                if (character) fillSlot(slot, character);
            }
        });

        // Click to clear a slot (existing functionality)
        slot.addEventListener('click', () => { if (slot.dataset.characterId) clearSlot(slot); });
    });

    function fillSlot(slot, character) {
        const attributeClass = `attr-${character.attribute.toLowerCase()}`;
        slot.innerHTML = `
            <div class="name">${character.name}</div>
            <div class="rarity">${'★'.repeat(character.rarity || 0)}</div>
            <div class="attribute ${attributeClass}">${character.attribute}</div>
        `;
        slot.classList.add('slot-filled');
        slot.dataset.characterId = character.id;
        slot.setAttribute('draggable', true); // Make the filled slot draggable
    }

    function clearSlot(slot) {
        slot.innerHTML = `Slot ${parseInt(slot.dataset.slotIndex) + 1}`;
        slot.classList.remove('slot-filled');
        delete slot.dataset.characterId;
        slot.setAttribute('draggable', false); // Make the empty slot not draggable
    }

    // --- Side Panel Functions ---
    function openSidePanel() {
        sidePanelOverlay.classList.remove('hidden');
        renderSavedTeams();
    }
    function closeSidePanel() {
        sidePanelOverlay.classList.add('hidden');
    }

    // --- Team Save/Load/Delete Functions ---
    function getSavedTeams() {
        return JSON.parse(localStorage.getItem('reverse1999_saved_teams')) || [];
    }
    function saveTeamsToStorage(teams) {
        localStorage.setItem('reverse1999_saved_teams', JSON.stringify(teams));
    }

    function renderSavedTeams() {
        const teams = getSavedTeams();
        savedTeamsList.innerHTML = '';

        if (teams.length === 0) {
            savedTeamsList.innerHTML = '<li>No saved teams yet.</li>';
            return;
        }

        teams.forEach(teamData => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="team-info">
                    <strong>${teamData.name}</strong>
                    <p>${teamData.description}</p>
                </div>
                <div class="team-actions">
                    <button class="load-btn" data-id="${teamData.id}">Load</button>
                    <button class="delete-btn" data-id="${teamData.id}">Delete</button>
                </div>
            `;
            li.querySelector('.load-btn').addEventListener('click', () => loadTeam(teamData.id));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTeam(teamData.id));
            savedTeamsList.appendChild(li);
        });
    }

    function loadTeam(teamId) {
        const teams = getSavedTeams();
        const teamToLoad = teams.find(t => t.id === teamId);
        if (!teamToLoad) return;

        teamSlots.forEach(slot => clearSlot(slot));
        teamToLoad.team.forEach((charId, index) => {
            if (charId) {
                const character = allCharacters.find(c => c.id == charId);
                if (character) {
                    fillSlot(teamSlots[index], character);
                }
            }
        });
        closeSidePanel();
    }
    
    function deleteTeam(teamId) {
        if (!confirm('Are you sure you want to delete this team?')) {
            return;
        }
        let teams = getSavedTeams();
        teams = teams.filter(t => t.id !== teamId);
        saveTeamsToStorage(teams);
        renderSavedTeams();
    }
    
    // --- Event Listeners ---
    menuButton.addEventListener('click', openSidePanel);
    closePanelButton.addEventListener('click', closeSidePanel);
    sidePanelOverlay.addEventListener('click', (event) => {
        if (event.target === sidePanelOverlay) {
            closeSidePanel();
        }
    });
    
    saveTeamForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const name = teamNameInput.value.trim();
        const description = teamDescInput.value.trim();
        if (!name) {
            alert('Team Name is required.');
            return;
        }
        
        const currentTeamIds = Array.from(teamSlots).map(slot => slot.dataset.characterId || null);
        const newTeam = {
            id: Date.now().toString(),
            name: name,
            description: description,
            team: currentTeamIds
        };
        
        const teams = getSavedTeams();
        teams.push(newTeam);
        saveTeamsToStorage(teams);

        teamNameInput.value = '';
        teamDescInput.value = '';
        renderSavedTeams();
    });

    searchBar.addEventListener('input', applyFilters);

    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedLang = button.dataset.lang;
            langButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            disclaimerTexts.forEach(text => text.classList.add('hidden'));
            const targetText = document.querySelector(`.disclaimer-text.lang-${selectedLang}`);
            if (targetText) {
                targetText.classList.remove('hidden');
            }
        });
    });

    // ▼▼▼ ドラッグ中の自動スクロール機能 ▼▼▼
    document.addEventListener('dragover', (event) => {
        const viewportHeight = window.innerHeight;
        const threshold = 60; // 画面の端から何ピクセルでスクロールを開始するか
        const scrollSpeed = 15; // スクロール速度

        const y = event.clientY; // カーソルのY座標

        // カーソルが画面上部に来たら上にスクロール
        if (y < threshold) {
            window.scrollBy(0, -scrollSpeed);
        } 
        // カーソルが画面下部に来たら下にスクロール
        else if (y > viewportHeight - threshold) {
            window.scrollBy(0, scrollSpeed);
        }
    });

}); 