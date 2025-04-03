// Function to format content for display
function formatContent(content) {
  if (!content) return '';

  // First, split by double newlines to separate paragraphs
  const paragraphs = content.split(/\n\s*\n/);

  return paragraphs
    .map((paragraph) => {
      // Trim whitespace
      paragraph = paragraph.trim();
      if (!paragraph) return '';

      // Check if this is a list (starts with -, *, or •)
      if (paragraph.match(/^[-*•]/m)) {
        // Split into lines and process each line
        const items = paragraph
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line)
          .map((line) => {
            // Remove the bullet point marker
            line = line.replace(/^[-*•]\s*/, '');
            return `<li>${line}</li>`;
          });

        // Wrap list items in a ul tag
        return `<ul>${items.join('')}</ul>`;
      } else {
        // Regular paragraph - no bullets
        return `<p>${paragraph}</p>`;
      }
    })
    .join('');
}

// Function to handle text formatting
function setupFormattingToolbar() {
  const toolbar = document.querySelector('.formatting-toolbar');
  const contentArea = document.querySelector('.content');

  toolbar.addEventListener('click', (e) => {
    if (e.target.classList.contains('format-btn')) {
      const format = e.target.dataset.format;
      const button = e.target;

      // Make sure the content area is focused
      contentArea.focus();

      switch (format) {
        case 'bold':
          document.execCommand('bold', false, null);
          button.classList.toggle('active');
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          button.classList.toggle('active');
          break;
        case 'underline':
          document.execCommand('underline', false, null);
          button.classList.toggle('active');
          break;
        case 'bullet':
          document.execCommand('insertUnorderedList', false, null);
          button.classList.toggle('active');
          // Remove active state from number button if it's active
          toolbar
            .querySelector('[data-format="number"]')
            .classList.remove('active');
          break;
        case 'number':
          document.execCommand('insertOrderedList', false, null);
          button.classList.toggle('active');
          // Remove active state from bullet button if it's active
          toolbar
            .querySelector('[data-format="bullet"]')
            .classList.remove('active');
          break;
      }
    }
  });

  // Add selection change listener to update button states
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const parentList = range.commonAncestorContainer.closest('ul, ol');

    // Update bullet button state
    const bulletBtn = toolbar.querySelector('[data-format="bullet"]');
    if (parentList && parentList.tagName === 'UL') {
      bulletBtn.classList.add('active');
    } else {
      bulletBtn.classList.remove('active');
    }

    // Update number button state
    const numberBtn = toolbar.querySelector('[data-format="number"]');
    if (parentList && parentList.tagName === 'OL') {
      numberBtn.classList.add('active');
    } else {
      numberBtn.classList.remove('active');
    }
  });
}

// Function to load and display blog posts
async function loadBlogPosts() {
  try {
    const response = await fetch('http://localhost:3000/data.json');
    const data = await response.json();

    const container = document.querySelector('.container');
    container.innerHTML = ''; // Clear existing content

    data.forEach((blog) => {
      const blogPreview = document.createElement('div');
      blogPreview.className = 'blogPreview';

      const img = document.createElement('img');
      img.src = blog.data.imagePath
        ? `http://localhost:3000/${blog.data.imagePath}`
        : './images/1.webp';
      img.alt = blog.data.title;

      const titleAndContent = document.createElement('div');
      titleAndContent.className = 'titleAndContent';

      const title = document.createElement('h3');
      title.className = 'blogTitle';
      title.textContent = blog.data.title;

      const content = document.createElement('div');
      content.className = 'blogContent';
      content.innerHTML = formatContent(blog.data.content);

      const author = document.createElement('p');
      author.className = 'authorName';
      author.textContent = `by ${blog.data.author}`;

      const date = document.createElement('p');
      date.className = 'blogDate';
      date.textContent = blog.data.date;

      const readMore = document.createElement('button');
      readMore.className = 'readMore';
      readMore.textContent = 'Read More';

      // Add click event for Read More button
      readMore.addEventListener('click', () => showBlogPopup(blog));

      titleAndContent.appendChild(title);
      titleAndContent.appendChild(content);
      titleAndContent.appendChild(author);
      titleAndContent.appendChild(date);

      blogPreview.appendChild(img);
      blogPreview.appendChild(titleAndContent);
      blogPreview.appendChild(readMore);

      container.appendChild(blogPreview);
    });
  } catch (error) {
    console.error('Error loading blog posts:', error);
  }
}

// Function to show blog popup
function showBlogPopup(blog) {
  const popup = document.querySelector('.popup-overlay');
  const popupImage = document.querySelector('.popup-image');
  const popupTitle = document.querySelector('.popup-title');
  const popupAuthor = document.querySelector('.popup-author');
  const popupDate = document.querySelector('.popup-date');
  const popupContent = document.querySelector('.popup-content-text');

  popupImage.src = blog.data.imagePath
    ? `http://localhost:3000/${blog.data.imagePath}`
    : './images/1.webp';
  popupTitle.textContent = blog.data.title;
  popupAuthor.textContent = `by ${blog.data.author}`;
  popupDate.textContent = blog.data.date;
  popupContent.innerHTML = formatContent(blog.data.content);

  popup.style.display = 'flex';
}

// Function to close blog popup
function closeBlogPopup() {
  const popup = document.querySelector('.popup-overlay');
  popup.style.display = 'none';
}

// Add event listeners for popup
document.addEventListener('DOMContentLoaded', () => {
  loadBlogPosts();
  setupFormattingToolbar();

  // Close popup when clicking the close button
  document
    .querySelector('.close-btn')
    .addEventListener('click', closeBlogPopup);

  // Close popup when clicking outside
  document.querySelector('.popup-overlay').addEventListener('click', (e) => {
    if (e.target.classList.contains('popup-overlay')) {
      closeBlogPopup();
    }
  });
});

// Update form submission to handle HTML content
const form = document.querySelector('form');
form.addEventListener('submit', async function (eve) {
  eve.preventDefault();

  const author = document.querySelector('.name').value;
  const title = document.querySelector('.title').value;
  const content = document.querySelector('.content').innerHTML;
  const date = new Date().toLocaleDateString();
  const imageFile = document.querySelector('.uploadedFile').files[0];

  // Create FormData object to handle file upload
  const formData = new FormData();
  formData.append('author', author);
  formData.append('date', date);
  formData.append('title', title);
  formData.append('content', content);
  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const response = await fetch('http://localhost:3000/add', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log(result);
    if (result.message === 'Data added successfully!') {
      alert('Blog post submitted successfully!');
      form.reset();
      loadBlogPosts(); // Reload blog posts to show the new entry
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error submitting blog post');
  }
});
