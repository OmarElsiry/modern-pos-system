# 🚀 Quick Start Guide - POS Cashier System

**Get up and running in 5 minutes!**

---

## 📋 Prerequisites

Before you start, make sure you have:
- ✅ Windows 10 or 11
- ✅ Node.js installed (v16 or higher)
- ✅ npm installed (comes with Node.js)

---

## ⚡ Quick Installation

### Step 1: Install Dependencies
```bash
npm install
```
*This will take 2-3 minutes*

### Step 2: Build the Application
```bash
npm run build
```
*This will take 5-10 seconds*

### Step 3: Run the Application
```bash
npx electron .
```
*The app will open automatically*

---

## 🎯 First-Time Setup (5 minutes)

### 1. Configure Business Information
1. Click **⚙️ الإعدادات** (Settings) in the menu
2. Fill in your business details:
   - **اسم المتجر** (Store Name): Your business name
   - **العنوان** (Address): Your full address
   - **رقم الهاتف** (Phone): Your contact number
   - **الرقم الضريبي** (Tax Number): Optional
3. Click **💾 حفظ معلومات المتجر** (Save)

### 2. Add Product Categories
1. Click **📁 الفئات** (Categories) in the menu
2. Click **إضافة فئة جديدة** (Add New Category)
3. Enter category name (e.g., "Electronics", "Food", "Clothing")
4. Click **حفظ** (Save)
5. Repeat for all your categories

### 3. Add Products
1. Click **📦 المنتجات** (Products) in the menu
2. Click **إضافة منتج جديد** (Add New Product)
3. Fill in product details:
   - **اسم المنتج** (Product Name): Required
   - **الباركود** (Barcode): Optional
   - **الفئة** (Category): Select from dropdown
   - **سعر الجملة** (Wholesale Price): For bulk sales
   - **سعر القطاعي** (Retail Price): For individual sales
   - **الكمية** (Stock Quantity): Current stock
   - **الحد الأدنى للمخزون** (Minimum Stock): Alert threshold
4. Click **حفظ** (Save)
5. Repeat for all your products

### 4. Add Customers (Optional)
1. Click **👥 العملاء** (Customers) in the menu
2. Click **إضافة عميل جديد** (Add New Customer)
3. Fill in customer details:
   - **الاسم** (Name): Required
   - **رقم الهاتف** (Phone): Recommended
   - **البريد الإلكتروني** (Email): Optional
4. Click **حفظ** (Save)

---

## 💰 Making Your First Sale

### Step 1: Go to POS
Click **🛒 نقطة البيع** (Point of Sale) in the menu

### Step 2: Select Pricing Type
Choose between:
- **جملة** (Wholesale) - For bulk sales
- **قطاعي** (Retail) - For individual sales

### Step 3: Add Products
You have 3 options:

**Option A: Scan Barcode**
- Use your barcode scanner
- Product adds automatically

**Option B: Quick Search (Recommended)**
- Press **F2** on your keyboard
- Type product name or barcode
- Click product from dropdown
- Product adds to invoice

**Option C: Manual Entry**
- Type barcode in the barcode field
- Press Enter
- Product adds to invoice

### Step 4: Select Customer (Optional)
- Click customer dropdown
- Search or select customer
- Purchase will be linked to customer

### Step 5: Adjust Quantities
- Click on quantity field
- Change number
- Press Enter or click outside

### Step 6: Complete Sale
1. Click **إتمام الفاتورة** (Complete Invoice)
2. Confirm in the dialog
3. Receipt preview opens automatically
4. Choose action:
   - **🖨️ طباعة** (Print) - Print receipt
   - **📥 تحميل PDF** (Download) - Save as PDF
   - **إغلاق** (Close) - Continue selling

---

## 📊 Daily Operations

### Check Dashboard
1. Click **📊 لوحة التحكم** (Dashboard)
2. View today's sales
3. Check stock alerts
4. See recent invoices

### View Reports
1. Click **📈 التقارير** (Reports)
2. Select period:
   - **اليوم** (Today)
   - **آخر 7 أيام** (Last 7 days)
   - **آخر 30 يوم** (Last 30 days)
   - **فترة مخصصة** (Custom range)
3. Analyze charts and data

### Check Stock Alerts
1. Go to **📦 المنتجات** (Products)
2. Look for alert badge at top
3. Click badge to see low stock items
4. Update stock as needed

### View Invoice History
1. Click **📋 الفواتير** (Invoices)
2. Search by invoice number or customer
3. Filter by status
4. Click **التفاصيل** (Details) to view

---

## ⌨️ Keyboard Shortcuts

- **F2** - Open quick product search (POS screen)
- **ESC** - Close modals and dropdowns
- **Enter** - Submit forms

---

## 🔧 Common Tasks

### Restock Products
1. Go to Products
2. Click **تعديل** (Edit) on product
3. Update **الكمية** (Quantity)
4. Click **حفظ** (Save)

### Edit Business Info
1. Go to Settings
2. Update information
3. Click **حفظ** (Save)

### Customize Receipt
1. Go to Settings
2. Scroll to Print Options
3. Edit footer message
4. See live preview
5. Click **حفظ** (Save)

### View Customer History
1. Go to Customers
2. Find customer
3. Click **عرض المشتريات** (View Purchases)
4. See all invoices

---

## 💡 Pro Tips

### For Faster Checkout:
1. Use **F2** quick search instead of scanning
2. Set up customers in advance
3. Organize products by category
4. Use keyboard shortcuts

### For Better Inventory:
1. Set realistic minimum stock levels
2. Check alerts daily
3. Review reports weekly
4. Update stock regularly

### For Customer Satisfaction:
1. Always print receipts
2. Link sales to customers
3. Track purchase history
4. Provide professional service

---

## 🆘 Troubleshooting

### App Won't Start
```bash
# Try rebuilding
npm run build
npx electron .
```

### Database Error
- Check if `pos-database.db` exists
- Check disk space
- Restart the app

### Products Not Showing
- Make sure you added products
- Check if category is selected
- Try refreshing (click menu item again)

### Receipt Not Printing
- Check if business info is configured
- Try download instead
- Check printer connection

---

## 📞 Need Help?

### Documentation:
- **COMPLETE_FEATURE_GUIDE.md** - Detailed feature guide
- **DEPLOYMENT_GUIDE.md** - Complete user manual
- **README.md** - Project overview

### Check Status:
- **LATEST_STATUS.md** - Current system status
- **PHASE_X_COMPLETE.md** - Feature documentation

---

## 🎯 Next Steps

After setup, you should:

1. **Test Everything**
   - Make test sales
   - Print test receipts
   - Check reports
   - Verify data

2. **Train Staff**
   - Show them the interface
   - Teach keyboard shortcuts
   - Practice checkout flow
   - Review reports together

3. **Go Live**
   - Start with real products
   - Make real sales
   - Print real receipts
   - Monitor performance

4. **Optimize**
   - Review reports weekly
   - Adjust stock levels
   - Update customer database
   - Refine workflows

---

## ✅ Checklist

Before going live, make sure:

- [ ] Business information configured
- [ ] Categories added
- [ ] Products added with prices
- [ ] Stock quantities set
- [ ] Minimum stock levels set
- [ ] Test sale completed
- [ ] Receipt printed successfully
- [ ] Reports working
- [ ] Staff trained
- [ ] Backup system ready

---

## 🎉 You're Ready!

Your POS system is now configured and ready for business!

**Key Features:**
- ✅ Fast checkout
- ✅ Receipt printing
- ✅ Inventory management
- ✅ Customer tracking
- ✅ Sales reports
- ✅ Stock alerts

**Start selling and grow your business!** 🚀

---

## 📊 Daily Workflow

### Morning:
1. Open app
2. Check dashboard
3. Review stock alerts
4. Plan for the day

### During Day:
1. Make sales
2. Print receipts
3. Track customers
4. Monitor stock

### Evening:
1. Review today's report
2. Check total sales
3. Note best products
4. Plan restocking

### Weekly:
1. Analyze 7-day report
2. Review trends
3. Optimize inventory
4. Update strategies

---

**Happy Selling!** 💼🎊

*For detailed information, see COMPLETE_FEATURE_GUIDE.md*
