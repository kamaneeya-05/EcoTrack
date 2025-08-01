document.addEventListener('DOMContentLoaded', () => {
  // -------- Dashboard Username --------
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.name) {
    const usernameDisplay = document.getElementById("username");
    if (usernameDisplay) {
      usernameDisplay.textContent = user.name;
    }
  }

  // -------- Logout Functionality --------
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  }

  // -------- Dashboard Card Navigation --------
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-target');
      if (target) window.location.href = target;
    });
  });

  // -------- Contact Form Handling --------
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const message = document.getElementById("message")?.value.trim();

      if (!name || !email || !message) {
        alert("Please fill in all fields.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        });

        const data = await response.json();
        alert(data.message || "Message sent successfully!");
        contactForm.reset();
      } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  }

  // -------- Report Form Handling --------
  const reportForm = document.getElementById('report-form');
  if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const category = document.getElementById('category')?.value.trim();
      const location = document.getElementById('location')?.value.trim();
      const description = document.getElementById('description')?.value.trim();
      const image = document.getElementById('image')?.files[0];

      if (!category || !location || !description) {
        alert('Please fill in all required fields.');
        return;
      }

      const formData = new FormData();
      formData.append('category', category);
      formData.append('location', location);
      formData.append('description', description);
      if (image) formData.append('image', image);

      try {
        const response = await fetch('http://localhost:3000/api/report', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        alert(data.message || 'Report submitted successfully!');
        reportForm.reset();
        document.getElementById('report-message').style.display = 'block';
      } catch (error) {
        console.error('Error submitting report:', error);
        alert('Something went wrong. Please try again.');
      }
    });
  }

  // -------- Login Form Handling --------
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      try {
        const response = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("user", JSON.stringify(data.user));
          alert("Login successful!");
          window.location.href = "dashboard.html";
        } else {
          alert(data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong.");
      }
    });
  }

  // -------- Registration Form Handling --------
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();

      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Registration successful! You can now log in.");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Registration failed.");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong.");
      }
    });
  }

  // -------- Smooth Scroll --------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // -------- Nav Highlighting --------
  const currentPage = location.pathname.split("/").pop();
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
});
