const toggleBtn = document.getElementById('toggleBtn');
const importBtn = document.getElementById('importBtn');
const status = document.getElementById('status');
const songList = document.getElementById('songList');
const songCount = document.getElementById('songCount');
const versesContainer = document.getElementById('versesContainer');

let isDisplayOn = false;
let songs = [];
let currentSongIndex = null;
let currentVerseIndex = null;

// Toggle Display
toggleBtn.addEventListener('click', async () => {
  isDisplayOn = await window.electronAPI.toggleDisplay();
  updateDisplayStatus();
});

function updateDisplayStatus() {
  if (isDisplayOn) {
    toggleBtn.textContent = 'Display ausschalten';
    status.textContent = 'Display ist an';
    status.className = 'status-on';
  } else {
    toggleBtn.textContent = 'Display einschalten';
    status.textContent = 'Display ist aus';
    status.className = 'status-off';
  }
}

// Import Songs
importBtn.addEventListener('click', async () => {
  const importedSongs = await window.electronAPI.importSongs();
  
  if (importedSongs.length > 0) {
    // Füge neue Songs zur Liste hinzu statt sie zu ersetzen
    songs = [...songs, ...importedSongs];
    renderSongList();
  }
});

// Render Song List
function renderSongList() {
  songList.innerHTML = '';
  songCount.textContent = songs.length;
  
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = 'song-item';
    if (index === currentSongIndex) {
      li.classList.add('active');
    }
    
    li.innerHTML = `
      <div class="song-title">${song.title}</div>
      <div class="song-verses-count">${song.verses.length} Verse</div>
    `;
    
    li.addEventListener('click', () => {
      currentSongIndex = index;
      currentVerseIndex = null;
      renderSongList();
      renderVerses();
    });
    
    songList.appendChild(li);
  });
}

// Render Verses
function renderVerses() {
  if (currentSongIndex === null) {
    versesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎵</div>
        <h2>Willkommen!</h2>
        <p>Importiere Markdown-Dateien um zu starten.<br>Du kannst mehrere Songs auf einmal importieren.</p>
      </div>
    `;
    return;
  }
  
  const song = songs[currentSongIndex];
  versesContainer.innerHTML = `<div class="verses-container"></div>`;
  const container = versesContainer.querySelector('.verses-container');
  
  const title = document.createElement('h2');
  title.textContent = song.title;
  container.appendChild(title);
  
  song.verses.forEach((verse, index) => {
    const div = document.createElement('div');
    div.className = 'verse-item';
    if (index === currentVerseIndex) {
      div.classList.add('active');
    }
    
    div.innerHTML = `
      <div class="verse-number">Vers ${index + 1}</div>
      <div class="verse-text">${verse}</div>
    `;
    
    div.addEventListener('click', () => {
      currentVerseIndex = index;
      renderVerses();
      window.electronAPI.showVerse(verse);
    });
    
    container.appendChild(div);
  });
}

// Initial render
renderVerses();
