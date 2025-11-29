// API Configuration
// Auto-detect environment: production (Vercel) or local development
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : '/api';

// ImgBB API Configuration
const IMGBB_API_KEY = '4042c537845e8b19b443add46f4a859c';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

// State Management
let currentPage = 'default';
let isSettingsMode = false;
let isViewMode = false;
let editingSection = null;
let editingItem = null;
let currentTab = 'url';
let uploadedImageData = null;
let currentPageData = null;

// API Functions
async function fetchPages() {
  try {
    const response = await fetch(`${API_BASE_URL}/pages`);
    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
}

async function fetchPage(pageId) {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}`);
    const result = await response.json();
    if (result.success) {
      currentPageData = result.data;
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

async function savePage(pageId, sections) {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections })
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error saving page:', error);
    return false;
  }
}

async function createPage(name) {
  try {
    const response = await fetch(`${API_BASE_URL}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error creating page:', error);
    console.error('Make sure backend server is running: cd backend && npm start');
    return null;
  }
}

async function deletePage(pageId) {
  try {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error deleting page:', error);
    return false;
  }
}

async function createShareLink(pageId) {
  try {
    const response = await fetch(`${API_BASE_URL}/share/${pageId}`, {
      method: 'POST'
    });
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error creating share link:', error);
    return null;
  }
}

async function fetchSharedPage(shortCode) {
  try {
    const response = await fetch(`${API_BASE_URL}/share/${shortCode}`);
    const result = await response.json();
    if (result.success) {
      currentPageData = result.data;
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching shared page:', error);
    return null;
  }
}

function getCurrentPageData() {
  return currentPageData || { name: 'My Gallery', sections: [] };
}

// ImgBB Upload Function
async function uploadToImgBB(base64Image) {
  try {
    // Remove data:image/xxx;base64, prefix if exists
    const base64Data = base64Image.split(',')[1] || base64Image;
    
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Data);
    
    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      return {
        url: result.data.url, // Full size for lightbox
        thumb: result.data.medium?.url || result.data.thumb.url, // Medium size for grid (faster)
        medium: result.data.medium?.url || result.data.url,
        deleteUrl: result.data.delete_url
      };
    } else {
      throw new Error(result.error?.message || 'Upload failed');
    }
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
}

// Generate dynamic content
function generateGallery() {
  const container = document.getElementById('mainContainer');
  if (!container) return;
  
  const pageData = getCurrentPageData();
  let html = '';
  
  if (!pageData.sections || pageData.sections.length === 0) {
    html = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.3;">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
        <h3>No sections yet</h3>
        <p>${isSettingsMode ? 'Click "Add New Section" to get started' : 'Enable Settings Mode to add content'}</p>
      </div>
    `;
    
    if (isSettingsMode) {
      html += `
        <div class="add-section-wrapper">
          <button class="btn btn-add-section" id="addSection">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Add New Section
          </button>
        </div>
      `;
    }
    
    container.innerHTML = html;
    if (isSettingsMode) attachSettingsListeners();
    return;
  }
  
  pageData.sections.forEach((section, index) => {
    const sectionId = section.id || Date.now() + index;
    html += `
      <div class="hs__wrapper hs__wrapper--${sectionId}" data-section-id="${sectionId}">
        <div class="hs__header">
          <h2 class="hs__headline">${section.headline}</h2>
          <div class="hs__actions">
            ${isSettingsMode ? `
              <button class="action-btn action-btn--add" data-action="add-image" data-section="${sectionId}" title="Add Image">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
              <button class="action-btn action-btn--delete" data-action="delete-section" data-section="${sectionId}" title="Delete Section">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            ` : ''}
            <div class="hs__arrows">
              <a class="arrow disabled arrow-prev"></a>
              <a class="arrow arrow-next"></a>
            </div>
          </div>
        </div>
        <ul class="hs lightgallery-${sectionId}">
    `;
    
    if (section.items && section.items.length > 0) {
      section.items.forEach(item => {
        const imgUrl = item.image_url || item.imageUrl || `https://picsum.photos/300/300`;
        const imgLarge = item.image_large || item.imageLarge || item.image_url || item.imageUrl || `https://picsum.photos/1200/1200`;
        
        html += `
          <li class="hs__item" data-item-id="${item.id}">
            ${isSettingsMode ? `
              <div class="item-actions">
                <button class="item-action-btn" data-action="edit-image" data-section="${sectionId}" data-item="${item.id}" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
                <button class="item-action-btn item-action-btn--delete" data-action="delete-image" data-section="${sectionId}" data-item="${item.id}" title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            ` : ''}
            <a href="${imgLarge}" class="hs__item__image__wrapper">
              <img class="hs__item__image" src="${imgUrl}" alt="${item.title}" loading="lazy"/>
            </a>
            <div class="hs__item__description">
              <span class="hs__item__title">${item.title}</span>
              <span class="hs__item__subtitle">${item.subtitle || ''}</span>
            </div>
          </li>
        `;
      });
    }
    
    html += `
        </ul>
      </div>
    `;
  });
  
  // Add section button in settings mode
  if (isSettingsMode) {
    html += `
      <div class="add-section-wrapper">
        <button class="btn btn-add-section" id="addSection">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Add New Section
        </button>
      </div>
    `;
  }
  
  container.innerHTML = html;
  
  // Initialize LightGallery for each section (only if not in settings mode)
  if (!isSettingsMode) {
    pageData.sections.forEach((section) => {
      const sectionId = section.id;
      const galleryElement = document.querySelector(`.lightgallery-${sectionId}`);
      if (galleryElement) {
        lightGallery(galleryElement, {
          speed: 500,
          plugins: [lgZoom, lgThumbnail, lgFullscreen],
          thumbnail: true,
          animateThumb: true,
          showThumbByDefault: false,
          zoom: true,
          actualSize: false,
          download: false,
          counter: true,
          selector: '.hs__item__image__wrapper',
          mode: 'lg-fade',
          hideControlOnEnd: true,
          closable: true,
          escKey: true
        });
      }
    });
  }
  
  // Attach event listeners for settings mode
  if (isSettingsMode) {
    attachSettingsListeners();
  }
  
  // Reinitialize horizontal scroll after content is loaded
  setTimeout(initHorizontalScroll, 100);
}

// Theme Switcher
const themeButtons = document.querySelectorAll('.theme-btn');
const body = document.body;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
body.className = `theme-${savedTheme}`;
document.querySelector(`[data-theme="${savedTheme}"]`)?.classList.add('active');

themeButtons.forEach(btn => {
  btn.addEventListener('click', function() {
    const theme = this.getAttribute('data-theme');
    
    // Remove active class from all buttons
    themeButtons.forEach(b => b.classList.remove('active'));
    
    // Add active class to clicked button
    this.classList.add('active');
    
    // Remove all theme classes
    body.className = body.className.split(' ').filter(c => !c.startsWith('theme-')).join(' ');
    
    // Add new theme class
    body.classList.add(`theme-${theme}`);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  });
});

// Navbar dropdown toggle
const navToggle = document.getElementById('navToggle');
const navDropdown = document.getElementById('navDropdown');

if (navToggle && navDropdown) {
  navToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    navToggle.classList.toggle('active');
    navDropdown.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!navToggle.contains(e.target) && !navDropdown.contains(e.target)) {
      navToggle.classList.remove('active');
      navDropdown.classList.remove('active');
    }
  });

  // Close dropdown when clicking a link
  navDropdown.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
      navToggle.classList.remove('active');
      navDropdown.classList.remove('active');
    });
  });
}

// Wait for jQuery and images to load
$(document).ready(function() {
  setTimeout(function() {
    // LightGallery handles image clicks automatically
  }, 500);
});

// Horizontal scroll functionality
function initHorizontalScroll() {
  var instance = $(".hs__wrapper");
  $.each( instance, function(key, value) {
      
    var arrows = $(instance[key]).find(".arrow"),
        prevArrow = arrows.filter('.arrow-prev'),
        nextArrow = arrows.filter('.arrow-next'),
        box = $(instance[key]).find(".hs"), 
        x = 0,
        mx = 0,
        maxScrollWidth = box[0].scrollWidth - (box[0].clientWidth / 2) - (box.width() / 2);

    $(arrows).on('click', function() {
        
      if ($(this).hasClass("arrow-next")) {
        x = ((box.width() / 2)) + box.scrollLeft() - 10;
        box.animate({
          scrollLeft: x,
        })
      } else {
        x = ((box.width() / 2)) - box.scrollLeft() -10;
        box.animate({
          scrollLeft: -x,
        })
      }
        
    });
      
    $(box).on({
      mousemove: function(e) {
        var mx2 = e.pageX - this.offsetLeft;
        if(mx) this.scrollLeft = this.sx + mx - mx2;
      },
      mousedown: function(e) {
        this.sx = this.scrollLeft;
        mx = e.pageX - this.offsetLeft;
      },
      scroll: function() {
        toggleArrows();
      }
    });

    $(document).on("mouseup", function(){
      mx = 0;
    });
    
    function toggleArrows() {
      if(box.scrollLeft() > maxScrollWidth - 10) {
          // disable next button when right end has reached 
          nextArrow.addClass('disabled');
        } else if(box.scrollLeft() < 10) {
          // disable prev button when left end has reached 
          prevArrow.addClass('disabled')
        } else{
          // both are enabled
          nextArrow.removeClass('disabled');
          prevArrow.removeClass('disabled');
        }
    }
    
  });
}

// Initialize gallery on page load
$(document).ready(function() {
  checkViewMode();
  initializeModals();
  initializeMenuHandlers();
});

// Check if in view mode from URL
async function checkViewMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const shortCode = urlParams.get('share');
  const pageId = urlParams.get('page');
  
  if (shortCode) {
    // Shared view mode
    isViewMode = true;
    isSettingsMode = false;
    document.querySelector('.navbar').style.display = 'none';
    
    const data = await fetchSharedPage(shortCode);
    if (data) {
      generateGallery();
    } else {
      document.getElementById('mainContainer').innerHTML = '<div class="empty-state"><h3>Share link not found</h3></div>';
    }
  } else {
    // Normal mode - load page
    if (pageId) {
      currentPage = pageId;
    }
    await loadCurrentPage();
  }
}

async function loadCurrentPage() {
  const data = await fetchPage(currentPage);
  if (data) {
    generateGallery();
  }
}

// Settings Mode Functions
function enableSettingsMode() {
  isSettingsMode = true;
  isViewMode = false;
  document.getElementById('settingsBar').style.display = 'block';
  generateGallery();
}

function disableSettingsMode() {
  isSettingsMode = false;
  document.getElementById('settingsBar').style.display = 'none';
  generateGallery();
}

function attachSettingsListeners() {
  // Add image buttons
  document.querySelectorAll('[data-action="add-image"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionId = this.dataset.section;
      openImageModal('add', sectionId);
    });
  });
  
  // Edit image buttons
  document.querySelectorAll('[data-action="edit-image"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionId = this.dataset.section;
      const itemId = this.dataset.item;
      openImageModal('edit', sectionId, itemId);
    });
  });
  
  // Delete image buttons
  document.querySelectorAll('[data-action="delete-image"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionId = this.dataset.section;
      const itemId = this.dataset.item;
      deleteImage(sectionId, itemId);
    });
  });
  
  // Delete section buttons
  document.querySelectorAll('[data-action="delete-section"]').forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionId = this.dataset.section;
      deleteSection(sectionId);
    });
  });
  
  // Add section button
  const addSectionBtn = document.getElementById('addSection');
  if (addSectionBtn) {
    addSectionBtn.addEventListener('click', addNewSection);
  }
}

// Image Modal Functions
function openImageModal(mode, sectionId, itemId = null) {
  editingSection = sectionId;
  editingItem = itemId;
  uploadedImageData = null;
  
  const modal = document.getElementById('imageModal');
  const title = document.getElementById('imageModalTitle');
  
  title.textContent = mode === 'edit' ? 'Edit Image' : 'Add Image';
  
  // Reset form
  document.getElementById('imageUrl').value = '';
  document.getElementById('imageTitle').value = '';
  document.getElementById('imageSubtitle').value = '';
  document.getElementById('imageTitle2').value = '';
  document.getElementById('imageSubtitle2').value = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.querySelector('.upload-placeholder').style.display = 'flex';
  
  // If editing, populate form
  if (mode === 'edit' && itemId) {
    const pageData = getCurrentPageData();
    const section = pageData.sections.find(s => s.id == sectionId);
    if (section) {
      const item = section.items.find(i => i.id == itemId);
      if (item) {
        const url = item.image_url || item.imageUrl || '';
        const title = item.title || '';
        const subtitle = item.subtitle || '';
        
        document.getElementById('imageUrl').value = url;
        document.getElementById('imageTitle').value = title;
        document.getElementById('imageSubtitle').value = subtitle;
        document.getElementById('imageTitle2').value = title;
        document.getElementById('imageSubtitle2').value = subtitle;
      }
    }
  }
  
  modal.style.display = 'flex';
}

function closeImageModal() {
  document.getElementById('imageModal').style.display = 'none';
  editingSection = null;
  editingItem = null;
  uploadedImageData = null;
}

async function saveImageData() {
  console.log('=== SAVE IMAGE DEBUG ===');
  const pageData = getCurrentPageData();
  console.log('Page Data:', pageData);
  console.log('Editing Section:', editingSection);
  
  const section = pageData.sections.find(s => s.id == editingSection);
  
  if (!section) {
    console.error('Section not found!');
    alert('Error: Section not found');
    return;
  }
  
  console.log('Section found:', section);
  
  let imageUrl, imageLarge, title, subtitle;
  
  if (currentTab === 'url') {
    imageUrl = document.getElementById('imageUrl').value.trim();
    imageLarge = imageUrl;
    title = document.getElementById('imageTitle').value.trim();
    subtitle = document.getElementById('imageSubtitle').value.trim();
  } else {
    if (!uploadedImageData) {
      alert('Please upload an image');
      return;
    }
    
    title = document.getElementById('imageTitle2').value.trim();
    subtitle = document.getElementById('imageSubtitle2').value.trim();
    
    // Upload to ImgBB
    try {
      console.log('Uploading to ImgBB...');
      const uploadResult = await uploadToImgBB(uploadedImageData);
      console.log('ImgBB upload success:', uploadResult);
      
      imageUrl = uploadResult.thumb; // Use thumbnail for grid
      imageLarge = uploadResult.url; // Use full size for lightbox
      
      alert('Image uploaded to ImgBB successfully!');
    } catch (error) {
      console.error('ImgBB upload failed:', error);
      alert('Failed to upload image to ImgBB. Using base64 instead.');
      // Fallback to base64
      imageUrl = uploadedImageData;
      imageLarge = uploadedImageData;
    }
  }
  
  console.log('Image data:', { imageUrl, title, subtitle });
  
  if (!imageUrl || !title) {
    alert('Please fill in required fields (URL and Title)');
    return;
  }
  
  if (editingItem) {
    // Edit existing item
    const item = section.items.find(i => i.id == editingItem);
    if (item) {
      item.image_url = imageUrl;
      item.imageUrl = imageUrl;
      item.image_large = imageLarge;
      item.imageLarge = imageLarge;
      item.title = title;
      item.subtitle = subtitle;
      console.log('Updated item:', item);
    }
  } else {
    // Add new item
    if (!section.items) section.items = [];
    const newItem = {
      id: Date.now(),
      image_url: imageUrl,
      imageUrl: imageUrl,
      image_large: imageLarge,
      imageLarge: imageLarge,
      title: title,
      subtitle: subtitle
    };
    section.items.push(newItem);
    console.log('Added new item:', newItem);
  }
  
  console.log('Saving to database...');
  console.log('Current Page:', currentPage);
  console.log('Sections to save:', pageData.sections);
  
  // Save to database
  try {
    const saved = await savePage(currentPage, pageData.sections);
    console.log('Save result:', saved);
    
    if (saved) {
      console.log('✅ Image saved successfully');
      closeImageModal();
      await loadCurrentPage();
    } else {
      console.error('❌ Save failed - API returned false');
      alert('Error saving image to database. Check console for details.');
    }
  } catch (error) {
    console.error('❌ Save error:', error);
    alert('Error saving image: ' + error.message);
  }
}

async function deleteImage(sectionId, itemId) {
  if (!confirm('Are you sure you want to delete this image?')) return;
  
  const pageData = getCurrentPageData();
  const section = pageData.sections.find(s => s.id == sectionId);
  
  if (section) {
    section.items = section.items.filter(i => i.id != itemId);
    const saved = await savePage(currentPage, pageData.sections);
    if (saved) {
      await loadCurrentPage();
    }
  }
}

// Section Functions
async function addNewSection() {
  const sectionName = prompt('Enter section name:');
  if (!sectionName) return;
  
  const pageData = getCurrentPageData();
  if (!pageData.sections) pageData.sections = [];
  
  const newSection = {
    id: Date.now(),
    headline: sectionName,
    items: []
  };
  
  pageData.sections.push(newSection);
  const saved = await savePage(currentPage, pageData.sections);
  if (saved) {
    await loadCurrentPage();
  }
}

async function deleteSection(sectionId) {
  if (!confirm('Are you sure you want to delete this section?')) return;
  
  const pageData = getCurrentPageData();
  pageData.sections = pageData.sections.filter(s => s.id != sectionId);
  const saved = await savePage(currentPage, pageData.sections);
  if (saved) {
    await loadCurrentPage();
  }
}

// Page Manager Functions
async function openPageManager() {
  const modal = document.getElementById('pageModal');
  const pageList = document.getElementById('pageList');
  
  const pages = await fetchPages();
  
  let html = '<div class="page-items">';
  
  pages.forEach(page => {
    const isCurrent = page.id === currentPage;
    
    html += `
      <div class="page-item ${isCurrent ? 'active' : ''}">
        <div class="page-item__info">
          <span class="page-item__name">${page.name}</span>
          <span class="page-item__id">${page.id}</span>
        </div>
        <div class="page-item__actions">
          ${!isCurrent ? `<button class="btn-sm" onclick="switchPage('${page.id}')">Switch</button>` : '<span class="badge">Current</span>'}
          <button class="btn-sm" onclick="editPageName('${page.id}', '${page.name.replace(/'/g, "\\'")}')">Edit</button>
          ${page.id !== 'default' ? `<button class="btn-sm btn-danger" onclick="deletePageConfirm('${page.id}', '${page.name.replace(/'/g, "\\'")}')">Delete</button>` : ''}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  pageList.innerHTML = html;
  modal.style.display = 'flex';
}

function openCreatePageModal() {
  document.getElementById('pageName').value = '';
  document.getElementById('createPageModal').style.display = 'flex';
  document.getElementById('pageModal').style.display = 'none';
}

async function createNewPage() {
  const name = document.getElementById('pageName').value.trim();
  if (!name) {
    alert('Please enter a page name');
    return;
  }
  
  const result = await createPage(name);
  if (result) {
    currentPage = result.id;
    document.getElementById('createPageModal').style.display = 'none';
    await loadCurrentPage();
  } else {
    alert('Error creating page. Make sure the backend server is running on http://localhost:3000');
  }
}

async function switchPage(pageId) {
  currentPage = pageId;
  document.getElementById('pageModal').style.display = 'none';
  await loadCurrentPage();
}

async function editPageName(pageId, currentName) {
  const newName = prompt('Enter new page name:', currentName);
  if (!newName || newName.trim() === '') {
    alert('Page name cannot be empty');
    return;
  }
  
  if (newName.trim() === currentName) {
    return; // No change
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/pages/${pageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Page name updated!');
      // Refresh page list
      await openPageManager();
      // Reload current page if editing current page
      if (pageId === currentPage) {
        await loadCurrentPage();
      }
    } else {
      alert('❌ Failed to update page name');
    }
  } catch (error) {
    console.error('Error updating page name:', error);
    alert('❌ Error updating page name. Make sure backend is running.');
  }
}

async function deletePageConfirm(pageId, pageName) {
  const confirmed = confirm(`⚠️ Delete Page: "${pageName}"\n\nAre you sure? This action cannot be undone.\nAll sections and images in this page will be permanently deleted.`);
  if (!confirmed) return;
  
  const success = await deletePage(pageId);
  if (success) {
    if (currentPage === pageId) {
      currentPage = 'default';
      await loadCurrentPage();
    }
    openPageManager();
  }
}

// Share Functions
async function openShareModal() {
  const modal = document.getElementById('shareModal');
  const shareLink = document.getElementById('shareLink');
  
  // Create share link
  const result = await createShareLink(currentPage);
  
  if (result) {
    const baseUrl = window.location.origin + window.location.pathname;
    const fullLink = `${baseUrl}?share=${result.shortCode}`;
    shareLink.value = fullLink;
  } else {
    shareLink.value = 'Error creating share link';
  }
  
  modal.style.display = 'flex';
}

function copyShareLink() {
  const shareLink = document.getElementById('shareLink');
  shareLink.select();
  document.execCommand('copy');
  
  const btn = document.getElementById('copyLink');
  const originalText = btn.textContent;
  btn.textContent = 'Copied!';
  setTimeout(() => {
    btn.textContent = originalText;
  }, 2000);
}

// Modal Initialization
function initializeModals() {
  // Settings bar
  document.getElementById('exitSettings')?.addEventListener('click', disableSettingsMode);
  
  // Image modal
  document.getElementById('closeImageModal')?.addEventListener('click', closeImageModal);
  document.getElementById('cancelImage')?.addEventListener('click', closeImageModal);
  document.getElementById('saveImage')?.addEventListener('click', saveImageData);
  
  // Tab switching
  document.querySelectorAll('.modal__tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;
      currentTab = tabName;
      
      document.querySelectorAll('.modal__tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.modal__tab-content').forEach(c => c.classList.remove('active'));
      
      this.classList.add('active');
      document.getElementById(tabName + 'Tab').classList.add('active');
    });
  });
  
  // File upload
  const uploadArea = document.getElementById('uploadArea');
  const imageFile = document.getElementById('imageFile');
  const imagePreview = document.getElementById('imagePreview');
  
  uploadArea?.addEventListener('click', () => imageFile.click());
  
  imageFile?.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = function(e) {
        uploadedImageData = e.target.result;
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        document.querySelector('.upload-placeholder').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Drag and drop
  uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#007aff';
  });
  
  uploadArea?.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
  });
  
  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        uploadedImageData = e.target.result;
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        document.querySelector('.upload-placeholder').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Page modals
  document.getElementById('closePageModal')?.addEventListener('click', () => {
    document.getElementById('pageModal').style.display = 'none';
  });
  
  document.getElementById('addNewPage')?.addEventListener('click', openCreatePageModal);
  
  document.getElementById('closeCreatePageModal')?.addEventListener('click', () => {
    document.getElementById('createPageModal').style.display = 'none';
  });
  
  document.getElementById('cancelPage')?.addEventListener('click', () => {
    document.getElementById('createPageModal').style.display = 'none';
  });
  
  document.getElementById('savePage')?.addEventListener('click', createNewPage);
  
  // Share modal
  document.getElementById('closeShareModal')?.addEventListener('click', () => {
    document.getElementById('shareModal').style.display = 'none';
  });
  
  document.getElementById('copyLink')?.addEventListener('click', copyShareLink);
  
  // Close modals on outside click
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
}

// Menu Handlers
function initializeMenuHandlers() {
  document.getElementById('menuPage')?.addEventListener('click', (e) => {
    e.preventDefault();
    openPageManager();
  });
  
  document.getElementById('menuSettings')?.addEventListener('click', (e) => {
    e.preventDefault();
    enableSettingsMode();
  });
  
  document.getElementById('menuShare')?.addEventListener('click', (e) => {
    e.preventDefault();
    openShareModal();
  });
}
