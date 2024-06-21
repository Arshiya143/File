document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const draggable = document.getElementById("draggable");
  const progress = document.getElementById("progress");
  const container = document.getElementById("gridContainer");
  const tableContainer = document.getElementById("tableContainer");
  const zoom = document.getElementById("zoom");
  const detailContent = document.getElementById("detailContent");
  const previewContent = document.getElementById("previewContent");
  const panel = document.getElementById("panel");
  const resizer = document.querySelector(".resizer");
  const sidebar = document.querySelector(".resizable-sidebar");
  const editIcon = document.querySelector(".edit-icon");
  const textDisplay = document.querySelector(".text-display");
  const textInput = document.querySelector(".text-input");
  const imageOverlay = document.querySelector(".group .absolute");
  const overlay = document.querySelector(".overlay");

  // Utility Functions
  const throttle = (callback, delay) => {
    let lastCalled = 0;
    return function () {
      const now = new Date().getTime();
      if (now - lastCalled >= delay) {
        callback.apply(null, arguments);
        lastCalled = now;
      }
    };
  };

  const toggleClass = (element, className) => {
    element.classList.toggle(className);
  };

  // Event Handlers
  const setDraggablePosition = (percentage) => {
    if (window.innerWidth < 768) return;
    const y = (percentage / 100) * 110;
    progress.style.height = `${percentage}%`;
    draggable.style.top = `${y}px`;
  };

  const updateGridColumns = (percentage) => {
    const columns = Math.max(5, 12 - Math.floor(percentage / 16));
    container.className = `grid grid-cols-${columns} p-4 transition-all duration-300 dive-height md-height`;
    localStorage.setItem("gridPercentage", percentage);
  };

  const initResize = (e) => {
    window.addEventListener("mousemove", startResizing);
    window.addEventListener("mouseup", stopResizing);
  };

  const startResizing = (e) => {
    const minWidth = 288;
    const maxWidth = 600;
    let newWidth = window.innerWidth - e.clientX;
    if (newWidth < minWidth) newWidth = minWidth;
    else if (newWidth > maxWidth) newWidth = maxWidth;

    sidebar.style.width = `${newWidth}px`;
    const margin = !panel.classList.contains("hidden") ? `${newWidth}px` : "0";
    gridContainer.style.marginRight = margin;
    tableContainer.style.marginRight = margin;
  };

  const stopResizing = () => {
    window.removeEventListener("mousemove", startResizing);
    window.removeEventListener("mouseup", stopResizing);
  };

  const handleResize = () => {
    const width = window.innerWidth;
    if (width < 768) {
      const cont = container.className;
      if (!cont.includes("hidden")) {
        container.className =
          "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-4 transition-all duration-300 dive-height p-6 overflow-y-auto md-height";
      }
    }
  };

  const toggleDropdown = (id) => {
    const dropdownOptions = document.getElementById(id);
    const allDropdowns = document.querySelectorAll(".dropdown-options");

    allDropdowns.forEach((dropdown) => {
      if (dropdown.id !== id) dropdown.style.display = "none";
    });

    dropdownOptions.style.display =
      dropdownOptions.style.display === "none" ||
      dropdownOptions.style.display === ""
        ? "block"
        : "none";

    const dropdownButton = document.querySelector(
      `button[onclick="toggleDropdown('${id}')"]`
    );
    const allDropdownButtons = document.querySelectorAll(".dropdown-toggle");

    allDropdownButtons.forEach((button) => {
      if (button !== dropdownButton)
        button.classList.remove("dropdown-button-active");
    });

    dropdownButton.classList.toggle("dropdown-button-active");
  };

  const togglePopup = (popupId) => {
    const popup = document.getElementById(popupId);
    if (popup) toggleClass(popup, "hidden");
    else console.error(`Popup with id ${popupId} not found.`);
  };

  const toggleView = () => {
    toggleClass(gridContainer, "hidden");
    toggleClass(tableContainer, "hidden");
    toggleClass(zoom, "hidden");
  };

  const togglePanel = (view) => {
    const isPanelHidden = panel.classList.contains("hidden");

    if (view === "detail") {
      if (isPanelHidden || detailContent.classList.contains("hidden")) {
        panel.classList.remove("hidden");
        detailContent.classList.remove("hidden");
        previewContent.classList.add("hidden");
        gridContainer.style.marginRight =
          tableContainer.style.marginRight = `${panel.offsetWidth}px`;
      } else {
        panel.classList.add("hidden");
        gridContainer.style.marginRight = tableContainer.style.marginRight =
          "0";
      }
    } else if (view === "preview") {
      if (isPanelHidden || previewContent.classList.contains("hidden")) {
        panel.classList.remove("hidden");
        previewContent.classList.remove("hidden");
        detailContent.classList.add("hidden");
        gridContainer.style.marginRight =
          tableContainer.style.marginRight = `${panel.offsetWidth}px`;
      } else {
        panel.classList.add("hidden");
        gridContainer.style.marginRight = tableContainer.style.marginRight =
          "0";
      }
    }
  };

  // Event Listeners
  draggable.addEventListener("mousedown", function (event) {
    if (window.innerWidth < 768) return;
    event.preventDefault();
    const slider = draggable.parentElement;
    const sliderRect = slider.getBoundingClientRect();

    const onMouseMove = (e) => {
      let y = e.clientY - sliderRect.top;
      y = Math.max(0, Math.min(y, sliderRect.height));
      draggable.style.top = `${y}px`;
      const percentage = (y / sliderRect.height) * 100;
      progress.style.height = `${percentage}%`;
      updateGridColumns(percentage);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
  });

  editIcon.addEventListener("click", function (event) {
    event.stopPropagation();
    toggleClass(textDisplay, "hidden");
    toggleClass(textInput, "hidden");
    editIcon.classList.add("hidden");
    textInput.focus();
    textInput.select();
    imageOverlay.classList.add("opacity-50");
    overlay.classList.add("overlay-height");
  });

  textInput.addEventListener("blur", function () {
    textDisplay.textContent = textInput.value;
    toggleClass(textDisplay, "hidden");
    toggleClass(textInput, "hidden");
    imageOverlay.classList.remove("opacity-50");
    overlay.classList.remove("overlay-height");
  });

  document.addEventListener("click", function (event) {
    const isClickInside = document
      .querySelector(".relative")
      .contains(event.target);
    if (!isClickInside) {
      editIcon.classList.remove("hidden");
      textDisplay.classList.remove("hidden");
      textInput.classList.add("hidden");
      imageOverlay.classList.remove("opacity-50");
    }
  });

  window.addEventListener("resize", throttle(handleResize, 200));
  window.addEventListener("load", () => {
    if (window.innerWidth >= 768) {
      const savedPercentage = localStorage.getItem("gridPercentage");
      if (savedPercentage !== null) {
        const percentage = parseFloat(savedPercentage);
        setDraggablePosition(percentage);
        updateGridColumns(percentage);
      }
    }
  });

  // Initialization
  resizer.addEventListener("mousedown", initResize);
  handleResize();
  window.togglePanel = togglePanel;
  window.toggleView = toggleView;
  window.togglePopup = togglePopup;
  window.toggleDropdown = toggleDropdown;
});
