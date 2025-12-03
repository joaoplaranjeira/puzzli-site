# Puzzli - Private Transport Website

A modern, Uber-inspired website for Puzzli, a private transport company operating with Uber and Bolt.

## Features

✅ **Modern Design** - Inspired by Uber's clean, professional interface
✅ **Booking System** - Users can book rides by selecting origin, destination, and pickup time
✅ **Price Estimation** - Automatic price calculation based on distance and service type
✅ **Booking Summary** - Review all trip details before confirming
✅ **OTP Authentication** - Email verification using One-Time Password for booking confirmation
✅ **Responsive Design** - Works perfectly on mobile, tablet, and desktop devices
✅ **Contact Information** - Easy access to company contacts

## Service Types

- **Standard** - €1.50/km (minimum fare €5.00)
- **Comfort** - €2.00/km (minimum fare €5.00)
- **Premium** - €3.00/km (minimum fare €5.00)

## How to Use

1. Open `index.html` in a web browser
2. Click "Reservar Viagem" (Book Trip) button
3. Fill in the booking form:
   - Origin address
   - Destination address
   - Pickup date and time
   - Service type
   - Number of passengers
4. Review the booking summary with estimated price
5. Enter your email address
6. Click "Confirmar e Enviar OTP"
7. Check the browser console for the OTP code (in production, this would be sent via email)
8. Enter the 6-digit OTP code
9. Receive booking confirmation with reference number

## Files Structure

```
puzzle-site/
├── index.html       # Main HTML file
├── styles.css       # All CSS styles
├── script.js        # JavaScript functionality
└── README.md        # This file
```

## Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- LocalStorage for booking persistence

## Features Breakdown

### 1. Navigation
- Fixed top navigation bar
- Smooth scrolling to sections
- Mobile-responsive menu

### 2. Hero Section
- Eye-catching gradient background
- Clear call-to-action button
- Uber-inspired design

### 3. Services Section
- Four service cards showcasing offerings
- Hover animations
- Icon-based design

### 4. Contact Section
- Phone numbers
- Email addresses
- Location information

### 5. Booking System
- Modal-based booking flow
- Form validation
- Date/time pickers with minimum constraints

### 6. Price Calculation
- Distance estimation (simulated)
- Service type multipliers
- Minimum fare protection

### 7. OTP Authentication
- 6-digit code generation
- Email validation
- OTP verification
- Resend functionality

### 8. Booking Confirmation
- Unique reference number generation
- LocalStorage persistence
- Success confirmation modal

## Development Notes

### For Production Deployment:

1. **Distance Calculation**: Replace the simulated `calculateDistance()` function with Google Maps Distance Matrix API for real distance calculation.

2. **OTP Email Service**: Integrate a backend service (Node.js, PHP, Python) with an email provider (SendGrid, AWS SES, Mailgun) to actually send OTP codes via email.

3. **Database**: Replace LocalStorage with a proper database (MySQL, PostgreSQL, MongoDB) to store bookings.

4. **Payment Integration**: Add payment gateway (Stripe, PayPal) to process payments.

5. **Backend API**: Create a REST API to handle:
   - Booking creation
   - OTP generation and verification
   - Email sending
   - Booking retrieval

6. **Security**: Implement proper security measures:
   - HTTPS
   - Rate limiting for OTP requests
   - Input sanitization
   - CSRF protection

7. **Real-time Tracking**: Integrate with Uber/Bolt APIs for real-time driver tracking.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Demo Instructions

Since this is a frontend-only demonstration:

1. The OTP code is logged to the browser console (press F12 to open developer tools)
2. Look for the console message showing the 6-digit code
3. Enter this code in the OTP verification modal
4. Bookings are saved to browser LocalStorage

## Customization

### Colors
Edit CSS variables in `styles.css` to match your brand colors.

### Service Prices
Modify the `rates` object in `script.js`:
```javascript
const rates = {
    'standard': 1.50,
    'comfort': 2.00,
    'premium': 3.00
};
```

### Contact Information
Update the contact section in `index.html` with your actual contact details.

### Language
The interface is in Portuguese (PT). To change language, update text content in `index.html` and `script.js`.

## License

This is a demonstration project for Puzzli transport company.

## Support

For questions or support, contact:
- Email: info@puzzli.pt
- Phone: +351 912 345 678
