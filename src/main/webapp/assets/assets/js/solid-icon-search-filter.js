const iconList = [
    {
      id: "adjustment",
      name: "Adjustment Icon",
      svgIcon:
        '<svg fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.87774 6.37856C8.87774 8.24523 7.33886 9.75821 5.43887 9.75821C3.53999 9.75821 2 8.24523 2 6.37856C2 4.51298 3.53999 3 5.43887 3C7.33886 3 8.87774 4.51298 8.87774 6.37856ZM20.4933 4.89833C21.3244 4.89833 22 5.56203 22 6.37856C22 7.19618 21.3244 7.85989 20.4933 7.85989H13.9178C13.0856 7.85989 12.4101 7.19618 12.4101 6.37856C12.4101 5.56203 13.0856 4.89833 13.9178 4.89833H20.4933ZM3.50777 15.958H10.0833C10.9155 15.958 11.5911 16.6217 11.5911 17.4393C11.5911 18.2558 10.9155 18.9206 10.0833 18.9206H3.50777C2.67555 18.9206 2 18.2558 2 17.4393C2 16.6217 2.67555 15.958 3.50777 15.958ZM18.5611 20.7778C20.4611 20.7778 22 19.2648 22 17.3992C22 15.5325 20.4611 14.0196 18.5611 14.0196C16.6623 14.0196 15.1223 15.5325 15.1223 17.3992C15.1223 19.2648 16.6623 20.7778 18.5611 20.7778Z" fill="currentColor" />\n  </svg>',
    },
    {
      id: "analytics",
      name: "Analytics",
      svgIcon:
        ' <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1801 4.41C17.1801 3.08 18.2601 2 19.5901 2C20.9201 2 22.0001 3.08 22.0001 4.41C22.0001 5.74 20.9201 6.82 19.5901 6.82C18.2601 6.82 17.1801 5.74 17.1801 4.41ZM13.33 14.7593L16.22 11.0303L16.18 11.0503C16.34 10.8303 16.37 10.5503 16.26 10.3003C16.151 10.0503 15.91 9.8803 15.651 9.8603C15.38 9.8303 15.111 9.9503 14.95 10.1703L12.531 13.3003L9.76 11.1203C9.59 10.9903 9.39 10.9393 9.19 10.9603C8.991 10.9903 8.811 11.0993 8.69 11.2593L5.731 15.1103L5.67 15.2003C5.5 15.5193 5.58 15.9293 5.88 16.1503C6.02 16.2403 6.17 16.3003 6.34 16.3003C6.571 16.3103 6.79 16.1893 6.93 16.0003L9.44 12.7693L12.29 14.9103L12.38 14.9693C12.7 15.1393 13.1 15.0603 13.33 14.7593ZM15.45 3.7803C15.41 4.0303 15.39 4.2803 15.39 4.5303C15.39 6.7803 17.21 8.5993 19.45 8.5993C19.7 8.5993 19.94 8.5703 20.19 8.5303V16.5993C20.19 19.9903 18.19 22.0003 14.79 22.0003H7.401C4 22.0003 2 19.9903 2 16.5993V9.2003C2 5.8003 4 3.7803 7.401 3.7803H15.45Z" fill="currentColor" />\n  </svg>',
    },
    {
      id: "arrow-box-down",
      name: "Arrow Box Down",
      svgIcon:
        ' <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path fill-rule="evenodd" clip-rule="evenodd" d="M2 16.08V7.91C2 4.38 4.271 2 7.66 2H16.33C19.72 2 22 4.38 22 7.91V16.08C22 19.62 19.72 22 16.33 22H7.66C4.271 22 2 19.62 2 16.08ZM12.75 14.27V7.92C12.75 7.5 12.41 7.17 12 7.17C11.58 7.17 11.25 7.5 11.25 7.92V14.27L8.78 11.79C8.64 11.65 8.44 11.57 8.25 11.57C8.061 11.57 7.87 11.65 7.72 11.79C7.43 12.08 7.43 12.56 7.72 12.85L11.47 16.62C11.75 16.9 12.25 16.9 12.53 16.62L16.28 12.85C16.57 12.56 16.57 12.08 16.28 11.79C15.98 11.5 15.51 11.5 15.21 11.79L12.75 14.27Z" fill="currentColor" />\n  </svg>',
    },
    {
      id: "arrow-box-up",
      name: "Arrow Box Up",
      svgIcon:
        '  <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path fill-rule="evenodd" clip-rule="evenodd" d="M22 7.92V16.09C22 19.62 19.729 22 16.34 22H7.67C4.28 22 2 19.62 2 16.09V7.92C2 4.38 4.28 2 7.67 2H16.34C19.729 2 22 4.38 22 7.92ZM11.25 9.73V16.08C11.25 16.5 11.59 16.83 12 16.83C12.42 16.83 12.75 16.5 12.75 16.08V9.73L15.22 12.21C15.36 12.35 15.56 12.43 15.75 12.43C15.939 12.43 16.13 12.35 16.28 12.21C16.57 11.92 16.57 11.44 16.28 11.15L12.53 7.38C12.25 7.1 11.75 7.1 11.47 7.38L7.72 11.15C7.43 11.44 7.43 11.92 7.72 12.21C8.02 12.5 8.49 12.5 8.79 12.21L11.25 9.73Z" fill="currentColor" />\n  </svg>',
    },
    {
      id: "arrow-box-left",
      name: "Arrow Box Left",
      svgIcon:
        '<svg fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.92 2H16.09C19.62 2 22 4.271 22 7.66V16.33C22 19.72 19.62 22 16.09 22H7.92C4.38 22 2 19.72 2 16.33V7.66C2 4.271 4.38 2 7.92 2ZM9.73 12.75H16.08C16.5 12.75 16.83 12.41 16.83 12C16.83 11.58 16.5 11.25 16.08 11.25H9.73L12.21 8.78C12.35 8.64 12.43 8.44 12.43 8.25C12.43 8.061 12.35 7.87 12.21 7.72C11.92 7.43 11.44 7.43 11.15 7.72L7.38 11.47C7.1 11.75 7.1 12.25 7.38 12.53L11.15 16.28C11.44 16.57 11.92 16.57 12.21 16.28C12.5 15.98 12.5 15.51 12.21 15.21L9.73 12.75Z" fill="currentColor" />\n  </svg>',
    },
    {
      id: "arrow-box-right",
      name: "Arrow Box Right",
      svgIcon:
        ' <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path fill-rule="evenodd" clip-rule="evenodd" d="M16.08 22H7.91C4.38 22 2 19.729 2 16.34V7.67C2 4.28 4.38 2 7.91 2H16.08C19.62 2 22 4.28 22 7.67V16.34C22 19.729 19.62 22 16.08 22ZM14.27 11.25H7.92C7.5 11.25 7.17 11.59 7.17 12C7.17 12.42 7.5 12.75 7.92 12.75H14.27L11.79 15.22C11.65 15.36 11.57 15.56 11.57 15.75C11.57 15.939 11.65 16.13 11.79 16.28C12.08 16.57 12.56 16.57 12.85 16.28L16.62 12.53C16.9 12.25 16.9 11.75 16.62 11.47L12.85 7.72C12.56 7.43 12.08 7.43 11.79 7.72C11.5 8.02 11.5 8.49 11.79 8.79L14.27 11.25Z" fill="currentColor" />\n  </svg>',
    },
    {
      id: "arrow-circle-down",
      name: "Arrow Circle Down",
      svgIcon:
        '<svg fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C6.48 22 2 17.51 2 12C2 6.48 6.48 2 12 2C17.51 2 22 6.48 22 12C22 17.51 17.51 22 12 22ZM16 10.02C15.7 9.73 15.23 9.73 14.94 10.03L12 12.98L9.06 10.03C8.77 9.73 8.29 9.73 8 10.02C7.7 10.32 7.7 10.79 8 11.08L11.47 14.57C11.61 14.71 11.8 14.79 12 14.79C12.2 14.79 12.39 14.71 12.53 14.57L16 11.08C16.15 10.94 16.22 10.75 16.22 10.56C16.22 10.36 16.15 10.17 16 10.02Z" fill="currentColor" />\n  </svg>',
    },
    {
      id: "arrow-circle-up",
      name: "Arrow Circle Up",
      svgIcon:
        ' <svg fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C17.52 2 22 6.49 22 12L21.9962 12.2798C21.8478 17.6706 17.4264 22 12 22C6.49 22 2 17.52 2 12C2 6.49 6.49 2 12 2ZM8 13.98C8.3 14.27 8.77 14.27 9.06 13.97L12 11.02L14.94 13.97C15.23 14.27 15.71 14.27 16 13.98C16.3 13.68 16.3 13.21 16 12.92L12.53 9.43C12.39 9.29 12.2 9.21 12 9.21C11.8 9.21 11.61 9.29 11.47 9.43L8 12.92C7.85 13.06 7.78 13.25 7.78 13.44C7.78 13.64 7.85 13.83 8 13.98Z" fill="currentColor" />\n  </svg>',
    },
     
  ];
  const searchOutput = document.querySelector("#search-output");
  const searchValue = document.getElementById("search-value");
  function renderIcon({ id, name, svgIcon }) {
    const iconBox = document.createElement("div");
    const iconOverlay = document.createElement("div");
    const iconWrapper = document.createElement("div");
    const copyButton = document.createElement("button");

    const iconName = document.createElement("div");
    iconName.textContent = name;
    iconName.classList.add("d-none"); // Hide the name
  
    copyButton.classList.add("btn", "btn-sm", "btn-soft-primary");
    copyButton.setAttribute("data-bs-toggle", "tooltip");
    copyButton.setAttribute("data-bs-original-title", "copy");
    copyButton.textContent = "Copy";
    copyButton.addEventListener("click", (e) => {
        navigator.clipboard.writeText(svgIcon);
    });
    iconOverlay.appendChild(copyButton);
    const iconSvgContainer = document.createElement("div");
  
    iconBox.classList.add("icon-box");
    iconOverlay.classList.add("overlay");
  
    iconSvgContainer.innerHTML = svgIcon;
    iconSvgContainer.setAttribute("aria-hidden", "true"); // Ensure accessibility
  
    iconBox.appendChild(iconSvgContainer);
  iconBox.appendChild(iconOverlay);
  iconBox.appendChild(iconName); // Add hidden name element to the icon box
  searchOutput.appendChild(iconBox);
  
    // iconBox.appendChild(iconOverlay);
    iconBox.appendChild(iconWrapper);
  
    return iconBox;
  }
  function filterCount(list) {
    const searchLength = document.querySelector("#search-length");
    if (searchLength !== null) {
      searchLength.textContent = "(" + list.length + ")";
    }
  }
  function searchList(list) {
    searchOutput.innerHTML = "";
    filterCount(list);
    list.map((icon) => {
      if (searchOutput !== null) { 
        searchOutput.appendChild(renderIcon(icon));
      }
    });
  }
  
  function searchNotFound() {
    searchOutput.innerHTML = "";
    const searchNotfoundText = document.createElement("span");
    searchNotfoundText.textContent = "Search Not Found";
    searchOutput.appendChild(searchNotfoundText);
    filterCount([]);
  }
  
  let searchParams = new URLSearchParams(window.location.search);
  
  let defaultIcon = iconList;
  
  if (searchParams.get("q") !== null) {
    defaultIcon = iconList.filter((icon) =>
      icon.name.toLowerCase().includes(searchParams.get("q"))
    );
  }
  searchList(defaultIcon);
  
  if (searchValue !== null) {
    searchValue.addEventListener("keyup", function () {
      if (searchValue.value !== "") {
        const filteredIcons = iconList.filter((icon) =>
          icon.name.toLowerCase().includes(searchValue.value.toLowerCase())
        );
        if (filteredIcons.length > 0) {
          searchList(filteredIcons);
        } else {
          searchNotFound();
        }
      } else {
        searchList(iconList);
      }
    });
  }
  const searchInput = document.getElementById("search-value");
  searchValue.addEventListener("keyup", function (event) {
    let searchParams = new URLSearchParams(window.location.search);
  
    searchParams.set("q", event.target.value);
  
    if (window.history.replaceState) {
      const url =
        window.location.protocol +
        "//" +
        window.location.host +
        window.location.pathname +
        "?" +
        searchParams.toString();
  
      window.history.replaceState(
        {
          path: url,
        },
        "",
        url
      );
    }
  });
  