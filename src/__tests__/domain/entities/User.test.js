import { User } from '../../../domain';

describe('User Entity', () => {
  const validUserData = {
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg'
  };

  describe('User.create', () => {
    it('should create a user with valid data', () => {
      const user = User.create(validUserData);

      expect(user.email).toBe(validUserData.email);
      expect(user.displayName).toBe(validUserData.displayName);
      expect(user.photoURL).toBe(validUserData.photoURL);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a user without photoURL', () => {
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User'
      };

      const user = User.create(userData);

      expect(user.email).toBe(userData.email);
      expect(user.displayName).toBe(userData.displayName);
      expect(user.photoURL).toBeNull();
    });

    it('should throw error when email is missing', () => {
      const invalidData = { displayName: 'Test User' };

      expect(() => User.create(invalidData)).toThrow('Email is required');
    });

    it('should throw error when email is empty string', () => {
      const invalidData = { email: '', displayName: 'Test User' };

      expect(() => User.create(invalidData)).toThrow('Email is required');
    });
  });

  describe('constructor', () => {
    it('should create user with all parameters', () => {
      const userData = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02')
      };

      const user = new User(userData);

      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.displayName).toBe(userData.displayName);
      expect(user.photoURL).toBe(userData.photoURL);
      expect(user.createdAt).toBe(userData.createdAt);
      expect(user.updatedAt).toBe(userData.updatedAt);
    });

    it('should default photoURL to null', () => {
      const userData = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const user = new User(userData);

      expect(user.photoURL).toBeNull();
    });
  });

  describe('updateProfile', () => {
    let user;

    beforeEach(() => {
      user = User.create(validUserData);
    });

    it('should update displayName', async () => {
      const newDisplayName = 'Updated Name';
      const originalUpdatedAt = user.updatedAt;

      // Add small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      user.updateProfile({ displayName: newDisplayName });

      expect(user.displayName).toBe(newDisplayName);
      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should update photoURL', async () => {
      const newPhotoURL = 'https://example.com/new-photo.jpg';
      const originalUpdatedAt = user.updatedAt;

      // Add small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      user.updateProfile({ photoURL: newPhotoURL });

      expect(user.photoURL).toBe(newPhotoURL);
      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should update both displayName and photoURL', () => {
      const updates = {
        displayName: 'New Name',
        photoURL: 'https://example.com/new-photo.jpg'
      };

      user.updateProfile(updates);

      expect(user.displayName).toBe(updates.displayName);
      expect(user.photoURL).toBe(updates.photoURL);
    });

    it('should not update when values are undefined', () => {
      const originalDisplayName = user.displayName;
      const originalPhotoURL = user.photoURL;

      user.updateProfile({ displayName: undefined, photoURL: undefined });

      expect(user.displayName).toBe(originalDisplayName);
      expect(user.photoURL).toBe(originalPhotoURL);
    });

    it('should allow setting photoURL to null', () => {
      user.updateProfile({ photoURL: null });

      expect(user.photoURL).toBeNull();
    });

    it('should not update email or id', () => {
      const originalEmail = user.email;
      const originalId = user.id;

      user.updateProfile({
        email: 'new@example.com',
        id: 'new-id',
        displayName: 'New Name'
      });

      expect(user.email).toBe(originalEmail);
      expect(user.id).toBe(originalId);
      expect(user.displayName).toBe('New Name');
    });
  });

  describe('toJSON', () => {
    it('should return correct JSON representation', () => {
      const user = User.create(validUserData);
      const json = user.toJSON();

      expect(json).toEqual({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    });

    it('should include all fields even when null', () => {
      const userData = {
        email: 'test@example.com',
        displayName: 'Test User'
      };
      const user = User.create(userData);
      const json = user.toJSON();

      expect(json.photoURL).toBeNull();
      expect(json).toHaveProperty('photoURL');
    });
  });
});