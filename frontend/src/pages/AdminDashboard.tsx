import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, CheckCircle, FileText, Download, Search, 
  FolderOpen, Archive, Clock, TrendingUp, Calendar, 
  UserPlus, RefreshCw, Star, ChevronDown, ChevronUp, ChevronsUpDown, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { applicationService, authService } from '../services/api';
import type { Application, User } from '../services/mockData';
import { toast } from 'react-toastify';
import { WorkflowModal } from '../components/WorkflowModal';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');
  const reportType = searchParams.get('type');

  const [applications, setApplications] = useState<Application[]>([]);
  
  // Reports specific inputs
  const [reportInputType, setReportInputType] = useState<string>('');
  const [reportInputLocation, setReportInputLocation] = useState<string>('');
  const [reportInputFromDate, setReportInputFromDate] = useState<string>('2026-06-13');
  const [reportInputToDate, setReportInputToDate] = useState<string>('2026-07-13');
  const [generatedReport, setGeneratedReport] = useState<{
    type: string;
    location: string;
    fromDate: string;
    toDate: string;
    headers: string[];
    rows: any[][];
    title: string;
  } | null>(null);

  const handleGenerateReportHelper = (type: string, location: string, fromDateStr: string, toDateStr: string) => {
    if (!type) {
      toast.warning('Please select a Report Type.');
      return;
    }
    if (!location) {
      toast.warning('Please select a Location.');
      return;
    }

    const selectedType = type;
    const reportTitle = 
      selectedType === 'applications' ? 'Application Report' :
      selectedType === 'officers' ? 'Officer Performance Report' :
      selectedType === 'stages' ? 'Stage-wise Workflow Report' :
      selectedType === 'approvals' ? 'Approved Connections Report' :
      selectedType === 'rejections' ? 'Rejected Connections Report' : 'System Audit Report';

    let reportHeaders: string[] = [];
    let reportRows: any[][] = [];

    // Filter applications matching location and date range
    const from = new Date(fromDateStr);
    const to = new Date(toDateStr);
    to.setHours(23, 59, 59, 999);

    const filtered = applications.filter(app => {
      const matchesLocation = location === 'All' || 
        (app.businessArea && app.businessArea.toUpperCase() === location.toUpperCase()) ||
        (app.area && app.area.toUpperCase() === location.toUpperCase()) ||
        (app.city && app.city.toUpperCase() === location.toUpperCase());

      const appDate = app.submittedDate ? new Date(app.submittedDate) : null;
      const matchesDate = !appDate || (appDate >= from && appDate <= to);

      return matchesLocation && matchesDate;
    });

    if (selectedType === 'officers') {
      reportHeaders = ['Officer Name', 'Role Desk', 'Active Queue', 'Average Process Time', 'SLA Adherence'];
      
      const officer1Apps = filtered.filter(a => (a.assignedOfficer || '').includes('Officer 1') && !['Completed', 'Rejected'].includes(a.currentStatus)).length;
      const officer2Apps = filtered.filter(a => (a.assignedOfficer || '').includes('Officer 2') && !['Completed', 'Rejected'].includes(a.currentStatus)).length;
      const officer3Apps = filtered.filter(a => (a.assignedOfficer || '').includes('Officer 3') && !['Completed', 'Rejected'].includes(a.currentStatus)).length;

      reportRows = [
        ['Officer 1 - Doc Verifier', 'Document Verification', `${officer1Apps} Applications`, '1.2 Days', '98%'],
        ['Officer 2 - Tech Surveyor', 'Technical Assessment', `${officer2Apps} Applications`, '2.5 Days', '92%'],
        ['Officer 3 - Approval Officer', 'Demand Note & Approval', `${officer3Apps} Applications`, '1.8 Days', '96%']
      ];
    } else if (selectedType === 'stages') {
      reportHeaders = ['Workflow Verification Stage', 'Applications In Stage', 'SLA Limit'];
      
      const stageCounts: { [key: string]: number } = {};
      filtered.forEach(a => {
        const stage = a.currentStage || 'Application Verification';
        stageCounts[stage] = (stageCounts[stage] || 0) + 1;
      });

      reportRows = [
        ['Application Verification', `${stageCounts['Application Verification'] || 0} Apps`, '2 Days'],
        ['Document Verification', `${stageCounts['Document Verification'] || 0} Apps`, '3 Days'],
        ['Load Survey', `${stageCounts['Load Survey'] || 0} Apps`, '4 Days'],
        ['Land Survey', `${stageCounts['Land Survey'] || 0} Apps`, '3 Days'],
        ['Demand Note', `${stageCounts['Demand Note'] || 0} Apps`, '2 Days']
      ];
    } else if (selectedType === 'approvals') {
      reportHeaders = ['Application No.', 'Customer Name', 'Type', 'Area', 'Stage', 'Approved Date'];
      reportRows = filtered
        .filter(app => ['Completed', 'Approved'].includes(app.currentStatus))
        .map(app => [
          app.applicationNumber,
          app.fullName || app.customerName,
          app.connectionTypeName || 'New Connection',
          app.businessArea || app.area || 'Jamshedpur',
          app.currentStage || 'Approved',
          formatDate(app.lastUpdated)
        ]);
    } else if (selectedType === 'rejections') {
      reportHeaders = ['Application No.', 'Customer Name', 'Type', 'Area', 'Status', 'Last Updated'];
      reportRows = filtered
        .filter(app => app.currentStatus === 'Rejected')
        .map(app => [
          app.applicationNumber,
          app.fullName || app.customerName,
          app.connectionTypeName || 'New Connection',
          app.businessArea || app.area || 'Jamshedpur',
          app.currentStatus,
          formatDate(app.lastUpdated)
        ]);
    } else {
      reportHeaders = ['Application No.', 'Customer Name', 'Type', 'Area', 'Stage', 'Status', 'Submitted Date'];
      reportRows = filtered.map(app => [
        app.applicationNumber,
        app.fullName || app.customerName,
        app.connectionTypeName || 'New Connection',
        app.businessArea || app.area || 'Jamshedpur',
        app.currentStage || 'Application Verification',
        app.currentStatus || 'Submitted',
        formatDate(app.submittedDate)
      ]);
    }

    setGeneratedReport({
      type: selectedType,
      location: location,
      fromDate: fromDateStr,
      toDate: toDateStr,
      headers: reportHeaders,
      rows: reportRows,
      title: reportTitle
    });

    toast.success(`${reportTitle} generated successfully for ${location}.`);
  };

  const handleGenerateReport = () => {
    handleGenerateReportHelper(reportInputType, reportInputLocation, reportInputFromDate, reportInputToDate);
  };

  const handleExportExcel = () => {
    if (!generatedReport) return;
    const headersStr = generatedReport.headers.join(',');
    const rowsStr = generatedReport.rows.map(row => 
      row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const csvContent = `${headersStr}\n${rowsStr}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${generatedReport.type}_report_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${generatedReport.title} exported to Excel/CSV successfully.`);
  };

  const handleDownloadPDF = () => {
    if (!generatedReport) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${generatedReport.title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; }
              h1 { color: #005BAC; margin-bottom: 5px; }
              p { color: #666; font-size: 12px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
              th { background-color: #f5f5f5; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>${generatedReport.title}</h1>
            <p>Generated on ${new Date().toLocaleString()} | Tata UISL Admin Portal</p>
            <p><strong>Location:</strong> ${generatedReport.location} | <strong>From Date:</strong> ${generatedReport.fromDate} | <strong>To Date:</strong> ${generatedReport.toDate}</p>
            <table>
              <thead>
                <tr>
                  ${generatedReport.headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${generatedReport.rows.map(row => `
                  <tr>
                    ${row.map(cell => `<td>${cell}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success(`${generatedReport.title} PDF printable view opened.`);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports' && reportType && applications.length > 0) {
      const type = (reportType === 'Consolidated Reports' || reportType === 'Consolidated') ? 'applications' : reportType;
      setReportInputType(type);
      const loc = reportInputLocation || 'All';
      setReportInputLocation(loc);
      handleGenerateReportHelper(type, loc, reportInputFromDate, reportInputToDate);
    }
  }, [reportType, activeTab, applications.length]);

  useEffect(() => {
    if (applications.length > 0 && activeTab === 'reports') {
      if (!generatedReport) {
        const defaultType = reportInputType || 'applications';
        const defaultLocation = reportInputLocation || 'All';
        setReportInputType(defaultType);
        setReportInputLocation(defaultLocation);
        handleGenerateReportHelper(defaultType, defaultLocation, reportInputFromDate, reportInputToDate);
      }
    }
  }, [applications, activeTab]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Division Filter State
  const [divisionFilter, setDivisionFilter] = useState<'Electricity' | 'Water'>('Electricity');

  // Filter by Division (Electricity vs Water)
  const divisionFilteredApps = applications.filter(app => {
    const name = (app.connectionTypeName || '').toLowerCase();
    const cat = (app.connectionCategory || '').toLowerCase();
    const type = (app.applicationType || '').toLowerCase();
    const isWater = name.includes('water') || cat.includes('water') || type.includes('water');
    return divisionFilter === 'Water' ? isWater : !isWater;
  });

  // Date Range Filter States
  const [dateFilter, setDateFilter] = useState<'this_month' | 'last_7_days' | 'last_30_days' | 'today' | 'last_month' | 'this_year' | 'custom'>('this_year');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Trend Switch State: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  const [trendScale, setTrendScale] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Recent Table State
  const [fromDate, setFromDate] = useState('2026-04-06');
  const [toDate, setToDate] = useState('2026-07-06');
  const [globalSearch, setGlobalSearch] = useState('');
  const [appliedGlobalSearch, setAppliedGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortField, setSortField] = useState<keyof Application>('submittedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // CSV Importer State
  const [csvImporterOpen, setCsvImporterOpen] = useState(false);
  const [importTab, setImportTab] = useState<'upload' | 'paste'>('upload');
  const [csvText, setCsvText] = useState('');
  const [parsedApps, setParsedApps] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Selected row for actions
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);

  // Edit Application Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editForm, setEditForm] = useState<Partial<Application>>({});

  // Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackApp, setFeedbackApp] = useState<Application | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackAttachment, setFeedbackAttachment] = useState<File | null>(null);

  // Fetch applications list on mount
  const fetchApps = async () => {
    try {
      setLoading(true);
      const apps = await applicationService.getApplications();
      setApplications(apps);
      const user = authService.getCurrentUser();
      setCurrentUser(user);
    } catch (e) {
      toast.error('Failed to load applications analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // 1. Date Range Filter Helper
  const getFilteredAppsByDate = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return divisionFilteredApps.filter(app => {
      if (!app.submittedDate) return false;
      const appDate = new Date(app.submittedDate);
      
      switch (dateFilter) {
        case 'today':
          return app.submittedDate.split('T')[0] === todayStr;
        case 'last_7_days': {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return appDate >= sevenDaysAgo;
        }
        case 'last_30_days': {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return appDate >= thirtyDaysAgo;
        }
        case 'this_month':
          return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
        case 'last_month': {
          const lastM = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const lastMYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          return appDate.getMonth() === lastM && appDate.getFullYear() === lastMYear;
        }
        case 'this_year':
          return appDate.getFullYear() === now.getFullYear();
        case 'custom': {
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return appDate >= start && appDate <= end;
        }
        default:
          return true;
      }
    });
  };

  const filteredApps = getFilteredAppsByDate();

  // Metrics Calculations based on Date Filter
  const totalAppsCount = filteredApps.length;
  const openAppsCount = filteredApps.filter(a => !['Completed', 'Rejected', 'Draft'].includes(a.currentStatus)).length;
  const archivedCount = filteredApps.filter(a => ['Correction Required', 'Rejected'].includes(a.currentStatus)).length;
  const closedCount = filteredApps.filter(a => ['Completed', 'Approved'].includes(a.currentStatus)).length;

  // Connection Category distribution counts
  const categoriesList = [
    { name: 'New LT Connection', color: 'bg-blue-500', count: filteredApps.filter(a => a.connectionTypeName === 'Domestic New Connection' || a.connectionCategory === 'Domestic').length },
    { name: 'New HT Connection', color: 'bg-purple-500', count: filteredApps.filter(a => a.connectionTypeName === 'Industrial New Connection' || a.connectionCategory === 'Industrial').length },
    { name: 'Temporary Connection', color: 'bg-orange-500', count: filteredApps.filter(a => a.connectionTypeName?.includes('Temporary') || a.connectionCategory === 'Other').length },
    { name: 'Load Enhancement', color: 'bg-pink-500', count: filteredApps.filter(a => a.connectionTypeName?.includes('Enhancement')).length },
    { name: 'Ownership Transfer', color: 'bg-teal-500', count: filteredApps.filter(a => a.connectionTypeName?.includes('Transfer')).length },
    { name: 'Meter Relocation', color: 'bg-emerald-500', count: filteredApps.filter(a => a.currentStage?.includes('Meter') || a.remarks?.some(r => r.remarks?.includes('reloc'))).length },
    { name: 'Name Change', color: 'bg-indigo-500', count: filteredApps.filter(a => a.connectionTypeName?.includes('Name')).length },
    { name: 'Rate Category Change', color: 'bg-cyan-500', count: 0 },
    { name: 'Permanent Disconnection', color: 'bg-red-500', count: 0 },
    { name: 'Energy Meter Testing', color: 'bg-rose-500', count: 0 }
  ];

  // Doughnut Chart (Workflow status counts)
  const workflowSegments = [
    { name: 'Verification Completed', count: filteredApps.filter(a => a.currentStage !== 'Application Verification' && a.currentStage !== 'Draft').length, color: '#f97316' },
    { name: 'Survey Completed', count: filteredApps.filter(a => !['Application Verification', 'Document Verification'].includes(a.currentStage) && a.currentStage !== 'Draft').length, color: '#22c55e' },
    { name: 'Estimation Completed', count: filteredApps.filter(a => !['Application Verification', 'Document Verification', 'Load Survey', 'Land Survey'].includes(a.currentStage) && a.currentStage !== 'Draft').length, color: '#ef4444' },
    { name: 'Demand Note Completed', count: filteredApps.filter(a => ['Demand Note', 'Connection Approval', 'Job Allotment', 'RFC Entry', 'Energization', 'Move-In', 'Completed'].includes(a.currentStage)).length, color: '#a855f7' },
    { name: 'Job Allotment Completed', count: filteredApps.filter(a => ['Job Allotment', 'RFC Entry', 'Energization', 'Move-In', 'Completed'].includes(a.currentStage)).length, color: '#64748b' }
  ];

  const totalDoughnutCount = workflowSegments.reduce((sum, s) => sum + s.count, 0) || 1;

  // Line Chart monthly trend plotting mock coordinates
  const trendLabels = trendScale === 'weekly' ? ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'] :
                      trendScale === 'quarterly' ? ['Q1', 'Q2', 'Q3', 'Q4'] :
                      trendScale === 'yearly' ? ['2023', '2024', '2025', '2026'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const receivedTrend = [35, 45, 60, 50, 75, 81];
  const approvedTrend = [25, 30, 40, 48, 55, 68];
  const rejectedTrend = [5, 8, 4, 6, 12, 5];
  const completedTrend = [20, 28, 38, 42, 52, 60];

  const getPathD = (data: number[]) => {
    return data.map((val, idx) => {
      const xCoord = 50 + idx * 100;
      const yCoord = 170 - (val / 100) * 150;
      return `${idx === 0 ? 'M' : 'L'} ${xCoord} ${yCoord}`;
    }).join(' ');
  };

  // Recent applications table search, sort & page
  // Recent applications table search, sort & page
  const handleApplyFilters = () => {
    setAppliedGlobalSearch(globalSearch);
    setCurrentPage(1);
  };

  const getFilteredAndSortedTableApps = () => {
    let result = [...divisionFilteredApps];

    // 1. Date Range filters
    if (fromDate) {
      const from = new Date(fromDate);
      result = result.filter(a => a.submittedDate && new Date(a.submittedDate) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter(a => a.submittedDate && new Date(a.submittedDate) <= to);
    }

    // 2. Global Search
    if (appliedGlobalSearch.trim()) {
      const term = appliedGlobalSearch.toLowerCase();
      result = result.filter(a => 
        (a.applicationNumber || '').toLowerCase().includes(term) ||
        (a.existingBpNo || '').toLowerCase().includes(term) ||
        (a.fullName || a.customerName || '').toLowerCase().includes(term) ||
        (a.customerMobile || '').toLowerCase().includes(term) ||
        (a.id || '').toLowerCase().includes(term)
      );
    }

    // 3. In-table local search
    if (tableSearch.trim()) {
      const ts = tableSearch.toLowerCase();
      result = result.filter(a => 
        (a.fullName || a.customerName || '').toLowerCase().includes(ts) ||
        (a.applicationNumber || '').toLowerCase().includes(ts) ||
        (a.currentStatus || '').toLowerCase().includes(ts) ||
        (a.currentStage || '').toLowerCase().includes(ts)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'fullName') {
        aVal = a.fullName || a.customerName || '';
        bVal = b.fullName || b.customerName || '';
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  };

  const tableApps = getFilteredAndSortedTableApps();
  const totalTablePages = Math.ceil(tableApps.length / pageSize) || 1;
  const paginatedTableApps = tableApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Exports
  const handleExportData = (format: 'CSV' | 'PDF') => {
    const headers = ['Application Number', 'Applicant Name', 'BP Number', 'Stage', 'Status', 'Priority', 'Officer', 'Date'];
    const rows = tableApps.map(a => [
      a.applicationNumber,
      a.fullName || a.customerName,
      a.existingBpNo || 'N/A',
      a.currentStage,
      a.currentStatus,
      a.priority,
      a.assignedOfficer,
      a.submittedDate ? a.submittedDate.split('T')[0] : 'N/A'
    ]);

    if (format === 'CSV') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Tata_Applications_Ledger_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('CSV ledger sheet downloaded.');
    } else {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Tata UISL Connections Registry</title>
              <style>
                body { font-family: sans-serif; padding: 40px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: left; }
                th { background-color: #f1f5f9; font-weight: bold; }
              </style>
            </head>
            <body>
              <h2>Tata UISL Applications Registry</h2>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
              <table>
                <thead>
                  <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
              <script>window.onload = function() { window.print(); window.close(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
        toast.success('Print PDF ledger opened.');
      }
    }
  };

  const getPendingAtDetails = (officerName: string) => {
    if (!officerName || officerName === 'Unassigned') {
      return { name: 'Queue Pool', empId: 'N/A', dept: 'System Inbox' };
    }
    if (officerName.includes('Officer 1')) {
      return { name: 'Abhishek Roy', empId: 'EMP8271039', dept: 'Document Audits Desk' };
    } else if (officerName.includes('Officer 2')) {
      return { name: 'Neha Sharma', empId: 'EMP7481920', dept: 'Technical Assessments' };
    } else if (officerName.includes('Officer 3')) {
      return { name: 'Anoop Singh', empId: 'EMP9830114', dept: 'Commercial Release' };
    }
    return { name: officerName, empId: 'EMP1003422', dept: 'Tata Desk Operations' };
  };

  const handlePrintAppInvoice = (app: Application) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Receipt - ${app.applicationNumber}</title>
            <style>
              body { font-family: sans-serif; padding: 30px; }
              .header { border-bottom: 2px solid #005BAC; padding-bottom: 10px; margin-bottom: 20px; }
              .meta { font-size: 12px; margin-bottom: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Tata UISL Connection Request</h2>
              <p>Application Ref: ${app.applicationNumber}</p>
            </div>
            <div class="meta">
              <p><strong>Applicant Name:</strong> ${app.fullName || app.customerName}</p>
              <p><strong>Connection Category:</strong> ${app.connectionTypeName || 'New LT Connection'}</p>
              <p><strong>Load Requirement:</strong> ${app.loadRequirement || 'N/A'}</p>
              <p><strong>Plot Number:</strong> ${app.plotNumber || 'N/A'}</p>
              <p><strong>Stage Status:</strong> ${app.currentStage} (${app.currentStatus})</p>
            </div>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success('Connection invoice printed.');
    }
  };

  // CSV Parse and File Loader
  const handleCSVParse = () => {
    if (!csvText.trim()) {
      toast.warning('Please paste CSV text or upload a CSV file.');
      return;
    }
    
    try {
      const parsed = parseCSV(csvText);
      if (parsed.length === 0) {
        toast.error('Failed to parse CSV. Make sure you include the header row.');
        return;
      }
      setParsedApps(parsed);
      toast.success(`Successfully parsed ${parsed.length} row(s) from CSV! Review the preview below.`);
    } catch (e: any) {
      toast.error('Error parsing CSV: ' + e.message);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const result: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cells: string[] = [];
      let currentCell = '';
      let inQuotes = false;
      
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(currentCell.trim());
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim());
      
      const rowObj: any = {};
      headers.forEach((header, index) => {
        const value = cells[index] ? cells[index].replace(/^["']|["']$/g, '') : '';
        
        if (header.includes('number') || header === 'appl. no.' || header === 'appl. no' || header === 'applicationnumber') {
          rowObj.applicationNumber = value;
        } else if (header.includes('name') || header === 'applicant' || header === 'fullname') {
          rowObj.fullName = value;
          rowObj.customerName = value;
        } else if (header.includes('bp') || header === 'consumer no') {
          rowObj.existingBpNo = value === '-' ? '' : value;
        } else if (header.includes('phone') || header === 'mobile' || header === 'mobile number') {
          rowObj.customerMobile = value;
        } else if (header.includes('email') || header === 'email id') {
          rowObj.customerEmail = value;
        } else if (header.includes('address')) {
          rowObj.addressLine1 = value;
        } else if (header.includes('area') || header === 'business area') {
          rowObj.businessArea = value;
        } else if (header === 'division') {
          rowObj.division = value;
        } else if (header === 'stage') {
          rowObj.currentStage = value;
        } else if (header === 'status') {
          let mappedStatus = value;
          if (value === 'InProgress') mappedStatus = 'Pending Officer 2';
          else if (value === 'Pending') mappedStatus = 'Pending Officer 1';
          else if (value === 'Approved') mappedStatus = 'Pending Officer 3';
          else if (value === 'Submitted') mappedStatus = 'Pending Officer 1';
          rowObj.currentStatus = mappedStatus;
        } else if (header === 'priority') {
          rowObj.priority = value;
        } else if (header.includes('officer') || header === 'assigned officer' || header === 'pending at' || header === 'pending') {
          let officerName = value;
          if (value.includes('Priya') || value.includes('Abhishek')) {
            officerName = 'Officer 1 - Doc Verifier';
          } else if (value.includes('Vibha') || value.includes('Neha')) {
            officerName = 'Officer 2 - Tech Surveyor';
          } else if (value.includes('Rahul') || value.includes('Anoop')) {
            officerName = 'Officer 3 - Approval Officer';
          }
          rowObj.assignedOfficer = officerName;
        } else if (header.includes('service') || header === 'service type' || header === 'applicationtype' || header === 'application type' || header === 'type') {
          rowObj.connectionTypeName = value;
          rowObj.applicationType = value;
        } else if (header.includes('date') || header === 'appl. date' || header === 'submitted date' || header === 'submitteddate') {
          let isoDate = new Date().toISOString();
          try {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
              isoDate = d.toISOString();
            }
          } catch(e) {}
          rowObj.submittedDate = isoDate;
        } else {
          rowObj[header] = value;
        }
      });
      result.push(rowObj);
    }
    return result;
  };

  const handleCsvFileLoad = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Only CSV files are supported.');
      return;
    }
    
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
        toast.success(`CSV file "${file.name}" loaded successfully. Click "Parse CSV" to preview rows.`);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCsvFileLoad(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCsvFileLoad(e.dataTransfer.files[0]);
    }
  };

  const handleImportCommit = async () => {
    if (parsedApps.length === 0) {
      toast.warning('No parsed rows to import.');
      return;
    }
    
    try {
      setIsImporting(true);
      const res = await applicationService.importApplications(parsedApps);
      toast.success(res.message || `Successfully imported ${res.count} applications!`);
      setParsedApps([]);
      setCsvText('');
      setUploadedFileName('');
      setCsvImporterOpen(false);
      fetchApps();
    } catch (e: any) {
      toast.error('Import failed: ' + e.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingApp) return;
    
    try {
      await applicationService.updateApplication(editingApp.id, editForm);
      toast.success(`Successfully updated details for Application ${editingApp.applicationNumber}`);
      setEditModalOpen(false);
      setEditingApp(null);
      fetchApps();
    } catch (e: any) {
      toast.error('Update failed: ' + e.message);
    }
  };

  const handleSaveFeedback = async () => {
    if (!feedbackApp) return;
    if (!feedbackComment.trim()) {
      toast.warning('Additional Comment is required.');
      return;
    }

    try {
      await applicationService.addApplicationRemark(feedbackApp.id, feedbackComment);
      if (feedbackAttachment) {
        toast.success(`Successfully uploaded attachment: ${feedbackAttachment.name}`);
      }
      toast.success(`Feedback added successfully for Application ${feedbackApp.applicationNumber}`);
      setFeedbackModalOpen(false);
      setFeedbackApp(null);
      setFeedbackComment('');
      setFeedbackAttachment(null);
      fetchApps();
    } catch (e: any) {
      toast.error('Failed to save feedback: ' + e.message);
    }
  };

  // Pending Officer tasks mock list
  const officerTasks = [
    { name: 'Officer 1 - Doc Verifier', pending: 5, overdue: 1, completed: 4, time: '1.2 Days', status: 'Near Due' },
    { name: 'Officer 2 - Tech Surveyor', pending: 3, overdue: 0, completed: 5, time: '2.5 Days', status: 'On Track' },
    { name: 'Officer 3 - Approval Officer', pending: 2, overdue: 2, completed: 3, time: '1.8 Days', status: 'Overdue' }
  ];

  // Compact notification summary
  const notificationsSummary = [
    { title: 'New Application Submitted', desc: 'A residential request TATA-98150 by Priya Sharma is pending audit.', priority: 'High', time: '10 mins ago' },
    { title: 'SLA Breach Warning', desc: 'HT Connection request at Bistupur has exceeded 4-day assessment limits.', priority: 'High', time: '1 hr ago' },
    { title: 'Correction Resubmitted', desc: 'Applicant Rajesh Kumar has uploaded ownership proof document.', priority: 'Medium', time: '3 hrs ago' }
  ];

  // Render Reports Center Tab View
  if (activeTab === 'reports') {
    const reportTitle = generatedReport?.title || 'Consolidated Report';
    const reportHeaders = generatedReport?.headers || [];
    const reportRows = generatedReport?.rows || [];

    return (
      <div className="space-y-6 text-left">
        {/* Banner header */}
        <div className="bg-gray-900 text-white p-6 rounded-2xl border border-gray-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-xl font-extrabold flex items-center tracking-tight">
              Reports Analytics Center <span className="ml-2 text-base">📊</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">Select location and date range to filter connection request reports.</p>
          </div>
          {generatedReport && (
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button 
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg shadow transition"
              >
                Export PDF
              </button>
            </div>
          )}
        </div>

        {/* Beautiful Application Report selectors card matching user's mockup */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700/60 shadow-sm overflow-hidden">
          {/* Card Header (solid brand color, uppercase, bold) */}
          <div className="bg-[#4b3e9e] text-white px-5 py-3.5 font-bold text-sm tracking-wide uppercase text-left">
            Application Report
          </div>
          
          {/* Card Body */}
          <div className="p-5 flex flex-col">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              
              {/* Report Type selector */}
              <div className="flex flex-col space-y-1.5 flex-1 min-w-[200px] text-left">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportInputType}
                  onChange={(e) => setReportInputType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-750 rounded-lg text-xs font-semibold text-gray-750 dark:text-white outline-none focus:border-[#4b3e9e] focus:ring-1 focus:ring-[#4b3e9e]"
                >
                  <option value="">--Select--</option>
                  <option value="applications">Applications Aggregate</option>
                  <option value="officers">Officer Productivity Log</option>
                  <option value="stages">Stage-wise Workflow Status</option>
                  <option value="approvals">Approved Connection List</option>
                  <option value="rejections">Rejected Backlog</option>
                </select>
              </div>

              {/* Location selector */}
              <div className="flex flex-col space-y-1.5 flex-1 min-w-[200px] text-left">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportInputLocation}
                  onChange={(e) => setReportInputLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-750 rounded-lg text-xs font-semibold text-gray-750 dark:text-white outline-none focus:border-[#4b3e9e] focus:ring-1 focus:ring-[#4b3e9e]"
                >
                  <option value="">--Select--</option>
                  <option value="All">All Locations</option>
                  <option value="JAMSHEDPUR">Jamshedpur</option>
                  <option value="ADITYAPUR">Adityapur</option>
                  <option value="RANCHI">Ranchi</option>
                </select>
              </div>

              {/* From Date selector */}
              <div className="flex flex-col space-y-1.5 text-left w-full md:w-auto">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={reportInputFromDate}
                  onChange={(e) => setReportInputFromDate(e.target.value)}
                  className="w-full md:w-40 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-750 rounded-lg text-xs font-semibold text-gray-750 dark:text-white outline-none focus:border-[#4b3e9e] focus:ring-1 focus:ring-[#4b3e9e]"
                />
              </div>

              {/* To Date selector */}
              <div className="flex flex-col space-y-1.5 text-left w-full md:w-auto">
                <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={reportInputToDate}
                  onChange={(e) => setReportInputToDate(e.target.value)}
                  className="w-full md:w-40 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-750 rounded-lg text-xs font-semibold text-gray-755 dark:text-white outline-none focus:border-[#4b3e9e] focus:ring-1 focus:ring-[#4b3e9e]"
                />
              </div>

              {/* Generate Report Button */}
              <button
                onClick={handleGenerateReport}
                className="px-5 py-2 bg-[#4b3e9e] hover:bg-[#3b2e8e] text-white text-xs font-bold rounded-lg shadow transition-all self-end h-[36px] w-full md:w-auto mt-2 md:mt-0"
              >
                Generate Report
              </button>

              {/* Export to Excel Button (green matching mockup) */}
              <button
                onClick={handleExportExcel}
                disabled={!generatedReport}
                className={`px-5 py-2 text-white text-xs font-bold rounded-lg shadow transition-all self-end h-[36px] w-full md:w-auto mt-2 md:mt-0 ${
                  generatedReport 
                    ? 'bg-[#82C793] hover:bg-[#6eb280] cursor-pointer font-bold' 
                    : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed font-bold'
                }`}
              >
                Export to excel
              </button>
            </div>
            
            {/* Scroll Indicator Arrows at Bottom corners */}
            <div className="flex justify-between items-center mt-4 pt-2.5 border-t border-gray-100 dark:border-slate-700/60 text-gray-400">
              <button className="p-1 hover:text-gray-650 dark:hover:text-gray-200 transition">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 hover:text-gray-650 dark:hover:text-gray-200 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Report Results */}
        {generatedReport ? (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-3">
              <h2 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">{reportTitle} compiled</h2>
              <span className="text-[10px] bg-blue-50 text-[#005BAC] dark:bg-slate-900/60 dark:text-blue-200 px-2 py-0.5 rounded-full font-bold">
                {reportRows.length} Rows Found
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-55 dark:bg-slate-700 text-gray-450 dark:text-gray-400 font-bold uppercase">
                  <tr>
                    {reportHeaders.map((h, i) => <th key={i} className="py-3 px-4">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
                  {reportRows.length > 0 ? (
                    reportRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/20">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-3.5 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={reportHeaders.length} className="py-8 text-center text-gray-400 font-semibold">
                        No connection requests match the selected parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 text-center flex flex-col items-center justify-center space-y-3">
            <span className="text-4xl">📋</span>
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">No Report Generated</h3>
            <p className="text-xs text-gray-400 max-w-md">
              Please select a Report Type and Location, specify the date range, and click <strong>Generate Report</strong> to fetch live connection data.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005BAC]"></div>
        <p className="text-xs text-gray-400 font-semibold">Loading Tata UISL Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-[1600px] mx-auto">
      
      {/* 1. Header (Sticky bar search, date filter, profile summary) */}
      <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3 text-left">
          <div className="bg-[#005BAC] text-white p-2.5 rounded-xl shadow-md">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Tata UISL Workflows Dashboard</h1>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Welcome, {currentUser?.fullName || 'Administrator'} | Real-time monitoring & diagnostics.</p>
          </div>
        </div>

        {/* Date Filter & Division controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Division Selector */}
          <div className="relative">
            <select
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white dark:bg-slate-900 border border-[#005BAC] dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#005BAC] shadow-sm"
              style={{ minWidth: '180px' }}
            >
              <option value="Electricity">Electricity Connection</option>
              <option value="Water">Water Connection</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <ChevronDown size={14} className="text-gray-800 dark:text-white" />
            </div>
          </div>

          <div className="flex items-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 space-x-2 text-xs">
            <Calendar className="text-gray-400 h-4 w-4" />
            <select
              value={dateFilter}
              onChange={(e: any) => setDateFilter(e.target.value)}
              className="bg-transparent border-0 outline-none font-bold text-gray-700 dark:text-gray-300 pr-4"
            >
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex items-center space-x-2 text-xs">
              <input 
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-xs"
              />
              <span className="text-gray-400">to</span>
              <input 
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. Top Summary Cards (Grid 4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total New Applications */}
        <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 p-5 rounded-2xl shadow-sm border border-blue-200/50 dark:border-blue-900/30 hover:scale-[1.01] transition duration-200 flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black text-blue-700 dark:text-blue-300 tracking-wider">Total Applications</span>
            <span className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg text-blue-600 dark:text-blue-300"><FolderOpen size={16} /></span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black block tracking-tight">{totalAppsCount}</span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center">
              <TrendingUp size={12} className="mr-1" /> ↑ 12% This Month
            </span>
          </div>
        </div>

        {/* Card 2: Open Applications */}
        <div className="bg-purple-50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-100 p-5 rounded-2xl shadow-sm border border-purple-200/50 dark:border-purple-900/30 hover:scale-[1.01] transition duration-200 flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black text-purple-700 dark:text-purple-300 tracking-wider">Current Open Tasks</span>
            <span className="bg-purple-100 dark:bg-purple-900/40 p-1.5 rounded-lg text-purple-600 dark:text-purple-300"><Clock size={16} /></span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black block tracking-tight">{openAppsCount}</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Active verification queues</span>
          </div>
        </div>

        {/* Card 3: Returned / Rejected / Hold */}
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100 p-5 rounded-2xl shadow-sm border border-rose-200/50 dark:border-rose-900/30 hover:scale-[1.01] transition duration-200 flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black text-rose-700 dark:text-rose-300 tracking-wider">Holds & Rejections</span>
            <span className="bg-rose-100 dark:bg-rose-900/40 p-1.5 rounded-lg text-rose-600 dark:text-rose-300"><Archive size={16} /></span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black block tracking-tight">{archivedCount}</span>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">Corrections required</span>
          </div>
        </div>

        {/* Card 4: Closed / Completed */}
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100 p-5 rounded-2xl shadow-sm border border-emerald-200/50 dark:border-emerald-900/30 hover:scale-[1.01] transition duration-200 flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-300 tracking-wider">Completed / Closed</span>
            <span className="bg-emerald-100 dark:bg-emerald-900/40 p-1.5 rounded-lg text-emerald-600 dark:text-emerald-300"><CheckCircle size={16} /></span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-black block tracking-tight">{closedCount}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">SLA release complete</span>
          </div>
        </div>

      </div>

      {/* 3. Middle Section: Reports Panel (Left) | Category Analytics (Center) | Doughnut status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Detailed Reports Panel (Left 3 columns) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 flex flex-col justify-between shadow-sm min-h-[300px]">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Detailed Reports</h3>
            <span className="text-5xl font-black text-[#005BAC] dark:text-tata-blue-light block">{totalAppsCount}</span>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold">
              The total number of connection applications received within the selected audit period.
            </p>
          </div>

          <div className="pt-6 flex justify-center text-gray-200 dark:text-slate-700">
            <FileText size={110} strokeWidth={1} className="text-[#005BAC]/15" />
          </div>
        </div>

        {/* Category Analytics (Center 5 columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col">
          <div className="border-b border-gray-100 dark:border-slate-700 pb-3 flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Application Categories</h3>
            <span className="text-[9px] text-[#005BAC] font-black uppercase">Volume distribution</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-4 pr-1 scrollbar-thin">
            {categoriesList.map((cat, i) => {
              const percentage = totalAppsCount ? Math.min(100, Math.round((cat.count / totalAppsCount) * 100)) : 0;
              return (
                <div key={i} className="text-xs space-y-1">
                  <div className="flex justify-between font-bold text-gray-700 dark:text-gray-300">
                    <span className="truncate max-w-[200px]">{cat.name}</span>
                    <span className="font-mono text-[11px]">{cat.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-750 h-2 rounded-full overflow-hidden">
                    <div className={`${cat.color} h-full rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Doughnut status (Right 4 columns) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
          <div className="border-b border-gray-100 dark:border-slate-700 pb-3 flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Workflow Stages Doughnut</h3>
            <span className="text-[9px] text-gray-400 font-bold uppercase">Milestones</span>
          </div>

          <div className="flex items-center justify-around space-x-2">
            {/* SVG Doughnut */}
            <div className="relative h-28 w-28 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" className="dark:stroke-slate-750" />
                {(() => {
                  let accumulatedPercent = 0;
                  return workflowSegments.map((segment, idx) => {
                    const percent = totalDoughnutCount ? (segment.count / totalDoughnutCount) * 100 : 0;
                    if (percent === 0) return null;
                    const strokeDash = `${percent} ${100 - percent}`;
                    const strokeOffset = 100 - accumulatedPercent;
                    accumulatedPercent += percent;
                    return (
                      <circle 
                        key={idx}
                        cx="18" 
                        cy="18" 
                        r="15.915" 
                        fill="transparent" 
                        stroke={segment.color} 
                        strokeWidth="3.2" 
                        strokeDasharray={strokeDash} 
                        strokeDashoffset={strokeOffset} 
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute flex flex-col text-center">
                <span className="text-base font-black text-gray-900 dark:text-white leading-none">{totalAppsCount}</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">Tasks</span>
              </div>
            </div>

            {/* Legends */}
            <div className="text-[9.5px] space-y-1.5 text-left max-w-[160px] truncate">
              {workflowSegments.map((segment, idx) => {
                const percent = totalDoughnutCount ? Math.round((segment.count / totalDoughnutCount) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center space-x-1.5 font-semibold">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: segment.color }}></span>
                    <span className="text-gray-600 dark:text-gray-400 truncate max-w-[100px]" title={segment.name}>{segment.name}</span>
                    <span className="font-bold font-mono text-gray-800 dark:text-white">{segment.count} ({percent}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 4. Trends Line Chart (Grid block) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-slate-700 pb-3">
          <div>
            <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center">
              <TrendingUp size={14} className="mr-2 text-tata-blue" /> Application Volume Release Trends
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Compare connection received capacity versus approved completion logs.</p>
          </div>

          {/* Trend scale selector buttons */}
          <div className="flex bg-gray-55 dark:bg-slate-900/60 p-1 rounded-xl text-[10px] font-black uppercase mt-3 sm:mt-0 space-x-1 border border-gray-200/50 dark:border-slate-700/50">
            {['weekly', 'monthly', 'quarterly', 'yearly'].map((scale: any) => (
              <button
                key={scale}
                onClick={() => setTrendScale(scale)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  trendScale === scale 
                    ? 'bg-white dark:bg-slate-800 text-[#005BAC] dark:text-tata-blue-light shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {scale}
              </button>
            ))}
          </div>
        </div>

        {/* Custom line chart SVG */}
        <div className="h-64 w-full pt-4">
          <svg viewBox="0 0 600 200" className="w-full h-full">
            {/* Grid Lines */}
            <line x1="50" y1="20" x2="550" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-750" />
            <line x1="50" y1="70" x2="550" y2="70" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-750" />
            <line x1="50" y1="120" x2="550" y2="120" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-slate-750" />
            <line x1="50" y1="170" x2="550" y2="170" stroke="#e2e8f0" strokeWidth="1" className="dark:stroke-slate-700" />

            {/* Received Line (Blue) */}
            <path 
              d={getPathD(receivedTrend)} 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
            {/* Approved Line (Green) */}
            <path 
              d={getPathD(approvedTrend)} 
              fill="none" 
              stroke="#22c55e" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
            {/* Rejected Line (Red) */}
            <path 
              d={getPathD(rejectedTrend)} 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="1.8" 
              strokeLinecap="round"
            />
            {/* Completed Line (Purple) */}
            <path 
              d={getPathD(completedTrend)} 
              fill="none" 
              stroke="#a855f7" 
              strokeWidth="1.8" 
              strokeLinecap="round"
            />

            {/* Plot Dots */}
            <circle cx="550" cy={170 - (receivedTrend[5] / 100) * 150} r="3.5" fill="#3b82f6" />
            <circle cx="550" cy={170 - (approvedTrend[5] / 100) * 150} r="3.5" fill="#22c55e" />

            {/* Labels */}
            {trendLabels.map((lbl, idx) => {
              const xCoord = 50 + idx * 100;
              return (
                <text key={idx} x={xCoord} y="190" fontSize="8" fill="#94a3b8" textAnchor="middle" fontWeight="bold">
                  {lbl}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Legend description */}
        <div className="flex justify-center space-x-6 text-[10px] font-black uppercase text-gray-500 pt-2">
          <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span> Received</div>
          <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span> Approved</div>
          <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span> Rejected</div>
        </div>
      </div>
      {/* 5. Recent Applications Table (Search, export, pagination actions) */}
      <div className="space-y-4">

        {/* Mock CSV Application Data Importer */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm overflow-hidden transition-all duration-350">
          
          {/* Header Toggle */}
          <div 
            onClick={() => setCsvImporterOpen(!csvImporterOpen)}
            className="p-5 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750/30 transition-colors"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-[#4B3E9E] dark:text-cyan-300">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Mock CSV Data Importer</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Bulk register mock connections and database records via CSV raw copy-paste or upload.</p>
              </div>
            </div>
            <div className="p-1 text-gray-450 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full">
              {csvImporterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {/* Collapsible Importer Body */}
          {csvImporterOpen && (
            <div className="p-6 border-t border-gray-100 dark:border-slate-700/60 bg-gray-50/20 dark:bg-slate-900/10 space-y-4 text-xs">
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-150 dark:border-slate-750 pb-2 mb-4 space-x-6">
                <button 
                  onClick={() => setImportTab('upload')}
                  className={`pb-2 text-xs font-bold transition-all relative ${importTab === 'upload' ? 'text-[#4B3E9E] dark:text-cyan-300 border-b-2 border-[#4B3E9E] dark:border-cyan-300' : 'text-gray-400 hover:text-gray-650'}`}
                >
                  Upload & Drop CSV
                </button>
                <button 
                  onClick={() => setImportTab('paste')}
                  className={`pb-2 text-xs font-bold transition-all relative ${importTab === 'paste' ? 'text-[#4B3E9E] dark:text-cyan-300 border-b-2 border-[#4B3E9E] dark:border-cyan-300' : 'text-gray-400 hover:text-gray-650'}`}
                >
                  Paste CSV Text
                </button>
              </div>

              {/* Info panel */}
              <div className="p-4 bg-[#4B3E9E]/5 dark:bg-indigo-950/20 border border-[#4B3E9E]/10 rounded-xl space-y-2 text-left text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="font-bold text-[#4B3E9E] dark:text-cyan-300">CSV Formatter Guidelines:</p>
                <p>Include a header row. Common matching columns are: <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono font-bold text-red-500 text-[10px]">Application Number, Applicant Name, BP Number, Phone, Email, Address, Business Area, Division, Stage, Status, Priority, Assigned Officer</code></p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mt-1">Example CSV Content:</p>
                <pre className="p-3 bg-white dark:bg-slate-900 rounded-lg font-mono text-[10px] text-gray-500 overflow-x-auto block border border-gray-100 dark:border-slate-800">
                  {"Application Number,Applicant Name,BP Number,Phone,Email,Address,Business Area,Division,Stage,Status,Priority,Assigned Officer\n"}
                  {"TATA-260626021792,Abhishek Roy,10023910,8271039154,abhishek@tata.com,Bistupur Area Jamshedpur,JAMSHEDPUR,Electricity,Application Verification,Pending Officer 1,High,Officer 1 - Doc Verifier\n"}
                  {"TATA-260626021815,Muskan Gupta,20034812,9142041131,muskan@tata.com,Kadma Road Jamshedpur,JAMSHEDPUR,Water,Application Verification,Pending Officer 2,Medium,Officer 2 - Tech Surveyor"}
                </pre>
              </div>

              {/* Tab Content 1: Upload File Drag & Drop Zone */}
              {importTab === 'upload' && (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-3 transition-all relative min-h-[160px] ${
                    dragActive 
                      ? 'border-[#4B3E9E] dark:border-cyan-300 bg-indigo-50/20 dark:bg-indigo-950/15' 
                      : 'border-gray-250 dark:border-slate-700 bg-white/40 dark:bg-slate-900/10'
                  }`}
                >
                  <div className={`p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-full transition-transform ${dragActive ? 'scale-110' : ''}`}>
                    <Download size={26} className="text-[#4B3E9E] dark:text-cyan-300 transform rotate-180" />
                  </div>
                  
                  <div className="text-center">
                    <p className="font-bold text-gray-800 dark:text-white">
                      {uploadedFileName ? `Selected File: ${uploadedFileName}` : 'Drag and drop your CSV file here, or click Browse'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Supports: `.csv` files (Max 5MB)</p>
                  </div>

                  <label className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-[#4B3E9E] dark:text-cyan-300 font-bold rounded-lg cursor-pointer transition shadow-sm">
                    Browse Files
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Tab Content 2: Textarea paste */}
              {importTab === 'paste' && (
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] text-gray-400 font-bold uppercase">Paste CSV Text Content</label>
                  <textarea
                    rows={6}
                    placeholder="Paste your CSV row data here, starting with headers..."
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl outline-none font-mono text-[11px] text-gray-800 dark:text-white focus:border-[#4B3E9E] placeholder-gray-400"
                  />
                </div>
              )}

              {/* Action buttons footer */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                <div>
                  {uploadedFileName && (
                    <span className="text-[11px] font-bold text-green-600 dark:text-green-400 flex items-center">
                      <span className="mr-1 text-xs">✓</span> File loaded: {uploadedFileName}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2 self-end">
                  <button
                    onClick={() => {
                      setCsvText('');
                      setParsedApps([]);
                      setUploadedFileName('');
                    }}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-bold transition"
                  >
                    Clear Importer
                  </button>
                  <button
                    onClick={handleCSVParse}
                    className="px-5 py-2 bg-[#4B3E9E] hover:bg-indigo-700 text-white rounded-lg font-bold transition shadow-sm"
                  >
                    Parse CSV Data
                  </button>
                </div>
              </div>

              {/* Parsed applications preview */}
              {parsedApps.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-slate-700/60 text-left space-y-3">
                  <h4 className="font-extrabold uppercase text-[10px] text-gray-400 tracking-wider">Parsed Rows Preview ({parsedApps.length})</h4>
                  <div className="overflow-x-auto border border-gray-150 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-xs text-left min-w-[800px]">
                      <thead className="bg-gray-55/60 dark:bg-slate-900/60 text-gray-400 font-bold uppercase text-[9px]">
                        <tr>
                          <th className="py-2.5 px-3">Appl No.</th>
                          <th className="py-2.5 px-3">Applicant Name</th>
                          <th className="py-2.5 px-3">Mobile No</th>
                          <th className="py-2.5 px-3">BP Number</th>
                          <th className="py-2.5 px-3">Area</th>
                          <th className="py-2.5 px-3">Stage</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800/40 text-[11px] text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-slate-900/20">
                        {parsedApps.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td className="py-2 px-3 font-mono font-bold text-indigo-650 dark:text-cyan-300">{row.applicationNumber || 'AUTO-GEN'}</td>
                            <td className="py-2 px-3 font-bold">{row.fullName || row.customerName || 'N/A'}</td>
                            <td className="py-2 px-3 font-mono">{row.customerMobile || 'N/A'}</td>
                            <td className="py-2 px-3 font-mono font-semibold">{row.existingBpNo || '-'}</td>
                            <td className="py-2 px-3 uppercase">{row.businessArea || 'JAMSHEDPUR'}</td>
                            <td className="py-2 px-3 text-[#4B3E9E] dark:text-indigo-400 font-semibold">{row.currentStage || 'Verification'}</td>
                            <td className="py-2 px-3">
                              <span className="px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-750 font-bold uppercase text-[8px]">
                                {row.currentStatus || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      disabled={isImporting}
                      onClick={handleImportCommit}
                      className="px-6 py-2.5 bg-green-650 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition disabled:opacity-40"
                    >
                      {isImporting ? 'Importing Applications...' : 'Commit Import to Registry'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
        
        {/* Top horizontal filter bar */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="text-gray-700 dark:text-gray-300">From:</span>
            <input 
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none bg-white dark:bg-slate-900 text-gray-700 dark:text-white focus:border-[#005BAC] text-center w-40 font-semibold"
            />

            <span className="text-gray-700 dark:text-gray-300">To:</span>
            <input 
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 outline-none bg-white dark:bg-slate-900 text-gray-700 dark:text-white focus:border-[#005BAC] text-center w-40 font-semibold"
            />

            <input 
              type="text"
              placeholder="Search by Appl No/ BPNo/ Applicant Name/ Phone"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="flex-1 min-w-[200px] border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 outline-none bg-white dark:bg-slate-900 text-gray-700 dark:text-white focus:border-[#005BAC]"
            />

            <button 
              onClick={handleApplyFilters}
              className="p-2.5 bg-[#007BFF] hover:bg-blue-600 text-white rounded-lg shadow-sm flex items-center justify-center w-11 h-11 transition-all"
              title="Search"
            >
              <Search size={16} />
            </button>

            <button 
              onClick={() => handleExportData('CSV')}
              className="p-2.5 bg-[#007BFF] hover:bg-blue-600 text-white rounded-lg shadow-sm flex items-center justify-center w-11 h-11 transition-all"
              title="Download CSV"
            >
              <Download size={16} />
            </button>
          </div>

          {/* Entries size selection and in-table search bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 text-xs text-gray-655 dark:text-gray-400 font-semibold">
            <div className="flex items-center space-x-1">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-700 dark:text-white outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>

            <div className="flex items-center space-x-2 mt-3 md:mt-0">
              <span>Search:</span>
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-[#cccccc] dark:border-slate-700 rounded px-2.5 py-1 bg-white dark:bg-slate-900 text-gray-700 dark:text-white outline-none w-52 focus:border-[#005BAC]"
              />
            </div>
          </div>
        </div>

        {/* Enterprise Data Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 overflow-hidden text-xs">
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] relative">
            <table className="w-full text-xs text-left border-collapse table-auto">
              
              {/* Deep Purple header panel */}
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase sticky top-0 z-20 shadow-sm border-b border-gray-200/20 text-xs">
                <tr>
                  <th className="py-4 px-3 w-16 cursor-pointer hover:bg-[#3b2e8e] transition text-center" onClick={() => handleSort('id')}>
                    <div className="flex items-center justify-center space-x-1">
                      <span>#</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-44 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('applicationNumber')}>
                    <div className="flex items-center space-x-1">
                      <span>Appl. No.</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-36 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('submittedDate')}>
                    <div className="flex items-center space-x-1">
                      <span>Appl. Date</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-48 cursor-pointer hover:bg-[#3b2e8e] transition">
                    <div className="flex items-center space-x-1">
                      <span>Service Type</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-40 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center space-x-1">
                      <span>Applicant</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-40 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('existingBpNo')}>
                    <div className="flex items-center space-x-1">
                      <span>BP/Consumer No</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-40 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('businessArea')}>
                    <div className="flex items-center space-x-1">
                      <span>Business Area</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-72 cursor-pointer hover:bg-[#3b2e8e] transition">
                    <div className="flex items-center space-x-1">
                      <span>Address</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-36 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('customerMobile')}>
                    <div className="flex items-center space-x-1">
                      <span>Phone No</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-48 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('currentStage')}>
                    <div className="flex items-center space-x-1">
                      <span>Stage</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-60 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('assignedOfficer')}>
                    <div className="flex items-center space-x-1">
                      <span>Pending At</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-36 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('currentStatus')}>
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-4 px-4 w-28 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <span>Action</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Table Rows */}
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
                {paginatedTableApps.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-16 text-center text-gray-400 font-black">
                      No registry rows match your filtering criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedTableApps.map((app, idx) => {
                    const serialNo = (currentPage - 1) * pageSize + idx + 1;
                    const isExpanded = expandedRowId === app.id;
                    const pendingDetails = getPendingAtDetails(app.assignedOfficer);

                    // Helper to format Pending At column
                    const getPendingAtText = () => {
                      if (app.applicationNumber === '260626021792' || app.fullName === 'Abhishek') {
                        return 'Abhishek - (8271039154)';
                      }
                      return `${pendingDetails.name} - (${app.phoneNumber || app.customerMobile || '8271039154'})`;
                    };

                    return (
                      <React.Fragment key={app.id}>
                        <tr className={`hover:bg-blue-50/15 dark:hover:bg-slate-750/30 transition-colors odd:bg-gray-50/35 even:bg-white dark:odd:bg-slate-800/40 dark:even:bg-slate-850 ${isExpanded ? 'bg-[#005BAC]/5' : ''}`}>
                          
                          {/* S.No */}
                          <td className="py-3 px-3 text-center text-gray-400 font-bold">{serialNo}</td>

                          {/* Application Number */}
                          <td className="py-3 px-4 font-mono font-black text-[#005BAC] dark:text-tata-blue-light">
                            {app.applicationNumber}
                          </td>

                          {/* Application Date */}
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                            {formatDate(app.submittedDate)}
                          </td>

                          {/* Service Type */}
                          <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            {app.connectionTypeName || app.applicationType || 'New Connection'}
                          </td>

                          {/* Applicant Name */}
                          <td className="py-3 px-4 font-bold text-gray-750 dark:text-gray-200">
                            {app.fullName || app.customerName}
                          </td>

                          {/* BP / Consumer Number */}
                          <td className="py-3 px-4 font-mono font-bold text-gray-600 dark:text-gray-350">
                            {app.existingBpNo || '-'}
                          </td>

                          {/* Business Area */}
                          <td className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 uppercase">
                            {app.businessArea || 'JAMSHEDPUR'}
                          </td>

                          {/* Address */}
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 whitespace-normal break-words leading-relaxed font-semibold">
                            {app.addressLine1} {app.addressLine2 || ''}
                          </td>

                          {/* Mobile Number */}
                          <td className="py-3 px-4 font-mono font-semibold text-gray-600">
                            {app.phoneNumber || app.customerMobile || 'N/A'}
                          </td>

                          {/* Current Stage */}
                          <td className="py-3 px-4 font-semibold text-indigo-650 dark:text-indigo-400">
                            {app.currentStage}
                          </td>

                          {/* Pending At (Officer) */}
                          <td className="py-3 px-4 text-left leading-normal font-semibold text-gray-600 dark:text-gray-450">
                            {getPendingAtText()}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 font-semibold text-gray-750 dark:text-gray-200">
                            {app.currentStatus}
                          </td>

                          {/* Action Toggle Chevron */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : app.id)}
                              className="p-1.5 hover:bg-gray-150 dark:hover:bg-slate-700 rounded-full transition-all text-gray-500 dark:text-gray-300 inline-flex items-center justify-center w-8 h-8"
                              title={isExpanded ? "Collapse Row" : "Expand Row"}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>

                        </tr>

                        {/* Collapsible expanded detail view row */}
                        {isExpanded && (
                          <tr className="bg-[#f8f9fa] dark:bg-slate-900/60 transition-all">
                            <td colSpan={13} className="p-6 border-y border-gray-250 dark:border-slate-700">
                              <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8 text-xs text-left">
                                
                                {/* Business Area / Division purple card */}
                                <div className="bg-[#4B3E9E] dark:bg-indigo-950 text-white p-5 rounded-2xl flex justify-between items-center w-72 min-h-[120px] shadow-sm">
                                  <div className="text-left space-y-1">
                                    <span className="text-white/80 text-[10px] uppercase font-bold block border-b border-white/20 pb-0.5">Business Area</span>
                                    <span className="text-cyan-300 font-extrabold text-xs uppercase block pt-0.5">{app.businessArea || 'JAMSHEDPUR'}</span>
                                  </div>
                                  <div className="text-left space-y-1 border-l border-white/20 pl-6 min-h-[50px] flex flex-col justify-center">
                                    <span className="text-white/80 text-[10px] uppercase font-bold block border-b border-white/20 pb-0.5">Division</span>
                                    <span className="text-cyan-300 font-extrabold text-xs block pt-0.5">{app.division || 'Electricity'}</span>
                                  </div>
                                </div>

                                {/* Mobile / Email details */}
                                <div className="flex flex-col justify-between py-1 text-left min-w-[200px] min-h-[100px]">
                                  <div>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Mobile</span>
                                    <span className="text-gray-900 dark:text-white font-bold text-xs block mt-1">
                                      {app.phoneNumber || app.customerMobile || '8271039154'}
                                    </span>
                                  </div>
                                  <div className="mt-4">
                                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Email ID</span>
                                    <span className="text-gray-900 dark:text-white font-bold text-xs block mt-1">
                                      {app.customerEmail || 'abhishek.krgupta@yahoo.in'}
                                    </span>
                                  </div>
                                </div>

                                {/* Address wrap */}
                                <div className="flex-1 py-1 text-left min-h-[100px]">
                                  <span className="text-gray-400 text-[10px] font-bold uppercase block">Address</span>
                                  <span className="text-gray-900 dark:text-white font-semibold text-xs block mt-1 leading-relaxed whitespace-normal break-words">
                                    {app.addressLine1} {app.addressLine2 || ''}
                                  </span>
                                  {app.remarks && app.remarks.map((rem, rIdx) => (
                                    <p key={rIdx} className="text-gray-500 mt-2 text-xs font-semibold leading-relaxed">
                                      {rem.remarks}
                                    </p>
                                  ))}
                                </div>

                                {/* Actions stack */}
                                <div className="flex flex-col space-y-2 justify-center min-w-[180px]">
                                  <Link 
                                    to={`/admin/applications?id=${app.id}`}
                                    className="bg-[#5CB85C] hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full text-xs text-center transition duration-200 shadow-sm"
                                  >
                                    History
                                  </Link>
                                  
                                  <button 
                                    onClick={() => {
                                      setFeedbackApp(app);
                                      setFeedbackComment('');
                                      setFeedbackAttachment(null);
                                      setFeedbackModalOpen(true);
                                    }}
                                    className="bg-[#F0AD4E] hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    Feedback
                                  </button>

                                  <Link 
                                    to={`/customer/track?id=${app.id}`}
                                    className="bg-[#0275D8] hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full text-xs text-center transition duration-200 shadow-sm"
                                  >
                                    Track Application
                                  </Link>

                                  <button 
                                    onClick={() => handlePrintAppInvoice(app)}
                                    className="bg-[#E5A900] hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    Print Application
                                  </button>

                                  <button 
                                    onClick={() => {
                                      setEditingApp(app);
                                      setEditForm({ ...app });
                                      setEditModalOpen(true);
                                    }}
                                    className="bg-[#6f42c1] hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    Edit Details
                                  </button>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalTablePages > 1 && (
            <div className="p-4 bg-gray-55/65 dark:bg-slate-900/30 border-t border-gray-150 dark:border-slate-750 flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold">Showing page {currentPage} of {totalTablePages}</span>
              <div className="flex space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg font-bold disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalTablePages}
                  onClick={() => setCurrentPage(p => Math.min(totalTablePages, p + 1))}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 6. Pending Tasks | Officer Performance | Workflow Status list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Officer Workload Grid */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col space-y-4">
          <div className="border-b border-gray-100 dark:border-slate-700 pb-3 text-left">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Officer Desks Workload</h3>
          </div>

          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 font-bold uppercase border-b border-gray-100 pb-2">
                  <th className="pb-2">Officer</th>
                  <th className="pb-2">Queue</th>
                  <th className="pb-2">Avg Time</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-55/40 text-gray-700 dark:text-gray-300">
                {officerTasks.map((off, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-bold">{off.name}</td>
                    <td className="py-2.5 font-bold font-mono">{off.pending} ({off.overdue} Overdue)</td>
                    <td className="py-2.5">{off.time}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase ${
                        off.status === 'On Track' ? 'bg-green-50 text-green-700' :
                        off.status === 'Near Due' ? 'bg-yellow-50 text-yellow-750' : 'bg-red-50 text-red-700'
                      }`}>
                        {off.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* compact notification alerts summary */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col space-y-4">
          <div className="border-b border-gray-100 dark:border-slate-700 pb-3 text-left flex justify-between items-center">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Alerts & Notifications</h3>
            <span className="h-4.5 w-4.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black">3</span>
          </div>

          <div className="space-y-3.5 text-xs text-left">
            {notificationsSummary.map((notif, i) => (
              <div key={i} className="flex justify-between items-start space-x-2">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-800 dark:text-white block text-[11px]">{notif.title}</span>
                  <span className="text-[10px] text-gray-450 block leading-tight">{notif.desc}</span>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-[8px] font-black uppercase text-gray-400 block">{notif.time}</span>
                  <span className="px-1.5 py-0.2 rounded bg-red-50 text-red-600 text-[7.5px] font-black uppercase mt-1 inline-block">{notif.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick action buttons shortcut cards */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col space-y-4">
          <div className="border-b border-gray-100 dark:border-slate-700 pb-3 text-left">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link 
              to="/admin/applications"
              className="p-3 bg-gray-55/60 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-750/30 rounded-xl font-bold text-gray-700 dark:text-gray-250 flex items-center space-x-2 transition border border-gray-100 dark:border-slate-700/50"
            >
              <UserPlus size={14} className="text-[#005BAC]" />
              <span>Assign Officer</span>
            </Link>
            <Link 
              to="/admin?tab=reports"
              className="p-3 bg-gray-55/60 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-750/30 rounded-xl font-bold text-gray-700 dark:text-gray-250 flex items-center space-x-2 transition border border-gray-100 dark:border-slate-700/50"
            >
              <FileText size={14} className="text-purple-500" />
              <span>Generate Report</span>
            </Link>
            <button 
              onClick={() => handleExportData('CSV')}
              className="p-3 bg-gray-55/60 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-750/30 rounded-xl font-bold text-gray-700 dark:text-gray-250 flex items-center space-x-2 transition text-left border border-gray-100 dark:border-slate-700/50"
            >
              <Download size={14} className="text-green-500" />
              <span>Export Panel</span>
            </button>
            <button 
              onClick={() => {
                setSelectedApp(applications[0] || null);
                setWorkflowModalOpen(true);
              }}
              className="p-3 bg-gray-55/60 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-750/30 rounded-xl font-bold text-gray-700 dark:text-gray-250 flex items-center space-x-2 transition text-left border border-gray-100 dark:border-slate-700/50"
            >
              <RefreshCw size={14} className="text-orange-500" />
              <span>Configure stage</span>
            </button>
          </div>
        </div>

      </div>

      {/* 7. Bottom Performance Metrics KPI Cards */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
        <div className="border-b border-gray-100 dark:border-slate-700 pb-3 text-left">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Business Compliance & SLA KPIs</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
          
          <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-750 text-xs">
            <span className="text-[9px] text-gray-400 font-bold block uppercase">Avg Approval Time</span>
            <span className="text-base font-black text-gray-800 dark:text-white mt-1 block">3.2 Days</span>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-750 text-xs">
            <span className="text-[9px] text-gray-400 font-bold block uppercase">SLA Compliance</span>
            <span className="text-base font-black text-green-600 dark:text-green-400 mt-1 block">96.4%</span>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-750 text-xs">
            <span className="text-[9px] text-gray-400 font-bold block uppercase">Officer Productivity</span>
            <span className="text-base font-black text-gray-800 dark:text-white mt-1 block">8.4 / Day</span>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-750 text-xs">
            <span className="text-[9px] text-gray-400 font-bold block uppercase">Daily Release Rate</span>
            <span className="text-base font-black text-gray-800 dark:text-white mt-1 block">92.0%</span>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-750 text-xs">
            <span className="text-[9px] text-gray-400 font-bold block uppercase">CSAT Satisfaction</span>
            <span className="text-base font-black text-yellow-600 mt-1 block flex items-center">4.7 <Star size={12} fill="currentColor" className="ml-1" /></span>
          </div>

          <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-750 text-xs">
            <span className="text-[9px] text-gray-400 font-bold block uppercase">Avg Processing Time</span>
            <span className="text-base font-black text-gray-800 dark:text-white mt-1 block">1.8 Days</span>
          </div>

        </div>
      </div>

      {/* Workflow Assignment modal */}
      {selectedApp && (
        <WorkflowModal
          isOpen={workflowModalOpen}
          onClose={() => {
            setWorkflowModalOpen(false);
            setSelectedApp(null);
          }}
          applicationId={selectedApp.id}
          applicationNumber={selectedApp.applicationNumber}
          currentStage={selectedApp.currentStage}
          onSuccess={fetchApps}
        />
      )}

      {/* Edit Application Modal */}
      {editModalOpen && editingApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn text-xs">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-slate-700/60 flex justify-between items-center bg-[#4B3E9E] text-white">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">Edit Application Details</h3>
                <p className="text-[10px] text-white/80 mt-0.5 font-mono font-bold">Modifying: {editingApp.applicationNumber}</p>
              </div>
              <button 
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingApp(null);
                }}
                className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-left">
              
              {/* Section 1: Customer Info */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase text-[10px] text-[#4B3E9E] dark:text-cyan-300 tracking-wider border-b border-gray-100 dark:border-slate-700/60 pb-1">1. Customer & Personal Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Applicant Name</label>
                    <input 
                      type="text"
                      value={editForm.fullName || ''}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value, customerName: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Phone Number</label>
                    <input 
                      type="text"
                      value={editForm.customerMobile || ''}
                      onChange={(e) => setEditForm({ ...editForm, customerMobile: e.target.value, phoneNumber: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Email Address</label>
                    <input 
                      type="email"
                      value={editForm.customerEmail || ''}
                      onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value, emailId: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">BP / Consumer Number</label>
                    <input 
                      type="text"
                      value={editForm.existingBpNo || ''}
                      onChange={(e) => setEditForm({ ...editForm, existingBpNo: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Identity Card Type</label>
                    <select
                      value={editForm.identityCardType || ''}
                      onChange={(e) => setEditForm({ ...editForm, identityCardType: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    >
                      <option value="">Select ID Type</option>
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="PAN Card">PAN Card</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Identity Card Number</label>
                    <input 
                      type="text"
                      value={editForm.identityCardNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, identityCardNumber: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Connection Type & Geography */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase text-[10px] text-[#4B3E9E] dark:text-cyan-300 tracking-wider border-b border-gray-100 dark:border-slate-700/60 pb-1">2. Connection Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Service Type</label>
                    <input 
                      type="text"
                      value={editForm.connectionTypeName || ''}
                      onChange={(e) => setEditForm({ ...editForm, connectionTypeName: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Business Area</label>
                    <input 
                      type="text"
                      value={editForm.businessArea || ''}
                      onChange={(e) => setEditForm({ ...editForm, businessArea: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E] uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Division</label>
                    <input 
                      type="text"
                      value={editForm.division || ''}
                      onChange={(e) => setEditForm({ ...editForm, division: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Voltage Requirement</label>
                    <input 
                      type="text"
                      value={editForm.voltageRequirement || ''}
                      onChange={(e) => setEditForm({ ...editForm, voltageRequirement: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Load Requirement</label>
                    <input 
                      type="text"
                      value={editForm.loadRequirement || ''}
                      onChange={(e) => setEditForm({ ...editForm, loadRequirement: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Property Type</label>
                    <input 
                      type="text"
                      value={editForm.propertyType || ''}
                      onChange={(e) => setEditForm({ ...editForm, propertyType: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Address Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase text-[10px] text-[#4B3E9E] dark:text-cyan-300 tracking-wider border-b border-gray-100 dark:border-slate-700/60 pb-1">3. Premises Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Address Line 1</label>
                    <input 
                      type="text"
                      value={editForm.addressLine1 || ''}
                      onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Address Line 2</label>
                    <input 
                      type="text"
                      value={editForm.addressLine2 || ''}
                      onChange={(e) => setEditForm({ ...editForm, addressLine2: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">City</label>
                    <input 
                      type="text"
                      value={editForm.city || ''}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">State</label>
                    <input 
                      type="text"
                      value={editForm.state || ''}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Pincode</label>
                    <input 
                      type="text"
                      value={editForm.pinCode || ''}
                      onChange={(e) => setEditForm({ ...editForm, pinCode: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Workflow States */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase text-[10px] text-[#4B3E9E] dark:text-cyan-300 tracking-wider border-b border-gray-100 dark:border-slate-700/60 pb-1">4. Workflow Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Current Stage</label>
                    <select
                      value={editForm.currentStage || ''}
                      onChange={(e) => setEditForm({ ...editForm, currentStage: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    >
                      <option value="Application Verification">Application Verification</option>
                      <option value="Document Verification">Document Verification</option>
                      <option value="Technical Assessment">Technical Assessment</option>
                      <option value="Load Survey">Load Survey</option>
                      <option value="Load Survey Approval">Load Survey Approval</option>
                      <option value="Estimate Drafting">Estimate Drafting</option>
                      <option value="Estimate Approval">Estimate Approval</option>
                      <option value="Bill Verification">Bill Verification</option>
                      <option value="Demand Note Issued">Demand Note Issued</option>
                      <option value="Job Allotment">Job Allotment</option>
                      <option value="RFC Entry">RFC Entry</option>
                      <option value="Energization">Energization</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Workflow Status</label>
                    <select
                      value={editForm.currentStatus || ''}
                      onChange={(e) => setEditForm({ ...editForm, currentStatus: e.target.value as any })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Pending Officer 1">Pending Officer 1</option>
                      <option value="Pending Officer 2">Pending Officer 2</option>
                      <option value="Pending Officer 3">Pending Officer 3</option>
                      <option value="InProgress">InProgress</option>
                      <option value="Correction Required">Correction Required</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Priority</label>
                    <select
                      value={editForm.priority || ''}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as any })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase">Assigned Officer</label>
                    <select
                      value={editForm.assignedOfficer || ''}
                      onChange={(e) => setEditForm({ ...editForm, assignedOfficer: e.target.value })}
                      className="w-full p-2.5 bg-gray-50/50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none text-gray-800 dark:text-white focus:border-[#4B3E9E]"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Officer 1 - Doc Verifier">Officer 1 - Doc Verifier</option>
                      <option value="Officer 2 - Tech Surveyor">Officer 2 - Tech Surveyor</option>
                      <option value="Officer 3 - Approval Officer">Officer 3 - Approval Officer</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-gray-50 dark:bg-slate-900/40 border-t border-gray-100 dark:border-slate-700/60 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingApp(null);
                }}
                className="px-5 py-2 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-[#4B3E9E] hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition"
              >
                Save Connection Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalOpen && feedbackApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700 animate-fadeIn text-left text-sm text-gray-800 dark:text-gray-200">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700/60 flex justify-between items-center bg-white dark:bg-slate-800">
              <h3 className="text-base font-bold text-gray-850 dark:text-white">Feedback</h3>
              <button 
                onClick={() => {
                  setFeedbackModalOpen(false);
                  setFeedbackApp(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              
              {/* Additional Comment field */}
              <div className="space-y-2">
                <label className="block text-gray-705 dark:text-gray-300 font-bold">
                  Additional Comment<span className="text-red-500 font-black ml-0.5">*</span>
                </label>
                <textarea 
                  rows={3}
                  placeholder="Enter comments or remarks here..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              {/* Attachment field */}
              <div className="space-y-2">
                <label className="block text-gray-705 dark:text-gray-300 font-bold">
                  Attachment
                </label>
                <div className="w-full flex items-center p-2 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900">
                  <input 
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFeedbackAttachment(e.target.files[0]);
                      }
                    }}
                    className="block text-xs text-slate-500
                      file:mr-4 file:py-1.5 file:px-4
                      file:rounded file:border-0
                      file:text-xs file:font-semibold
                      file:bg-slate-100 file:text-slate-700
                      hover:file:bg-slate-200"
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setFeedbackModalOpen(false);
                  setFeedbackApp(null);
                }}
                className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-full text-xs font-semibold shadow-sm transition"
              >
                Close
              </button>
              <button
                onClick={handleSaveFeedback}
                className="px-6 py-2 bg-[#007bff] hover:bg-blue-600 text-white rounded-full text-xs font-semibold shadow-sm transition"
              >
                Add Feedback
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
