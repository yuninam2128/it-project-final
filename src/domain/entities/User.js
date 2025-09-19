export class User {
  constructor({
    id,
    email,
    displayName,
    photoURL = null,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.email = email;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create({
    email,
    displayName,
    photoURL = null
  }) {
    if (!email) {
      throw new Error('Email is required');
    }

    return new User({
      email,
      displayName,
      photoURL,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  updateProfile({ displayName, photoURL }) {
    if (displayName !== undefined) {
      this.displayName = displayName;
    }
    if (photoURL !== undefined) {
      this.photoURL = photoURL;
    }
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}