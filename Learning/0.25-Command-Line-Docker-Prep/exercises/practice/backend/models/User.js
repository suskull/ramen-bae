class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.createdAt = new Date();
  }

  // TODO: Add validation methods
  validate() {
    return this.name && this.email;
  }
}

module.exports = User;
