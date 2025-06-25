//INSERT HEADER AND FOOTER
    // $(document).ready(function () {
    //     // Load Header
    //     $("#header").load("header.html");

    //     // Load Footer
    //     $("#footer").load("footer.html");
    // });









//HERO SECTION CONTENT AND ANIMATION

const contents = [
    { 
        title: "TRANSACTIONS", 
        text: "Your secure tool to monitor and guide your transactions with Glittarz.", 
        button: "Get Started"
    },
    { 
        title: "PAYMENTS", 
        text: "Experience the convenience of seamless payments with Gobapay", 
        button: "Get Started"
    },
    { 
        title: "BUSINESS", 
        text: "Grow Your Business with Gobapay secure and efficient financial solutions", 
        button: "Get Started"
    }
];

let index = 0;
const title = document.getElementById("hero-title");
const text = document.getElementById("hero-text");
const button = document.getElementById("hero-button");

function changeContent(firstLoad = false) {
    if (!firstLoad) {
        title.style.animation = "fadeOutTop 0.5s forwards";
        text.style.animation = "fadeOutRight 0.5s forwards";
        button.style.animation = "fadeOutBottom 0.5s forwards";
    }

    setTimeout(() => {
        index = (index + 1) % contents.length;
        title.innerText = contents[index].title;
        text.innerText = contents[index].text;
        button.innerText = contents[index].button;

        title.style.animation = "fadeInTop 1s forwards";
        text.style.animation = "fadeInRight 1s forwards 0.5s";
        button.style.animation = "fadeInBottom 1s forwards 1s";
    }, firstLoad ? 0 : 1000);
}

// Load first content immediately
changeContent(true);

// Continue changing content every 5 seconds
setInterval(() => changeContent(false), 5000);




//FREQUENTLY ASKED QUESTIONS
let activeFaq = null;

function toggleFaq(card) {
    // Get the plus sign inside the clicked card
    const plusSign = card.querySelector('.plus-sign');

    // Check if the clicked card is already active
    const isActive = card.classList.contains('active');

    // Close the currently active FAQ if any
    if (activeFaq && activeFaq !== card) {
        activeFaq.classList.remove('active');
        activeFaq.querySelector('.plus-sign').classList.replace('fa-minus', 'fa-plus'); // Change back to plus icon
    }

    // If the clicked card was not active, make it active
    if (!isActive) {
        card.classList.add('active');
        plusSign.classList.replace('fa-plus', 'fa-minus'); // Change to minus icon
        activeFaq = card;
    } else {
        card.classList.remove('active');
        plusSign.classList.replace('fa-minus', 'fa-plus'); // Change back to plus icon
        activeFaq = null;
    }
}