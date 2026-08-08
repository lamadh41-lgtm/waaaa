/**
 * واجهة المستخدم - عرض وتحديث العناصر
 */

const UI = {
  currentCategory: 'all',
  currentView: 'grid',
  currentSort: 'newest',
  searchQuery: '',
  selectedColor: '#6366f1',
  editingFileId: null,

  async renderCategories(categories, files) {
    const list = document.getElementById('categories-list');
    list.innerHTML = '';

    // عنصر "الكل"
    const allCount = files.length;
    const allItem = this.createCategoryItem({
      id: 'all',
      name: 'كل الملفات',
      icon: '📁',
      color: '#6366f1'
    }, allCount, this.currentCategory === 'all');
    list.appendChild(allItem);

    // باقي القوائم
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    for (const cat of sorted) {
      const count = files.filter(f => f.categoryId === cat.id).length;
      const item = this.createCategoryItem(cat, count, this.currentCategory === cat.id);
      list.appendChild(item);
    }
  },

  createCategoryItem(cat, count, isActive) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'nav-item' + (isActive ? ' active' : '');
    btn.dataset.id = cat.id;
    btn.innerHTML = `
      <span class="cat-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</span>
      <span>${cat.name}</span>
      <span class="count">${count}</span>
    `;
    btn.addEventListener('click', () => {
      this.currentCategory = cat.id;
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      this.updateTitle(cat);
      App.refreshFiles();
    });
    li.appendChild(btn);
    return li;
  },

  updateTitle(cat) {
    const title = document.getElementById('current-category-title');
    const desc = document.getElementById('current-category-desc');
    if (cat.id === 'all') {
      title.textContent = 'كل الملفات';
      desc.textContent = 'كل ما حفظته محلياً في مكان واحد';
    } else {
      title.textContent = cat.name;
      desc.textContent = `ملفات قائمة ${cat.name}`;
    }
  },

  renderFiles(files) {
    const container = document.getElementById('files-container');
    const empty = document.getElementById('empty-state');

    // فلترة حسب البحث
    let filtered = files;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = files.filter(f =>
        (f.displayName || f.name).toLowerCase().includes(q) ||
        (f.notes || '').toLowerCase().includes(q)
      );
    }

    // ترتيب
    filtered = this.sortFiles(filtered);

    container.innerHTML = '';
    container.className = this.currentView === 'list' ? 'files-grid list-view' : 'files-grid';

    if (filtered.length === 0) {
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    filtered.forEach(file => {
      const card = this.createFileCard(file);
      container.appendChild(card);
    });
  },

  sortFiles(files) {
    const sorted = [...files];
    switch (this.currentSort) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case 'name':
        return sorted.sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name, 'ar'));
      case 'size':
        return sorted.sort((a, b) => (b.size || 0) - (a.size || 0));
      default:
        return sorted;
    }
  },

  createFileCard(file) {
    const card = document.createElement('div');
    card.className = 'file-card';
    card.dataset.id = file.id;

    const icon = getFileIcon(file.type, file.name);
    const color = getFileColor(file.type, file.name);

    card.innerHTML = `
      <div class="file-actions">
        <button class="icon-btn btn-download" title="تحميل">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        </button>
      </div>
      <div class="file-icon" style="background:${color}22">${icon}</div>
      <div class="file-info">
        <div class="file-name" title="${file.displayName || file.name}">${file.displayName || file.name}</div>
        <div class="file-meta">
          <span>${formatSize(file.size)}</span>
          <span>•</span>
          <span>${formatDate(file.createdAt)}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-download')) {
        e.stopPropagation();
        App.downloadFile(file.id);
        return;
      }
      App.openFileModal(file.id);
    });

    return card;
  },

  showUploadZone(show) {
    const zone = document.getElementById('upload-zone');
    if (show) {
      zone.classList.remove('hidden');
    } else {
      zone.classList.add('hidden');
    }
  },

  openCategoryModal() {
    document.getElementById('category-name').value = '';
    document.getElementById('category-icon').value = '📁';
    this.selectedColor = '#6366f1';
    document.querySelectorAll('.color-dot').forEach(d => {
      d.classList.toggle('active', d.dataset.color === this.selectedColor);
    });
    document.getElementById('modal-category').classList.remove('hidden');
  },

  closeCategoryModal() {
    document.getElementById('modal-category').classList.add('hidden');
  },

  async openFileModal(file) {
    this.editingFileId = file.id;
    document.getElementById('preview-icon').textContent = getFileIcon(file.type, file.name);
    document.getElementById('preview-name').textContent = file.displayName || file.name;
    document.getElementById('preview-meta').textContent =
      `${formatSize(file.size)} • ${formatDate(file.createdAt)} • ${file.type || 'غير معروف'}`;
    document.getElementById('file-display-name').value = file.displayName || file.name;
    document.getElementById('file-notes').value = file.notes || '';

    // ملء القوائم
    const select = document.getElementById('file-category-select');
    const categories = await getAllCategories();
    select.innerHTML = categories.map(c =>
      `<option value="${c.id}" ${c.id === file.categoryId ? 'selected' : ''}>${c.icon} ${c.name}</option>`
    ).join('');

    document.getElementById('modal-file').classList.remove('hidden');
  },

  closeFileModal() {
    document.getElementById('modal-file').classList.add('hidden');
    this.editingFileId = null;
  },

  setView(view) {
    this.currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
  }
};
