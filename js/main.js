document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 760) {
          nav.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((element, index) => {
    element.style.setProperty("--reveal-index", String(index % 6));
  });

  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    reveals.forEach((element) => io.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add("is-visible"));
  }

  if (header) {
    const toggleHeaderState = () => {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };

    toggleHeaderState();
    window.addEventListener("scroll", toggleHeaderState, { passive: true });
  }

  const floatPanels = document.querySelectorAll("[data-float]");
  if (floatPanels.length) {
    window.addEventListener("mousemove", (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 8;
      const y = (event.clientY / window.innerHeight - 0.5) * 8;
      floatPanels.forEach((panel) => {
        panel.style.transform = `translate(${x * -0.25}px, ${y * -0.25}px)`;
      });
    });
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      let hasRefreshed = false;

      const askForUpdate = (registration) => {
        if (!registration.waiting) return;

        const shouldUpdate = window.confirm(
          "A new site version is available. Refresh now to update?"
        );

        if (shouldUpdate) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      };

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hasRefreshed) return;
        hasRefreshed = true;
        window.location.reload();
      });

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          askForUpdate(registration);

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                askForUpdate(registration);
              }
            });
          });
        })
        .catch(() => {
          // Keep registration failure silent for static hosting compatibility.
        });
    });
  }
});
