const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Load existing song content if editing
window.addEventListener('DOMContentLoaded', async () => {
  const content = await window.electronAPI.getEditorContent();
  if (content) {
    editor.value = content;
    updatePreview();
  }
});

// Update preview on input
editor.addEventListener('input', updatePreview);

function updatePreview() {
  preview.textContent = editor.value;
}

// Save button
saveBtn.addEventListener('click', async () => {
  const content = editor.value.trim();
  if (!content) {
    alert('Bitte gib Inhalt ein');
    return;
  }
  
  await window.electronAPI.saveSong(content);
});

// Cancel button
cancelBtn.addEventListener('click', () => {
  window.electronAPI.closeEditor();
});
