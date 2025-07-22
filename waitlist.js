// Handles waitlist form submission and count fetching, no jQuery
document.addEventListener("DOMContentLoaded", function () {
  const WAITLIST_API = "https://unix-t1yv.onrender.com/waitlist";
  const form = document.getElementById("email-form");
  const input = document.getElementById("Email");
  const btn = document.getElementById("waitlist-submit-btn");
  const btnText = document.getElementById("waitlist-btn-text");
  const btnLoading = document.getElementById("waitlist-btn-loading");
  const successModal = document.getElementById("waitlist-success-modal");
  const errorModal = document.getElementById("waitlist-error-modal");
  const errorText = errorModal ? errorModal.querySelector(".regular-s") : null;
  const socialProof = document.querySelector(".social-proof .regular-s");

  function validateInput(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  }

  function showModal(type, msg) {
    if (type === "success" && successModal) {
      successModal.style.display = "flex";
    }
    if (type === "error" && errorModal) {
      if (msg && errorText) errorText.textContent = msg;
      errorModal.style.display = "flex";
    }
  }

  function hideModals() {
    if (successModal) successModal.style.display = "none";
    if (errorModal) errorModal.style.display = "none";
  }

  // Hide modal on click anywhere
  [successModal, errorModal].forEach(function (modal) {
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      });
    }
  });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideModals();
      const value = input.value.trim();
      if (!validateInput(value)) {
        if (errorText) errorText.textContent = "Please enter a valid email or phone number.";
        showModal("error");
        return;
      }
      let data = {};
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        data.email = value;
      } else {
        data.phone = value;
      }
      // Show loading
      if (btnText && btnLoading) {
        btnText.style.display = "none";
        btnLoading.style.display = "inline";
      }
      fetch(WAITLIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(async (response) => {
          // Hide loading
          if (btnText && btnLoading) {
            btnText.style.display = "inline";
            btnLoading.style.display = "none";
          }
          if (response.ok) {
            showModal("success");
            form.reset();
            fetchCount();
          } else {
            let msg = "Oops! Something went wrong while submitting the form.";
            try {
              const res = await response.json();
              if (res.error) msg = res.error;
            } catch (e) {}
            showModal("error", msg);
          }
        })
        .catch(() => {
          if (btnText && btnLoading) {
            btnText.style.display = "inline";
            btnLoading.style.display = "none";
          }
          showModal("error", "Oops! Something went wrong while submitting the form.");
        });
    });
  }

  function fetchCount() {
    fetch(WAITLIST_API + "/count")
      .then((res) => res.json())
      .then((data) => {
        if (data.count !== undefined && socialProof) {
          socialProof.textContent = data.count + "+ persons have joined";
        }
      });
  }

  fetchCount();
});
