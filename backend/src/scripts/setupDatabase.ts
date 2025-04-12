import { db, auth } from '../config/firebase-admin';
import { logger } from '../utils/logger';

/**
 * Script to set up initial database structure and sample data
 * Run with: npx ts-node src/scripts/setupDatabase.ts
 */

const setupDatabase = async () => {
  try {
    logger.info('Starting database setup...');
    
    // Create sample users
    await setupUsers();
    
    // Create sample announcements
    await setupAnnouncements();
    
    // Create sample events
    await setupEvents();
    
    // Create sample documents
    await setupDocuments();
    
    // Create sample gallery
    await setupGallery();
    
    // Create sample complaints
    await setupComplaints();
    
    // Create sample payments
    await setupPayments();
    
    logger.info('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
};

const setupUsers = async () => {
  logger.info('Setting up users collection...');
  
  const users = [
    {
      uid: 'admin-user-1',
      displayName: 'Admin User',
      email: 'admin@example.com',
      phoneNumber: '+1234567890',
      role: 'admin',
      admin: true,
      address: 'Block A, Apt 201',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
      emailVerified: true
    },
    {
      uid: 'admin-mallikarjun',
      displayName: 'Mallikarjun Admin',
      email: 'avmallikarjun99@gmail.com',
      phoneNumber: '+1234567899',
      role: 'admin',
      admin: true,
      address: 'Block A, Apt 101',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoURL: 'https://randomuser.me/api/portraits/men/4.jpg',
      emailVerified: true
    },
    {
      uid: 'admin-bhargav',
      displayName: 'Bhargav Admin',
      email: 'adepuvaatsavasribhargav@gmail.com',
      phoneNumber: '+1234567888',
      role: 'admin',
      admin: true,
      address: 'Block D, Apt 404',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoURL: 'https://randomuser.me/api/portraits/men/5.jpg',
      emailVerified: true
    },
    {
      uid: 'resident-1',
      displayName: 'John Resident',
      email: 'john@example.com',
      phoneNumber: '+1234567891',
      role: 'resident',
      address: 'Block B, Apt 101',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoURL: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    {
      uid: 'resident-2',
      displayName: 'Jane Resident',
      email: 'jane@example.com',
      phoneNumber: '+1234567892',
      role: 'resident',
      address: 'Block C, Apt 305',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoURL: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      uid: 'security-1',
      displayName: 'Sam Security',
      email: 'security@example.com',
      phoneNumber: '+1234567893',
      role: 'security',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoURL: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  ];
  
  // Write users individually and set custom claims for admins
  for (const user of users) {
    // Create/update user document in Firestore
    await db.collection('users').doc(user.uid).set(user);
    logger.info(`Set user document for ${user.email} (UID: ${user.uid})`);

    // Set custom claims for admin users if using real Firebase Admin SDK
    if (user.role === 'admin' && auth && typeof auth.setCustomUserClaims === 'function') {
      try {
        // Ensure the user exists in Firebase Auth (create if not, only works if real SDK)
        try {
          await auth.getUser(user.uid);
        } catch (error: any) {
          if (error.code === 'auth/user-not-found') {
            logger.warn(`User ${user.email} not found in Firebase Auth. Creating...`);
            // NOTE: This creation will fail if using mock auth
            await auth.createUser({ 
              uid: user.uid, 
              email: user.email, 
              emailVerified: user.emailVerified ?? false,
              displayName: user.displayName,
              photoURL: user.photoURL,
              // You might need to set a default/temporary password here if creating
            });
            logger.info(`Created user ${user.email} in Firebase Auth.`);
          } else {
            throw error; // Re-throw other errors
          }
        }
        
        // Set the custom claim
        await auth.setCustomUserClaims(user.uid, { admin: true, role: 'admin' });
        logger.info(`Set custom claims for admin: ${user.email}`);
      } catch (claimError) {
        logger.error(`Failed to set custom claims or create auth user for ${user.email}:`, claimError);
        // Log this error but continue the script, as Firestore setup might still be useful
      }
    }
  }
  
  logger.info(`Processed ${users.length} users`);
};

const setupAnnouncements = async () => {
  logger.info('Setting up announcements collection...');
  
  const announcements = [
    {
      title: 'Water Outage Notice',
      content: 'Due to maintenance work, water will be shut off from 9AM to 12PM tomorrow. Please store enough water for your needs during this time.',
      category: 'Maintenance',
      priority: 'High',
      createdBy: 'admin-user-1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      attachments: [
        { fileName: 'schedule.pdf', fileUrl: 'https://example.com/files/schedule.pdf' }
      ]
    },
    {
      title: 'Monthly Community Meeting',
      content: 'Our monthly community meeting will be held in the community hall on the 15th at 7PM. Please attend to discuss upcoming community projects.',
      category: 'General',
      priority: 'Medium',
      createdBy: 'admin-user-1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
      attachments: []
    },
    {
      title: 'Security Alert: Car Break-ins',
      content: 'There have been reports of car break-ins in the parking area. Please ensure your vehicles are locked and valuables are not left visible.',
      category: 'Security',
      priority: 'High',
      createdBy: 'admin-user-1',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      attachments: []
    }
  ];
  
  for (const announcement of announcements) {
    await db.collection('announcements').add(announcement);
  }
  
  logger.info(`Added ${announcements.length} announcements`);
};

const setupEvents = async () => {
  logger.info('Setting up events collection...');
  
  const events = [
    {
      title: 'Community BBQ',
      description: 'Join us for our summer BBQ with food, games, and fun for the whole family!',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours after start
      location: 'Community Park',
      maxAttendees: 50,
      attendees: ['resident-1', 'resident-2'],
      createdBy: 'admin-user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000'
    },
    {
      title: 'Yoga in the Park',
      description: 'Weekly yoga session open to residents of all skill levels. Bring your own mat!',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000).toISOString(), // 1 hour after start
      location: 'Community Garden',
      maxAttendees: 20,
      attendees: ['resident-2'],
      createdBy: 'admin-user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000'
    },
    {
      title: 'Book Club Meeting',
      description: 'This month we are discussing "The Great Gatsby". Come even if you haven\'t finished the book!',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours after start
      location: 'Community Center, Room 2',
      maxAttendees: 15,
      attendees: ['resident-1'],
      createdBy: 'admin-user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: 'https://images.unsplash.com/photo-1530143584546-02191bc84eb5?q=80&w=1000'
    }
  ];
  
  for (const event of events) {
    await db.collection('events').add(event);
  }
  
  logger.info(`Added ${events.length} events`);
};

const setupDocuments = async () => {
  logger.info('Setting up documents collection...');
  
  const documents = [
    {
      title: 'Community Bylaws',
      description: 'Official rules and regulations for our residential community',
      category: 'Rules',
      fileUrl: 'https://example.com/files/bylaws.pdf',
      fileName: 'community_bylaws_2024.pdf',
      fileType: 'application/pdf',
      fileSize: 1254000,
      uploadedBy: 'admin-user-1',
      uploadedAt: new Date().toISOString(),
      tags: ['rules', 'official', 'bylaws']
    },
    {
      title: 'Maintenance Request Form',
      description: 'Form to be filled out for any maintenance requests',
      category: 'Forms',
      fileUrl: 'https://example.com/files/maintenance_form.pdf',
      fileName: 'maintenance_request_form.pdf',
      fileType: 'application/pdf',
      fileSize: 285000,
      uploadedBy: 'admin-user-1',
      uploadedAt: new Date().toISOString(),
      tags: ['maintenance', 'form', 'request']
    },
    {
      title: 'Community Newsletter - July 2024',
      description: 'Monthly newsletter with updates and announcements',
      category: 'Newsletters',
      fileUrl: 'https://example.com/files/newsletter_july.pdf',
      fileName: 'community_newsletter_july_2024.pdf',
      fileType: 'application/pdf',
      fileSize: 3450000,
      uploadedBy: 'admin-user-1',
      uploadedAt: new Date().toISOString(),
      tags: ['newsletter', 'monthly', 'updates']
    }
  ];
  
  for (const document of documents) {
    await db.collection('documents').add(document);
  }
  
  logger.info(`Added ${documents.length} documents`);
};

const setupGallery = async () => {
  logger.info('Setting up gallery collection...');
  
  const galleryItems = [
    {
      title: 'Summer Pool Party 2024',
      description: 'Photos from our annual summer pool party',
      imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=500',
      category: 'Events',
      uploadedBy: 'admin-user-1',
      uploadedAt: new Date().toISOString(),
      tags: ['summer', 'pool', 'party']
    },
    {
      title: 'Community Garden',
      description: 'Our beautiful community garden in bloom',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1000',
      thumbnailUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=500',
      category: 'Facilities',
      uploadedBy: 'admin-user-1',
      uploadedAt: new Date().toISOString(),
      tags: ['garden', 'flowers', 'spring']
    },
    {
      title: 'New Year Celebration',
      description: 'Ringing in the new year with our community',
      imageUrl: 'https://images.unsplash.com/photo-1546271876-af6caec5fae4?q=80&w=1000',
      thumbnailUrl: 'https://images.unsplash.com/photo-1546271876-af6caec5fae4?q=80&w=500',
      category: 'Events',
      uploadedBy: 'admin-user-1',
      uploadedAt: new Date().toISOString(),
      tags: ['new year', 'celebration', 'fireworks']
    }
  ];
  
  for (const item of galleryItems) {
    await db.collection('gallery').add(item);
  }
  
  logger.info(`Added ${galleryItems.length} gallery items`);
};

const setupComplaints = async () => {
  logger.info('Setting up complaints collection...');
  
  const complaints = [
    {
      title: 'Leaking Pipe in Bathroom',
      description: 'Water is leaking from the ceiling in my bathroom, possibly from the apartment above.',
      category: 'Plumbing',
      priority: 'High',
      status: 'In Progress',
      createdBy: 'resident-1',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      assignedTo: 'admin-user-1',
      attachments: [
        { fileName: 'leak.jpg', fileUrl: 'https://example.com/files/leak.jpg' }
      ],
      comments: [
        {
          text: 'Maintenance team has been notified and will visit tomorrow',
          createdBy: 'admin-user-1',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          text: 'Plumber has identified the issue and will fix it tomorrow',
          createdBy: 'admin-user-1',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ]
    },
    {
      title: 'Broken light in hallway',
      description: 'The light in the hallway outside my apartment is broken, creating a safety hazard at night.',
      category: 'Electrical',
      priority: 'Medium',
      status: 'Pending',
      createdBy: 'resident-2',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      assignedTo: null,
      attachments: [],
      comments: []
    },
    {
      title: 'Noise complaint',
      description: 'The residents in Unit 304 are playing loud music after 10PM almost every night.',
      category: 'Neighbor Issues',
      priority: 'Medium',
      status: 'Resolved',
      createdBy: 'resident-1',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      assignedTo: 'admin-user-1',
      attachments: [],
      comments: [
        {
          text: 'We have contacted the residents of Unit 304',
          createdBy: 'admin-user-1',
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() // 9 days ago
        },
        {
          text: 'Issue has been resolved. Please let us know if it happens again.',
          createdBy: 'admin-user-1',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        }
      ]
    }
  ];
  
  for (const complaint of complaints) {
    await db.collection('complaints').add(complaint);
  }
  
  logger.info(`Added ${complaints.length} complaints`);
};

const setupPayments = async () => {
  logger.info('Setting up payments collection...');
  
  const payments = [
    {
      userId: 'resident-1',
      amount: 150.00,
      description: 'Monthly Maintenance - July 2024',
      status: 'Completed',
      category: 'Maintenance',
      paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      paymentMethod: 'Credit Card',
      transactionId: 'tx_12345',
      receiptUrl: 'https://example.com/receipts/12345.pdf'
    },
    {
      userId: 'resident-2',
      amount: 150.00,
      description: 'Monthly Maintenance - July 2024',
      status: 'Completed',
      category: 'Maintenance',
      paymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      paymentMethod: 'Bank Transfer',
      transactionId: 'tx_67890',
      receiptUrl: 'https://example.com/receipts/67890.pdf'
    },
    {
      userId: 'resident-1',
      amount: 75.00,
      description: 'Parking Fee - Q3 2024',
      status: 'Pending',
      category: 'Parking',
      paymentDate: null,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      paymentMethod: null,
      transactionId: null,
      receiptUrl: null
    }
  ];
  
  for (const payment of payments) {
    await db.collection('payments').add(payment);
  }
  
  logger.info(`Added ${payments.length} payments`);
};

// Run the setup
setupDatabase(); 