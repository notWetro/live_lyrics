const toggleBtn = document.getElementById('toggleBtn');
const importBtn = document.getElementById('importBtn');
const blackoutBtn = document.getElementById('blackoutBtn');
const status = document.getElementById('status');
const songList = document.getElementById('songList');
const songCount = document.getElementById('songCount');
const versesContainer = document.getElementById('versesContainer');

let isDisplayOn = false;
let songs = [];
let currentSongIndex = null;
let currentVerseIndex = null;
let draggedIndex = null;

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

// Blackout
blackoutBtn.addEventListener('click', () => {
  window.electronAPI.showVerse('');
});

// Render Song List
function renderSongList() {
  songList.innerHTML = '';
  songCount.textContent = songs.length;
  
  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = 'song-item';
    li.draggable = true;
    if (index === currentSongIndex) {
      li.classList.add('active');
    }
    
    li.innerHTML = `
      <div class="song-title">${song.title}</div>
      <div class="song-verses-count">${song.verses.length} Verse</div>
    `;
    
    // Click handler
    li.addEventListener('click', () => {
      currentSongIndex = index;
      currentVerseIndex = null;
      renderSongList();
      renderVerses();
    });
    
    // Drag and Drop handlers
    li.addEventListener('dragstart', (e) => {
      draggedIndex = index;
      li.style.opacity = '0.5';
    });
    
    li.addEventListener('dragend', (e) => {
      li.style.opacity = '1';
    });
    
    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(songList, e.clientY);
      if (afterElement == null) {
        songList.appendChild(li);
      }
    });
    
    li.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedIndex !== null && draggedIndex !== index) {
        const draggedSong = songs[draggedIndex];
        songs.splice(draggedIndex, 1);
        const newIndex = draggedIndex < index ? index - 1 : index;
        songs.splice(newIndex, 0, draggedSong);
        
        // Update current song index if needed
        if (currentSongIndex === draggedIndex) {
          currentSongIndex = newIndex;
        } else if (draggedIndex < currentSongIndex && newIndex >= currentSongIndex) {
          currentSongIndex--;
        } else if (draggedIndex > currentSongIndex && newIndex <= currentSongIndex) {
          currentSongIndex++;
        }
        
        draggedIndex = null;
        renderSongList();
        renderVerses();
      }
    });
    
    // Context menu handler
    li.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, index);
    });
    
    songList.appendChild(li);
  });
}

// Helper function for drag and drop
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.song-item:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Context menu
function showContextMenu(x, y, index) {
  // Remove existing context menu if any
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  
  const removeOption = document.createElement('div');
  removeOption.className = 'context-menu-item';
  removeOption.innerHTML = '🗑️ Entfernen';
  removeOption.addEventListener('click', () => {
    removeSong(index);
    menu.remove();
  });
  
  menu.appendChild(removeOption);
  document.body.appendChild(menu);
  
  // Close menu on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu() {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    });
  }, 0);
}

function removeSong(index) {
  songs.splice(index, 1);
  
  // Update current song index
  if (currentSongIndex === index) {
    currentSongIndex = null;
    currentVerseIndex = null;
  } else if (currentSongIndex > index) {
    currentSongIndex--;
  }
  
  renderSongList();
  renderVerses();
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
