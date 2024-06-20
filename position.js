document.addEventListener("DOMContentLoaded", function () {
  const draggable = document.getElementById("draggable");
  const progress = document.getElementById("progress");
  const container = document.getElementById("gridContainer");
  const tableContainer = document.getElementById("tableContainer");
  const zoom = document.getElementById("zoom");
  const detailContent = document.getElementById("detailContent");
  const previewContent = document.getElementById("previewContent");
  const panel = document.getElementById("panel");
  const gridContainer = document.getElementById("gridContainer");
  const resizer = document.querySelector(".resizer");
  const sidebar = document.querySelector(".resizable-sidebar");

  const updateGridColumns = (percentage) => {
    if (window.innerWidth >= 769) {
      const columns = Math.max(5, 12 - Math.floor(percentage / 16));
      container.className = `grid grid-cols-${columns} p-4 transition-all duration-300 dive-height`;
    }
    localStorage.setItem("gridPercentage", percentage); // Save percentage to local storage
  };

  const setDraggablePosition = (percentage) => {
    const y = (percentage / 100) * 110;
    progress.style.height = percentage + "%";
    draggable.style.top = y + "px";
  };

  draggable.addEventListener("mousedown", function (event) {
    event.preventDefault();
    const slider = draggable.parentElement;
    const sliderRect = slider.getBoundingClientRect();

    const onMouseMove = (e) => {
      let y = e.clientY - sliderRect.top;
      y = Math.max(0, Math.min(y, sliderRect.height));
      draggable.style.top = y + "px";
      const percentage = (y / sliderRect.height) * 100;
      progress.style.height = percentage + "%";
      updateGridColumns(percentage);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp, { once: true });
  });

  // Initial setup on page load
  window.addEventListener("load", () => {
    const savedPercentage = localStorage.getItem("gridPercentage");
    if (savedPercentage !== null) {
      const percentage = parseFloat(savedPercentage);
      setDraggablePosition(percentage);
      updateGridColumns(percentage); // Ensure grid columns are updated initially
    }
  });

  const editIcon = document.querySelector(".edit-icon");
  const textDisplay = document.querySelector(".text-display");
  const textInput = document.querySelector(".text-input");
  const imageOverlay = document.querySelector(".group .absolute");
  const overlay = document.querySelector(".overlay");

  // Click handler for edit icon
  editIcon.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevents the click from bubbling to the image overlay
    textDisplay.classList.toggle("hidden");
    textInput.classList.toggle("hidden");
    editIcon.classList.add("hidden");
    textInput.focus();
    textInput.select(); // Selects all text inside the input
    imageOverlay.classList.add("opacity-50");
    overlay.classList.add("overlay-height");
  });

  // Blur event handler for text input
  textInput.addEventListener("blur", function () {
    textDisplay.textContent = textInput.value;
    textDisplay.classList.toggle("hidden");
    textInput.classList.toggle("hidden");
    imageOverlay.classList.remove("opacity-50");
    overlay.classList.remove("overlay-height");
  });

  // Close on click outside
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
  function toggleDropdown(id) {
    var dropdownOptions = document.getElementById(id);
    var allDropdowns = document.querySelectorAll(".dropdown-options");

    allDropdowns.forEach(function (dropdown) {
      if (dropdown.id !== id) {
        dropdown.style.display = "none";
      }
    });

    if (
      dropdownOptions.style.display === "none" ||
      dropdownOptions.style.display === ""
    ) {
      dropdownOptions.style.display = "block";
    } else {
      dropdownOptions.style.display = "none";
    }

    // Toggle active class on button
    var dropdownButton = document.querySelector(
      `button[onclick="toggleDropdown('${id}')"]`
    );
    var allDropdownButtons = document.querySelectorAll(".dropdown-toggle");

    allDropdownButtons.forEach(function (button) {
      if (button !== dropdownButton) {
        button.classList.remove("dropdown-button-active");
      }
    });

    dropdownButton.classList.toggle("dropdown-button-active");
  }
  const togglePopup = (popupId) => {
    const popup = document.getElementById(popupId);
    if (popup) {
      popup.classList.toggle("hidden");
    } else {
      console.error("Popup with id " + popupId + " not found.");
    }
  };
  const toggleView = () => {
    gridContainer.classList.toggle("hidden");
    tableContainer.classList.toggle("hidden");
    zoom.classList.toggle("hidden");
  };
  // JavaScript to toggle the visibility of the input field
  const pathDisplay = document.getElementById("path-display");
  const positionInputContainer = document.getElementById(
    "position-input-container"
  );
  const positionInput = document.getElementById("position-input");

  pathDisplay.addEventListener("click", () => {
    pathDisplay.classList.add("hidden");
    positionInputContainer.classList.remove("hidden");
    positionInput.focus();
    positionInput.select();
  });

  positionInput.addEventListener("blur", () => {
    positionInputContainer.classList.add("hidden");
    pathDisplay.classList.remove("hidden");
  });
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

  const initResize = (e) => {
    window.addEventListener("mousemove", startResizing);
    window.addEventListener("mouseup", stopResizing);
  };

  const startResizing = (e) => {
    const minWidth = 288; // Set your minimum width here
    const maxWidth = 600; // Set your maximum width here
    let newWidth = window.innerWidth - e.clientX;

    // Ensure the new width is within the specified range
    if (newWidth < minWidth) {
      newWidth = minWidth;
    } else if (newWidth > maxWidth) {
      newWidth = maxWidth;
    }

    sidebar.style.width = `${newWidth}px`;

    const margin = !panel.classList.contains("hidden") ? `${newWidth}px` : "0";
    document.getElementById("gridContainer").style.marginRight = margin;
    document.getElementById("tableContainer").style.marginRight = margin;
  };

  const stopResizing = () => {
    window.removeEventListener("mousemove", startResizing);
    window.removeEventListener("mouseup", stopResizing);
  };

  resizer.addEventListener("mousedown", initResize);
  window.togglePanel = togglePanel;
  window.toggleView = toggleView;
  window.togglePopup = togglePopup;
  window.toggleDropdown = toggleDropdown;
});
