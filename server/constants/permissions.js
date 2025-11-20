// constants/permissions.js
const ROLES = {
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
  };
  
  const PERMISSIONS = {
    // Product permissions
    PRODUCT: {
      CREATE: 'product:create',
      READ: 'product:read',
      UPDATE: 'product:update',
      DELETE: 'product:delete',
      UPDATE_OWN: 'product:update_own',
      DELETE_OWN: 'product:delete_own'
    },
  
    // User permissions
    USER: {
      READ: 'user:read',
      UPDATE: 'user:update',
      DELETE: 'user:delete',
      UPDATE_PROFILE: 'user:update_profile'
    },
  
    // Order permissions
    ORDER: {
      CREATE: 'order:create',
      READ: 'order:read',
      UPDATE: 'order:update',
      DELETE: 'order:delete',
      UPDATE_STATUS: 'order:update_status'
    },
  
    // Category permissions
    CATEGORY: {
      CREATE: 'category:create',
      READ: 'category:read',
      UPDATE: 'category:update',
      DELETE: 'category:delete'
    },
  
    // Admin permissions
    ADMIN: {
      ALL: 'admin:all'
    }
  };
  
  // Role-Permission Mapping
  const ROLE_PERMISSIONS = {
    [ROLES.USER]: [
      PERMISSIONS.PRODUCT.READ,
      PERMISSIONS.USER.UPDATE_PROFILE,
      PERMISSIONS.ORDER.CREATE,
      PERMISSIONS.ORDER.READ,
      PERMISSIONS.CATEGORY.READ
    ],
  
    [ROLES.SELLER]: [
      PERMISSIONS.PRODUCT.CREATE,
      PERMISSIONS.PRODUCT.READ,
      PERMISSIONS.PRODUCT.UPDATE_OWN,
      PERMISSIONS.PRODUCT.DELETE_OWN,
      PERMISSIONS.ORDER.READ,
      PERMISSIONS.ORDER.UPDATE_STATUS,
      PERMISSIONS.USER.UPDATE_PROFILE,
      PERMISSIONS.CATEGORY.READ
    ],
  
    [ROLES.ADMIN]: [
      PERMISSIONS.ADMIN.ALL,
      PERMISSIONS.PRODUCT.CREATE,
      PERMISSIONS.PRODUCT.READ,
      PERMISSIONS.PRODUCT.UPDATE,
      PERMISSIONS.PRODUCT.DELETE,
      PERMISSIONS.USER.READ,
      PERMISSIONS.USER.UPDATE,
      PERMISSIONS.USER.DELETE,
      PERMISSIONS.ORDER.READ,
      PERMISSIONS.ORDER.UPDATE,
      PERMISSIONS.ORDER.DELETE,
      PERMISSIONS.CATEGORY.CREATE,
      PERMISSIONS.CATEGORY.READ,
      PERMISSIONS.CATEGORY.UPDATE,
      PERMISSIONS.CATEGORY.DELETE
    ]
  };
  
  module.exports = {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS
  };