import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Droplet, BookOpen, Truck, Search, History, Settings, CheckSquare, 
  ChevronRight, Printer, Check, X, Info
} from 'lucide-react';
import { toast } from 'react-toastify';

interface TankerOrder {
  id: string;
  bpNo: string;
  fullName: string;
  mobile: string;
  email: string;
  deliveryAddress: string;
  tankerSize: string;
  charge: number;
  deliveryDate: string;
  deliverySlot: string;
  purpose: string;
  status: 'Pending Approval' | 'Approved' | 'Paid' | 'Out for Delivery' | 'Delivered' | 'Rejected' | 'Hold' | 'Returned';
  orderDate: string;
}

export const WaterTanker: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'apply' | 'track' | 'history' | 'manage' | 'approve'>('dashboard');
  const [orders, setOrders] = useState<TankerOrder[]>([]);

  // Form states
  const [bpNo, setBpNo] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tankerSize, setTankerSize] = useState('5,000 Litres');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('9 AM - 12 PM');
  const [purpose, setPurpose] = useState('Residential');

  // Track search state
  const [trackSearchId, setTrackSearchId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<TankerOrder | null>(null);

  // Guide Modal state
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  // Initialize and load data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('tata_current_user') || '{}');
    setCurrentUser(user);

    // Initial Tanker orders
    const stored = localStorage.getItem('tata_water_tanker_orders');
    if (stored) {
      setOrders(JSON.parse(stored));
    } else {
      const initialOrders: TankerOrder[] = [
        {
          id: 'TATA-WT-2026-1082',
          bpNo: '0010122668',
          fullName: 'Abhishek',
          mobile: '8271039154',
          email: 'abhishek.krgupta@yahoo.in',
          deliveryAddress: '00002 L4 Type, Road No.2 JAMSHEDPUR Kadma Farm Area 831005',
          tankerSize: '5,000 Litres',
          charge: 800,
          deliveryDate: '2026-07-20',
          deliverySlot: '9 AM - 12 PM',
          purpose: 'Residential',
          status: 'Pending Approval',
          orderDate: '2026-07-12'
        },
        {
          id: 'TATA-WT-2026-0925',
          bpNo: '0010122668',
          fullName: 'Abhishek',
          mobile: '8271039154',
          email: 'abhishek.krgupta@yahoo.in',
          deliveryAddress: '00002 L4 Type, Road No.2 JAMSHEDPUR Kadma Farm Area 831005',
          tankerSize: '9,000 Litres',
          charge: 1200,
          deliveryDate: '2026-07-18',
          deliverySlot: '12 PM - 3 PM',
          purpose: 'Marriage/Event',
          status: 'Delivered',
          orderDate: '2026-07-10'
        }
      ];
      localStorage.setItem('tata_water_tanker_orders', JSON.stringify(initialOrders));
      setOrders(initialOrders);
    }
  }, []);

  const updateOrdersState = (newOrders: TankerOrder[]) => {
    setOrders(newOrders);
    localStorage.setItem('tata_water_tanker_orders', JSON.stringify(newOrders));
  };

  // Submit new Tanker request
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bpNo || !fullName || !mobile || !deliveryAddress || !deliveryDate) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    const price = tankerSize === '5,000 Litres' ? 800 : 1200;
    const newOrder: TankerOrder = {
      id: `TATA-WT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      bpNo,
      fullName,
      mobile,
      email,
      deliveryAddress,
      tankerSize,
      charge: price,
      deliveryDate,
      deliverySlot,
      purpose,
      status: 'Pending Approval',
      orderDate: new Date().toISOString().split('T')[0]
    };

    const list = [newOrder, ...orders];
    updateOrdersState(list);
    toast.success(`Tanker Order placed successfully! ID: ${newOrder.id}`);
    setActiveTab('dashboard');

    // Reset form
    setBpNo('');
    setFullName('');
    setMobile('');
    setEmail('');
    setDeliveryAddress('');
    setDeliveryDate('');
  };

  // Pre-populate on BP Search
  const handleBpSearch = () => {
    if (!bpNo.trim()) {
      toast.error('Please enter a BP/Consumer number');
      return;
    }
    setFullName('Abhishek');
    setMobile('8271039154');
    setEmail('abhishek.krgupta@yahoo.in');
    setDeliveryAddress('00002 L4 Type, Road No.2 JAMSHEDPUR Kadma Farm Area 831005');
    toast.success('Consumer details retrieved successfully!');
  };

  // Status transitions or approvals
  const handleUpdateStatus = (orderId: string, newStatus: TankerOrder['status']) => {
    const list = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    updateOrdersState(list);
    toast.success(`Order ${orderId} updated to ${newStatus}`);
  };

  // Print Invoice Popup
  const handlePrintReceipt = (order: TankerOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Water Tanker Order Receipt - ${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 30px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #4B3E9E; padding-bottom: 10px; margin-bottom: 20px; }
            .title { font-size: 22px; font-weight: bold; color: #4B3E9E; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .field { font-weight: bold; font-size: 12px; color: #666; text-transform: uppercase; }
            .value { font-size: 14px; font-weight: bold; margin-top: 2px; }
            .total-box { margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd; text-align: right; }
            .total-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #555; }
            .total-val { font-size: 20px; font-weight: 800; color: #4B3E9E; }
            .print-btn { background: #4B3E9E; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; display: block; margin: 20px auto 0; }
            @media print { .print-btn { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">TATA UISL - WATER TANKER ORDER RECEIPT</div>
            <div style="font-size: 11px; color: #888; margin-top: 5px;">JAMSHEDPUR UTILITIES & SERVICES COMPANY</div>
          </div>
          <div class="grid">
            <div>
              <div class="field">Order Reference ID</div>
              <div class="value">${order.id}</div>
            </div>
            <div>
              <div class="field">Order Date</div>
              <div class="value">${order.orderDate}</div>
            </div>
            <div>
              <div class="field">Consumer BP Number</div>
              <div class="value">${order.bpNo}</div>
            </div>
            <div>
              <div class="field">Customer Name</div>
              <div class="value">${order.fullName}</div>
            </div>
            <div>
              <div class="field">Contact Mobile</div>
              <div class="value">${order.mobile}</div>
            </div>
            <div>
              <div class="field">Tanker Size</div>
              <div class="value">${order.tankerSize}</div>
            </div>
            <div>
              <div class="field">Delivery Date</div>
              <div class="value">${order.deliveryDate}</div>
            </div>
            <div>
              <div class="field">Delivery Slot</div>
              <div class="value">${order.deliverySlot}</div>
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <div class="field">Delivery Location Address</div>
            <div class="value" style="font-weight: 500;">${order.deliveryAddress}</div>
          </div>
          <div class="total-box">
            <div class="total-title">Total Charged amount</div>
            <div class="total-val">₹${order.charge}.00</div>
            <div style="font-size: 11px; color: #28a745; font-weight: bold; margin-top: 5px;">Paid via Online Wallet</div>
          </div>
          <button class="print-btn" onclick="window.print()">Print Receipt</button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <div className="max-w-6xl mx-auto space-y-5 text-left text-slate-800 dark:text-slate-100">
      
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-800 px-5 py-3 rounded-xl shadow-sm border border-gray-150 dark:border-slate-700/50 flex justify-between items-center w-full">
        <div>
          <h1 className="text-base md:text-lg font-extrabold text-gray-905 dark:text-white flex items-center">
            <Truck className="mr-2 text-[#4B3E9E]" size={20} />
            Water Tanker Portal Dashboard
          </h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Order water tankers, view historical transactions, and manage delivery slots.</p>
        </div>
        {activeTab !== 'dashboard' && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center px-3 py-1.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
          >
            <ArrowLeft size={12} className="mr-1" /> Back to Panel
          </button>
        )}
      </div>

      {/* 1. Main Grid Dashboard Cards */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: How To Apply */}
          <div 
            onClick={() => setGuideModalOpen(true)}
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.85)), url("https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="group cursor-pointer relative overflow-hidden text-white p-6 rounded-2xl border border-slate-700/40 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[170px] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-cyan-300">
                <BookOpen size={20} />
              </div>
              <ChevronRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight uppercase text-white">How To Apply</h2>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                A Comprehensive Step-by-Step Guide to Navigating the Application Process with Tips, Common Pitfalls, and Expert Advice for Success.
              </p>
            </div>
          </div>

          {/* Card 2: Order Water Tanker */}
          <div 
            onClick={() => setActiveTab('apply')}
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.85)), url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="group cursor-pointer relative overflow-hidden text-white p-6 rounded-2xl border border-indigo-700/40 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[170px] flex flex-col justify-between"
          >
            {/* WATER watermark overlay */}
            <div className="absolute right-12 top-[35%] opacity-25 text-5xl font-black tracking-wider text-black dark:text-white font-sans pointer-events-none select-none">
              WATER
            </div>

            <div className="flex items-start justify-between z-10">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-yellow-300">
                <Truck size={20} />
              </div>
              <span className="text-[9px] bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Water</span>
            </div>
            <div className="z-10">
              <h2 className="text-sm font-extrabold tracking-tight uppercase text-white">Order Water Tanker</h2>
              <p className="text-[11px] text-indigo-150 mt-1 leading-relaxed">
                Seamless Solutions for Reliable Water Delivery to Meet Your Residential, Commercial, and Industrial Needs Anytime, Anywhere at a reasonable cost.
              </p>
            </div>
          </div>

          {/* Card 3: Track Order */}
          <div 
            onClick={() => {
              setTrackedOrder(null);
              setTrackSearchId('');
              setActiveTab('track');
            }}
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.85)), url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="group cursor-pointer relative overflow-hidden text-white p-6 rounded-2xl border border-emerald-800/40 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[170px] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-300">
                <Search size={20} />
              </div>
              <ChevronRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight uppercase text-white">Track Order</h2>
              <p className="text-[11px] text-emerald-150 mt-1 leading-relaxed">
                Easily Monitor and Manage Your Purchases with Real-Time Updates and Detailed Tracking Information.
              </p>
            </div>
          </div>

          {/* Card 4: Order History */}
          <div 
            onClick={() => setActiveTab('history')}
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.85)), url("https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=600")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className="group cursor-pointer relative overflow-hidden text-white p-6 rounded-2xl border border-purple-800/40 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[170px] flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-purple-300">
                <History size={20} />
              </div>
              <ChevronRight size={16} className="text-white/40 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight uppercase text-white">Order History</h2>
              <p className="text-[11px] text-purple-150 mt-1 leading-relaxed">
                A Detailed Chronology of Your Purchases, Transactions, and Shipping Information to Track Your Shopping Journey and Stay Updated on Your Orders.
              </p>
            </div>
          </div>

          {/* Card 5: Order Management (Admin/Operator) */}
          {(isAdmin || currentUser?.role === 'Operator') && (
            <div 
              onClick={() => setActiveTab('manage')}
              style={{
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.85)), url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              className="group cursor-pointer relative overflow-hidden text-white p-6 rounded-2xl border border-amber-800/40 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[170px] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-amber-300">
                  <Settings size={20} />
                </div>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight uppercase text-white">Order Management</h2>
                <p className="text-[11px] text-amber-150 mt-1 leading-relaxed">
                  Admin can pay on behalf of customer, print receipt, cancel order and see the details of order on the go.
                </p>
              </div>
            </div>
          )}

          {/* Card 6: Order Approval (Approver/Admin) */}
          {(isAdmin || currentUser?.role === 'Approver') && (
            <div 
              onClick={() => setActiveTab('approve')}
              style={{
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.85)), url("https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600")',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              className="group cursor-pointer relative overflow-hidden text-white p-6 rounded-2xl border border-rose-800/40 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 min-h-[170px] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-rose-300">
                  <CheckSquare size={20} />
                </div>
                <span className="text-[9px] bg-rose-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Approver</span>
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight uppercase text-white">Order Approval</h2>
                <p className="text-[11px] text-rose-150 mt-1 leading-relaxed">
                  Any who has the role of Approver, can Approve/Reject/Return/Hold the request.
                </p>
              </div>
            </div>
          )}

        </div>
      )}      {/* 2. Sub-view: Order Booking Form */}
      {activeTab === 'apply' && (
        <form onSubmit={handleCreateOrder} className="bg-white dark:bg-slate-850 rounded-3xl border border-gray-200 dark:border-slate-750 shadow-xl overflow-hidden text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Left 8 Cols: Inputs */}
            <div className="lg:col-span-8 p-6 md:p-8 space-y-6 border-b lg:border-b-0 lg:border-r border-gray-150 dark:border-slate-750">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-750">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Book Water Tanker Delivery</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Fill consumer details and select delivery slot schedule.</p>
                </div>
                <span className="text-[10px] font-bold text-[#005BAC] bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40">
                  Tata Utility Dispatch
                </span>
              </div>

              <div className="space-y-4">
                {/* Consumer BP Search */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    Consumer BP Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2.5 max-w-md">
                    <input
                      type="text"
                      value={bpNo}
                      onChange={(e) => setBpNo(e.target.value)}
                      placeholder="Enter BP/Consumer Number"
                      className="flex-1 px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] focus:border-transparent transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={handleBpSearch}
                      className="px-5 py-2.5 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Retrieve Data
                    </button>
                  </div>
                </div>

                {/* Customer Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                      Customer Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] focus:border-transparent transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                      Phone / Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="Mobile Number"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] focus:border-transparent transition-all shadow-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                      Email ID
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] focus:border-transparent transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                      Purpose of Requirement
                    </label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] focus:border-transparent transition-all shadow-xs"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Marriage/Event">Marriage / Social Event</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter complete address coordinates where tanker should arrive"
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] focus:border-transparent transition-all shadow-xs resize-none"
                  />
                </div>

                {/* Capacity Chips Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
                    Tanker Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTankerSize('5,000 Litres')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        tankerSize === '5,000 Litres'
                          ? 'border-[#005BAC] bg-blue-50/60 dark:bg-blue-950/40 text-[#005BAC] dark:text-tata-blue-light ring-2 ring-[#005BAC]/20'
                          : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block text-xs font-black">5,000 Litres</span>
                        <span className="block text-[10px] text-gray-400 font-normal">Standard Residential Tanker</span>
                      </div>
                      <span className="text-xs font-black text-[#005BAC]">₹800.00</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTankerSize('9,000 Litres')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                        tankerSize === '9,000 Litres'
                          ? 'border-[#005BAC] bg-blue-50/60 dark:bg-blue-950/40 text-[#005BAC] dark:text-tata-blue-light ring-2 ring-[#005BAC]/20'
                          : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-left">
                        <span className="block text-xs font-black">9,000 Litres</span>
                        <span className="block text-[10px] text-gray-400 font-normal">Heavy Event & Commercial</span>
                      </div>
                      <span className="text-xs font-black text-[#005BAC]">₹1,200.00</span>
                    </button>
                  </div>
                </div>

                {/* Slot Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                      Delivery Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] focus:border-transparent transition-all shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                      Time Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50/70 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#005BAC] focus:border-transparent transition-all shadow-xs"
                    >
                      <option value="9 AM - 12 PM">9 AM - 12 PM (Morning)</option>
                      <option value="12 PM - 3 PM">12 PM - 3 PM (Noon)</option>
                      <option value="3 PM - 6 PM">3 PM - 6 PM (Evening)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-7 py-3 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer"
                >
                  <span>Submit Order Request</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Side Summary & Price Panel */}
            <div className="lg:col-span-4 bg-slate-50/70 dark:bg-slate-900/40 p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#005BAC] to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-900/20">
                  <Droplet size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Water Tanker Details</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Direct dispatch request from Tata Steel Utilities water distribution fleet to your registered premises.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-200 dark:border-slate-750 shadow-sm space-y-3">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Estimated Charges</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-[#005BAC] dark:text-tata-blue-light">
                    ₹{tankerSize === '5,000 Litres' ? '800' : '1,200'}.00
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">/ delivery</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed border-t border-gray-100 dark:border-slate-700 pt-2.5">
                  Includes driver allowance, water quality clearance & municipal delivery tax.
                </p>
              </div>
            </div>
          </div>

        </form>
      )}

      {/* 3. Sub-view: Track Order */}
      {activeTab === 'track' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-slate-700">
            Track Water Tanker Order
          </h2>

          <div className="max-w-md flex gap-2">
            <input
              type="text"
              value={trackSearchId}
              onChange={(e) => setTrackSearchId(e.target.value)}
              placeholder="Enter Order ID (e.g. TATA-WT-2026-1082)"
              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded-md text-[11px] font-semibold focus:border-[#4B3E9E] outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const found = orders.find(o => o.id.toLowerCase() === trackSearchId.trim().toLowerCase());
                if (found) {
                  setTrackedOrder(found);
                } else {
                  toast.error('Order not found. Please verify Order ID.');
                  setTrackedOrder(null);
                }
              }}
              className="px-4 py-1.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[11px] font-bold rounded-lg transition-all"
            >
              Search Status
            </button>
          </div>

          {/* Tracking Pipeline Status */}
          {trackedOrder && (
            <div className="border border-gray-100 dark:border-slate-700/60 p-5 rounded-2xl space-y-6 text-xs bg-slate-50/20 dark:bg-slate-900/30">
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Tracking Reference</span>
                  <span className="font-bold text-[#005BAC] text-sm block mt-0.5 font-mono">{trackedOrder.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Tanker Volume</span>
                  <span className="font-semibold text-gray-800 dark:text-white block mt-0.5">{trackedOrder.tankerSize} ({trackedOrder.purpose})</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Scheduled Date</span>
                  <span className="font-semibold text-gray-800 dark:text-white block mt-0.5 font-mono">{trackedOrder.deliveryDate} ({trackedOrder.deliverySlot})</span>
                </div>
              </div>

              <div className="relative border-l-2 border-gray-200 dark:border-slate-700 ml-4 pl-8 space-y-6 text-left">
                {/* Step 1: Ordered */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-0 h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white border-2 border-white shadow-sm">
                    <Check size={11} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">Order Registered</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Order logged successfully under BP No: {trackedOrder.bpNo} on {trackedOrder.orderDate}</p>
                  </div>
                </div>

                {/* Step 2: Approved */}
                <div className="relative">
                  <div className={`absolute -left-[41px] top-0 h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors ${
                    ['Approved', 'Paid', 'Out for Delivery', 'Delivered'].includes(trackedOrder.status)
                      ? 'bg-green-500 text-white'
                      : 'bg-white border-gray-200 text-gray-300 dark:bg-slate-800 dark:border-slate-700'
                  }`}>
                    {['Approved', 'Paid', 'Out for Delivery', 'Delivered'].includes(trackedOrder.status) ? <Check size={11} /> : <span className="text-[10px]">2</span>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">Order Approved</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {trackedOrder.status === 'Pending Approval' ? 'Awaiting slot allotment approval by Technical Review Team.' : 'Tanker order approved by Technical Officer.'}
                    </p>
                  </div>
                </div>

                {/* Step 3: Paid */}
                <div className="relative">
                  <div className={`absolute -left-[41px] top-0 h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors ${
                    ['Paid', 'Out for Delivery', 'Delivered'].includes(trackedOrder.status)
                      ? 'bg-green-500 text-white'
                      : 'bg-white border-gray-200 text-gray-300 dark:bg-slate-800 dark:border-slate-700'
                  }`}>
                    {['Paid', 'Out for Delivery', 'Delivered'].includes(trackedOrder.status) ? <Check size={11} /> : <span className="text-[10px]">3</span>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">Payment Verification</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {['Paid', 'Out for Delivery', 'Delivered'].includes(trackedOrder.status) ? `Charged amount of ₹${trackedOrder.charge}.00 successfully cleared.` : 'Payment pending.'}
                    </p>
                  </div>
                </div>

                {/* Step 4: Out for Delivery */}
                <div className="relative">
                  <div className={`absolute -left-[41px] top-0 h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors ${
                    ['Out for Delivery', 'Delivered'].includes(trackedOrder.status)
                      ? 'bg-green-500 text-white'
                      : 'bg-white border-gray-200 text-gray-300 dark:bg-slate-800 text-gray-300 dark:border-slate-700'
                  }`}>
                    {['Out for Delivery', 'Delivered'].includes(trackedOrder.status) ? <Check size={11} /> : <span className="text-[10px]">4</span>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">Out for Delivery</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {trackedOrder.status === 'Out for Delivery' ? 'Tanker has left the Bistupur filling station and is enroute.' : 'Tanker load allocation pending.'}
                    </p>
                  </div>
                </div>

                {/* Step 5: Delivered */}
                <div className="relative">
                  <div className={`absolute -left-[41px] top-0 h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors ${
                    trackedOrder.status === 'Delivered'
                      ? 'bg-green-500 text-white'
                      : 'bg-white border-gray-200 text-gray-300 dark:bg-slate-800 dark:border-slate-700'
                  }`}>
                    {trackedOrder.status === 'Delivered' ? <Check size={11} /> : <span className="text-[10px]">5</span>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">Delivered</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {trackedOrder.status === 'Delivered' ? 'Water tanker successfully delivered and discharged at location.' : 'Awaiting delivery completion.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Sub-view: Order History (Customer) */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-slate-700">
            Water Tanker History
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Size</th>
                  <th className="pb-3 px-3">Purpose</th>
                  <th className="pb-3 px-3">Delivery Date</th>
                  <th className="pb-3 px-3">Slot</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-400 font-semibold">No history found.</td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-750/30 transition-all">
                      <td className="py-3 px-3 font-mono font-bold text-[#005BAC]">{o.id}</td>
                      <td className="py-3 px-3 text-gray-500 font-semibold">{o.orderDate}</td>
                      <td className="py-3 px-3 font-semibold">{o.tankerSize}</td>
                      <td className="py-3 px-3 text-gray-650">{o.purpose}</td>
                      <td className="py-3 px-3 text-gray-500 font-mono font-semibold">{o.deliveryDate}</td>
                      <td className="py-3 px-3 text-gray-600 font-semibold">{o.deliverySlot}</td>
                      <td className="py-3 px-3 font-bold text-gray-800 dark:text-gray-200">₹{o.charge}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          o.status === 'Delivered' 
                            ? 'bg-green-100 text-green-700' 
                            : o.status === 'Pending Approval' 
                              ? 'bg-yellow-100 text-yellow-700'
                              : o.status === 'Paid'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {o.status === 'Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'Paid')}
                            className="px-2.5 py-1 bg-[#28A745] hover:bg-green-600 text-white text-[10px] font-bold rounded shadow transition mr-2"
                          >
                            Pay Online
                          </button>
                        )}
                        {['Paid', 'Out for Delivery', 'Delivered'].includes(o.status) && (
                          <button
                            onClick={() => handlePrintReceipt(o)}
                            className="p-1.5 bg-gray-150 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-gray-700 dark:text-gray-200 transition inline-flex items-center"
                            title="Print Receipt"
                          >
                            <Printer size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Sub-view: Order Management (Admin) */}
      {activeTab === 'manage' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-slate-700">
            Water Tanker Operations Management
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">BP / Consumer</th>
                  <th className="pb-3 px-3">Customer Name</th>
                  <th className="pb-3 px-3">Capacity</th>
                  <th className="pb-3 px-3">Delivery Date</th>
                  <th className="pb-3 px-3">Charge</th>
                  <th className="pb-3 px-3 text-center">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400 font-semibold">No orders logged.</td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-750/30 transition-all">
                      <td className="py-3 px-3 font-mono font-bold text-[#005BAC]">{o.id}</td>
                      <td className="py-3 px-3 font-semibold text-gray-600 dark:text-gray-300 font-mono">{o.bpNo}</td>
                      <td className="py-3 px-3 font-bold">{o.fullName}</td>
                      <td className="py-3 px-3 font-semibold">{o.tankerSize} ({o.deliverySlot})</td>
                      <td className="py-3 px-3 font-mono font-semibold text-gray-500">{o.deliveryDate}</td>
                      <td className="py-3 px-3 font-bold">₹{o.charge}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          o.status === 'Delivered' 
                            ? 'bg-green-100 text-green-700' 
                            : o.status === 'Pending Approval' 
                              ? 'bg-yellow-100 text-yellow-700'
                              : o.status === 'Paid'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {o.status === 'Approved' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'Paid')}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded text-[10px] shadow"
                            title="Collect Payment"
                          >
                            Collect Cash
                          </button>
                        )}
                        {o.status === 'Paid' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'Out for Delivery')}
                            className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded text-[10px] shadow"
                          >
                            Assign Truck
                          </button>
                        )}
                        {o.status === 'Out for Delivery' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'Delivered')}
                            className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded text-[10px] shadow"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {['Paid', 'Out for Delivery', 'Delivered'].includes(o.status) && (
                          <button
                            onClick={() => handlePrintReceipt(o)}
                            className="p-1 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 rounded text-gray-700 dark:text-gray-250 inline-flex items-center"
                            title="Print Receipt"
                          >
                            <Printer size={12} />
                          </button>
                        )}
                        {o.status !== 'Delivered' && o.status !== 'Rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, 'Rejected')}
                            className="p-1 bg-red-100 hover:bg-red-200 rounded text-red-600 inline-flex items-center"
                            title="Cancel Order"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Sub-view: Order Approval (Approver) */}
      {activeTab === 'approve' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider pb-2 border-b border-gray-100 dark:border-slate-700">
            Water Tanker Slot Approval Panel
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-700 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">BP / Consumer</th>
                  <th className="pb-3 px-3">Customer Name</th>
                  <th className="pb-3 px-3">Tanker Capacity</th>
                  <th className="pb-3 px-3">Delivery Date</th>
                  <th className="pb-3 px-3">Purpose</th>
                  <th className="pb-3 px-3 text-center">Current Status</th>
                  <th className="pb-3 px-3 text-right">Approve / Reject Pipeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-700/30">
                {orders.filter(o => o.status === 'Pending Approval').length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400 font-semibold">No orders pending approval.</td>
                  </tr>
                ) : (
                  orders.filter(o => o.status === 'Pending Approval').map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-750/30 transition-all">
                      <td className="py-3 px-3 font-mono font-bold text-[#005BAC]">{o.id}</td>
                      <td className="py-3 px-3 font-semibold text-gray-600 dark:text-gray-300 font-mono">{o.bpNo}</td>
                      <td className="py-3 px-3 font-bold">{o.fullName}</td>
                      <td className="py-3 px-3 font-semibold">{o.tankerSize} ({o.deliverySlot})</td>
                      <td className="py-3 px-3 font-mono font-semibold text-gray-500">{o.deliveryDate}</td>
                      <td className="py-3 px-3 text-gray-600 font-semibold">{o.purpose}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-yellow-100 text-yellow-700">
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'Approved')}
                          className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded text-[10px] shadow transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'Rejected')}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-600 text-white font-bold rounded text-[10px] shadow transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'Returned')}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded text-[10px] shadow transition"
                        >
                          Return
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'Hold')}
                          className="px-2.5 py-1 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded text-[10px] shadow transition"
                        >
                          Hold
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guide / How To Apply Modal */}
      {guideModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 max-w-lg w-full rounded-2xl shadow-xl overflow-hidden border border-gray-150 dark:border-slate-700">
            <div className="bg-[#4B3E9E] p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center">
                <Info className="mr-2" size={16} /> How to Apply for Water Tanker
              </h3>
              <button onClick={() => setGuideModalOpen(false)} className="text-white hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 text-xs text-left space-y-4 max-h-[70vh] overflow-y-auto leading-relaxed">
              <p className="font-bold text-gray-800 dark:text-white">Follow this step-by-step procedure to book a water tanker:</p>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="h-5 w-5 bg-indigo-50 text-[#4B3E9E] dark:bg-indigo-950 font-bold rounded-full flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                  <p className="text-gray-650 dark:text-gray-300">
                    <strong>Enter your BP Number:</strong> Retrieve your registered name and premises details instantly using the search utility.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="h-5 w-5 bg-indigo-50 text-[#4B3E9E] dark:bg-indigo-950 font-bold rounded-full flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                  <p className="text-gray-650 dark:text-gray-300">
                    <strong>Choose Tanker Capacity:</strong> Select from 5,000 Litres (₹800) or 9,000 Litres (₹1,200) according to your social/construction requirements.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="h-5 w-5 bg-indigo-50 text-[#4B3E9E] dark:bg-indigo-950 font-bold rounded-full flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                  <p className="text-gray-650 dark:text-gray-300">
                    <strong>Select Slot & Date:</strong> Pick an appropriate delivery slot (Morning, Noon, Evening) and complete date details.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="h-5 w-5 bg-indigo-50 text-[#4B3E9E] dark:bg-indigo-950 font-bold rounded-full flex items-center justify-center text-[10px] flex-shrink-0">4</span>
                  <p className="text-gray-650 dark:text-gray-300">
                    <strong>Approval and Payment:</strong> Once submitted, the technical review officer evaluates queue slots. Upon approval, pay online or cash to begin dispatch!
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-900 p-3 text-right">
              <button
                onClick={() => setGuideModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
