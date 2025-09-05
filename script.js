document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selection ---
    const characterListElement = document.getElementById('character-list');
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
    const loadedTeamInfo = document.getElementById('loaded-team-info');
    const loadedTeamName = document.getElementById('loaded-team-name');
    const loadedTeamDesc = document.getElementById('loaded-team-desc');
    const teamStatsContainer = document.getElementById('team-stats-container');
    const modeSelector = document.getElementById('mode-selector');
    const teamSlotsContainer = document.getElementById('team-slots-container');
    const panelNavButtons = document.querySelectorAll('.panel-nav-button');
    const panelContents = document.querySelectorAll('.panel-content');
    const shareModal = document.getElementById('share-modal');
    const closeShareModalButton = document.getElementById('close-modal-button');
    const shareUrlInput = document.getElementById('share-url-input');
    const copyUrlButton = document.getElementById('copy-url-button');
    const qrcodeDisplay = document.getElementById('qrcode-display');

    // --- Global Variables ---
    let allCharacters = [];
    let selectedDamageType = null;
    let selectedAttribute = null;
    let currentMode = 'mode1';
    let currentlyLoadedTeamId = null;

    // --- Initialization ---
    fetch('./characters.json')
        .then(response => response.json())
        .then(characters => {
            allCharacters = characters;
            const didLoadFromUrl = loadTeamFromUrl(); // << 変更
            if (!didLoadFromUrl) { // << if文を追加
                renderTeamSlots();
            }
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

    // --- Display and UI Creation Functions ---
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

    function createDamageTypeFilters() {
        const damageTypes = ["Reality", "Mental"];
        damageTypes.forEach(type => {
            const btn = document.createElement('button');
            btn.className = `damage-type-filter type-${type.toLowerCase()}`;
            btn.textContent = type;
            btn.addEventListener('click', () => {
                if (selectedDamageType === type) {
                    selectedDamageType = null;
                    damageTypeFiltersContainer.classList.remove('filter-active');
                } else {
                    selectedDamageType = type;
                    damageTypeFiltersContainer.classList.add('filter-active');
                }
                document.querySelectorAll('.damage-type-filter').forEach(b => b.classList.remove('selected'));
                if(selectedDamageType) {
                    btn.classList.add('selected');
                }
                applyFilters();
            });
            damageTypeFiltersContainer.appendChild(btn);
        });
    }

    function createAttributeFilters() {
        const attributes = ["Beast", "Plant", "Star", "Mineral", "Spirit", "Intellect"];
        attributes.forEach(attr => {
            const btn = document.createElement('button');
            btn.className = `attribute-filter attr-${attr.toLowerCase()}`;
            btn.textContent = attr;
            btn.addEventListener('click', () => {
                if (selectedAttribute === attr) {
                    selectedAttribute = null;
                    attributeFiltersContainer.classList.remove('filter-active');
                } else {
                    selectedAttribute = attr;
                    attributeFiltersContainer.classList.add('filter-active');
                }
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

    // --- Mode and Team Slot Functions ---
    function renderTeamSlots() {
        teamSlotsContainer.innerHTML = '';
        let partyCount = 0;
        let partyLabels = [];
        switch (currentMode) {
            case 'limbo':
                partyCount = 2;
                partyLabels = ['Party A', 'Party B'];
                break;
            case '4parties':
                partyCount = 4;
                partyLabels = ['Party 1', 'Party 2', 'Party 3', 'Party 4'];
                break;
            case 'mode1':
            default:
                partyCount = 1;
                partyLabels = [''];
                break;
        }
        for (let i = 0; i < partyCount; i++) {
            const partyRow = document.createElement('div');
            partyRow.className = 'party-row';
            if (partyLabels[i]) {
                const label = document.createElement('div');
                label.className = 'party-label';
                label.textContent = partyLabels[i];
                partyRow.appendChild(label);
            }
            const slotsDiv = document.createElement('div');
            slotsDiv.className = 'team-slots';
            for (let j = 0; j < 4; j++) {
                const slot = document.createElement('div');
                slot.className = 'team-slot';
                const slotIndex = i * 4 + j;
                slot.dataset.slotIndex = slotIndex;
                slot.textContent = `Slot ${slotIndex + 1}`;
                slotsDiv.appendChild(slot);
            }
            partyRow.appendChild(slotsDiv);
            teamSlotsContainer.appendChild(partyRow);
        }
        attachSlotListeners();
        addCurrentTeamShareButton(); // 共有ボタンを追加
        updateTeamStats();
    }

    function attachSlotListeners() {
        const teamSlots = document.querySelectorAll('.team-slot');
        teamSlots.forEach(slot => {
            slot.addEventListener('dragstart', (event) => {
                if (!slot.dataset.characterId) { event.preventDefault(); return; }
                const dragData = JSON.stringify({ source: 'slot', characterId: slot.dataset.characterId, sourceSlotIndex: slot.dataset.slotIndex });
                event.dataTransfer.setData('application/json', dragData);
                setTimeout(() => slot.classList.add('dragging'), 0);
            });
            slot.addEventListener('dragend', () => slot.classList.remove('dragging'));
            slot.addEventListener('dragover', e => { e.preventDefault(); if (!slot.classList.contains('dragging')) slot.classList.add('drag-over'); });
            slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
            slot.addEventListener('drop', (event) => {
                event.preventDefault();
                slot.classList.remove('drag-over');
                const slotDataString = event.dataTransfer.getData('application/json');
                if (slotDataString) {
                    const sourceData = JSON.parse(slotDataString);
                    const sourceSlot = document.querySelector(`.team-slot[data-slot-index="${sourceData.sourceSlotIndex}"]`);
                    if (sourceSlot === slot) return;
                    const sourceCharacter = allCharacters.find(c => c.id == sourceData.characterId);
                    const targetCharacter = slot.dataset.characterId ? allCharacters.find(c => c.id == slot.dataset.characterId) : null;
                    fillSlot(slot, sourceCharacter);
                    if (targetCharacter) {
                        fillSlot(sourceSlot, targetCharacter);
                    } else {
                        clearSlot(sourceSlot);
                    }
                } else {
                    const characterId = event.dataTransfer.getData('text/plain');
                    const character = allCharacters.find(c => c.id == characterId);
                    if (character) fillSlot(slot, character);
                }
            });
            slot.addEventListener('click', () => { if (slot.dataset.characterId) clearSlot(slot); });
        });
    }

    function fillSlot(slot, character) {
        const attributeClass = `attr-${character.attribute.toLowerCase()}`;
        slot.innerHTML = `<div class="name">${character.name}</div><div class="rarity">${'★'.repeat(character.rarity || 0)}</div><div class="attribute ${attributeClass}">${character.attribute}</div>`;
        slot.classList.add('slot-filled');
        slot.dataset.characterId = character.id;
        slot.setAttribute('draggable', true);
        updateTeamStats();
    }
    
    function clearSlot(slot) {
        slot.innerHTML = `Slot ${parseInt(slot.dataset.slotIndex) + 1}`;
        slot.classList.remove('slot-filled');
        delete slot.dataset.characterId;
        slot.setAttribute('draggable', false);
        updateTeamStats();
    }

    // --- Side Panel & Team Data Functions ---
    function openSidePanel() {
        const teamDescTextarea = document.getElementById('loaded-team-desc');
        const teamDescInput = document.getElementById('team-desc-input');
        teamDescInput.value = teamDescTextarea.value;
        sidePanelOverlay.classList.remove('hidden');
        renderSavedTeams();
    }
    function closeSidePanel() {
        sidePanelOverlay.classList.add('hidden');
    }

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
            savedTeamsList.innerHTML = '<li>No teams saved yet.</li>';
            return;
        }

        teams.forEach(teamData => {
            const li = document.createElement('li');
            li.dataset.teamId = teamData.id;
            li.innerHTML = `
                <div class="team-info">
                    <strong>${teamData.name}</strong>
                    <p>${teamData.description}</p>
                </div>
                <div class="team-actions">
                    <button class="load-btn">Load</button>
                    <button class="edit-btn">Edit</button>
                    <button class="share-btn">Share</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            li.querySelector('.load-btn').addEventListener('click', () => loadTeam(teamData.id));
            li.querySelector('.edit-btn').addEventListener('click', () => editTeam(teamData.id));
            li.querySelector('.share-btn').addEventListener('click', () => openShareModal(teamData.id));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTeam(teamData.id));
            savedTeamsList.appendChild(li);
        });
    }
    
    function editTeam(teamId) {
        const teams = getSavedTeams();
        const teamData = teams.find(t => t.id === teamId);
        const li = savedTeamsList.querySelector(`[data-team-id="${teamId}"]`);
        li.innerHTML = `<form class="edit-form"><input type="text" value="${teamData.name}" required><textarea>${teamData.description}</textarea><div class="edit-form-actions"><button type="submit">Save</button><button type="button" class="cancel-btn">Cancel</button></div></form>`;
        li.querySelector('.cancel-btn').addEventListener('click', () => renderSavedTeams());
        li.querySelector('.edit-form').addEventListener('submit', (event) => {
            event.preventDefault();
            const newName = li.querySelector('input').value.trim();
            const newDesc = li.querySelector('textarea').value.trim();
            if (!newName) { alert('Team Name is required.'); return; }
            updateTeam(teamId, newName, newDesc);
        });
    }

    function updateTeam(teamId, newName, newDesc) {
        let teams = getSavedTeams();
        const teamIndex = teams.findIndex(t => t.id === teamId);
        if (teamIndex > -1) {
            teams[teamIndex].name = newName;
            teams[teamIndex].description = newDesc;
            saveTeamsToStorage(teams);
            renderSavedTeams();
        }
    }
    
    function loadTeam(teamId) {
        const teams = getSavedTeams();
        const teamDataToLoad = teams.find(t => t.id === teamId);
        if (!teamDataToLoad) return;

        currentlyLoadedTeamId = teamId;

        currentMode = teamDataToLoad.mode;
        modeSelector.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === currentMode);
        });
        
        renderTeamSlots();
        const allSlots = document.querySelectorAll('.team-slot');
        const flatTeamIds = teamDataToLoad.teams.flat();
        allSlots.forEach((slot, index) => {
            const charId = flatTeamIds[index];
            if (charId) {
                const character = allCharacters.find(c => c.id == charId);
                if (character) fillSlot(slot, character);
            } else {
                clearSlot(slot);
            }
        });

        //loadedTeamName.textContent = teamDataToLoad.name;
        loadedTeamDesc.value = teamDataToLoad.description; // textContentからvalueに変更
        //loadedTeamInfo.classList.remove('hidden');
        closeSidePanel();
    }

    // --- Share Modal Functions ---
    function openShareModal(teamId = null) {
        let teamData;
        
        if (teamId) {
            // 保存されたチームから読み込み
            const teams = getSavedTeams();
            teamData = teams.find(t => t.id === teamId);
            if (!teamData) return;
        } else {
            // 現在のチーム状態から生成
            teamData = generateCurrentTeamData();
            if (!teamData) {
                alert('チームが空です。キャラクターを配置してから共有してください。');
                return;
            }
        }

        const shareData = {
            n: teamData.name,         
            d: teamData.description,  
            m: teamData.mode,
            t: teamData.teams
        };
        
        const jsonString = JSON.stringify(shareData);
        const encodedString = btoa(encodeURIComponent(jsonString));
        
        const shareUrl = `${window.location.origin}${window.location.pathname}#${encodedString}`;

        shareUrlInput.value = shareUrl;
        
        // チームコードも表示
        displayTeamCode(encodedString, teamData);
        generateQrCode(shareUrl);
        shareModal.classList.remove('hidden');
    }

    function closeShareModal() {
        shareModal.classList.add('hidden');
    }

    copyUrlButton.addEventListener('click', () => {
        shareUrlInput.select();
        navigator.clipboard.writeText(shareUrlInput.value)
            .then(() => {
                alert('Link copied to clipboard!');
            })
            .catch(err => {
                console.error('Copy failed: ', err);
                try {
                    document.execCommand('copy');
                    alert('Link copied to clipboard! (fallback)');
                } catch (copyErr) {
                    alert('Sorry, could not copy the link.');
                }
            });
    });

    // 現在のチーム状態からチームデータを生成
    function generateCurrentTeamData() {
        const allSlots = document.querySelectorAll('.team-slot');
        const teamIds = Array.from(allSlots).map(slot => slot.dataset.characterId || null);
        
        // チームが空かどうかチェック
        if (teamIds.every(id => id === null)) {
            return null;
        }
        
        const teams = [];
        for (let i = 0; i < teamIds.length; i += 4) {
            teams.push(teamIds.slice(i, i + 4));
        }
        
        const teamName = loadedTeamDesc.value ? 
            (loadedTeamName.textContent !== 'チームメモ' ? loadedTeamName.textContent : '共有チーム') : 
            '共有チーム';
            
        return {
            id: 'current-' + Date.now().toString(),
            name: teamName,
            description: loadedTeamDesc.value || '',
            mode: currentMode,
            teams: teams
        };
    }

    // チームコードを表示する関数
    function displayTeamCode(encodedCode, teamData) {
        const characterCount = teamData.teams.flat().filter(id => id !== null).length;
        
        // モーダル内にチームコード表示エリアを追加
        const existingCodeDisplay = shareModal.querySelector('.team-code-display');
        if (existingCodeDisplay) {
            existingCodeDisplay.remove();
        }
        
        const codeDisplay = document.createElement('div');
        codeDisplay.className = 'team-code-display';
        codeDisplay.innerHTML = `
            <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
                <h4>チームコード</h4>
                <textarea readonly style="width: 100%; height: 80px; margin: 10px 0; font-family: monospace; font-size: 12px; resize: vertical;">${encodedCode}</textarea>
                <button id="copy-team-code-button" style="padding: 8px 16px; margin-right: 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">チームコードをコピー</button>
                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    <strong>チーム情報:</strong><br>
                    名前: ${teamData.name}<br>
                    モード: ${teamData.mode}<br>
                    キャラクター数: ${characterCount}
                    ${teamData.description ? `<br>説明: ${teamData.description}` : ''}
                </div>
            </div>
        `;
        
        // QRコード表示の前に挿入
        shareModal.querySelector('.modal-content').insertBefore(codeDisplay, qrcodeDisplay);
        
        // チームコードコピー機能
        document.getElementById('copy-team-code-button').addEventListener('click', () => {
            const textarea = codeDisplay.querySelector('textarea');
            textarea.select();
            navigator.clipboard.writeText(textarea.value)
                .then(() => {
                    alert('チームコードをクリップボードにコピーしました！');
                })
                .catch(err => {
                    console.error('Copy failed: ', err);
                    try {
                        document.execCommand('copy');
                        alert('チームコードをクリップボードにコピーしました！');
                    } catch (copyErr) {
                        alert('コピーに失敗しました。');
                    }
                });
        });
    }

    // チーム共有ボタンを追加する関数（チームスロットの近くに配置）
    function addCurrentTeamShareButton() {
        // 既存のボタンがあれば削除
        const existingButton = document.querySelector('.current-team-share-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        const shareButton = document.createElement('button');
        shareButton.className = 'current-team-share-button';
        shareButton.textContent = '現在のチームを共有';
        shareButton.style.cssText = `
            margin: 10px 0;
            padding: 10px 20px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        
        shareButton.addEventListener('click', () => openShareModal());
        
        // チームスロットコンテナの後に追加
        teamSlotsContainer.parentNode.insertBefore(shareButton, loadedTeamInfo);
    }

    function generateQrCode(url) {
        qrcodeDisplay.innerHTML = '';
        try {
            const qr = qrcode(0, 'M');
            qr.addData(url);
            qr.make();
            qrcodeDisplay.innerHTML = qr.createImgTag(5, 10);
        } catch (e) {
            console.error("QR Code generation failed:", e);
            qrcodeDisplay.textContent = "QR Code could not be generated.";
        }
    }

    function loadTeamFromUrl() {
        const hash = window.location.hash.substring(1);
        if (!hash) return false;

        try {
            const jsonString = decodeURIComponent(atob(hash));
            const sharedData = JSON.parse(jsonString);

            if (sharedData.m && sharedData.t) {
                currentlyLoadedTeamId = null;
                currentMode = sharedData.m;
                modeSelector.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.mode === currentMode);
                });
                renderTeamSlots();

                const allSlots = document.querySelectorAll('.team-slot');
                const flatTeamIds = sharedData.t.flat();
                allSlots.forEach((slot, index) => {
                    const charId = flatTeamIds[index];
                    if (charId) {
                        const character = allCharacters.find(c => c.id == charId);
                        if (character) fillSlot(slot, character);
                    }
                });

                if (sharedData.n) {
                    //loadedTeamName.textContent = sharedData.n;
                    loadedTeamDesc.value = sharedData.d || ''; // textContentからvalueに変更
                    //loadedTeamInfo.classList.remove('hidden');
                }

                alert('Team loaded from URL!');
                history.pushState("", document.title, window.location.pathname + window.location.search);
                return true; 
            }
        } catch (e) {
            console.error("Failed to load team from URL:", e);
            alert("Could not load team from the provided link. It might be invalid.");
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
        return false; 
    }
    
    function deleteTeam(teamId) {
        if (!confirm('Are you sure you want to delete this team?')) { return; }
        let teams = getSavedTeams();
        teams = teams.filter(t => t.id !== teamId);
        saveTeamsToStorage(teams);
        renderSavedTeams();
    }

    function updateTeamStats() {
        const partyRows = document.querySelectorAll('.party-row');
        teamStatsContainer.innerHTML = '';
        let anyPartyHasMembers = false;

        partyRows.forEach((row) => {
            const slotsInParty = row.querySelectorAll('.team-slot');
            const charactersInParty = Array.from(slotsInParty).map(slot => slot.dataset.characterId).filter(id => id).map(id => allCharacters.find(c => c.id == id));

            if (charactersInParty.length > 0) {
                anyPartyHasMembers = true;
                const attrCounts = {};
                const specCounts = {};
                charactersInParty.forEach(char => {
                    if (!char) return;
                    attrCounts[char.attribute] = (attrCounts[char.attribute] || 0) + 1;
                    char.specialties.forEach(spec => {
                        specCounts[spec] = (specCounts[spec] || 0) + 1;
                    });
                });

                const statsBlock = document.createElement('div');
                statsBlock.className = 'party-stats-block';
                const partyLabelText = row.querySelector('.party-label')?.textContent || 'Team';
                statsBlock.innerHTML = `<h4>${partyLabelText} - Stats</h4><div class="stats-nav"><button class="stats-nav-button active" data-stats="attributes">Attributes</button><button class="stats-nav-button" data-stats="specialties">Specialties</button></div><div class="stats-display-area"></div>`;
                teamStatsContainer.appendChild(statsBlock);

                const navButtons = statsBlock.querySelectorAll('.stats-nav-button');
                const displayArea = statsBlock.querySelector('.stats-display-area');

                const displayPartyStats = (view) => {
                    const dataToShow = view === 'attributes' ? attrCounts : specCounts;
                    displayArea.innerHTML = '';
                    Object.entries(dataToShow).sort((a,b) => b[1] - a[1]).forEach(([key, value]) => {
                        const item = document.createElement('div');
                        item.className = 'stat-item';
                        
                        // ▼▼▼ ここから追加 ▼▼▼
                        // 表示が 'attributes' の場合、属性ごとの色クラスを追加
                        if (view === 'attributes') {
                            const attributeClass = `attr-${key.toLowerCase()}`;
                            item.classList.add(attributeClass);
                        }
                        // ▲▲▲ ここまで追加 ▲▲▲
                        
                        item.innerHTML = `<span>${key}</span><span class="count">${value}</span>`;
                        displayArea.appendChild(item);
                    });
                };
                
                navButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        navButtons.forEach(b => b.classList.remove('active'));
                        e.target.classList.add('active');
                        displayPartyStats(e.target.dataset.stats);
                    });
                });
                displayPartyStats('attributes');
            }
        });
        teamStatsContainer.classList.toggle('hidden', !anyPartyHasMembers);
    }

    // --- Event Listeners ---
    modeSelector.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'BUTTON') {
            currentMode = target.dataset.mode;
            modeSelector.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            target.classList.add('active');
            renderTeamSlots();
        }
    });

    menuButton.addEventListener('click', openSidePanel);
    closePanelButton.addEventListener('click', closeSidePanel);
    sidePanelOverlay.addEventListener('click', (event) => {
        if (event.target === sidePanelOverlay) closeSidePanel();
    });
    
    saveTeamForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = teamNameInput.value.trim();
        const description = teamDescInput.value.trim();
        if (!name) { alert('Team Name is required.'); return; }
        const allSlots = document.querySelectorAll('.team-slot');
        const teamIds = Array.from(allSlots).map(slot => slot.dataset.characterId || null);
        const teams = [];
        for (let i = 0; i < teamIds.length; i += 4) {
            teams.push(teamIds.slice(i, i + 4));
        }
        const newTeamData = { id: Date.now().toString(), name, description, mode: currentMode, teams: teams };
        const savedTeams = getSavedTeams();
        savedTeams.push(newTeamData);
        saveTeamsToStorage(savedTeams);
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

    document.addEventListener('dragover', (event) => {
        const viewportHeight = window.innerHeight;
        const threshold = 60;
        const scrollSpeed = 15;
        const y = event.clientY;
        if (y < threshold) {
            window.scrollBy(0, -scrollSpeed);
        } else if (y > viewportHeight - threshold) {
            window.scrollBy(0, scrollSpeed);
        }
    });

    panelNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPanelId = `panel-content-${button.dataset.panel}`;
            panelNavButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            panelContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetPanelId).classList.add('active');
        });
    });

    // Modal close event listeners
    closeShareModalButton.addEventListener('click', closeShareModal);
    shareModal.addEventListener('click', (event) => {
        if (event.target === shareModal) {
            closeShareModal();
        }
    });

    // Descriptionの自動保存
    const teamDescTextarea = document.getElementById('loaded-team-desc');
    const saveStatusElement = document.getElementById('save-status');

    teamDescTextarea.addEventListener('blur', () => {
        // 編集中のチームがあり、内容が変更されていた場合のみ保存
        if (!currentlyLoadedTeamId) return;

        let teams = getSavedTeams();
        const teamIndex = teams.findIndex(t => t.id === currentlyLoadedTeamId);
        
        if (teamIndex > -1 && teams[teamIndex].description !== teamDescTextarea.value) {
            teams[teamIndex].description = teamDescTextarea.value;
            saveTeamsToStorage(teams);
            
            // 保存したことをユーザーにフィードバック
            saveStatusElement.textContent = 'Saved!';
            setTimeout(() => {
                saveStatusElement.textContent = '';
            }, 2000); // 2秒後にメッセージを消す

            // サイドパネルのリストも更新
            renderSavedTeams();
        }
    });

    // チームコード生成
    function generateTeamCode() {
        const teamName = document.getElementById('team-name').value;
        const description = document.getElementById('team-description').value;
        const characterIds = document.getElementById('character-ids').value;
        const mode = document.getElementById('mode-select').value;
        
        if (!teamName || !characterIds) {
            showError('チーム名とキャラクターIDは必須です');
            return;
        }
        
        // キャラクターIDを配列に変換
        const ids = characterIds.split(',').map(id => id.trim()).filter(id => id);
        if (ids.length === 0) {
            showError('有効なキャラクターIDを入力してください');
            return;
        }
        
        // チームデータ作成
        const teamData = {
            n: teamName,
            d: description,
            m: mode,
            t: []
        };
        
        // 4人ずつのパーティに分割
        for (let i = 0; i < ids.length; i += 4) {
            const party = ids.slice(i, i + 4);
            // 4人未満の場合はnullで埋める
            while (party.length < 4) {
                party.push(null);
            }
            teamData.t.push(party);
        }
        
        // Base64エンコード
        const jsonString = JSON.stringify(teamData);
        const encodedCode = btoa(encodeURIComponent(jsonString));
        
        // 結果表示
        const outputDiv = document.getElementById('generated-output');
        outputDiv.style.display = 'block';
        outputDiv.innerHTML = `
            <strong>生成されたチームコード:</strong>
            ${encodedCode}
            
            <strong>チーム情報:</strong>
            名前: ${teamName}
            説明: ${description}
            モード: ${mode}
            キャラクター数: ${ids.length}
        `;
        
        showSuccess('チームコードが生成されました！');
    }

    // QRコード生成
    function generateQRCode() {
        const teamName = document.getElementById('team-name').value;
        const description = document.getElementById('team-description').value;
        const characterIds = document.getElementById('character-ids').value;
        const mode = document.getElementById('mode-select').value;
        
        if (!teamName || !characterIds) {
            showError('チーム名とキャラクターIDは必須です');
            return;
        }
        
        const ids = characterIds.split(',').map(id => id.trim()).filter(id => id);
        const teamData = {
            n: teamName,
            d: description,
            m: mode,
            t: []
        };
        
        for (let i = 0; i < ids.length; i += 4) {
            const party = ids.slice(i, i + 4);
            while (party.length < 4) {
                party.push(null);
            }
            teamData.t.push(party);
        }
        
        const jsonString = JSON.stringify(teamData);
        const encodedCode = btoa(encodeURIComponent(jsonString));
        
        try {
            const qr = qrcode(0, 'M');
            qr.addData(encodedCode);
            qr.make();
            
            document.getElementById('qr-display').innerHTML = `
                <h3>生成されたQRコード</h3>
                ${qr.createImgTag(4, 8)}
                <p style="font-size: 12px; color: #666;">
                    このQRコードをスキャンまたは画像として保存してください
                </p>
            `;
            
            showSuccess('QRコードが生成されました！');
        } catch (e) {
            showError('QRコード生成に失敗しました: ' + e.message);
        }
    }

    // チーム読み込み
    // Load Teamパネルの関数を統一
    function loadTeamFromCode() {
        const codeInput = document.getElementById('team-code-input');
        if (!codeInput) {
            console.error('Team code input element not found');
            return;
        }
        
        const code = codeInput.value.trim();
        if (!code) {
            //showMessage('チームコードを入力してください', 'error');
            return;
        }
        
        try {
            const jsonString = decodeURIComponent(atob(code));
            const teamData = JSON.parse(jsonString);
            
            if (teamData.m && teamData.t) {
                loadTeamData(teamData);
                //showMessage('チーム読み込み成功！', 'success');
                closeSidePanel();
            } else {
                throw new Error('無効なチームデータ形式');
            }
        } catch (e) {
            //showMessage('無効なチームコードです: ' + e.message, 'error');
        }
    }

    const loadTeamFromCodeButton = document.getElementById("load-team-from-code-button");
    loadTeamFromCodeButton.addEventListener('click', loadTeamFromCode);

    function loadTeamData(teamData) {
        // 保存されたチームのIDではないため、選択を解除
        currentlyLoadedTeamId = null; 
        currentMode = teamData.m;

        // モード選択ボタンの表示を更新
        modeSelector.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === currentMode);
        });

        // 新しいモードに合わせてチームスロットを再描画
        renderTeamSlots(); 

        const allSlots = document.querySelectorAll('.team-slot');
        // teamData.t は [['id1', 'id2', ...], ['id5', ...]] のような配列なので、
        // flat()で ['id1', 'id2', ..., 'id5', ...] のような一次元配列に変換します。
        const flatTeamIds = teamData.t.flat();

        allSlots.forEach((slot, index) => {
            const charId = flatTeamIds[index];
            if (charId) {
                const character = allCharacters.find(c => c.id == charId);
                if (character) {
                    fillSlot(slot, character);
                } else {
                    clearSlot(slot);
                }
            } else {
                clearSlot(slot);
            }
        });

        // チーム名や説明があればテキストエリアに反映
        loadedTeamDesc.value = teamData.d || '';
    }




    function clearInput() {
        document.getElementById('team-code-input').value = '';
        document.getElementById('load-result').innerHTML = '';
    }
        
    // チームプレビュー表示
    function displayTeamPreview(teams) {
        const previewDiv = document.getElementById('team-preview');
        previewDiv.innerHTML = '';
        
        teams.forEach((party, partyIndex) => {
            const partyLabel = document.createElement('div');
            partyLabel.style.width = '100%';
            partyLabel.style.fontWeight = 'bold';
            partyLabel.style.marginTop = partyIndex > 0 ? '20px' : '10px';
            partyLabel.style.marginBottom = '10px';
            partyLabel.textContent = `パーティ ${partyIndex + 1}:`;
            previewDiv.appendChild(partyLabel);
            
            party.forEach((charId, slotIndex) => {
                const slot = document.createElement('div');
                slot.className = 'character-slot';
                
                if (charId && sampleCharacters[charId]) {
                    const char = sampleCharacters[charId];
                    slot.className += ' filled';
                    slot.innerHTML = `
                        <div style="font-size: 10px; font-weight: bold;">${char.name}</div>
                        <div style="font-size: 8px;">${'★'.repeat(char.rarity)}</div>
                        <div style="font-size: 8px;">${char.attribute}</div>
                    `;
                } else {
                    slot.textContent = `スロット ${slotIndex + 1}`;
                }
                
                previewDiv.appendChild(slot);
            });
        });
    }
    
    // 入力クリア
    function clearInput() {
        document.getElementById('team-code-input').value = '';
        document.getElementById('load-result').innerHTML = '';
        document.getElementById('team-preview').innerHTML = '';
    }

    const clearInputButton = document.getElementById('clear-input-button');
    if (clearInputButton) clearInputButton.addEventListener('click', clearInput);
    
    // QRファイルアップロード処理
    function handleQRUpload(event) {
        const file = event.target.files[0];
        if (file) {
            showError('QR読み取り機能は実装中です。現在はチームコードの手入力をお使いください。');
        }
    }
    
    // エラー表示
    function showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.container').appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
    
    // 成功メッセージ表示
    function showSuccess(message) {
        const existingSuccess = document.querySelector('.success-message');
        if (existingSuccess) existingSuccess.remove();
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.querySelector('.container').appendChild(successDiv);
        
        setTimeout(() => successDiv.remove(), 3000);
    }

    // Translate button
    /*
    function translator_button() {
        if (result == "EN") {

        } else if (result == "JP") {

        } else {    // CN

        }
    }
    */
});