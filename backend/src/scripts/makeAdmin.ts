import { db, auth } from '../config/firebase-admin';
import { logger } from '../utils/logger';

/**
 * Script to set a user as admin by email
 * Run with: npx ts-node src/scripts/makeAdmin.ts <email>
 * 
 * Example: npx ts-node src/scripts/makeAdmin.ts avmallikarjun99@gmail.com
 */

const makeUserAdmin = async (email: string) => {
  try {
    logger.info(`Attempting to make user ${email} an admin...`);
    
    // Find user by email
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      logger.info(`Found existing user with UID: ${userRecord.uid}`);
    } catch (error) {
      logger.info(`User not found, creating new user for ${email}`);
      
      // Create user if they don't exist (in a real app, you'd set a temporary password or use passwordless sign-in)
      userRecord = await auth.createUser({
        email,
        emailVerified: true,
        displayName: email.split('@')[0],
        password: 'Temp' + Math.random().toString(36).substring(2, 10) // Temporary random password
      });
      
      logger.info(`Created new user with UID: ${userRecord.uid}`);
    }
    
    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      // Create user document if it doesn't exist
      await db.collection('users').doc(userRecord.uid).set({
        email,
        displayName: userRecord.displayName || email.split('@')[0],
        role: 'admin',
        admin: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      logger.info(`Created new user document in Firestore`);
    } else {
      // Update existing user document
      await db.collection('users').doc(userRecord.uid).update({
        role: 'admin',
        admin: true,
        updatedAt: new Date().toISOString()
      });
      logger.info(`Updated existing user document in Firestore`);
    }
    
    // Set custom claims for Firebase Auth
    await auth.setCustomUserClaims(userRecord.uid, { 
      admin: true,
      role: 'admin'
    });
    
    logger.info(`Successfully set user ${email} as admin`);
    return {
      success: true,
      message: `User ${email} is now an admin`,
      uid: userRecord.uid
    };
  } catch (error) {
    logger.error('Error making user admin:', error);
    return {
      success: false,
      message: `Failed to make ${email} an admin`,
      error
    };
  }
};

// Get email from command line arguments or use the hardcoded one
const targetEmail = process.argv[2] || 'avmallikarjun99@gmail.com';

makeUserAdmin(targetEmail)
  .then(result => {
    console.log(result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  }); 