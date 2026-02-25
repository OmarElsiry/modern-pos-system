# 🧪 Complete Testing Guide

## ✅ System Testing Checklist

### Pre-Testing Setup

**1. Fresh Start:**
```bash
# Build the app
npm run build

# Run the app
npx electron .
```

**2. Database Check:**
- Verify `pos-database.db` exists
- Check `backups/` folder created
- Confirm migrations ran successfully

---

## 📊 Dashboard Testing

### Test 1: Dashboard Loads
- [ ] Dashboard opens on app start
- [ ] All stat cards display
- [ ] No errors in console

### Test 2: Stats Display
- [ ] Today's Sales shows 0.00 ج.م
- [ ] Products count shows 0
- [ ] Stock Alerts shows 0
- [ ] Customers shows 0

### Test 3: Empty States
- [ ] "لا توجد فواتير حتى الآن" message shows
- [ ] "لا توجد تنبيهات" (if no alerts)
- [ ] Quick actions buttons work

### Test 4: Navigation
- [ ] Click "فاتورة جديدة" → Goes to POS
- [ ] Click "إضافة منتج" → Goes to Products
- [ ] Click "إضافة عميل" → Goes to Customers
- [ ] Click "سجل الفواتير" → Goes to Invoices

---

## 📁 Category Management Testing

### Test 1: Add Category
1. Go to "الفئات" (Categories)
2. Click "إضافة فئة جديدة"
3. Enter name: "Electronics"
4. Enter description: "Electronic items"
5. Click "إضافة"
6. **Expected:** ✅ Toast: "تم إضافة الفئة بنجاح"
7. **Expected:** Category appears in list

### Test 2: Edit Category
1. Find "Electronics" category
2. Click "تعديل"
3. Change name to "الإلكترونيات"
4. Click "تحديث"
5. **Expected:** ✅ Toast: "تم تحديث الفئة بنجاح"
6. **Expected:** Name updated in list

### Test 3: Delete Category (with products)
1. Add products to category first
2. Try to delete category
3. **Expected:** ❌ Error: Cannot delete (has products)

### Test 4: Search Categories
1. Add multiple categories
2. Type in search box
3. **Expected:** Results filter instantly

---

## 📦 Product Management Testing

### Test 1: Add Product
1. Go to "المنتجات" (Products)
2. Click "إضافة منتج جديد"
3. Fill in:
   - Name: "Laptop"
   - Barcode: "123456789"
   - Category: "Electronics"
   - Wholesale: 5000
   - Retail: 6000
   - Stock: 10
   - Min Stock: 5
4. Click "إضافة"
5. **Expected:** ✅ Toast: "تم إضافة المنتج بنجاح"
6. **Expected:** Product appears in list

### Test 2: Duplicate Barcode
1. Try to add product with same barcode
2. **Expected:** ❌ Error: "Barcode already exists"

### Test 3: Edit Product
1. Find "Laptop"
2. Click "تعديل"
3. Change stock to 3 (below minimum)
4. Click "تحديث"
5. **Expected:** ✅ Toast: "تم تحديث المنتج بنجاح"
6. **Expected:** ⚠️ Alert badge appears (1)

### Test 4: Low Stock Alert
1. Click alert badge
2. **Expected:** Alert list expands
3. **Expected:** "Laptop" shows as low stock
4. Click alert item
5. **Expected:** Edit modal opens for that product

### Test 5: Search Products
1. Type "Lap" in search
2. **Expected:** "Laptop" appears
3. Type barcode "123456789"
4. **Expected:** "Laptop" appears

### Test 6: Filter by Category
1. Select "Electronics" from dropdown
2. **Expected:** Only electronics show
3. Select "جميع الفئات"
4. **Expected:** All products show

### Test 7: Delete Product
1. Find a product
2. Click "حذف"
3. Confirm deletion
4. **Expected:** ✅ Toast: "تم حذف المنتج بنجاح"
5. **Expected:** Product removed from list

---

## 👥 Customer Management Testing

### Test 1: Add Customer
1. Go to "العملاء" (Customers)
2. Click "إضافة عميل جديد"
3. Fill in:
   - Name: "Ahmed Ali"
   - Phone: "01234567890"
   - Email: "ahmed@email.com"
   - Address: "Cairo, Egypt"
4. Click "إضافة"
5. **Expected:** ✅ Toast: "تم إضافة العميل بنجاح"
6. **Expected:** Customer appears in list

### Test 2: Duplicate Phone
1. Try to add customer with same phone
2. **Expected:** ❌ Error: "عميل بنفس رقم الهاتف موجود بالفعل"

### Test 3: Invalid Email
1. Try to add customer with email "invalid"
2. **Expected:** ❌ Error: "البريد الإلكتروني غير صحيح"

### Test 4: Search Customers
1. Type "Ahmed" in search
2. **Expected:** Customer appears
3. Type phone number
4. **Expected:** Customer appears

### Test 5: View Purchase History (Empty)
1. Click "السجل" for Ahmed
2. **Expected:** "لا يوجد سجل مشتريات لهذا العميل"

### Test 6: Edit Customer
1. Click "تعديل" for Ahmed
2. Change name to "Ahmed Mohamed"
3. Click "تحديث"
4. **Expected:** ✅ Toast: "تم تحديث العميل بنجاح"

### Test 7: Delete Customer
1. Click "حذف"
2. Confirm
3. **Expected:** ✅ Toast: "تم حذف العميل بنجاح"

---

## 🛒 POS Testing

### Test 1: Pricing Selection
1. Go to "نقطة البيع" (POS)
2. Click "جملة" (Wholesale)
3. **Expected:** ✅ Toast: "تم تغيير نوع التسعير إلى جملة"
4. Click "قطاعي" (Retail)
5. **Expected:** ✅ Toast: "تم تغيير نوع التسعير إلى قطاعي"

### Test 2: Customer Selection
1. Click customer dropdown
2. **Expected:** Dropdown opens
3. Type customer name
4. **Expected:** Results filter
5. Click customer
6. **Expected:** Customer selected, dropdown closes

### Test 3: Quick Search (F2)
1. Press F2
2. **Expected:** Search bar focuses
3. Type product name
4. **Expected:** Results appear
5. Click product
6. **Expected:** Product added to invoice
7. **Expected:** ✅ Toast: "تم إضافة المنتج بنجاح"

### Test 4: Barcode Entry
1. Type barcode in barcode field
2. Click "إضافة"
3. **Expected:** Product added to invoice

### Test 5: Invalid Barcode
1. Type invalid barcode "999999"
2. Click "إضافة"
3. **Expected:** ❌ Toast: "Product with barcode '999999' not found"

### Test 6: Quantity Adjustment
1. Add product to invoice
2. Click "+" button
3. **Expected:** Quantity increases
4. Click "-" button
5. **Expected:** Quantity decreases
6. **Expected:** Total updates

### Test 7: Remove Item
1. Click "حذف" on item
2. **Expected:** ✅ Toast: "تم حذف المنتج من الفاتورة"
3. **Expected:** Item removed

### Test 8: Complete Invoice (No Customer)
1. Add products to invoice
2. Click "إتمام الفاتورة"
3. Review summary
4. Click "تأكيد الإتمام"
5. **Expected:** ✅ Toast: "تم إتمام الفاتورة بنجاح! رقم الفاتورة: INV-0001"
6. **Expected:** Invoice cleared
7. **Expected:** Stock deducted

### Test 9: Complete Invoice (With Customer)
1. Select customer
2. Add products
3. Complete invoice
4. **Expected:** Invoice saved with customer
5. **Expected:** Customer total purchases updated

### Test 10: Cancel Invoice
1. Add products
2. Click "إلغاء الفاتورة"
3. Confirm
4. **Expected:** ✅ Toast: "تم إلغاء الفاتورة"
5. **Expected:** Invoice cleared

### Test 11: Insufficient Stock
1. Add product with quantity > stock
2. Try to complete
3. **Expected:** ❌ Error: "Insufficient stock"

### Test 12: Empty Invoice
1. Try to complete empty invoice
2. **Expected:** Button disabled or error

---

## 📋 Invoice History Testing

### Test 1: View Invoices
1. Go to "الفواتير" (Invoices)
2. **Expected:** All invoices listed
3. **Expected:** Stats show correct totals

### Test 2: Search by Invoice Number
1. Type "INV-0001" in search
2. **Expected:** Invoice appears

### Test 3: Search by Customer
1. Type customer name
2. **Expected:** Customer's invoices appear

### Test 4: Filter by Status
1. Select "مكتملة" (Completed)
2. **Expected:** Only completed invoices show
3. Select "الكل" (All)
4. **Expected:** All invoices show

### Test 5: View Invoice Details
1. Click "التفاصيل" on invoice
2. **Expected:** Modal opens
3. **Expected:** All items listed
4. **Expected:** Customer name shows (if any)
5. **Expected:** Total correct

### Test 6: Invoice with Customer
1. Find invoice with customer
2. **Expected:** Customer name displays
3. View details
4. **Expected:** Customer info in modal

---

## 🔄 Integration Testing

### Test 1: Complete Sale Flow
1. Dashboard → Check stats
2. Products → Add product
3. Customers → Add customer
4. POS → Select customer
5. POS → Add products
6. POS → Complete invoice
7. Dashboard → Verify stats updated
8. Invoices → Verify invoice saved
9. Customers → Verify purchase history
10. Products → Verify stock deducted

### Test 2: Low Stock Flow
1. Products → Add product with stock = 2, min = 5
2. **Expected:** Alert badge shows
3. Dashboard → Check alert appears
4. Click alert → Edit product
5. Update stock to 10
6. **Expected:** Alert disappears

### Test 3: Customer Purchase History
1. Create customer
2. Complete 3 invoices with customer
3. Customers → View history
4. **Expected:** 3 invoices listed
5. **Expected:** Total purchases correct

---

## ⌨️ Keyboard Shortcuts Testing

### Test 1: F2 Shortcut
1. Go to POS
2. Press F2
3. **Expected:** Search bar focuses

### Test 2: ESC Shortcut
1. Open any modal
2. Press ESC
3. **Expected:** Modal closes

### Test 3: Enter Submit
1. Open add product modal
2. Fill form
3. Press Enter
4. **Expected:** Form submits

---

## 🔄 Data Persistence Testing

### Test 1: Restart App
1. Add products, customers, invoices
2. Close app
3. Reopen app
4. **Expected:** All data still there

### Test 2: Database File
1. Check `pos-database.db` exists
2. Check file size > 0
3. **Expected:** File persists

### Test 3: Backup Created
1. Check `backups/` folder
2. **Expected:** Backup files exist
3. **Expected:** Named with timestamp

---

## 🐛 Error Handling Testing

### Test 1: Invalid Input
1. Try to add product with negative price
2. **Expected:** Validation error

### Test 2: Required Fields
1. Try to submit form with empty required fields
2. **Expected:** Validation error

### Test 3: Database Error Recovery
1. Simulate database error (if possible)
2. **Expected:** Error message shown
3. **Expected:** App doesn't crash

---

## 📊 Performance Testing

### Test 1: Large Product List
1. Add 100+ products
2. Search products
3. **Expected:** Results < 100ms

### Test 2: Large Invoice History
1. Create 50+ invoices
2. Load invoice history
3. **Expected:** Loads quickly

### Test 3: Dashboard with Data
1. Create lots of data
2. Load dashboard
3. **Expected:** Stats calculate quickly

---

## ✅ Final Checklist

### Functionality
- [ ] All screens load
- [ ] All CRUD operations work
- [ ] Search works everywhere
- [ ] Filters work correctly
- [ ] Keyboard shortcuts work
- [ ] Toast notifications appear
- [ ] Stock alerts work
- [ ] Customer tracking works
- [ ] Invoice history accurate

### Data Integrity
- [ ] Data persists after restart
- [ ] Stock deducted correctly
- [ ] Customer totals accurate
- [ ] Invoice totals correct
- [ ] No data loss

### User Experience
- [ ] UI is responsive
- [ ] No lag or freezing
- [ ] Error messages clear
- [ ] Success feedback shown
- [ ] Loading states work

### Performance
- [ ] Search < 100ms
- [ ] Screen load < 200ms
- [ ] Invoice save < 500ms
- [ ] No memory leaks

---

## 🎯 Test Results Template

```
Date: ___________
Tester: ___________

Dashboard: ✅ / ❌
Categories: ✅ / ❌
Products: ✅ / ❌
Customers: ✅ / ❌
POS: ✅ / ❌
Invoices: ✅ / ❌
Integration: ✅ / ❌
Performance: ✅ / ❌

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

## 🐛 Common Issues & Solutions

### Issue: App won't start
**Solution:** Check database file exists, restart computer

### Issue: Search not working
**Solution:** Refresh screen, check spelling

### Issue: Stock not deducting
**Solution:** Check invoice completed successfully

### Issue: Alerts not showing
**Solution:** Check min_stock_level set correctly

---

## ✅ Sign-Off

After completing all tests:

- [ ] All critical features work
- [ ] No blocking bugs
- [ ] Performance acceptable
- [ ] Data integrity verified
- [ ] Ready for production

**Tested by:** ___________
**Date:** ___________
**Status:** ✅ APPROVED / ❌ NEEDS WORK

---

**🎉 Testing Complete! System Ready for Production!**
