/**
 * ProSpace - التطبيق الرئيسي
 */

const App = {
  categories: [],
  files: [],

  async init() {
    try {
      await openDB();
      await seedDefaultCategories();

      this.categories = await getAllCategories();
      this.files = await getAllFiles();

      // إخفاء اللودر
      setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
      }, 1200);

      this.bindEvents();
      await this.refresh();
    } catch (err) {
      console.error('Init error:', err);
      showToast('حدث خطأ أثناء التحميل', 'error');
    }
  },

  async refresh() {
    this.categories = await getAllCategories();
    this.files = await getAllFiles();
    await UI.renderCategories(this.categories, this.files);
    await this.refreshFiles();
  },

  async refreshFiles() {
    let files;
    if (UI.currentCategory === 'all') {
      files = this.files;
    } else {
      files = this.files.filter(f => f.categoryId === UI.currentCategory);
    }
    UI.renderFiles(files);
  },

  bindEvents() {
    // رفع ملفات
    document.getElementById('btn-upload').addEventListener('click', () => {
      UI.showUploadZone(true);
    });
    document.getElementById('btn-empty-upload').addEventListener('click', () => {
      UI.showUploadZone(true);
    });
    document.getElementById('btn-cancel-upload').addEventListener('click', () => {
      UI.showUploadZone(false);
    });
    document.getElementById('btn-select-files').addEventListener('click', () => {
      document.getElementById('file-input').click();
    });
    document.getElementById('file-input').addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag & Drop
    const dropArea = document.getElementById('drop-area');
    ['dragenter', 'dragover'].forEach(evt => {
      dropArea.addEventListener(evt, (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dropArea.addEventListener(evt, (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
      });
    });
    dropArea.addEventListener('drop', (e) => {
      this.handleFiles(e.dataTransfer.files);
    });

    // إضافة قائمة
    document.getElementById('add-category-btn').addEventListener('click', () => {
      UI.openCategoryModal();
    });
    document.getElementById('btn-cancel-category').addEventListener('click', () => {
      UI.closeCategoryModal();
    });
    document.getElementById('btn-save-category').addEventListener('click', () => {
      this.saveNewCategory();
    });
    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        UI.selectedColor = dot.dataset.color;
      });
    });
    document.querySelector('#modal-category .modal-backdrop').addEventListener('click', () => {
      UI.closeCategoryModal();
    });

    // نافذة الملف
    document.getElementById('btn-close-file').addEventListener('click', () => {
      UI.closeFileModal();
    });
    document.getElementById('btn-save-file').addEventListener('click', () => {
      this.saveFileChanges();
    });
    document.getElementById('btn-delete-file').addEventListener('click', () => {
      this.deleteCurrentFile();
    });
    document.querySelector('#modal-file .modal-backdrop').addEventListener('click', () => {
      UI.closeFileModal();
    });

    // بحث
    document.getElementById('search-input').addEventListener('input', (e) => {
      UI.searchQuery = e.target.value.trim();
      this.refreshFiles();
    });

    // ترتيب
    document.getElementById('sort-select').addEventListener('change', (e) => {
      UI.currentSort = e.target.value;
      this.refreshFiles();
    });

    // عرض
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        UI.setView(btn.dataset.view);
        this.refreshFiles();
      });
    });

    // المحفوظات المحلية
    document.getElementById('btn-all-saves').addEventListener('click', () => {
      UI.currentCategory = 'all';
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      const allBtn = document.querySelector('.nav-item[data-id="all"]');
      if (allBtn) allBtn.classList.add('active');
      UI.updateTitle({ id: 'all' });
      this.refreshFiles();
      showToast('عرض كل المحفوظات المحلية');
    });

    // طي الشريط الجانبي
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
    });
  },

  async handleFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const categoryId = UI.currentCategory === 'all' ? 'other' : UI.currentCategory;
    let successCount = 0;

    for (const file of Array.from(fileList)) {
      try {
        // حد أقصى 50 ميجا لكل ملف (لتجنب مشاكل الذاكرة)
        if (file.size > 50 * 1024 * 1024) {
          showToast(`الملف ${file.name} كبير جداً (الحد 50 م.ب)`, 'error');
          continue;
        }

        const buffer = await readFileAsArrayBuffer(file);
        const fileData = {
          id: generateId(),
          name: file.name,
          displayName: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          categoryId,
          notes: '',
          createdAt: Date.now(),
          data: buffer
        };

        await saveFile(fileData);
        successCount++;
      } catch (err) {
        console.error('Upload error:', err);
        showToast(`فشل رفع ${file.name}`, 'error');
      }
    }

    if (successCount > 0) {
      showToast(`تم حفظ ${successCount} ملف محلياً بنجاح`);
      UI.showUploadZone(false);
      document.getElementById('file-input').value = '';
      await this.refresh();
    }
  },

  async saveNewCategory() {
    const name = document.getElementById('category-name').value.trim();
    const icon = document.getElementById('category-icon').value.trim() || '📁';

    if (!name) {
      showToast('اكتب اسم القائمة', 'error');
      return;
    }

    const cat = {
      id: generateId(),
      name,
      icon,
      color: UI.selectedColor,
      order: this.categories.length + 1
    };

    await saveCategory(cat);
    UI.closeCategoryModal();
    showToast(`تم إنشاء قائمة "${name}"`);
    await this.refresh();
  },

  async openFileModal(id) {
    const file = await getFile(id);
    if (!file) return;
    UI.openFileModal(file);
  },

  async saveFileChanges() {
    if (!UI.editingFileId) return;

    const file = await getFile(UI.editingFileId);
    if (!file) return;

    file.displayName = document.getElementById('file-display-name').value.trim() || file.name;
    file.categoryId = document.getElementById('file-category-select').value;
    file.notes = document.getElementById('file-notes').value.trim();

    await saveFile(file);
    UI.closeFileModal();
    showToast('تم الحفظ محلياً');
    await this.refresh();
  },

  async deleteCurrentFile() {
    if (!UI.editingFileId) return;
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;

    await deleteFile(UI.editingFileId);
    UI.closeFileModal();
    showToast('تم الحذف');
    await this.refresh();
  },

  async downloadFile(id) {
    const file = await getFile(id);
    if (!file || !file.data) {
      showToast('الملف غير موجود', 'error');
      return;
    }
    const blob = new Blob([file.data], { type: file.type });
    downloadBlob(blob, file.displayName || file.name);
    showToast('جاري التحميل...');
  }
};

// بدء التطبيق
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
