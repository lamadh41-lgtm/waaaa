/**
 * أدوات مساعدة
 */

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 ب';
  const units = ['ب', 'ك.ب', 'م.ب', 'ج.ب'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const diff = now - d;

  if (diff < 60000) return 'الآن';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' د';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' س';
  if (diff < 604800000) return Math.floor(diff / 86400000) + ' ي';

  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getFileIcon(type, name) {
  const ext = (name || '').split('.').pop().toLowerCase();

  // صور
  if (type.startsWith('image/')) return '🖼️';
  // فيديو
  if (type.startsWith('video/')) return '🎬';
  // صوت
  if (type.startsWith('audio/')) return '🎵';
  // PDF
  if (type === 'application/pdf' || ext === 'pdf') return '📕';
  // مستندات
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext) || type.includes('document')) return '📘';
  // جداول
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || type.includes('sheet')) return '📊';
  // عروض
  if (['ppt', 'pptx', 'odp'].includes(ext)) return '📙';
  // أرشيف
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '🗜️';
  // برامج / تنفيذية
  if (['exe', 'msi', 'apk', 'dmg', 'app'].includes(ext)) return '⚙️';
  // كود
  if (['js', 'ts', 'py', 'html', 'css', 'json', 'xml', 'java', 'cpp', 'c', 'php'].includes(ext)) return '💻';
  // نصوص
  if (['txt', 'md', 'log'].includes(ext) || type.startsWith('text/')) return '📝';

  return '📄';
}

function getFileColor(type, name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  if (type.startsWith('image/')) return '#ec4899';
  if (type.startsWith('video/')) return '#f59e0b';
  if (type.startsWith('audio/')) return '#8b5cf6';
  if (type === 'application/pdf' || ext === 'pdf') return '#ef4444';
  if (['zip', 'rar', '7z'].includes(ext)) return '#06b6d4';
  if (['exe', 'msi', 'apk'].includes(ext)) return '#6366f1';
  return '#6b7280';
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}
