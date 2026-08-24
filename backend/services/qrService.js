const QRCode = require('qrcode');

/**
 * Generate a QR code data URL for a given booking reference.
 * @param {string} bookingRef
 * @returns {Promise<string>} base64 PNG data URL
 */
async function generateQR(bookingRef) {
  return QRCode.toDataURL(bookingRef, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });
}

module.exports = { generateQR };
