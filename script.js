// work in progress - needs some refactoring and will drop JQuery i promise :)

// State Management
let currentPage = 'default';
let isSettingsMode = false;
let isViewMode = false;
let editingSection = null;
let editingItem = null;
let currentTab = 'url';
let uploadedImageData = null;

// Pages Storage
let pages = JSON.parse(localStorage.getItem('galleryPages')) || {
  default: {
    name: 'My Gallery',
    sections: []
  }
};

// Dynamic Data Configuration
const galleryData = [
  {
    id: 1,
    headline: "Nature Collection",
    items: [
      { id: 112, title: "Mountain View", subtitle: "Landscape" },
      { id: 122, title: "Forest Path", subtitle: "Nature" },
      { id: 132, title: "Ocean Waves", subtitle: "Seascape" },
      { id: 142, title: "Desert Dunes", subtitle: "Adventure" },
      { id: 152, title: "Northern Lights", subtitle: "Sky" },
      { id: 162, title: "Tropical Beach", subtitle: "Paradise" },
      { id: 172, title: "Waterfall", subtitle: "Nature" },
      { id: 182, title: "Sunset", subtitle: "Evening" },
      { id: 192, title: "Canyon", subtitle: "Landscape" },
      { id: 202, title: "Lake View", subtitle: "Peaceful" }
    ]
  },
  {
    id: 2,
    headline: "Urban Life",
    items: [
      { id: 213, title: "City Lights", subtitle: "Night" },
      { id: 223, title: "Architecture", subtitle: "Modern" },
      { id: 233, title: "Street Art", subtitle: "Culture" },
      { id: 243, title: "Skyline", subtitle: "Urban" },
      { id: 253, title: "Subway", subtitle: "Transit" },
      { id: 263, title: "Cafe", subtitle: "Lifestyle" },
      { id: 273, title: "Market", subtitle: "Shopping" },
      { id: 283, title: "Park", subtitle: "Green Space" },
      { id: 293, title: "Bridge", subtitle: "Infrastructure" },
      { id: 303, title: "Plaza", subtitle: "Public Space" }
    ]
  },
  {
    id: 3,
    headline: "Travel Memories",
    items: [
      { id: 314, title: "Paris", subtitle: "France" },
      { id: 324, title: "Tokyo", subtitle: "Japan" },
      { id: 334, title: "New York", subtitle: "USA" },
      { id: 344, title: "London", subtitle: "UK" },
      { id: 354, title: "Dubai", subtitle: "UAE" },
      { id: 364, title: "Barcelona", subtitle: "Spain" },
      { id: 374, title: "Singapore", subtitle: "Asia" },
      { id: 384, title: "Sydney", subtitle: "Australia" },
      { id: 394, title: "Rome", subtitle: "Italy" },
      { id: 404, title: "Amsterdam", subtitle: "Netherlands" }
    ]
  }
];

// Initialize default page if empty
if (!pages.default || !pages.default.sections || pages.default.sections.length === 0) {
  pages.default = {
    name: 'My Gallery',
    sections: galleryData
  };
  savePages();
}

function savePages() {
  localStorage.setItem('galleryPages', JSON.stringify(pages));
}

function getCurrentPageData() {
  return pages[currentPage] || pages.default;
}

// Generate dynamic content
function generateGallery() {
  const container = document.getElementById('mainContainer');
  if (!container) return;
  
  const pageData = getCurrentPageData();
  let html = '';
  
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
    
    section.items.forEach(item => {
      const imgUrl = item.imageUrl || `https://picsum.photos/id/${item.id}/300/300`;
      const imgLarge = item.imageLarge || `https://picsum.photos/id/${item.id}/1200/1200`;
      
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
              <span class="hs__item__subtitle">${item.subtitle}</span>
            </div>
          </li>
      `;
    });
    
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
      const sectionId = section.id || section.id;
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

// Lightbox functionality removed - using LightGallery instead

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
  generateGallery();
  initializeModals();
  initializeMenuHandlers();
});

// Check if in view mode from URL
function checkViewMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get('p');
  const view = urlParams.get('view');
  
  if (pageId && view === 'share') {
    currentPage = pageId;
    isViewMode = true;
    isSettingsMode = false;
    
    // Hide navbar in view mode
    document.querySelector('.navbar').style.display = 'none';
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
        document.getElementById('imageUrl').value = item.imageUrl || '';
        document.getElementById('imageTitle').value = item.title || '';
        document.getElementById('imageSubtitle').value = item.subtitle || '';
        document.getElementById('imageTitle2').value = item.title || '';
        document.getElementById('imageSubtitle2').value = item.subtitle || '';
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

function saveImageData() {
  const pageData = getCurrentPageData();
  const section = pageData.sections.find(s => s.id == editingSection);
  
  if (!section) return;
  
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
    imageUrl = uploadedImageData;
    imageLarge = uploadedImageData;
    title = document.getElementById('imageTitle2').value.trim();
    subtitle = document.getElementById('imageSubtitle2').value.trim();
  }
  
  if (!imageUrl || !title) {
    alert('Please fill in required fields');
    return;
  }
  
  if (editingItem) {
    // Edit existing item
    const item = section.items.find(i => i.id == editingItem);
    if (item) {
      item.imageUrl = imageUrl;
      item.imageLarge = imageLarge;
      item.title = title;
      item.subtitle = subtitle;
    }
  } else {
    // Add new item
    const newItem = {
      id: Date.now(),
      imageUrl: imageUrl,
      imageLarge: imageLarge,
      title: title,
      subtitle: subtitle
    };
    section.items.push(newItem);
  }
  
  savePages();
  closeImageModal();
  generateGallery();
}

function deleteImage(sectionId, itemId) {
  if (!confirm('Are you sure you want to delete this image?')) return;
  
  const pageData = getCurrentPageData();
  const section = pageData.sections.find(s => s.id == sectionId);
  
  if (section) {
    section.items = section.items.filter(i => i.id != itemId);
    savePages();
    generateGallery();
  }
}

// Section Functions
function addNewSection() {
  const sectionName = prompt('Enter section name:');
  if (!sectionName) return;
  
  const pageData = getCurrentPageData();
  const newSection = {
    id: Date.now(),
    headline: sectionName,
    items: []
  };
  
  pageData.sections.push(newSection);
  savePages();
  generateGallery();
}

function deleteSection(sectionId) {
  if (!confirm('Are you sure you want to delete this section?')) return;
  
  const pageData = getCurrentPageData();
  pageData.sections = pageData.sections.filter(s => s.id != sectionId);
  savePages();
  generateGallery();
}

// Page Manager Functions
function openPageManager() {
  const modal = document.getElementById('pageModal');
  const pageList = document.getElementById('pageList');
  
  let html = '<div class="page-items">';
  
  Object.keys(pages).forEach(pageId => {
    const page = pages[pageId];
    const isCurrent = pageId === currentPage;
    
    html += `
      <div class="page-item ${isCurrent ? 'active' : ''}">
        <div class="page-item__info">
          <span class="page-item__name">${page.name}</span>
          <span class="page-item__id">${pageId}</span>
        </div>
        <div class="page-item__actions">
          ${!isCurrent ? `<button class="btn-sm" onclick="switchPage('${pageId}')">Switch</button>` : '<span class="badge">Current</span>'}
          ${pageId !== 'default' ? `<button class="btn-sm btn-danger" onclick="deletePage('${pageId}')">Delete</button>` : ''}
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

function createNewPage() {
  const name = document.getElementById('pageName').value.trim();
  if (!name) {
    alert('Please enter a page name');
    return;
  }
  
  const pageId = 'page_' + Date.now();
  pages[pageId] = {
    name: name,
    sections: []
  };
  
  savePages();
  currentPage = pageId;
  
  document.getElementById('createPageModal').style.display = 'none';
  generateGallery();
}

function switchPage(pageId) {
  currentPage = pageId;
  document.getElementById('pageModal').style.display = 'none';
  generateGallery();
}

function deletePage(pageId) {
  if (!confirm('Are you sure you want to delete this page?')) return;
  
  delete pages[pageId];
  savePages();
  
  if (currentPage === pageId) {
    currentPage = 'default';
  }
  
  openPageManager();
  generateGallery();
}

// Share Functions
function openShareModal() {
  const modal = document.getElementById('shareModal');
  const shareLink = document.getElementById('shareLink');
  
  // Generate shortened link
  const baseUrl = window.location.origin + window.location.pathname;
  const shortCode = generateShortCode(currentPage);
  const fullLink = `${baseUrl}?p=${currentPage}&view=share&c=${shortCode}`;
  
  shareLink.value = fullLink;
  modal.style.display = 'flex';
}

function generateShortCode(pageId) {
  // Simple hash function for demo
  let hash = 0;
  const str = pageId + Date.now();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).substring(0, 6);
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
  
  imageFile?.addEventListener('change', function(e) {
    const file = e.target.files[0];
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