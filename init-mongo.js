// MongoDB initialization script
db = db.getSiblingDB('im-connected');

// Create collections
db.createCollection('users');
db.createCollection('posts');
db.createCollection('comments');
db.createCollection('medications');
db.createCollection('carerecipients');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.posts.createIndex({ "userId": 1 });
db.comments.createIndex({ "postId": 1 });
db.medications.createIndex({ "careRecipientId": 1 });
db.carerecipients.createIndex({ "userId": 1 });

print('Database initialized successfully');
