// work in progress - needs some refactoring and will drop JQuery i promise :)

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

// Generate dynamic content
function generateGallery() {
  const container = document.getElementById('mainContainer');
  if (!container) return;
  
  let html = '';
  
  galleryData.forEach((section, index) => {
    html += `
      <div class="hs__wrapper hs__wrapper--${section.id}">
        <div class="hs__header">
          <h2 class="hs__headline">${section.headline}</h2>
          <div class="hs__arrows">
            <a class="arrow disabled arrow-prev"></a>
            <a class="arrow arrow-next"></a>
          </div>
        </div>
        <ul class="hs lightgallery-${section.id}">
    `;
    
    section.items.forEach(item => {
      html += `
          <li class="hs__item">
            <a href="https://picsum.photos/id/${item.id}/1200/1200" data-lg-size="1200-1200" class="hs__item__image__wrapper">
              <img class="hs__item__image" src="https://picsum.photos/id/${item.id}/300/300" alt="${item.title}"/>
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
  
  container.innerHTML = html;
  
  // Initialize LightGallery for each section
  galleryData.forEach((section) => {
    const galleryElement = document.querySelector(`.lightgallery-${section.id}`);
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
        selector: '.hs__item__image__wrapper'
      });
    }
  });
  
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
  generateGallery();
});