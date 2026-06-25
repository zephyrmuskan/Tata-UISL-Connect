import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Sun, Moon, Bell, LogOut, Menu, X, ChevronRight, User as UserIcon, 
  FileText, Home, PlusCircle, Settings, Clipboard, Shield,
  Clock, CheckCircle, XCircle, Users, BarChart3, UserPlus, HelpCircle, Lock, ChevronDown, Search
} from 'lucide-react';
import { authService, notificationService } from '../services/api';
import { type User, type Notification } from '../services/mockData';
import { toast } from 'react-toastify';
import { TataEmblem } from './TataLogo';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tata_dark_mode') === 'true';
  });
  
  // Remember sidebar state in current session
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('tata_sidebar_open');
    return saved !== 'false';
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState<boolean>(false);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState<boolean>(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Persist sidebar state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('tata_sidebar_open', String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
    } else {
      setCurrentUser(user);
    }
  }, [navigate]);

  // Load notifications
  const fetchNotifications = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        const notifs = await notificationService.getNotifications();
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Dark Mode side effects
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('tata_dark_mode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('tata_dark_mode', 'false');
    }
  }, [darkMode]);

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await notificationService.markAsRead(notifId);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    toast.success('Password updated successfully');
    setChangePasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (!currentUser) return null;

  // Navigation Items
  const customerLinks = [
    { name: 'Dashboard', path: '/customer', icon: Home },
    { name: 'New Application', path: '/customer/apply', icon: PlusCircle },
    { name: 'My Applications', path: '/customer/track', icon: FileText },
    { name: 'Track Application', path: '/customer/track', icon: Clipboard },
    { name: 'Notifications', path: '#notifications', icon: Bell, isAction: true },
    { name: 'Profile', path: '/customer/profile', icon: UserIcon },
    { name: 'Help & Support', path: '#help', icon: HelpCircle, isAction: true },
    { name: 'Logout', path: '#logout', icon: LogOut, isAction: true }
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: Home },
    { name: 'Applications', path: '/admin/applications', icon: FileText },
    { name: 'Pending Approvals', path: '/admin/applications?status=pending', icon: Clock },
    { name: 'Approved Applications', path: '/admin/applications?status=approved', icon: CheckCircle },
    { name: 'Rejected Applications', path: '/admin/applications?status=rejected', icon: XCircle },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Reports', path: '/admin', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'User Management', path: '/admin/customers', icon: UserPlus },
    { name: 'Notifications', path: '#notifications', icon: Bell, isAction: true },
    { name: 'Audit Logs', path: '/admin/logs', icon: Shield },
    { name: 'Logout', path: '#logout', icon: LogOut, isAction: true }
  ];

  const menuLinks = currentUser.role === 'Admin' ? adminLinks : customerLinks;

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${darkMode ? 'dark bg-slate-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/55 z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 bg-[#005BAC] text-white border-r border-white/10 shadow-xl flex flex-col transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-16 lg:translate-x-0'
        }`}
      >
        
        {/* Logo Header */}
        <div className={`h-16 flex items-center border-b border-white/10 flex-shrink-0 ${sidebarOpen ? 'justify-between px-4' : 'justify-center'}`}>
          {sidebarOpen ? (
            <Link to="/" className="flex items-center space-x-2">
              <TataEmblem size={28} />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-white tracking-wider leading-none text-sm">TATA UISL</span>
                <span className="text-[9px] text-white/60 font-semibold tracking-widest mt-0.5">CONNECT PORTAL</span>
              </div>
            </Link>
          ) : (
            <Link to="/">
              <TataEmblem size={28} />
            </Link>
          )}
          {sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-full transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User Desk Summary (Show when expanded) */}
        {sidebarOpen && (
          <div className="mx-3 mt-4 mb-2 p-3 bg-white/10 rounded-xl border border-white/5 shadow-sm text-left">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-full bg-white text-tata-blue font-black flex items-center justify-center text-sm shadow flex-shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">{currentUser.fullName}</span>
                <span className="text-[9px] text-white/70 font-semibold tracking-wider uppercase mt-0.5">{currentUser.role} Account</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items Links */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuLinks.map((link) => {
            const Icon = link.icon;
            
            // Highlight check
            const isActive = !link.isAction && (
              link.path.includes('?') 
                ? (location.pathname + location.search === link.path)
                : (location.pathname === link.path && !location.search)
            );
            
            const handleClick = (e: React.MouseEvent) => {
              if (link.isAction) {
                e.preventDefault();
                if (link.path === '#notifications') {
                  setNotifDrawerOpen(true);
                } else if (link.path === '#help') {
                  setHelpModalOpen(true);
                } else if (link.path === '#logout') {
                  handleLogout();
                }
              } else if (window.innerWidth < 1024) {
                setSidebarOpen(false); // Auto close mobile drawer
              }
            };

            return (
              <Link
                key={link.name + link.path}
                to={link.isAction ? '#' : link.path}
                onClick={handleClick}
                title={!sidebarOpen ? link.name : undefined}
                className={`flex items-center rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  sidebarOpen ? 'px-3 py-2.5 mx-2' : 'p-3 justify-center mx-1.5'
                } ${
                  isActive 
                    ? 'bg-white/15 text-white border-l-4 border-white' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} className={`${sidebarOpen ? 'mr-3' : ''} transition-transform duration-200 group-hover:scale-110 flex-shrink-0`} />
                {sidebarOpen && (
                  <span className="truncate text-xs font-semibold">{link.name}</span>
                )}
                {sidebarOpen && isActive && <ChevronRight size={14} className="ml-auto text-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Persistent Bottom Logout */}
        <div className="p-3 border-t border-white/10 bg-black/10 flex-shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="h-7 w-7 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className="text-[11px] font-bold text-white truncate leading-none">{currentUser.fullName}</span>
                  <span className="text-[9px] text-white/50 truncate mt-1">{currentUser.email}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button 
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER / NAVBAR */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-20 shadow-sm flex-shrink-0">
          
          <div className="flex items-center space-x-3">
            {/* Hamburger button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              title="Toggle sidebar menu"
            >
              <Menu size={22} />
            </button>
            
            {/* Portal Title */}
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xs text-tata-blue dark:text-tata-blue-light tracking-wide uppercase leading-none">Tata UISL Connect</span>
              <span className="text-[9px] text-gray-400 font-semibold tracking-wider mt-0.5 capitalize">
                {location.pathname.split('/').filter(Boolean).join(' / ') || 'Home'}
              </span>
            </div>
          </div>

          {/* Premium Search Bar */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg px-3 py-1.5 w-64 mx-auto">
            <Search size={14} className="text-gray-400 dark:text-gray-400 mr-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search application desk..." 
              className="bg-transparent border-none text-xs text-gray-700 dark:text-gray-250 outline-none w-full placeholder-gray-405"
              disabled
            />
          </div>

          {/* Quick Actions (Right side header) */}
          <div className="flex items-center space-x-3.5">
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none"
              title="Toggle theme mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifDrawerOpen(true)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none relative"
                title="View notification feed"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Avatar & Dropdown */}
            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700"></div>
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                title="Account options"
              >
                <div className="h-8 w-8 rounded-full bg-tata-blue text-white flex items-center justify-center font-bold text-xs shadow-md border border-white/20">
                  {currentUser.fullName.charAt(0)}
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold">
                  {currentUser.fullName}
                </span>
                <ChevronDown size={12} className="text-gray-400" />
              </button>

              {/* Profile Context Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in text-left">
                    <div className="px-4 py-2 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">{currentUser.role} Desk</p>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{currentUser.fullName}</p>
                    </div>
                    <Link 
                      to={currentUser.role === 'Admin' ? '/admin' : '/customer/profile'} 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-gray-700 dark:text-gray-250 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                    >
                      <UserIcon size={13} className="mr-2 text-gray-400" />
                      View Profile
                    </Link>
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setChangePasswordOpen(true);
                      }}
                      className="w-full flex items-center px-4 py-2 text-xs text-gray-700 dark:text-gray-250 hover:bg-gray-150 dark:hover:bg-slate-700 transition text-left"
                    >
                      <Lock size={13} className="mr-2 text-gray-400" />
                      Change Password
                    </button>
                    <div className="border-t border-gray-100 dark:border-slate-700"></div>
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-left font-semibold"
                    >
                      <LogOut size={13} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </header>

        {/* VIEW CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
        
        {/* FOOTER */}
        <footer className="py-4 px-8 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 text-center text-xs text-gray-400 flex-shrink-0">
          <p>© {new Date().getFullYear()} Jamshedpur Utilities and Services Company (Tata UISL). A Tata Enterprise. All rights reserved.</p>
        </footer>

      </div>

      {/* NOTIFICATIONS DRAWER FEED */}
      {notifDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/55 z-40 transition-opacity duration-300"
            onClick={() => setNotifDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white dark:bg-slate-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-slate-700 text-left">
            
            <div className="px-5 py-4 bg-[#005BAC] text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Bell size={18} />
                <span className="font-bold text-sm">Notifications Drawer</span>
              </div>
              <button 
                onClick={() => setNotifDrawerOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-slate-700/30 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center text-xs flex-shrink-0">
              <span className="font-semibold text-gray-500 dark:text-gray-400">Connection Feeds</span>
              <span className="bg-blue-50 text-tata-blue dark:bg-slate-700 dark:text-tata-blue-light px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                {unreadCount} Unread
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-xs text-gray-450 space-y-2">
                  <Bell size={24} className="text-gray-300 dark:text-slate-600" />
                  <p>All clean! No notification feeds found.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={`p-3.5 border border-gray-150 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/40 cursor-pointer flex flex-col transition duration-200 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-950/10 border-l-4 border-l-tata-blue dark:border-l-tata-blue-light' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-snug">{notif.title}</span>
                      {!notif.isRead && <span className="h-1.5 w-1.5 bg-[#005BAC] rounded-full mt-1.5 flex-shrink-0"></span>}
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{notif.message}</span>
                    <span className="text-[9px] text-gray-400 mt-2 font-mono flex items-center">
                      <Clock size={10} className="mr-1" />
                      {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 flex-shrink-0">
              <button 
                onClick={async () => {
                  try {
                    for (const n of notifications.filter(notif => !notif.isRead)) {
                      await notificationService.markAsRead(n.id);
                    }
                    fetchNotifications();
                    toast.success('All marked as read');
                  } catch(e) {}
                }}
                className="w-full py-2 bg-[#005BAC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow"
              >
                Mark All as Read
              </button>
            </div>

          </div>
        </>
      )}

      {/* HELP & SUPPORT DIALOG MODAL */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setHelpModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative z-10 border border-gray-100 dark:border-slate-700 animate-scale-in text-left">
            
            <div className="bg-[#005BAC] text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <HelpCircle size={18} />
                <span className="font-bold text-sm font-sans">Tata UISL Help Desk</span>
              </div>
              <button onClick={() => setHelpModalOpen(false)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-blue-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-blue-100 dark:border-slate-750 space-y-2">
                <h4 className="text-xs font-bold text-[#005BAC] dark:text-tata-blue-light uppercase tracking-wider">JUSCO Helpline coordinates</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">For billing disputes, power failures, document upload delays, or other complaints:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="font-bold text-gray-500">Hotline: </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-250">1800-345-6789</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-500">Email: </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-250">support.uisl@tatasteel.com</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 pb-1.5">Utility Portal FAQs</h4>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <h5 className="font-bold text-gray-800 dark:text-gray-200">1. How long does site verification take?</h5>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Once document checks are complete, a verification officer will inspect your site coordinates within 3 working days.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 dark:text-gray-200">2. How can I download my application receipt?</h5>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Log into the customer dashboard. Click "My Applications" / "Track Status", and scroll down to the bottom to download a PDF receipt.</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 dark:text-gray-200">3. What formats are allowed for document files?</h5>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">The portal supports JPG, PNG, and PDF. Make sure your scanned files are under 10MB in size.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3.5 bg-gray-50 dark:bg-slate-900/10 border-t border-gray-100 dark:border-slate-700 flex justify-end">
              <button 
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-slate-650 transition"
              >
                Close Support
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PASSWORD CHANGE MODAL */}
      {changePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setChangePasswordOpen(false)}></div>
          <form 
            onSubmit={handleChangePassword}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl relative z-10 border border-gray-100 dark:border-slate-700 animate-scale-in text-left"
          >
            <div className="bg-[#005BAC] text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Lock size={18} />
                <span className="font-bold text-sm">Modify Account Password</span>
              </div>
              <button type="button" onClick={() => setChangePasswordOpen(false)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-600 dark:text-gray-400">Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password" 
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-1 focus:ring-[#005BAC] outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-600 dark:text-gray-400">New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters" 
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-1 focus:ring-[#005BAC] outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-600 dark:text-gray-400">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password" 
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-1 focus:ring-[#005BAC] outline-none transition"
                  required
                />
              </div>
            </div>
            
            <div className="px-5 py-3.5 bg-gray-50 dark:bg-slate-900/10 border-t border-gray-100 dark:border-slate-700 flex justify-end space-x-2">
              <button 
                type="button"
                onClick={() => setChangePasswordOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-300 dark:hover:bg-slate-650 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
