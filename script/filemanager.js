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
  const textDisplay = document.getElementById("text-display");
  const textInput = document.querySelector(".text-input");
  const imageOverlay = document.querySelector(".group .absolute");
  const overlay = document.querySelector(".overlay");

  // Utility Functions
  // Throttle function to limit the rate of execution for a function
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

  // Toggle a class on an element
  const toggleClass = (element, className) => {
    element.classList.toggle(className);
  };

  // Event Handlers
  // Set the position of the draggable element based on percentage
  const setDraggablePosition = (percentage) => {
    if (window.innerWidth < 768) return;
    const y = (percentage / 100) * 110;
    progress.style.height = `${percentage}%`;
    draggable.style.top = `${y}px`;
  };

  // Update the number of grid columns based on percentage
  const updateGridColumns = (percentage) => {
    const columns = Math.max(3, 12 - Math.floor(percentage / 16));
    container.className = `grid grid-cols-${columns} pt-3 p-6 gap-2 transition-all duration-300 overflow-y-auto`;
    localStorage.setItem("gridPercentage", percentage);
  };

  // Initialize the resizing of the sidebar
  const initResize = (e) => {
    window.addEventListener("mousemove", startResizing);
    window.addEventListener("mouseup", stopResizing);
  };

  // Start resizing the sidebar
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

  // Stop resizing the sidebar
  const stopResizing = () => {
    window.removeEventListener("mousemove", startResizing);
    window.removeEventListener("mouseup", stopResizing);
  };

  // Handle window resize
  const handleResize = () => {
    const width = window.innerWidth;
    if (width <= 768) {
      const cont = container.className;
      if (!cont.includes("hidden")) {
        container.className =
          "grid grid-cols-3 sm:grid-cols-4 gap-4 transition-all duration-300 p-6 pt-3 overflow-y-auto";
      }
    }
  };

  // Toggle visibility of a dropdown
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

  // Toggle visibility of a popup
  const togglePopup = (popupId) => {
    const popup = document.getElementById(popupId);
    if (popup) toggleClass(popup, "hidden");
    else console.error(`Popup with id ${popupId} not found.`);
  };

  // Toggle between grid and table views
  const toggleView = () => {
    toggleClass(gridContainer, "hidden");
    toggleClass(tableContainer, "hidden");
    toggleClass(zoom, "hidden");
  };

  // Toggle the side panel between detail and preview views
  const togglePanel = (view) => {
    const isPanelHidden = panel.classList.contains("hidden");

    if (view === "detail") {
      if (isPanelHidden || detailContent.classList.contains("hidden")) {
        panel.classList.remove("hidden");
        detailContent.classList.remove("hidden");
        previewContent.classList.add("hidden");
        if (window.innerWidth >= 768)
          gridContainer.style.marginRight =
            tableContainer.style.marginRight = `${panel.offsetWidth}px`;
      } else {
        panel.classList.add("hidden");
        if (window.innerWidth >= 768)
          gridContainer.style.marginRight = tableContainer.style.marginRight =
            "0";
      }
    } else if (view === "preview") {
      if (isPanelHidden || previewContent.classList.contains("hidden")) {
        panel.classList.remove("hidden");
        previewContent.classList.remove("hidden");
        detailContent.classList.add("hidden");
        if (window.innerWidth >= 768)
          gridContainer.style.marginRight =
            tableContainer.style.marginRight = `${panel.offsetWidth}px`;
      } else {
        panel.classList.add("hidden");
        if (window.innerWidth >= 768)
          gridContainer.style.marginRight = tableContainer.style.marginRight =
            "0";
      }
    }
  };

  // Event Listeners
  // Handle dragging of the draggable element
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

  // Handle edit icon click
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

  // Handle text input blur
  textInput.addEventListener("blur", function () {
    textDisplay.textContent = textInput.value;
    toggleClass(textDisplay, "hidden");
    toggleClass(textInput, "hidden");
    imageOverlay.classList.remove("opacity-50");
    overlay.classList.remove("overlay-height");
  });

  // Handle document click to hide edit icon and text input
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

  // Handle window resize with throttle
  window.addEventListener("resize", throttle(handleResize, 200));

  // Handle window load to set grid columns based on saved percentage
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
