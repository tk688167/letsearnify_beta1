// ... existing modal and nav logic ...

// Auth Board Logic
function openAuthBoard(tab = 'login') {
    const modal = document.getElementById('authBoardModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        switchAuthTab(tab);
    }
}

function closeAuthBoard() {
    const modal = document.getElementById('authBoardModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function switchAuthTab(tab) {
    // Tabs
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    // Panels
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${tab}`).classList.add('active');
}


function handleAuthSubmit(e, type) {
    e.preventDefault();

    // Login Logic (Demo System)
    if (type === 'login') {
        const user = document.getElementById('loginUser').value;
        const pass = document.getElementById('loginPass').value;

        // Demo Credentials Check
        if (user === '12345' && pass === '12345') {
            closeAuthBoard();
            showNotification('Success', 'Welcome back! Redirecting to User Home...', 'success');

            // Set Auth Session
            localStorage.setItem('earnify_auth_status', 'true');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showNotification('Error', 'Invalid Credentials. Use Demo: 12345 / 12345', 'error');
        }
        return;
    }

    // Signup Logic (Basic Demo)
    if (type === 'signup') {
        const pass = document.getElementById('spass').value;
        const conf = document.getElementById('spassconf').value;
        if (pass !== conf) {
            showNotification('Error', 'Passwords do not match!', 'error');
            return;
        }
        // Success Simulation for Signup
        closeAuthBoard();
        showNotification('Success', 'Account Created! Redirecting to User Home...', 'success');

        // Set Auth Session
        localStorage.setItem('earnify_auth_status', 'true');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}

// Global Auth Functions
function logout() {
    localStorage.removeItem('earnify_auth_status');
    window.location.href = 'index.html';
}

function goBack() {
    // Check if referrer is internal (same domain)
    if (document.referrer && document.referrer.indexOf(window.location.hostname) !== -1) {
        history.back();
    } else {
        // Fallback to Dashboard if no history or external referrer
        window.location.href = 'dashboard.html';
    }
}

function checkAuth(isPrivatePage) {
    const isAuthenticated = localStorage.getItem('earnify_auth_status') === 'true';

    if (isPrivatePage) {
        // If on private page (Dashboard) and NOT logged in -> Redirect to Landing
        if (!isAuthenticated) {
            window.location.href = 'index.html';
        }
    } else {
        // If on public page (Landing) and IS logged in -> Redirect to User Home
        if (isAuthenticated) {
            window.location.href = 'dashboard.html';
        }
    }
}

function handleLogoClick() {
    const isAuthenticated = localStorage.getItem('earnify_auth_status') === 'true';
    if (isAuthenticated) {
        window.location.href = 'dashboard.html';
    } else {
        openAuthBoard('login');
    }
}


// Notification Logic
// Notification Logic (Toast System)
function showNotification(title, message, type = 'success') {
    // Ensure container exists
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = 'toast';

    // Icon based on type (simple logic)
    let iconClass = 'fa-info-circle';
    if (title.toLowerCase().includes('success') || type === 'success') iconClass = 'fa-check-circle';
    else if (title.toLowerCase().includes('error') || type === 'error') iconClass = 'fa-exclamation-circle';

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}

// ... deposit logic ...

// ... auth simulation ...

// ... sticky header ...

// Mobile Menu Logic (Shared)
const mobileMenuBtn = document.querySelector('.mobile-menu-btn'); // For index.html
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function () {
        const header = document.querySelector('.header');
        header.classList.toggle('mobile-nav-active');
        // Icon toggle logic
        const icon = this.querySelector('i');
        if (header.classList.contains('mobile-nav-active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}


// --- DASHBOARD SPECIFIC LOGIC ---

// Sidebar Toggle
const sidebarToggle = document.querySelector('.open-sidebar-btn');
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.add('active');
    });
}

const closeSidebar = document.querySelector('.close-sidebar');
if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.remove('active');
    });
}

// Tab Switching Logic
function switchTab(tabId, btnElement) {
    // Hide all contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active-content'));

    // Show target content
    document.getElementById(tabId).classList.add('active-content');

    // Deactivate all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Activate clicked button
    btnElement.classList.add('active');
}

// Chart.js Drawing
document.addEventListener('DOMContentLoaded', () => {
    // Scroll Animations (Outdoor Theme)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-title, .hero-content, .deposit-box').forEach(el => {
        el.style.opacity = '0'; // Prepare for animation
        observer.observe(el);
    });

    // Deposit Range Interaction
    const depositInput = document.getElementById('depositAmount');
    const depositRange = document.getElementById('depositRange');

    if (depositInput && depositRange) {
        const updateRangeBackground = (val, max) => {
            const percentage = (val / max) * 100;
            depositRange.style.backgroundSize = `${percentage}% 100%`;
        };

        depositRange.addEventListener('input', (e) => {
            const val = e.target.value;
            depositInput.value = parseFloat(val).toFixed(2);
            updateRangeBackground(val, depositRange.max);
        });

        depositInput.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (!val) val = 0;
            depositRange.value = val;
            updateRangeBackground(val, depositRange.max);
        });

        // Init
        updateRangeBackground(depositRange.value, depositRange.max);
    }

    const ctx = document.getElementById('portfolioChart');
    if (ctx) {
        // Gradient - Pink Theme (Earning Flow)
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(255, 64, 129, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 64, 129, 0.0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Portfolio Value ($)',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: '#ff4081', // Pink
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#e5e7eb',
                    pointBorderColor: '#b0bec5', // Light Steel Grey
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#ff4081'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: '#666' }, grid: { display: false } },
                    y: { ticks: { color: '#666' }, grid: { color: '#d1d5db' } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#f2f4f6',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#d1d5db',
                        borderWidth: 1,
                        titleFont: { family: 'Inter', size: 14 },
                        bodyFont: { family: 'Inter' }
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#888'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#888'
                        }
                    }
                }
            }
        });
    }

    // Task Interactions
    const taskButtons = document.querySelectorAll('.task-list-mini .btn-sm');
    taskButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskName = e.target.parentElement.querySelector('h5').innerText;
            // Simulate "Starting"
            e.target.innerText = "Started...";
            e.target.style.opacity = "0.7";

            setTimeout(() => {
                showNotification("Task Started", `You have started: ${taskName}. Complete the steps to earn your reward.`);
                e.target.innerText = "In Progress";
                e.target.classList.add("btn-secondary"); // distinct style if we had it, or just keep as is
                e.target.style.opacity = "1";
            }, 800);
        });
    });

    // Investment Interactions
    const investButtons = document.querySelectorAll('.investment-card .btn-primary');
    investButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.investment-card');
            const title = card.querySelector('h4').innerText;
            // Simulate Interaction
            e.target.innerText = "Processing...";
            e.target.style.opacity = "0.7";

            setTimeout(() => {
                showNotification("Investment Initiated", `You have requested to invest in: ${title}. Please complete the payment flow.`);
                e.target.innerText = "Invested";
                e.target.style.background = "#4caf50";
                e.target.style.borderColor = "#4caf50";
                e.target.style.color = "#fff";
                e.target.style.opacity = "1";
                e.target.disabled = true;
            }, 1000);
        });
    });
    // New Scroll Animation Observer for .reveal classes
    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    // --- Counter Animation Logic (Enhanced) ---
    const counters = document.querySelectorAll('.counter-anim');
    const speed = 200; // Adjust speed as needed

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const targetAttr = counter.getAttribute('data-target');
                const target = +targetAttr; // Numeric value

                // Detect Prefix/Suffix from initial text if not empty, otherwise guess
                const text = counter.innerText;
                const prefix = text.includes('$') ? '$' : '';
                const suffix = text.includes('%') ? '%' : '';

                const updateCount = () => {
                    const currentText = counter.innerText.replace(/[^0-9.]/g, '');
                    const count = +currentText;

                    const inc = target / speed;

                    if (count < target) {
                        const nextVal = Math.ceil(count + inc);
                        // Apply formatting
                        // Simple logic: if target has decimal in attribute? assume int for now unless specified
                        // Improving formatting based on target value type (float vs int)
                        const isFloat = targetAttr.includes('.');
                        const formattedVal = isFloat ? (count + (target / speed)).toFixed(2) : nextVal;

                        // Prevent overshooting
                        if (+formattedVal > target) {
                            counter.innerText = prefix + (isFloat ? target.toFixed(2) : target) + suffix;
                        } else {
                            counter.innerText = prefix + formattedVal + suffix;
                            setTimeout(updateCount, 15);
                        }
                    } else {
                        counter.innerText = prefix + (targetAttr.includes('.') ? target.toFixed(2) : target) + suffix;
                    }
                };

                // Initial clear for animation start
                counter.innerText = prefix + "0" + suffix;
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // --- Global Section Animation Observer ---
    const sectionObserverOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('anim-visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, sectionObserverOptions);

    document.querySelectorAll('.section-anim').forEach((el) => {
        el.classList.add('anim-hidden'); // Ensure initial state
        sectionObserver.observe(el);
    });

});

// --- Referral Logic ---
function copyReferralLink() {
    const linkText = document.getElementById('referralLink').innerText;
    navigator.clipboard.writeText(linkText).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.style.background = '#4caf50';
        btn.style.color = '#fff';

        showNotification('Success', 'Referral link copied to clipboard!', 'success');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'var(--primary-gold)';
            btn.style.color = '#000';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Error', 'Failed to copy link', 'error');
    });
}

// --- Dashboard Earnings Simulation ---
function updateDashboardEarnings() {
    // Simulated Data Source (In a real app, fetch from API)
    const earningsData = {
        task: localStorage.getItem('earn_task') || 0.00,
        watch: localStorage.getItem('earn_watch') || 0.00,
        mudaraba: localStorage.getItem('earn_mudaraba') || 0.00,
        marketplace: localStorage.getItem('earn_marketplace') || 0.00
    };

    // Update DOM elements if they exist
    const taskCard = document.querySelector('.task-card .counter-anim');
    if (taskCard) taskCard.setAttribute('data-target', earningsData.task);

    const watchCard = document.querySelector('.watch-card .counter-anim');
    if (watchCard) watchCard.setAttribute('data-target', earningsData.watch);

    const mudarabaCard = document.querySelector('.mudarba-card .counter-anim');
    if (mudarabaCard) mudarabaCard.setAttribute('data-target', earningsData.mudaraba);

    const marketplaceCard = document.querySelector('.marketplace-card .counter-anim');
    if (marketplaceCard) marketplaceCard.setAttribute('data-target', earningsData.marketplace);
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardEarnings();
});

// --- Feature Access Control (Minimum Deposit) ---
function checkFeatureAccess(targetUrl) {
    // Get total deposited from storage (simulated backend)
    const totalDeposited = parseFloat(localStorage.getItem('earnify_total_deposited') || '0');

    // Check Condition: Must have deposited at least $1
    if (totalDeposited >= 1) {
        // Unlock: Proceed to target
        window.location.href = targetUrl;
    } else {
        // Lock: Show Error
        showNotification('Access Denied', 'Please deposit at least $1 to unlock this premium feature.', 'error');
    }
}

// Auto-check on restricted page load
function enforcePageAccess() {
    const restrictedPages = ['tasks.html', 'investments.html', 'marketplace.html'];
    const path = window.location.pathname;
    const page = path.split('/').pop();

    if (restrictedPages.includes(page)) {
        const totalDeposited = parseFloat(localStorage.getItem('earnify_total_deposited') || '0');
        if (totalDeposited < 1) {
            alert('Access Denied: Please deposit at least $1 to unlock this feature.'); // Alert as fallback before redirect
            window.location.href = 'dashboard.html';
        }
    }
}

// Helper to simulate a successful deposit (Call this when payment succeeds)
function recordDeposit(amount) {
    let currentTotal = parseFloat(localStorage.getItem('earnify_total_deposited') || '0');
    currentTotal += parseFloat(amount);
    localStorage.setItem('earnify_total_deposited', currentTotal.toFixed(2));

    // Also update the UI mini-tile if present
    const miniStat = document.querySelector('.mini-stat-tile span:nth-child(2)'); // Rudimentary selector, might need id
    // Better to reload or specific ID update if strictly needed, but notifications usually suffice for now.
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardEarnings();
    enforcePageAccess();
});
