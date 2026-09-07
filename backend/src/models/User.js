// User model - supports environment configuration for production
const users = [
  {
    id: 1,
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'super-admin',
    displayName: 'NexaDairy Admin',
  },
];

class User {
  static findByUsername(username) {
    return users.find(user => user.username === username);
  }

  static findById(id) {
    return users.find(user => user.id === id);
  }
}

module.exports = User;
