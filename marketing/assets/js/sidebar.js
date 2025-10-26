const sideBarContainer = document.getElementById('sidebar_container');
        sideBarContainer.innerHTML += `
            <aside class="sidebar">
                <button class="close-sidebar"><i class="fas fa-xmark"></i></button>
                <div class="brand-logo"><img src="assets/img/brand-logo2.jpg" alt=""></div>
                <ul class="sidebar-menu">
                    <li><a href="dashboard.html" class="sidebar-link"><iconify-icon icon="mdi:view-dashboard-outline" class="iconify"></iconify-icon><span>Overview</span></a></li>
                    
                    <li>
                        <div class="dropdown">
                            <button type="button" class="dropdown-button dropdown-toggle"><iconify-icon icon="mdi:account-group" class="iconify"></iconify-icon><span>Customer</span></button>
                            <div class="dropdown-container">
                                <a href="customer.html"><iconify-icon icon="mdi:account-plus" class="iconify"></iconify-icon> Add Customer</a>
                                <a href="customer.html"><iconify-icon icon="mdi:account-eye" class="iconify"></iconify-icon> View Customer</a>
                                <a href="customer.html"><iconify-icon icon="mdi:history" class="iconify"></iconify-icon> Customer History</a>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div class="dropdown">
                            <button type="button" class="dropdown-button dropdown-toggle"><iconify-icon icon="mdi:cog" class="iconify"></iconify-icon><span>Settings</span></button>
                            <div class="dropdown-container">                                
                                <a href="settings.html"><iconify-icon icon="mdi:account-circle" class="iconify"></iconify-icon>Profile</a>
                                <a href="#" class="sidebar-theme-option">
                                    <iconify-icon icon="solar:moon-bold" class="iconify"></iconify-icon> 
                                    Theme
                                </a>
                            </div>
                        </div>
                    </li>
                    <li class="sm-logout"><a href="#" class="sidebar-link" id="logoutBTN"><iconify-icon icon="mdi:logout" class="iconify"></iconify-icon><span>Logout</span></a></li>
                </ul>
            </aside>
        `;



        const sidebar = sideBarContainer.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');

        document.querySelectorAll('.dropdown-button').forEach(button => {
            button.addEventListener('click', function () {
                const dropdownContainer = this.nextElementSibling;
                this.classList.toggle('active');
                dropdownContainer.classList.toggle('open');
            });
        });

        document.querySelector('.toggle-btn').addEventListener('click', function () {
            if (window.innerWidth <= 576) {
                sideBarContainer.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            }
        });

        sideBarContainer.querySelector('.close-sidebar').addEventListener('click', function () {
            sideBarContainer.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
        sideBarContainer.querySelector('.overlay').addEventListener('click', function () {
            sideBarContainer.classList.remove('active');
            document.body.style.overflow = 'auto';
        });

        const manageInitialViewState = () => {
            if (window.innerWidth > 576 && window.innerWidth <= 768) {
                sidebar.classList.add('collapsed');
                mainContent.classList.add('expanded');
            } else if (window.innerWidth > 768) {
                sidebar.classList.remove('collapsed');
                mainContent.classList.remove('expanded');
            }
        };

        manageInitialViewState();
        window.addEventListener('resize', manageInitialViewState);