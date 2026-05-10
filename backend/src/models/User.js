// User model - hardcoded for simplicity
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'super-admin',
    displayName: 'DairyFarm Admin',
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
