# 🔧 Troubleshooting Guide - POS Cashier System

**Solutions to common issues**

---

## 🚨 Installation Issues

### Problem: npm install fails
**Symptoms:**
- Error messages during installation
- Missing dependencies
- Installation stops

**Solutions:**
1. Check internet connection
2. Clear npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```
3. Delete node_modules and try again:
   ```bash
   rmdir /s /q node_modules
   npm install
   ```
4. Update npm:
   ```bash
   npm install -g npm@latest
   ```

### Problem: Build fails
**Symptoms:**
- Errors during `npm run build`
- TypeScript errors
- Vite errors

**Solutions:**
1. Check for syntax errors in code
2. Rebuild from scratch:
   ```bash
   npm run build
   ```
3. Check Node.js version (should be v16+):
   ```bash
   node --version
   ```
4. Clear dist folder and rebuild:
   ```bash
   rmdir /s /q dist
   npm run build
   ```

---

## 🖥️ Application Issues

### Problem: App won't start
**Symptoms:**
- Nothing happens when running
- Electron window doesn't open
- Immediate crash

**Solutions:**
1. Rebuild the application:
   ```bash
   npm run build
   npx electron .
   ```
2. Check if port is in use
3. Check console for errors
4. Restart computer
5. Reinstall dependencies:
   ```bash
   rmdir /s /q node_modules
   npm install
   npm run build
   npx electron .
   ```

### Problem: White/blank screen
**Symptoms:**
- App opens but shows blank screen
- No content visible
- Loading forever

**Solutions:**
1. Check browser console (F12)
2. Rebuild React:
   ```bash
   npm run build:react
   npx electron .
   ```
3. Check if database initialized
4. Clear cache and restart
5. Check for JavaScript errors in console

### Problem: App crashes on startup
**Symptoms:**
- App opens then closes immediately
- Error message appears
- Crash dialog

**Solutions:**
1. Check database file exists: `pos-database.db`
2. Check disk space (need at least 100MB)
3. Check file permissions
4. View error logs in console
5. Try deleting database and restart (will lose data):
   ```bash
   del pos-database.db
   npx electron .
   ```

---

## 💾 Database Issues

### Problem: Database not found
**Symptoms:**
- Error: "Schema file not found"
- Error: "Database not initialized"
- Can't save data

**Solutions:**
1. Check if `pos-database.db` exists in project root
2. Let app create database automatically on first run
3. Check file permissions
4. Check disk space
5. Restart application

### Problem: Database locked
**Symptoms:**
- Error: "Database is locked"
- Can't save changes
- Operations timeout

**Solutions:**
1. Close all instances of the app
2. Restart the application
3. Check if another process is using the database
4. Restart computer if needed

### Problem: Data not saving
**Symptoms:**
- Changes don't persist
- Data disappears after restart
- Save button doesn't work

**Solutions:**
1. Check console for errors
2. Verify database file is writable
3. Check disk space
4. Try saving again
5. Restart application

### Problem: Migration errors
**Symptoms:**
- Error: "no such column"
- Database schema mismatch
- Missing tables

**Solutions:**
1. Migrations run automatically on startup
2. Restart the application
3. Check console for migration errors
4. If persistent, backup data and delete database:
   ```bash
   copy pos-database.db pos-database-backup.db
   del pos-database.db
   npx electron .
   ```

---

## 🛒 POS Screen Issues

### Problem: Barcode scanner not working
**Symptoms:**
- Scanner doesn't add products
- No response when scanning
- Wrong products added

**Solutions:**
1. Check scanner is connected
2. Test scanner in notepad (should type barcode)
3. Make sure POS screen is focused
4. Check if barcode exists in products
5. Use F2 quick search instead

### Problem: Quick search (F2) not working
**Symptoms:**
- F2 doesn't open search
- Search box doesn't appear
- No response

**Solutions:**
1. Make sure you're on POS screen
2. Click inside the POS screen first
3. Try clicking the search icon instead
4. Check keyboard is working
5. Restart application

### Problem: Products not adding to invoice
**Symptoms:**
- Click product but nothing happens
- Barcode entered but no product
- Search doesn't add product

**Solutions:**
1. Check if product exists
2. Check if product has stock
3. Check console for errors
4. Try refreshing (go to another screen and back)
5. Restart application

### Problem: Can't complete invoice
**Symptoms:**
- Complete button disabled
- Error when completing
- Invoice doesn't save

**Solutions:**
1. Make sure invoice has items
2. Check all prices are valid
3. Check database is writable
4. Check console for errors
5. Try again or restart app

---

## 📦 Product Management Issues

### Problem: Products not showing
**Symptoms:**
- Product list is empty
- Can't see added products
- Search returns nothing

**Solutions:**
1. Make sure you added products
2. Check if category filter is applied
3. Try refreshing the screen
4. Check database has data
5. Restart application

### Problem: Can't add products
**Symptoms:**
- Save button doesn't work
- Error when saving
- Form doesn't submit

**Solutions:**
1. Fill all required fields (name, prices)
2. Check prices are valid numbers
3. Check stock quantity is valid
4. Check console for errors
5. Try again or restart

### Problem: Stock alerts not showing
**Symptoms:**
- No alert badge
- Low stock items not highlighted
- Alert count is wrong

**Solutions:**
1. Check if minimum stock levels are set
2. Check if products are actually low
3. Refresh the screen
4. Check console for errors
5. Restart application

---

## 👥 Customer Management Issues

### Problem: Can't add customers
**Symptoms:**
- Save doesn't work
- Error message appears
- Form doesn't submit

**Solutions:**
1. Fill required field (name)
2. Check phone/email format if provided
3. Check for duplicate phone/email
4. Check console for errors
5. Try again

### Problem: Customer search not working
**Symptoms:**
- Search returns no results
- Can't find existing customers
- Search box doesn't respond

**Solutions:**
1. Check spelling
2. Try partial name
3. Try phone number
4. Refresh the screen
5. Check if customers exist

### Problem: Purchase history empty
**Symptoms:**
- Customer has no purchases shown
- History is blank
- Wrong data displayed

**Solutions:**
1. Check if customer was linked to invoices
2. Check if invoices exist
3. Refresh the screen
4. Check console for errors
5. Verify customer ID is correct

---

## 📋 Invoice History Issues

### Problem: Invoices not showing
**Symptoms:**
- Invoice list is empty
- Can't see past invoices
- Search returns nothing

**Solutions:**
1. Make sure invoices were completed
2. Check date range/filters
3. Try "All" status filter
4. Refresh the screen
5. Check database

### Problem: Search not working
**Symptoms:**
- Can't find invoices
- Search returns wrong results
- No results shown

**Solutions:**
1. Check spelling
2. Try invoice number exactly
3. Try customer name
4. Clear filters
5. Refresh screen

### Problem: Invoice details won't open
**Symptoms:**
- Details button doesn't work
- Modal doesn't appear
- Error when clicking

**Solutions:**
1. Try clicking again
2. Check console for errors
3. Refresh the screen
4. Check if invoice exists
5. Restart application

---

## 📊 Reports Issues

### Problem: Reports not generating
**Symptoms:**
- Charts don't appear
- No data shown
- Loading forever

**Solutions:**
1. Check if invoices exist for the period
2. Try different date range
3. Check console for errors
4. Refresh the screen
5. Restart application

### Problem: Charts not displaying
**Symptoms:**
- Empty chart areas
- No visualization
- Only text shown

**Solutions:**
1. Check if data exists
2. Try different period
3. Check browser console
4. Refresh the screen
5. Rebuild application:
   ```bash
   npm run build
   npx electron .
   ```

### Problem: Wrong data in reports
**Symptoms:**
- Numbers don't match
- Incorrect calculations
- Missing invoices

**Solutions:**
1. Check date range is correct
2. Check status filter
3. Verify invoice data in history
4. Refresh the screen
5. Check console for errors

---

## 🖨️ Printing Issues

### Problem: Receipt preview doesn't open
**Symptoms:**
- No preview after completing invoice
- Modal doesn't appear
- Blank screen

**Solutions:**
1. Check if invoice was saved
2. Check console for errors
3. Try from invoice history instead
4. Restart application
5. Check browser popup blocker

### Problem: Print button doesn't work
**Symptoms:**
- Nothing happens when clicking print
- No print dialog
- Error message

**Solutions:**
1. Check if PDF generated
2. Check browser popup blocker
3. Try download instead
4. Check console for errors
5. Restart application

### Problem: Receipt looks wrong
**Symptoms:**
- Missing information
- Wrong layout
- Text cut off

**Solutions:**
1. Check business info in Settings
2. Check receipt preview
3. Update business information
4. Try regenerating receipt
5. Check PDF viewer

### Problem: Can't download receipt
**Symptoms:**
- Download doesn't start
- File not saved
- Error message

**Solutions:**
1. Check browser download settings
2. Check disk space
3. Check file permissions
4. Try print instead
5. Check console for errors

---

## ⚙️ Settings Issues

### Problem: Settings won't save
**Symptoms:**
- Changes don't persist
- Error when saving
- Settings reset

**Solutions:**
1. Check all fields are filled
2. Check console for errors
3. Try again
4. Check localStorage is enabled
5. Restart application

### Problem: Business info not showing on receipt
**Symptoms:**
- Receipt missing business details
- Default info shown
- Wrong information

**Solutions:**
1. Save settings first
2. Check settings were saved (refresh settings screen)
3. Generate new receipt
4. Check console for errors
5. Restart application

---

## 🔍 Search Issues

### Problem: Search is slow
**Symptoms:**
- Delay when typing
- Lag in results
- Freezing

**Solutions:**
1. Check number of products (should work with 10,000+)
2. Check computer performance
3. Close other applications
4. Restart application
5. Check disk space

### Problem: Search returns wrong results
**Symptoms:**
- Incorrect products shown
- Missing products
- Irrelevant results

**Solutions:**
1. Check spelling
2. Try exact match
3. Try barcode instead
4. Check product data
5. Refresh screen

---

## ⚡ Performance Issues

### Problem: App is slow
**Symptoms:**
- Lag when clicking
- Slow screen transitions
- Delayed responses

**Solutions:**
1. Close other applications
2. Check disk space
3. Check RAM usage
4. Restart application
5. Restart computer

### Problem: High memory usage
**Symptoms:**
- Computer slows down
- App uses lots of RAM
- System freezes

**Solutions:**
1. Restart application regularly
2. Close unused screens
3. Check for memory leaks in console
4. Update to latest version
5. Restart computer

### Problem: Database growing too large
**Symptoms:**
- Database file > 1GB
- Slow queries
- Disk space issues

**Solutions:**
1. Archive old invoices
2. Clean up old data
3. Backup and start fresh
4. Check for duplicate data
5. Optimize database (future feature)

---

## 🔐 Data Issues

### Problem: Data disappeared
**Symptoms:**
- Products missing
- Invoices gone
- Customers deleted

**Solutions:**
1. Check if you're looking at right screen
2. Check filters/search
3. Check backups folder
4. Restore from backup:
   ```bash
   copy backups\pos-database-YYYYMMDD.db pos-database.db
   ```
5. Contact support if critical

### Problem: Duplicate data
**Symptoms:**
- Same product twice
- Duplicate customers
- Repeated invoices

**Solutions:**
1. Delete duplicates manually
2. Check import process
3. Avoid double-clicking save
4. Check for bugs in console
5. Report issue

---

## 🆘 Emergency Procedures

### Complete Reset (WILL LOSE ALL DATA)
```bash
# Backup first!
copy pos-database.db pos-database-backup.db

# Delete database
del pos-database.db

# Restart app
npx electron .
```

### Restore from Backup
```bash
# Stop the app first
# Copy backup over current database
copy backups\pos-database-YYYYMMDD.db pos-database.db

# Restart app
npx electron .
```

### Reinstall Everything
```bash
# Backup database first!
copy pos-database.db pos-database-backup.db

# Clean install
rmdir /s /q node_modules
rmdir /s /q dist
npm install
npm run build

# Restore database
copy pos-database-backup.db pos-database.db

# Run app
npx electron .
```

---

## 📞 Getting Help

### Before Asking for Help:
1. Check this troubleshooting guide
2. Check console for errors (F12)
3. Try restarting the app
4. Check documentation files
5. Note exact error messages

### Information to Provide:
- What you were doing
- Exact error message
- Console errors (F12)
- Steps to reproduce
- System information
- Database size

### Documentation Files:
- COMPLETE_FEATURE_GUIDE.md
- DEPLOYMENT_GUIDE.md
- QUICK_START_GUIDE.md
- README.md

---

## 💡 Prevention Tips

### To Avoid Issues:
1. **Backup regularly** - Copy database file
2. **Update carefully** - Test before production
3. **Monitor disk space** - Keep 1GB free
4. **Restart weekly** - Clear memory
5. **Train staff** - Proper usage
6. **Check logs** - Watch for errors
7. **Test features** - Before going live
8. **Keep documentation** - Reference guides

### Best Practices:
1. Don't force close the app
2. Complete operations before closing
3. Don't edit database directly
4. Keep backups in safe location
5. Monitor system resources
6. Update Node.js when needed
7. Check for updates
8. Report bugs early

---

## ✅ Health Check

Run this checklist if experiencing issues:

- [ ] App starts without errors
- [ ] Database file exists
- [ ] Disk space > 1GB
- [ ] RAM usage normal
- [ ] All screens load
- [ ] Can add products
- [ ] Can make sales
- [ ] Can print receipts
- [ ] Reports generate
- [ ] Settings save
- [ ] No console errors
- [ ] Backups exist

If all checked, system is healthy! ✅

---

**Still having issues? Check the documentation or review console errors for more details.**

*Last updated: Phase 5 Complete*
