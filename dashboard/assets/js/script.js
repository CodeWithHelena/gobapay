//INSERT SIDEBAR
// $(document).ready(function () {
//   // Load Sidebar
//   $("#sidebar_container").load("sidebar.html");

// });


// SIDEBAR MENU DROPDOWNS

var dropdown = document.getElementsByClassName("dropdown-button");
 var i;
 
 for (i = 0; i < dropdown.length; i++) {
   dropdown[i].addEventListener("click", function() {
     this.classList.toggle("active");
     var dropdownContent = this.nextElementSibling;
     if (dropdownContent.style.display === "block") {
       dropdownContent.style.display = "none";
     } else {
       dropdownContent.style.display = "block";
     }
   });
 }


// TRANSACTION HISTORY DOTS ACTION TOGGLE
const dotAction = document.getElementById('dot-action') ;
const actionList = document.getElementById('action-list');
const dotIcon = document.getElementById('dot-icon');

//  dotIcon.addEventListener('click', () => {
//   dotAction.classList.toggle('dot-action');
// actionList.classList.toggle('action-list');
// })




// FUNCTION TO RETURN TO PREVIOUS PAGE 
function goBack() {
  window.history.back();
}

