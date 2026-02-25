import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '../types/models';
import { CustomerService } from '../services/CustomerService';
import Modal from './Modal';
import Button from './Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { User, X, Plus, Search, Phone } from 'lucide-react';

interface CustomerSelectProps {
  selectedCustomerId?: string;
  onSelect: (customer: Customer | null) => void;
}

export const CustomerSelect: React.FC<CustomerSelectProps> = ({
  selectedCustomerId,
  onSelect,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add Customer Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ name: '', phone: '' });
  const [addError, setAddError] = useState<string | null>(null);

  const customerService = new CustomerService();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCustomers = async () => {
    const response = await customerService.getAllCustomers();
    if (response.success) {
      setCustomers(response.data);
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers.slice(0, 10));
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = customers
      .filter(
        (customer) =>
          customer.name.toLowerCase().includes(term) ||
          customer.phone?.toLowerCase().includes(term)
      )
      .slice(0, 10);
    setFilteredCustomers(filtered);
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const handleSelect = (customer: Customer | null) => {
    onSelect(customer);
    setIsOpen(false);
    if (customer) {
      setSearchTerm(customer.name);
    } else {
      setSearchTerm('');
    }
  };

  const handleAddNewClick = () => {
    const isPhone = /^[0-9]+$/.test(searchTerm);
    setNewCustomerData({
      name: isPhone ? '' : searchTerm,
      phone: isPhone ? searchTerm : ''
    });
    setAddError(null);
    setIsAddModalOpen(true);
    setIsOpen(false);
  };

  const handleSaveNewCustomer = async () => {
    if (!newCustomerData.name.trim()) {
      setAddError('اسم العميل مطلوب');
      return;
    }

    if (newCustomerData.phone) {
      const exists = customers.find(c => c.phone === newCustomerData.phone);
      if (exists) {
        setAddError('رقم الهاتف موجود بالفعل لعميل آخر: ' + exists.name);
        return;
      }
    }

    const response = await customerService.createCustomer({
      name: newCustomerData.name,
      phone: newCustomerData.phone
    });

    if (response.success) {
      const newCustomer = response.data;
      setCustomers(prev => [...prev, newCustomer]);
      handleSelect(newCustomer);
      setNewCustomerData({ name: '', phone: '' });
      setIsAddModalOpen(false);
    } else {
      setAddError(response.error?.message || 'فشل في إضافة العميل');
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Label className="text-xs text-muted-foreground mb-1.5 block">العميل</Label>
      <div className="relative">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          className={cn(
            "pr-9",
            selectedCustomer && "border-primary/50"
          )}
          placeholder="ابحث باسم العميل أو رقم الهاتف..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value && selectedCustomerId) {
              handleSelect(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        {selectedCustomer && (
          <button
            className="absolute left-2 top-2 h-5 w-5 rounded-full bg-muted hover:bg-destructive/20 hover:text-destructive flex items-center justify-center transition-colors"
            onClick={() => {
              handleSelect(null);
              setSearchTerm('');
            }}
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {isOpen && searchTerm.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer transition-colors border-b last:border-b-0"
              onClick={() => {
                handleSelect(customer);
                setSearchTerm(customer.name);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium text-sm">{customer.name}</div>
                  {customer.phone && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {searchTerm && !filteredCustomers.find(c => c.name === searchTerm) && (
            <div
              className="flex items-center gap-2 p-3 text-primary hover:bg-primary/10 cursor-pointer transition-colors"
              onClick={handleAddNewClick}
            >
              <Plus className="h-4 w-4" />
              <span>إضافة عميل جديد: <strong>{searchTerm}</strong></span>
            </div>
          )}

          {filteredCustomers.length === 0 && !searchTerm && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              ابدأ بكتابة اسم العميل...
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة عميل جديد"
        footer={
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setIsAddModalOpen(false)} variant="outline">إلغاء</Button>
            <Button onClick={handleSaveNewCustomer} variant="solid">حفظ</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {addError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {addError}
            </div>
          )}

          <div className="space-y-2">
            <Label>
              اسم العميل <span className="text-destructive">*</span>
            </Label>
            <Input
              type="text"
              placeholder="اسم العميل"
              value={newCustomerData.name}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input
              type="text"
              placeholder="رقم الهاتف (اختياري)"
              value={newCustomerData.phone}
              onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveNewCustomer();
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
