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

  // Toggle a class on an element
  const toggleClass = (element, className) => {
    element.classList.toggle(className);
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

  /******* dragging in zoom toggle *******/

  // Update the number of grid columns based on percentage
  const updateGridColumns = (percentage) => {
    const columns = Math.max(3, 12 - Math.floor(percentage / 16));
    container.className = `grid grid-cols-${columns} pt-3 p-6 gap-2 transition-all duration-300 overflow-y-auto`;
    localStorage.setItem("gridPercentage", percentage);
  };

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

  /****on page load the zoom draggable pointer should maintain its previous position and also maintain grid column size ********/
  // Set the position of the draggable element based on percentage
  const setDraggablePosition = (percentage) => {
    if (window.innerWidth < 768) return;
    const y = (percentage / 100) * 110;
    progress.style.height = `${percentage}%`;
    draggable.style.top = `${y}px`;
  };

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

  /******Resizing of panes ******/
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

  // Initialization
  resizer.addEventListener("mousedown", initResize);

  /****grid column size in mobile ******/
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
  handleResize();

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
  // Handle window resize with throttle
  window.addEventListener("resize", throttle(handleResize, 200));

  /*******on click of edit icon the textbox should display in grid view of files ******/
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

  /********** iframe js with comment section **********/
  const comment = document.querySelector(".commentssection");
  const commentButton = document.querySelector(".commentbutton");
  const frame = document.querySelector(".frame");
  const commentResizer = document.querySelector(".commentresizer");
  const mentionTextbox = document.querySelector(".mention-textbox");
  const mentionList = document.querySelector(".mention-list");
  const mentionListItems = document.querySelector(".list");
  const commentList = document.querySelector(".comment-list");
  const iframePopup = document.querySelector(".popupiframe iframe");
  // Toggle visibility of the comments pane
  function togglePane(id) {
    let element = document.querySelector(id);
    if (element) {
      // Ensure the element exists
      element.classList.toggle("hidden");
      if (!element.classList.contains("hidden")) {
        scrollToBottom();
      }
      updateFrameMargin();
    } else {
      console.error(`Element with selector ${id} not found.`);
    }
  }

  // Scroll to the bottom of the comment list
  function scrollToBottom() {
    if (commentList) {
      commentList.scrollTop = commentList.scrollHeight;
    }
  }

  // Update the margin of the frame based on the comments pane width
  function updateFrameMargin() {
    if (window.innerWidth > 768 && comment) {
      // Check if comment is not null
      if (comment.classList.contains("hidden")) {
        iframePopup.style.width = "100%";
        iframePopup.style.marginLeft = "0";
        commentButton.style.marginLeft = "0";
      } else {
        const commentsWidth = comment.offsetWidth;
        iframePopup.style.width = `calc(100% - ${commentsWidth}px)`;
        commentButton.style.marginLeft = `${comment.offsetWidth}px`;
        iframePopup.style.marginLeft = `${comment.offsetWidth}px`;
      }
    }
  }

  let startX, startWidth;

  // Initialize the resizing of the comment section
  const initCommentResize = (e) => {
    e.preventDefault();
    startX = e.clientX;
    startWidth = comment.offsetWidth;

    window.addEventListener("mousemove", startCommentResizing);
    window.addEventListener("mouseup", stopcommentResizing);
  };

  // Start resizing the comment section
  const startCommentResizing = (e) => {
    const minWidth = 250;
    const maxWidth = 500;
    let newWidth = startWidth + (e.clientX - startX);

    if (newWidth < minWidth) newWidth = minWidth;
    else if (newWidth > maxWidth) newWidth = maxWidth;

    if (comment) {
      comment.style.width = `${newWidth}px`;
      updateFrameMargin();
    }
  };

  // Stop resizing the comment section
  const stopcommentResizing = () => {
    window.removeEventListener("mousemove", startCommentResizing);
    window.removeEventListener("mouseup", stopCommentResizing);
  };

  if (commentResizer) {
    commentResizer.addEventListener("mousedown", initCommentResize);
  }

  // Update frame margin initially in case the comments section is not hidden
  updateFrameMargin();

  const users = ["alice", "bob", "charlie", "dave"]; // Example users for mention list
  const placeholderText = "Type your comment here..."; // placeholder

  // Initial setup for the mention textbox
  mentionTextbox.textContent = placeholderText;

  // Event listener to manage placeholder behavior
  mentionTextbox.addEventListener("focus", function () {
    if (this.textContent === placeholderText) {
      this.textContent = "";
    }
  });

  mentionTextbox.addEventListener("blur", function () {
    if (this.textContent === "") {
      this.textContent = placeholderText;
    }
  });

  // Event listeners for handling input and keydown events
  mentionTextbox.addEventListener("input", handleInput);
  mentionTextbox.addEventListener("keydown", handleKeyDown);

  // Function to handle input events
  function handleInput(e) {
    const text = mentionTextbox.innerText;
    const cursorPos = getCaretPosition();
    const textBeforeCursor = text.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (text.charAt(cursorPos - 1) === "@") {
      showMentionList(atIndex);
    } else {
      hideMentionList();
    }

    applyMentionStyles();
  }

  // Function to handle keydown events
  function handleKeyDown(e) {
    if (e.key === "ArrowDown" && !mentionList.classList.contains("hidden")) {
      mentionList.querySelector("li").focus();
      e.preventDefault();
    }
  }

  // Function to show the mention list
  function showMentionList(atIndex) {
    mentionListItems.innerHTML = users
      .map(
        (user) =>
          `<li tabindex="0" class="p-2 hover-bg-c-yellow cursor-pointer">${user}</li>`
      )
      .join("");
    mentionList.classList.remove("hidden");

    mentionListItems.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", () => selectMention(item, atIndex));
    });
  }

  // Function to hide the mention list
  function hideMentionList() {
    mentionList.classList.add("hidden");
  }

  // Function to select a mention from the list
  function selectMention(item, atIndex) {
    const mentionText = item.innerText; // Get the mention text
    const text = mentionTextbox.innerText;
    const cursorPos = getCaretPosition();
    const textBeforeAt = text.substring(0, atIndex);
    const textAfterAt = text.substring(cursorPos);

    mentionTextbox.innerText =
      textBeforeAt + "@" + mentionText + "&nbsp;" + textAfterAt; // Update text with mention
    setCaretPosition(atIndex + mentionText.length + 2); // Adjust caret position

    hideMentionList();
    applyMentionStyles();
  }

  // Function to apply styles to mentions
  function applyMentionStyles() {
    const text = mentionTextbox.innerText;
    const html = text.replace(
      /(@\w+)/g,
      '<span class="text-link-blue">$1</span>'
    );
    mentionTextbox.innerHTML = html;
    setCaretToEnd();
  }

  // Function to set the caret to the end
  function setCaretToEnd() {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(mentionTextbox);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  // Function to get the caret position
  function getCaretPosition() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(mentionTextbox);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }

  // Function to set the caret position
  function setCaretPosition(chars) {
    if (chars >= 0) {
      const selection = window.getSelection();
      const range = createRange(mentionTextbox, { count: chars });
      if (range) {
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  // Function to create a range for caret position
  function createRange(node, chars, range) {
    if (!range) {
      range = document.createRange();
      range.selectNode(node);
      range.setStart(node, 0);
    }

    if (chars.count === 0) {
      range.setEnd(node, chars.count);
    } else if (node && chars.count > 0) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.length < chars.count) {
          chars.count -= node.textContent.length;
        } else {
          range.setEnd(node, chars.count);
          chars.count = 0;
        }
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          range = createRange(node.childNodes[i], chars, range);
          if (chars.count === 0) {
            break;
          }
        }
      }
    }

    return range;
  }

  window.togglePane = togglePane; // Expose togglePane globally
  window.togglePanel = togglePanel;
  window.toggleView = toggleView;
  window.togglePopup = togglePopup;
  window.toggleDropdown = toggleDropdown;
});
