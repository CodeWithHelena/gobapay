const header = document.getElementById('header');

header.innerHTML = `
    <header>
        <nav class="navba">
            <div class="brand-logo"><a href="/landing/"><img src="assets/img/logo__2.png" alt=""></a></div>
            <ul id="navba-links">
                <div class="close-toggler">
                    <span class="iconify" data-icon="fa6-solid:xmark"  onclick="closeNavba()"></span>
                </div>
                <li class="navba-link active"><a href="/landing/" onclick="closeNavba()">HOME</a></li>
                <li class="navba-link"><a href="about.html" onclick="closeNavba()">ABOUT US</a></li>
                <li class="navba-link"><a href="index.html#faq" onclick="closeNavba()">FAQ</a></li>
                <li class="navba-link"><a href="contact-us.html" onclick="closeNavba()">CONTACT</a></li>
                <li class="navba-link navba-btn mt-3">
                    <a href="login.html" class="btn-brand btn-brand-outline ms-4" onclick="closeNavba()">Login</a>
                    <a href="register.html" class=" btn-brand ms-2" onclick="closeNavba()">Get Started</a>
                </li>
            </ul>
            <div class="action-btn">
                <a href="login.html" class="me-3 login-btn">Login</a>
                <a href="register.html" class="btn-brand">Get Started <i class="ms-2 fa-solid fa-arrow-right"></i></a>
            </div>
            <div class="open-toggler" onclick="openNavba()">
                <span class="iconify" data-icon="hugeicons:menu-11"></span>
            </div>
        </nav>
    </header>
`


// SCRIPT TO OPEN AND CLOSE NAVBAR
function openNavba() {
    document.getElementById("navba-links").classList.add('show-navba');
    console.log('clicked')
}
 
function closeNavba() {
    document.getElementById("navba-links").classList.remove('show-navba');
    console.log('clicked')
}




const navbaLinks = document.querySelectorAll('.navba-link a');

// Normalize current path
let currentPath = window.location.pathname;
if (currentPath.endsWith('/')) {
  currentPath += 'index.html'; // Treat folders as index.html
}
currentPath = currentPath.split('/').pop(); // Get only the file name

navbaLinks.forEach(link => {
  let href = link.getAttribute('href');

  // Normalize href too
  if (href.endsWith('/')) {
    href += 'index.html';
  }
  href = href.split('/').pop();

  // Match and toggle active class
  if (href === currentPath) {
    link.parentElement.classList.add('active');
  } else {
    link.parentElement.classList.remove('active');
  }
});


