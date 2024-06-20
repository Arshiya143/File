// manage sidebar
const currentPath = window.location.pathname.split("/").pop();

const sidebarLinks = document.querySelectorAll(".sidebar a");
// find the link whose href === currentPath and apply 'active' class, break on first match
for (let i = 0; i < sidebarLinks.length; i++) {
  const link = sidebarLinks[i];
  if (link.getAttribute("href") === currentPath) {
    link.classList.add("active");
    // find the closest parent div with 'drop-menu' class
    const dropMenu = link.closest(".drop-menu");
    if (dropMenu) {
      dropMenu.classList.add("active");
    }
    break;
  }
}

function toggleDropMenu(target) {
  target.classList.toggle("active");
}
