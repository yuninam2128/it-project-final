export class AppConfig {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.config = this.loadConfiguration();
  }

  loadConfiguration() {
    const baseConfig = {
      app: {
        name: 'CosmoveIt',
        version: '1.0.0',
        debugMode: this.environment === 'development'
      },
      
      firebase: {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID
      },

      features: {
        enableRealTimeUpdates: true,
        enableOfflineMode: false,
        enableAnalytics: this.environment === 'production',
        enablePerformanceMonitoring: true,
        maxProjectsPerUser: 100,
        maxTodosPerProject: 500
      },

      ui: {
        theme: 'light',
        language: 'ko',
        autoSaveInterval: 30000, // 30 seconds
        debounceDelay: 300
      },

      performance: {
        cacheTimeout: 300000, // 5 minutes
        maxRetries: 3,
        retryDelay: 1000
      },

      logging: {
        level: this.environment === 'production' ? 'info' : 'debug',
        enableConsoleLogging: this.environment === 'development',
        enableRemoteLogging: this.environment === 'production'
      }
    };

    // Environment specific overrides
    const envConfig = this.getEnvironmentConfig();
    return this.mergeConfig(baseConfig, envConfig);
  }

  getEnvironmentConfig() {
    switch (this.environment) {
      case 'development':
        return {
          features: {
            enableAnalytics: false,
            maxProjectsPerUser: 10 // Lower limit for testing
          },
          performance: {
            cacheTimeout: 60000 // 1 minute for faster testing
          }
        };

      case 'test':
        return {
          features: {
            enableRealTimeUpdates: false,
            enableAnalytics: false,
            enablePerformanceMonitoring: false
          },
          logging: {
            level: 'error',
            enableConsoleLogging: false,
            enableRemoteLogging: false
          }
        };

      case 'production':
        return {
          logging: {
            level: 'warn'
          }
        };

      default:
        return {};
    }
  }

  mergeConfig(baseConfig, envConfig) {
    const merge = (target, source) => {
      const result = { ...target };
      
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = merge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
      
      return result;
    };

    return merge(baseConfig, envConfig);
  }

  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  set(path, value) {
    const keys = path.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  isFeatureEnabled(featureName) {
    return this.get(`features.${featureName}`, false);
  }

  getFirebaseConfig() {
    return this.get('firebase');
  }

  validateConfiguration() {
    const requiredPaths = [
      'firebase.apiKey',
      'firebase.authDomain',
      'firebase.projectId'
    ];

    const missingConfigs = requiredPaths.filter(path => !this.get(path));
    
    if (missingConfigs.length > 0) {
      throw new Error(`Missing required configuration: ${missingConfigs.join(', ')}`);
    }
  }

  isDevelopment() {
    return this.environment === 'development';
  }

  isProduction() {
    return this.environment === 'production';
  }

  isTest() {
    return this.environment === 'test';
  }
}

// Singleton instance
export const appConfig = new AppConfig();