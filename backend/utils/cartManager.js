// Cart Manager for handling cart cleanup and maintenance
const { guestCarts } = require('./cartStorage');

// Clean up guest carts that are older than 24 hours
const cleanupOldGuestCarts = () => {
  console.log('Starting guest cart cleanup...');
  
  const now = Date.now();
  const cutoffTime = now - (24 * 60 * 60 * 1000); // 24 hours ago
  
  let cleanedCount = 0;
  
  for (const [sessionId, cartData] of guestCarts.entries()) {
    // Extract timestamp from session ID (assuming format sess_timestamp_random)
    const parts = sessionId.split('_');
    if (parts.length >= 3) {
      const timestamp = parseInt(parts[1]);
      if (!isNaN(timestamp) && timestamp < cutoffTime) {
        guestCarts.delete(sessionId);
        cleanedCount++;
      }
    }
  }
  
  console.log(`Cleaned up ${cleanedCount} old guest carts.`);
};

// Schedule cleanup every hour
const startCartCleanupScheduler = () => {
  console.log('Starting cart cleanup scheduler...');
  
  // Run cleanup immediately on startup
  cleanupOldGuestCarts();
  
  // Schedule cleanup every hour (3600000 ms)
  setInterval(cleanupOldGuestCarts, 3600000);
};

module.exports = {
  cleanupOldGuestCarts,
  startCartCleanupScheduler
};