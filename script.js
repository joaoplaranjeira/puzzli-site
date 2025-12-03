// Global variables
let bookingData = {};
let generatedOTP = null;
let userEmail = null;

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}

// Modal functions
function showBookingModal() {
    document.getElementById('bookingModal').style.display = 'block';
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pickupDate').min = today;
    
    // Set default time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('pickupTime').value = `${hours}:${minutes}`;
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function closeSummaryModal() {
    document.getElementById('summaryModal').style.display = 'none';
}

function closeOTPModal() {
    document.getElementById('otpModal').style.display = 'none';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    // Reset all modals and forms
    closeBookingModal();
    closeSummaryModal();
    closeOTPModal();
    document.getElementById('bookingForm').reset();
    bookingData = {};
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Calculate distance (simplified - in real app, use Google Maps API)
function calculateDistance(from, to) {
    // Simulated distance calculation (10-50 km random)
    // In a real application, you would use Google Maps Distance Matrix API
    return Math.floor(Math.random() * 40) + 10;
}

// Calculate price based on distance and service type
function calculatePrice(distance, serviceType) {
    const rates = {
        'standard': 1.50,
        'comfort': 2.00,
        'premium': 3.00
    };
    
    const basePrice = distance * rates[serviceType];
    const minimumFare = 5.00;
    
    return Math.max(basePrice, minimumFare).toFixed(2);
}

// Handle booking form submission
function handleBookingSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const fromLocation = document.getElementById('fromLocation').value;
    const toLocation = document.getElementById('toLocation').value;
    const pickupDate = document.getElementById('pickupDate').value;
    const pickupTime = document.getElementById('pickupTime').value;
    const passengers = document.getElementById('passengers').value;
    
    // Fixed service type - BYD Atto 2
    const serviceType = 'standard';
    
    // Calculate distance and price
    const distance = calculateDistance(fromLocation, toLocation);
    const price = calculatePrice(distance, serviceType);
    
    // Store booking data
    bookingData = {
        from: fromLocation,
        to: toLocation,
        date: pickupDate,
        time: pickupTime,
        serviceType: serviceType,
        passengers: passengers,
        distance: distance,
        price: price
    };
    
    // Show summary
    showSummary();
}

// Show booking summary
function showSummary() {
    // Format date
    const dateObj = new Date(bookingData.date);
    const formattedDate = dateObj.toLocaleDateString('pt-PT', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const summaryHTML = `
        <div class="summary-item">
            <span class="summary-label">De:</span>
            <span class="summary-value">${bookingData.from}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Para:</span>
            <span class="summary-value">${bookingData.to}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Data:</span>
            <span class="summary-value">${formattedDate}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Hora:</span>
            <span class="summary-value">${bookingData.time}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Viatura:</span>
            <span class="summary-value">BYD Atto 2</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Passageiros:</span>
            <span class="summary-value">${bookingData.passengers}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Distância Estimada:</span>
            <span class="summary-value">${bookingData.distance} km</span>
        </div>
        <div class="price-display">
            <div class="price-label">Preço Estimado</div>
            <div class="price-amount">€${bookingData.price}</div>
        </div>
    `;
    
    document.getElementById('summaryContent').innerHTML = summaryHTML;
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('summaryModal').style.display = 'block';
}

// Generate OTP code
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Request OTP
function requestOTP() {
    const emailInput = document.getElementById('userEmail');
    const email = emailInput.value;
    
    if (!email || !emailInput.checkValidity()) {
        alert('Por favor, insira um email válido.');
        return;
    }
    
    userEmail = email;
    generatedOTP = generateOTP();
    
    // In a real application, you would send this OTP via email using a backend service
    // For demonstration, we'll just log it to console
    console.log('=================================');
    console.log('OTP Code:', generatedOTP);
    console.log('Email:', userEmail);
    console.log('=================================');
    
    // Simulate email sending
    alert(`Código OTP enviado para ${email}!\n\n(Para demonstração, verifique o console do navegador para ver o código)`);
    
    // Show OTP modal
    document.getElementById('otpEmail').textContent = email;
    document.getElementById('summaryModal').style.display = 'none';
    document.getElementById('otpModal').style.display = 'block';
}

// Verify OTP
function verifyOTP() {
    const enteredOTP = document.getElementById('otpCode').value;
    
    if (!enteredOTP || enteredOTP.length !== 6) {
        alert('Por favor, insira um código de 6 dígitos.');
        return;
    }
    
    if (enteredOTP === generatedOTP) {
        // OTP is correct - confirm booking
        confirmBooking();
    } else {
        alert('Código OTP inválido. Por favor, tente novamente.');
        document.getElementById('otpCode').value = '';
    }
}

// Confirm booking
function confirmBooking() {
    // Generate booking reference
    const bookingRef = 'PZL' + Date.now().toString().slice(-8);
    
    // Store booking reference
    bookingData.reference = bookingRef;
    bookingData.email = userEmail;
    bookingData.confirmedAt = new Date().toISOString();
    
    // In a real application, you would save this to a database
    console.log('Booking confirmed:', bookingData);
    
    // Save to localStorage for demonstration
    const bookings = JSON.parse(localStorage.getItem('puzzliBookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('puzzliBookings', JSON.stringify(bookings));
    
    // Show success modal
    document.getElementById('bookingRef').textContent = bookingRef;
    document.getElementById('otpModal').style.display = 'none';
    document.getElementById('successModal').style.display = 'block';
    
    // Reset OTP
    generatedOTP = null;
    document.getElementById('otpCode').value = '';
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});
