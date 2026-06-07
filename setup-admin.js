// Script to create admin user in Firebase with interactive prompts
// Run this to set up owner or employee accounts
// Usage: node setup-admin.js

const readline = require('readline');
const admin = require('firebase-admin');

// =============================================
// YOUR FIREBASE SERVICE ACCOUNT (Embedded - FIXED)
// =============================================
const serviceAccount = {
  "type": "service_account",
  "project_id": "typica-replica-1e67c",
  "private_key_id": "fad7abd2ea59d07759c29881f420c084ba8100c4",
  "private_key": `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCsvJKQRtoc0jDW
Mpu07u1y5vpwbk6KSMwa5Ix9KcaPnRHmDrgfdU4g48cQY8l3IoEhrCQkna5O8GRK
B8OFv4bmd3A553I+vUoIGWbbcdc3XckJQXiKmK/CNbGRsYTLEod03pU/oYUbOVjS
Khd/9ZrdmCEo2XCuefp9wt/KRP7iJC5ruNJG+X33Ik06cszMHGvefo6TFIPw3X0k
gPx7bzk+jkTV2AqsKsAc+e/df0QvMNdsXUpsV4cSejT+EgNw5y1LOfXu7gBu3H8Q
36d3/A8tbVHBgkORNNh9fMVebqC+zrEpvUB2R1ezkcIiiuwwWdqiQ5eLDX4H0xLJ
kAy0642PAgMBAAECggEAGkiHNJTTU1dYPv9sWdeRIc6rhLgEE16IT/8+sTzODcQk
mRDcS00aGj8OZxwH56zEYU9EIJ4ti61gVTNhONSvvhmmZeklpQ5AWYMj93gW+0G1
+UaRBOW+uJpa7oRIZG3pVosXwprdGgtbzH7DHKFOczFWulR7pNDCoKgqTSi6b8Y5
WLZbUrA6Z7OYmwShkBUBiDSHCpT5qBYtlPu+kdwipIStyboTBUGdAz9yJj2mOLE1
hVifVYK8e3xN20Rbf25bMHZXwezRAtCYVecmh7Vxslj6Hku5HVD1kIzniDT5J/Et
Ru+w4P5OMxAQgolwNjkZtLBQqtxEKgoSC/ijiGHhgQKBgQDmIMt2S0EpBuqzS69r
fLkoxXvFXcNe4WzbJMa9JEh/kePSGJz0YMB5Du3lWTMUjwLtFD+DLslqz9jGQHAn
8oISXCl07xMH4I9ke1ZzeplSuMLtis7tm7S2QFYfr8Mqyhi7Q2Liy/I6vg/Ciz73
x9PRF1/NyLwVzy3j+xCwfuMgnwKBgQDAKAVjJQMPa7Lrz2lpMuCaJUfPs1Bregir
kgXwibTvQrWvQ1gg43qmOV6Q5DaB0Xvmrz41x7gpPpsIEHG6iVW8zLo9oSmoKTcm
iNDeLBvyyGPVSpMbZoGZoC5YvaYwT205+o69w2i/Rdqg8vJXM8+qgrnBDUGD/Yrk
gtm86p+9EQKBgHUvzAwwJD1dLVUiPHES8UMG1ZFavutpBcLOhnm4qUZ1JztMl1iG
kFzVMmWxN6bHcKkDv5fw0laXAv9pvvNItd3dmqrWN62yN7Lmb86cZslOFs1Z+yfa
O3r3ZiP6n/sBMPjjRs7RJketk17xA56v3nhCW+Hxz32Xo/nNVuFZrBVnAoGAbpKZ
BwQ1Tppayvb/YVm1hP4O5KX6kN4YPyI36MJVK5jnk4LdI4/C9APvNtEbzHgPJB+T
XL8gahtseqd7yitc+teUFAK5RdrxsWrpRe975akKSaIwJIRH728NPGNlTkdmQwa7
PNdFX0uDEzq52RQnW6b93OkT2i/7zKK/SMZ6RQECgYB6a6aGuY+wz/uHuQZ1jo/J
DTn7zVHJLuvntDb7+biZq4K5PNUoBTU3nsAvIhzxFBwD7jIWJvid/gQ+WdbXJl6N
BltAqNZyCIut5oPgSVuXnTqXaRa2gjqrBKvgH81YyfSW+s6L3Oyk3aH3huy3vf7n
SOt34KEs3Beu3Aa1sOI0qg==
-----END PRIVATE KEY-----`,
  "client_email": "firebase-adminsdk-fbsvc@typica-replica-1e67c.iam.gserviceaccount.com",
  "client_id": "109734483363631489015",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40typica-replica-1e67c.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Initialize Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin Initialized\n");
} catch (error) {
    console.error("❌ Firebase Initialization Error:", error.message);
    process.exit(1);
}

const db = admin.firestore();

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to ask questions
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

// Helper function to check if owner already exists
async function checkOwnerExists() {
    try {
        const adminsSnapshot = await db.collection('admins').where('status', '==', 'owner').get();
        return !adminsSnapshot.empty;
    } catch (error) {
        console.error("Error checking owner:", error.message);
        return false;
    }
}

// Helper function to check if email already exists
async function checkEmailExists(email) {
    try {
        const adminDoc = await db.collection('admins').doc(email).get();
        return adminDoc.exists;
    } catch (error) {
        console.error("Error checking email:", error.message);
        return false;
    }
}

// Main function to create admin
async function createAdmin() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("     ADMIN REGISTRATION SYSTEM");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // Get email
    const email = await askQuestion("📧 Enter email address: ");
    
    // Validate email
    if (!email || !email.includes('@')) {
        console.log("❌ Invalid email address! Please enter a valid email.\n");
        rl.close();
        return;
    }
    
    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
        console.log(`❌ Email "${email}" already exists in the database!\n`);
        rl.close();
        return;
    }
    
    // Get password
    const password = await askQuestion("🔑 Enter password: ");
    
    if (!password || password.length < 6) {
        console.log("❌ Password must be at least 6 characters long!\n");
        rl.close();
        return;
    }
    
    // Get status
    console.log("\n📋 Status options:");
    console.log("   - owner (only ONE allowed in the entire system)");
    console.log("   - employee (unlimited)");
    
    const status = await askQuestion("\n👔 Enter status (owner/employee): ");
    
    // Validate status
    const validStatuses = ['owner', 'employee'];
    if (!validStatuses.includes(status.toLowerCase())) {
        console.log(`❌ Invalid status! Only "${validStatuses.join('" or "')}" are allowed.\n`);
        rl.close();
        return;
    }
    
    const normalizedStatus = status.toLowerCase();
    
    // Check if trying to create owner
    if (normalizedStatus === 'owner') {
        const ownerExists = await checkOwnerExists();
        if (ownerExists) {
            console.log("\n❌ ERROR: An OWNER already exists in the system!");
            console.log("⚠️  Only ONE owner account is allowed per database.\n");
            rl.close();
            return;
        }
        
        console.log("\n⚠️  WARNING: You are creating the MASTER OWNER account.");
        console.log("   This is a one-time action. No more owner accounts can be created.\n");
        
        const confirm = await askQuestion("   Type 'yes' to confirm: ");
        if (confirm.toLowerCase() !== 'yes') {
            console.log("\n❌ Owner creation cancelled.\n");
            rl.close();
            return;
        }
    }
    
    // Get name (optional)
    const name = await askQuestion("\n👤 Enter full name (optional, press Enter to skip): ");
    const finalName = name || (normalizedStatus === 'owner' ? "Master Owner" : "Employee");
    
    // Create the admin document
    try {
        const adminData = {
            email: email,
            password: password,
            name: finalName,
            status: normalizedStatus,
            role: normalizedStatus === 'owner' ? 'super_admin' : 'admin',
            permissions: normalizedStatus === 'owner' ? ['manage_users', 'manage_admins'] : ['manage_users'],
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
        };
        
        await db.collection('admins').doc(email).set(adminData);
        
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("✅ ADMIN USER CREATED SUCCESSFULLY!");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`👔 Status: ${normalizedStatus.toUpperCase()}`);
        console.log(`👤 Name: ${finalName}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        if (normalizedStatus === 'owner') {
            console.log("👑 You are the MASTER OWNER of this system!");
            console.log("⚠️  No other owner accounts can be created.");
        } else {
            console.log("💼 Employee account created successfully.");
        }
        
        console.log("\n⚠️  IMPORTANT: Change your password after first login!\n");
        
    } catch (error) {
        console.error("\n❌ Error creating admin:", error.message);
    }
    
    rl.close();
}

// Run the setup
createAdmin();