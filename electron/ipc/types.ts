export enum IpcChannels {
    // Products
    DB_PRODUCTS_GET_ALL = 'db:products:getAll',
    DB_PRODUCTS_SEARCH = 'db:products:search',
    DB_PRODUCTS_GET_BY_ID = 'db:products:getById',
    DB_PRODUCTS_CREATE = 'db:products:create',
    DB_PRODUCTS_UPDATE = 'db:products:update',
    DB_PRODUCTS_DELETE = 'db:products:delete',
    DB_PRODUCTS_UPDATE_STOCK = 'db:products:updateStock',

    // Categories
    DB_CATEGORIES_GET_ALL = 'db:categories:getAll',
    DB_CATEGORIES_GET_BY_ID = 'db:categories:getById',
    DB_CATEGORIES_CREATE = 'db:categories:create',
    DB_CATEGORIES_UPDATE = 'db:categories:update',
    DB_CATEGORIES_DELETE = 'db:categories:delete',

    // Customers
    DB_CUSTOMERS_GET_ALL = 'db:customers:getAll',
    DB_CUSTOMERS_SEARCH = 'db:customers:search',
    DB_CUSTOMERS_GET_BY_ID = 'db:customers:getById',
    DB_CUSTOMERS_CREATE = 'db:customers:create',
    DB_CUSTOMERS_UPDATE = 'db:customers:update',
    DB_CUSTOMERS_DELETE = 'db:customers:delete',
    DB_CUSTOMERS_GET_HISTORY = 'db:customers:getHistory',

    // Invoices
    DB_INVOICES_CREATE = 'db:invoices:create',
    DB_INVOICES_GET_ALL = 'db:invoices:getAll',
    DB_INVOICES_GET_BY_ID = 'db:invoices:getById',
    DB_INVOICES_REFUND = 'db:invoices:refund',

    // Reports
    DB_REPORTS_GET_SUMMARY = 'db:reports:getSalesSummary',
    DB_REPORTS_GET_BEST_SELLING = 'db:reports:getBestSellingProducts',
    DB_REPORTS_GET_DAILY = 'db:reports:getDaily' as any,
    DB_REPORTS_GET_BY_CATEGORY = 'db:reports:getByCategory' as any,

    // Backup
    DB_BACKUP_CREATE = 'db:backup:create',
    DB_BACKUP_RESTORE = 'db:backup:restore',
    DB_BACKUP_LIST = 'db:backup:list',

    // App
    APP_GET_VERSION = 'app:getVersion',
    APP_TOGGLE_KIOSK = 'app:toggleKiosk',
    DB_REPORTS_ARCHIVE_SAVE = 'db:reports:archiveSave',
}
