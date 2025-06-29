// Sticky header on scroll
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  header.classList.toggle("scrolled", window.scrollY > 50);
});

// Toggle navbar for mobile
document.querySelector('.menu-toggle').addEventListener('click', () => {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');

  navbar.classList.toggle('active');
  menuToggle.classList.toggle('active'); // 🔁 for icon swap
});


// Typing effect
const roleElement = document.querySelector(".role");
const text = "Web Developer & Designer.";
let index = 0;
function typeText() {
  if (index <= text.length) {
    roleElement.textContent = text.substring(0, index);
    index++;
    setTimeout(typeText, 100);
  }
}
typeText();

// Scroll animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    } else {
      entry.target.style.animation = 'none';
      void entry.target.offsetWidth;
      entry.target.style.animation = entry.target.dataset.animation;
      entry.target.style.animationPlayState = 'paused';
    }
  });
}, { threshold: 0.25 });

document.querySelectorAll('.about-heading, .about-text p, .about-image img, .portfolio-heading').forEach(el => {
  el.dataset.animation = 'fadeInUp 1.5s ease-out forwards';
  el.style.animation = el.dataset.animation;
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {

  // ========= Comment Form ===========
  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = document.getElementById('commenterName').value.trim();
      const message = document.getElementById('commentMessage').value.trim();

      if (!name || !message) {
        alert('Please fill in both name and comment.');
        return;
      }

      try {
        const res = await fetch('https://ohm-backend.onrender.com/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      });



        const data = await res.json();
        if (res.ok) {
          alert('✅ Comment submitted!');
          commentForm.reset();
          loadComments();
        } else {
          alert('❌ ' + data.message);
        }
      } catch (err) {
        console.error('Error:', err);
        alert('❌ Could not submit comment.');
      }
    });
  }

  // ========= Load Comments ===========
  async function loadComments() {
    try {
      const res = await fetch('https://ohm-backend.onrender.com/comments');
      const comments = await res.json();

      const commentList = document.getElementById('commentList');
      commentList.innerHTML = '';

      comments.forEach(comment => {
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
          <h4>${comment.name}</h4>
          <p>${comment.message}</p>
          <small>${new Date(comment.timestamp).toLocaleString()}</small>
          <div class="reactions">
            <button onclick="react('${comment._id}', 'like')">👍 ${comment.reactions?.like || 0}</button>
            <button onclick="react('${comment._id}', 'love')">❤️ ${comment.reactions?.love || 0}</button>
            <button onclick="react('${comment._id}', 'laugh')">😂 ${comment.reactions?.laugh || 0}</button>
          </div>
          <div class="delete-wrapper">
            <button class="delete-button" onclick="deleteComment('${comment._id}')">🗑️ Delete</button>
          </div>
          <hr>
        `;
        commentList.appendChild(div);
      });
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  }

  loadComments();

  // ========= React to Comment ===========
  window.react = async function (commentId, type) {
    try {
    const res = await fetch(`https://ohm-backend.onrender.com/comments/${commentId}/reactions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: type })
      });

      const data = await res.json();
      if (res.ok) {
        loadComments();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (err) {
      console.error('❌ Error reacting to comment:', err);
    }
  };

  // ========= Delete Comment ===========
  window.deleteComment = async function (id) {
    const confirmDelete = confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      const res = await fetch('https://ohm-backend.onrender.com/api/comments', {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Comment deleted!');
        loadComments();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  // ========= Animate Portfolio Cards ===========
  const projectCards = document.querySelectorAll('.portfolio-card');
  const projectObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'scale(1)';
      } else {
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'scale(0.95)';
      }
    });
  }, { threshold: 0.2 });

  projectCards.forEach((card, index) => {
    card.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
    projectObserver.observe(card);
  });

  // ========= Animate Skill Cards ===========
  const skillCards = document.querySelectorAll('.skill');
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'scale(1)';
      }
    });
  }, { threshold: 0.2 });

  skillCards.forEach(card => {
    skillObserver.observe(card);
  });

  // ========= Contact Form ===========
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const data = {};

      formData.forEach((value, key) => {
        data[key] = value;
      });

      data.consent = formData.get('consent') === 'on';

      if (!data.name || !data.email || !data.phone || !data.consent) {
        alert('Please fill in all required fields and check the consent box.');
        return;
      }

      try {
          const response = await fetch('https://ohm-backend.onrender.com/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          alert(result.msg);
          contactForm.reset();
        } else {
          alert('Error: ' + result.msg);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('An unexpected error occurred. Please try again later.');
      }
    });
  }
});


// Fix auto-scroll to contact on page load
window.addEventListener("load", () => {
  if (location.hash && document.querySelector(location.hash)) {
    history.replaceState(null, null, " ");
    window.scrollTo(0, 0);
  }
});





/* Dark/light mode (Toggle Mode) */

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode'); // Ensures light mode on first load
  }
});
