import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, Download, FileText, Check, X, Eye, 
  ChevronDown, ChevronUp, ChevronsUpDown, Printer, FileEdit,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { applicationService, documentService } from '../services/api';
import type { Application, ApplicationDocument } from '../services/mockData';
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

const mapSidebarTypeToDbValue = (sidebarType: string): string => {
  switch (sidebarType) {
    case 'Provisional Connection': return 'New Power Connection LT';
    case 'Permanent LT Connection': return 'New Power Connection LT';
    case 'Permanent HT Connection': return 'New Power Connection HT';
    case 'Temporary Connection': return 'Temporary Power Connection';
    case 'New Water Connection': return 'Water Connection';
    case 'WPC Order Instruction': return 'WPC Order';
    case 'WPC NewRequest': return 'WPC Request';
    case 'Separate Connection': return 'Separate Connection';
    case 'Load Enhancement Request': return 'Load Change-Enhancement';
    case 'Load Reduction Request': return 'Load Change-Reduction';
    case 'Consumer Name Change Request': return 'Name Change';
    case 'Ownership Transfer Legal Heir Request': return 'Ownership Transfer';
    case 'Change of Consumer Category / Shifting of Premises / Shifting of Meter and Switch Requests': return 'Meter Relocation';
    case 'Job Allotment': return 'Job Allotment';
    case 'RFC TR Details': return 'RFC TR';
    case 'Energizations': return 'Energizations';
    case 'Move In': return 'Move In';
    case 'Dismantling': return 'Dismantling';
    case 'Move Out': return 'Move Out';
    case 'Feedback Form': return 'Feedback Form';
    case 'Re Route Applications': return 'Re Route';
    case 'Water Tanker': return 'Water Tanker';
    case 'PrintApplicationForSurvey': return 'Survey Receipt';
    case 'Money Receipt': return 'Money Receipt';
    case 'PrintApplicationForEstimate': return 'Estimate Receipt';
    case 'Consolidated Reports': return 'Consolidated';
    case 'Activity Log': return 'Activity Log';
    case 'Regretted Applications': return 'Regretted';
    case 'Hold Applications': return 'Hold';
    case 'Archived Application': return 'Archived';
    default: return sidebarType;
  }
};

export const AdminApplications: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedReceiptAppId, setSelectedReceiptAppId] = useState<number>(1);
  const [energizationDivision, setEnergizationDivision] = useState<'Electricity' | 'Water'>('Electricity');
  const [moveInDivision, setMoveInDivision] = useState<'Electricity' | 'Water'>('Electricity');
  const [expandedEnergizationId, setExpandedEnergizationId] = useState<number | null>(null);

  // Material Master State
  const [materials, setMaterials] = useState<any[]>([
    { id: 1, category: 'Cable Services', description: 'Barricading with Fencing Net', uom: 'M', materialCost: 0.00, costJsr: 15.00, costSk: 16.00, createdDate: '23-Dec-2022', active: true },
    { id: 2, category: 'Cable Services', description: 'CABLE,TRENCH CUTTING & B.FILLING WITHOUT LAYING', uom: 'M', materialCost: 0.00, costJsr: 107.00, costSk: 113.00, createdDate: '23-Dec-2022', active: true },
    { id: 3, category: 'Cable Services', description: 'CUTTING OF HARD ROCK FOR CABLE LAYING', uom: 'M3', materialCost: 0.00, costJsr: 408.00, costSk: 429.00, createdDate: '23-Dec-2022', active: true },
    { id: 4, category: 'Cable Services', description: 'Dismantling -Abv Ground,11KV, 95-240 sqmm 3XC Cbl 1/L', uom: 'R.Mtr', materialCost: 0.00, costJsr: 43.00, costSk: 46.00, createdDate: '23-Dec-2022', active: true },
    { id: 5, category: 'Cable Services', description: 'DISMENTALING .R.C.C UPTO 9 THICK', uom: 'M3', materialCost: 0.00, costJsr: 640.00, costSk: 672.00, createdDate: '23-Dec-2022', active: true },
    { id: 6, category: 'Cable Services', description: 'DISMETALiNG PLAIN CONCRETE UPTO 9THICK', uom: 'M3', materialCost: 0.00, costJsr: 456.00, costSk: 479.00, createdDate: '23-Dec-2022', active: true },
    { id: 7, category: 'Cable Services', description: 'DIV of 33KV 1/L 3C Upto 400SQMM CAB.LAY.', uom: 'M', materialCost: 0.00, costJsr: 259.00, costSk: 272.00, createdDate: '23-Dec-2022', active: true },
    { id: 8, category: 'Cable Services', description: 'Diversion of 11KV, 95-240 sqmm 3XC Cable 1/L', uom: 'R.Mtr', materialCost: 0.00, costJsr: 295.00, costSk: 310.00, createdDate: '23-Dec-2022', active: true },
    { id: 9, category: 'Cable Services', description: 'Diversion U/G .2/L.HT cable above 70-300', uom: 'R.Mtr', materialCost: 0.00, costJsr: 359.00, costSk: 377.00, createdDate: '23-Dec-2022', active: true },
    { id: 10, category: 'Cable Services', description: 'Earthwork excavation in all type of soil', uom: 'M3', materialCost: 0.00, costJsr: 307.00, costSk: 323.00, createdDate: '23-Dec-2022', active: true },
    { id: 11, category: 'Transformer Parts', description: '100 KVA Distribution Transformer', uom: 'Nos', materialCost: 155000.00, costJsr: 4500.00, costSk: 4800.00, createdDate: '15-Jan-2023', active: true },
    { id: 12, category: 'Transformer Parts', description: '250 KVA Distribution Transformer', uom: 'Nos', materialCost: 285000.00, costJsr: 8500.00, costSk: 9000.00, createdDate: '15-Jan-2023', active: true },
    { id: 13, category: 'Meter Services', description: 'LT Single Phase Smart Energy Meter', uom: 'Nos', materialCost: 2450.00, costJsr: 150.00, costSk: 160.00, createdDate: '10-Feb-2023', active: true },
    { id: 14, category: 'Meter Services', description: 'LT Three Phase Smart Energy Meter', uom: 'Nos', materialCost: 5600.00, costJsr: 350.00, costSk: 380.00, createdDate: '10-Feb-2023', active: true },
    { id: 15, category: 'Conductor Services', description: 'AAAC Conductor 50 sq mm', uom: 'M', materialCost: 45.00, costJsr: 12.00, costSk: 13.00, createdDate: '01-Mar-2023', active: true }
  ]);

  const [materialActiveFilter, setMaterialActiveFilter] = useState(true);
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialPageSize, setMaterialPageSize] = useState(10);
  const [materialPage, setMaterialPage] = useState(1);

  // Edit Material States
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUom, setEditUom] = useState('');
  const [editMaterialCost, setEditMaterialCost] = useState('');
  const [editCostJsr, setEditCostJsr] = useState('');
  const [editCostSk, setEditCostSk] = useState('');

  // Add Material States
  const [addCategory, setAddCategory] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addUom, setAddUom] = useState('');
  const [addMaterialCost, setAddMaterialCost] = useState('');
  const [addCostJsr, setAddCostJsr] = useState('');
  const [addCostSk, setAddCostSk] = useState('');

  // Feeder Line Charge Master State
  const [feeders, setFeeders] = useState<any[]>([
    { id: 1, businessArea: 'Adityapur/ Saraikela', load: 1, charges: 0, status: 'Active', rule: '(1 x 0)' },
    { id: 2, businessArea: 'Adityapur/ Saraikela', load: 2, charges: 0, status: 'Active', rule: '(2 x 0)' },
    { id: 3, businessArea: 'Adityapur/ Saraikela', load: 3, charges: 1000, status: 'Active', rule: '(3 x 0)' },
    { id: 4, businessArea: 'Adityapur/ Saraikela', load: 4, charges: 2000, status: 'Active', rule: '(4 x 0)' },
    { id: 5, businessArea: 'Adityapur/ Saraikela', load: 5, charges: 3500, status: 'Active', rule: '(5 x 0)' },
    { id: 6, businessArea: 'Adityapur/ Saraikela', load: 6, charges: 5000, status: 'Active', rule: '(6 x 0)' },
    { id: 7, businessArea: 'Adityapur/ Saraikela', load: 7, charges: 6500, status: 'Active', rule: '(2 x 0) + (2 x 1000)+1500*3' },
    { id: 8, businessArea: 'Adityapur/ Saraikela', load: 8, charges: 8000, status: 'Active', rule: '(8 x 0)' },
    { id: 9, businessArea: 'Adityapur/ Saraikela', load: 9, charges: 9500, status: 'Active', rule: '(9 x 0)' },
    { id: 10, businessArea: 'Adityapur/ Saraikela', load: 10, charges: 11000, status: 'Active', rule: '(10 x 0)' }
  ]);
  const [feederSearch, setFeederSearch] = useState('');
  const [editingFeederId, setEditingFeederId] = useState<number | null>(null);

  // Form states for Feeder Master Add/Edit
  const [formFeederBusinessArea, setFormFeederBusinessArea] = useState('');
  const [formFeederLoad, setFormFeederLoad] = useState('');
  const [formFeederCharges, setFormFeederCharges] = useState('');
  const [formFeederStatus, setFormFeederStatus] = useState('Active');
  const [formFeederRule, setFormFeederRule] = useState('');

  // Energy Security Charge Master State
  const [securities, setSecurities] = useState<any[]>([
    { id: 1, businessArea: 'Adityapur/ Saraikela', category: 'DOMESTIC 1 kW', uom: 'Rs / kW', charges: 700, status: 'Active' },
    { id: 2, businessArea: 'Adityapur/ Saraikela', category: 'DOMESTIC Addition of 1 kW', uom: 'Rs / kW', charges: 1500, status: 'Active' },
    { id: 3, businessArea: 'Adityapur/ Saraikela', category: 'DOMESTIC DSHT', uom: 'Rs / kVA', charges: 2000, status: 'Active' },
    { id: 4, businessArea: 'Adityapur/ Saraikela', category: 'COMMERCIAL', uom: 'Rs / kW', charges: 2500, status: 'Active' },
    { id: 5, businessArea: 'Adityapur/ Saraikela', category: 'LT INDUSTRIAL Single Shift', uom: 'Rs/KVA', charges: 5000, status: 'Active' },
    { id: 6, businessArea: 'Adityapur/ Saraikela', category: 'LT INDUSTRIAL Double Shift', uom: 'Rs/KVA', charges: 7500, status: 'Active' },
    { id: 7, businessArea: 'Adityapur/ Saraikela', category: 'LT INDUSTRIAL Continuous Shift', uom: 'Rs/KVA', charges: 10000, status: 'Active' },
    { id: 8, businessArea: 'Adityapur/ Saraikela', category: 'HT INDUSTRIAL Single Shift', uom: 'Rs/KVA', charges: 6000, status: 'Active' },
    { id: 9, businessArea: 'Adityapur/ Saraikela', category: 'HT INDUSTRIAL Double Shift', uom: 'Rs/KVA', charges: 9000, status: 'Active' }
  ]);
  const [securitySearch, setSecuritySearch] = useState('');
  const [editingSecurityId, setEditingSecurityId] = useState<number | null>(null);

  // Form states for Energy Security Add/Edit
  const [formSecurityBusinessArea, setFormSecurityBusinessArea] = useState('');
  const [formSecurityCategory, setFormSecurityCategory] = useState('');
  const [formSecurityUom, setFormSecurityUom] = useState('');
  const [formSecurityCharges, setFormSecurityCharges] = useState('');
  const [formSecurityStatus, setFormSecurityStatus] = useState('Active');

  const isCustomList = [
    'Load Enhancement Request',
    'Load Reduction Request',
    'Consumer Name Change Request',
    'Ownership Transfer Legal Heir Request',
    'Change of Consumer Category / Shifting of Premises / Shifting of Meter and Switch Requests',
    'Change of Consumer Category',
    'Permanent Disconnection',
    'Energy Meter Testing'
  ].includes(searchParams.get('type') || '');

  const isRegrettedList = searchParams.get('type') === 'Regretted Applications';
  const isHoldList = searchParams.get('type') === 'Hold Applications';
  const isArchivedList = searchParams.get('type') === 'Archived Application';
  const isExceptionList = isRegrettedList || isHoldList || isArchivedList;

  const getEditDetailsUrlType = () => {
    const t = searchParams.get('type');
    if (t === 'Load Reduction Request') return 'reduction';
    if (t === 'Consumer Name Change Request') return 'namechange';
    if (t === 'Ownership Transfer Legal Heir Request') return 'ownershiptransfer';
    if (t === 'Change of Consumer Category / Shifting of Premises / Shifting of Meter and Switch Requests' || t === 'Change of Consumer Category') return 'categorychange';
    if (t === 'Permanent Disconnection') return 'disconnection';
    if (t === 'Energy Meter Testing') return 'metertest';
    return 'enhancement';
  };

  const getCustomCardDetails = (app: Application) => {
    const t = searchParams.get('type');
    if (t === 'Load Reduction Request') {
      return {
        lbl1: 'Existing load',
        val1: '5.00 kW',
        lbl2: 'Reduced load',
        val2: app.loadRequirement ? `${app.loadRequirement} kW` : '1.00 kW',
        div: loadReductionDivision
      };
    }
    if (t === 'Consumer Name Change Request') {
      return {
        lbl1: 'Existing name',
        val1: app.fullName || app.customerName || 'N/A',
        lbl2: 'Proposed name',
        val2: app.ownerOrgName || 'Abhishek Gupta',
        div: nameChangeDivision
      };
    }
    if (t === 'Ownership Transfer Legal Heir Request') {
      return {
        lbl1: 'Current owner',
        val1: app.fullName || app.customerName || 'N/A',
        lbl2: 'New Owner / Legal Heir',
        val2: app.ownerOrgName || 'Abhishek Gupta',
        div: ownershipTransferDivision
      };
    }
    if (t === 'Change of Consumer Category / Shifting of Premises / Shifting of Meter and Switch Requests' || t === 'Change of Consumer Category') {
      return {
        lbl1: 'Current category',
        val1: 'Domestic',
        lbl2: 'Proposed category',
        val2: 'Commercial',
        div: categoryChangeDivision
      };
    }
    if (t === 'Permanent Disconnection') {
      return {
        lbl1: 'Meter Number',
        val1: app.surveyNumber || 'MTR-98124',
        lbl2: 'Disconnection Reason',
        val2: app.loadRequirement || 'Shifting Premises',
        div: permanentDisconnectionDivision
      };
    }
    if (t === 'Energy Meter Testing') {
      return {
        lbl1: 'Meter Sl No.',
        val1: app.surveyNumber || '1234567890',
        lbl2: 'Reason for Test',
        val2: app.loadRequirement || 'Burnt out',
        div: energyMeterTestingDivision
      };
    }
    return {
      lbl1: 'Existing sanction load',
      val1: '1.00 kW',
      lbl2: 'Additional load',
      val2: app.loadRequirement ? `${app.loadRequirement} kW` : '1.00 kW',
      div: loadEnhancementDivision
    };
  };

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Provisional Connection division state (Electricity vs Water)
  const [provisionalDivision, setProvisionalDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Permanent LT Connection division state (Electricity vs Water)
  const [permanentLtDivision, setPermanentLtDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Permanent HT Connection division state (Electricity vs Water)
  const [permanentHtDivision, setPermanentHtDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Temporary Connection division state (Electricity vs Water)
  const [temporaryDivision, setTemporaryDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Separate Connection division state (Electricity vs Water)
  const [separateDivision, setSeparateDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Load Enhancement Request division state (Electricity vs Water)
  const [loadEnhancementDivision, setLoadEnhancementDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Load Reduction Request division state (Electricity vs Water)
  const [loadReductionDivision, setLoadReductionDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Name Change Request division state (Electricity vs Water)
  const [nameChangeDivision, setNameChangeDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Ownership Transfer Request division state (Electricity vs Water)
  const [ownershipTransferDivision, setOwnershipTransferDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Category Change Request division state (Electricity vs Water)
  const [categoryChangeDivision, setCategoryChangeDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Permanent Disconnection division state (Electricity vs Water)
  const [permanentDisconnectionDivision, setPermanentDisconnectionDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Energy Meter Testing division state (Electricity vs Water)
  const [energyMeterTestingDivision, setEnergyMeterTestingDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Regretted Applications division state (Electricity vs Water)
  const [regrettedDivision, setRegrettedDivision] = useState<'Electricity' | 'Water'>('Electricity');

  // Viewing letter modal state
  const [viewingLetterApp, setViewingLetterApp] = useState<Application | null>(null);

  // Feedback Dialog Modal states
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackApp, setFeedbackApp] = useState<Application | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackFile, setFeedbackFile] = useState<File | null>(null);

  // Customer Details Modal states
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerConnectionType, setCustomerConnectionType] = useState<'Electricity' | 'Water'>('Electricity');
  const [customerModalTab, setCustomerModalTab] = useState<'Existing' | 'New'>('Existing');
  
  // Existing Customer fields
  const [customerUsername, setCustomerUsername] = useState('');
  
  // New Customer fields
  const [newCustName, setNewCustName] = useState('');
  const [newCustAadhar, setNewCustAadhar] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustArea, setNewCustArea] = useState('');



  // Date Range states (Default: first of month to current date)
  const [fromDate, setFromDate] = useState('2026-04-02');
  const [toDate, setToDate] = useState('2026-07-02');

  // Global search input & Table inner search
  const [globalSearch, setGlobalSearch] = useState('');
  const [appliedGlobalSearch, setAppliedGlobalSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');

  // Table show entries & page number
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sorting
  const [sortField, setSortField] = useState<keyof Application>('submittedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Advanced collapsible filters states
  const filterStatuses: string[] = [];
  const filterStages: string[] = [];
  const filterPriorities: string[] = [];
  const filterBusinessAreas: string[] = [];
  const filterServiceTypes: string[] = [];
  const filterConnectionTypes: string[] = [];
  const filterOfficers: string[] = [];
  const filterDistricts: string[] = [];

  // Clickable summary statistics status selection
  const selectedStatFilter = '';

  // Row expansion state
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);



  // Reassignment & workflow remarks states inside drawer
  const [officerName, setOfficerName] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [drawerTab, setDrawerTab] = useState<'Overview' | 'Timeline' | 'Audit' | 'Documents'>('Overview');

  // Rejection & Preview file states
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [docRejectionReason, setDocRejectionReason] = useState('');
  const [previewingDoc, setPreviewingDoc] = useState<ApplicationDocument | null>(null);

  const fetchApps = async () => {
    try {
      const apps = await applicationService.getApplications();
      setApplications(apps);

      // Check URL query parameters for selected application id
      const queryId = searchParams.get('id');
      if (queryId) {
        const found = apps.find(a => a.id === queryId);
        if (found) {
          setSelectedApp(found);
          setOfficerName(found.assignedOfficer);
          setDrawerOpen(true);
        }
      }
    } catch (err) {
      toast.error('Error loading applications list');
    } finally {
      setLoading(false);
    }
  };

  // Debounce hook for globalSearch
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedGlobalSearch(globalSearch);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [globalSearch]);

  // Setup interval fetch
  useEffect(() => {
    fetchApps();
    const interval = setInterval(() => {
      fetchApps();
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [searchParams]);

  // Perform search / Filter applies
  const handleApplyFilters = () => {
    setAppliedGlobalSearch(globalSearch);
    setCurrentPage(1);
  };





  // Filter application database based on: date pickers, global search, summary cards, and advanced multi-select dropdowns
  const getFilteredAndSortedApps = () => {
    let result = [...applications];

    // 0. Query parameter filtering (stage / type / status)
    const stageParam = searchParams.get('stage');
    const typeParam = searchParams.get('type');
    
    if (stageParam) {
      result = result.filter(a => a.currentStage && a.currentStage.toLowerCase() === stageParam.toLowerCase());
    }
    
    if (typeParam) {
      if (typeParam === 'Provisional Connection') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isProvisional = name.includes('provisional') || typeName.includes('provisional') || name.includes('new power connection lt') || name.includes('power connection lt');
          if (!isProvisional) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return provisionalDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Permanent LT Connection') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isLt = name.includes('lt') || typeName.includes('lt') || cat.includes('lt') || name.includes('domestic new connection') || typeName.includes('domestic new connection');
          const isProvisional = name.includes('provisional') || typeName.includes('provisional');
          if (!isLt || isProvisional) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return permanentLtDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Permanent HT Connection') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isHt = name.includes('ht') || typeName.includes('ht') || cat.includes('ht');
          const isProvisional = name.includes('provisional') || typeName.includes('provisional');
          if (!isHt || isProvisional) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return permanentHtDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Temporary Connection') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isTemporary = name.includes('temporary') || typeName.includes('temporary') || cat.includes('temporary') || cat === 'other';
          if (!isTemporary) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return temporaryDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Separate Connection') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isSeparate = name.includes('separate') || typeName.includes('separate');
          if (!isSeparate) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return separateDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Load Enhancement Request') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isEnhancement = name.includes('enhancement') || typeName.includes('enhancement') || name.includes('load enhancement');
          if (!isEnhancement) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return loadEnhancementDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Load Reduction Request') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isReduction = name.includes('reduction') || typeName.includes('reduction') || name.includes('load reduction');
          if (!isReduction) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return loadReductionDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Consumer Name Change Request') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isNameChange = name.includes('name change') || typeName.includes('name change') || name.includes('namechange');
          if (!isNameChange) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return nameChangeDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Ownership Transfer Legal Heir Request') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isOwnership = name.includes('ownership') || typeName.includes('ownership') || name.includes('transfer');
          if (!isOwnership) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return ownershipTransferDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Change of Consumer Category / Shifting of Premises / Shifting of Meter and Switch Requests' || typeParam === 'Change of Consumer Category') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isCategoryChange = name.includes('category') || typeName.includes('category') || name.includes('relocation') || name.includes('shifting');
          if (!isCategoryChange) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return categoryChangeDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Permanent Disconnection') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isDisconnection = name.includes('disconnection') || typeName.includes('disconnection') || name.includes('dismantling');
          if (!isDisconnection) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return permanentDisconnectionDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Energy Meter Testing') {
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const isMeterTest = name.includes('meter test') || typeName.includes('meter test') || typeName.includes('metertest') || typeName.includes('energy meter');
          if (!isMeterTest) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return energyMeterTestingDivision === 'Water' ? isWater : !isWater;
        });
      } else if (typeParam === 'Regretted Applications' || typeParam === 'Hold Applications' || typeParam === 'Archived Application') {
        const dbStatus = typeParam === 'Regretted Applications' ? 'regretted' : typeParam === 'Hold Applications' ? 'hold' : 'archived';
        result = result.filter(a => {
          const name = (a.connectionTypeName || '').toLowerCase();
          const cat = (a.connectionCategory || '').toLowerCase();
          const typeName = (a.applicationType || '').toLowerCase();
          
          const matchesStatus = (a.currentStatus || '').toLowerCase() === dbStatus;
          if (!matchesStatus) return false;
          
          const isWater = name.includes('water') || cat.includes('water') || typeName.includes('water');
          return regrettedDivision === 'Water' ? isWater : !isWater;
        });
      } else {
        const dbType = mapSidebarTypeToDbValue(typeParam).toLowerCase();
        result = result.filter(a => 
          (a.applicationType && a.applicationType.toLowerCase().includes(dbType)) ||
          (a.connectionTypeName && a.connectionTypeName.toLowerCase().includes(dbType)) ||
          (a.currentStatus && a.currentStatus.toLowerCase() === dbType)
        );
      }
    }

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

    // 3. Clickable Statistics Card Filter
    if (selectedStatFilter) {
      if (selectedStatFilter === 'Pending') {
        result = result.filter(a => a.currentStatus && a.currentStatus.startsWith('Pending'));
      } else {
        result = result.filter(a => a.currentStatus === selectedStatFilter);
      }
    }

    // 4. Advanced collapsible filters (Multi-select)
    if (filterStatuses.length > 0) {
      result = result.filter(a => filterStatuses.includes(a.currentStatus));
    }
    if (filterStages.length > 0) {
      result = result.filter(a => filterStages.includes(a.currentStage));
    }
    if (filterPriorities.length > 0) {
      result = result.filter(a => filterPriorities.includes(a.priority));
    }
    if (filterBusinessAreas.length > 0) {
      result = result.filter(a => filterBusinessAreas.includes(a.businessArea || ''));
    }
    if (filterServiceTypes.length > 0) {
      result = result.filter(a => filterServiceTypes.includes(a.applicationType || 'New Connection'));
    }
    if (filterConnectionTypes.length > 0) {
      result = result.filter(a => filterConnectionTypes.includes(a.connectionCategory || ''));
    }
    if (filterOfficers.length > 0) {
      result = result.filter(a => filterOfficers.includes(a.assignedOfficer || ''));
    }
    if (filterDistricts.length > 0) {
      result = result.filter(a => filterDistricts.includes(a.district || ''));
    }

    // 5. In-table local search
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

  const processedApps = getFilteredAndSortedApps();
  const totalPages = Math.ceil(processedApps.length / pageSize) || 1;
  const paginatedApps = processedApps.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Sorting columns
  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
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

  const handlePrintReceipt = (app: Application) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocker is active. Please enable popups to print receipt.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Tata UISL Connection Receipt - ${app.applicationNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #333; line-height: 1.5; font-size: 13px; }
            .receipt-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
            .header { border-bottom: 2px solid #005BAC; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo-text { font-size: 16px; font-weight: 800; color: #005BAC; text-transform: uppercase; }
            .status-badge { background-color: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
            .title { font-size: 14px; font-weight: 800; color: #1e293b; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; text-align: center; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
            .field { display: flex; flex-direction: column; }
            .label { font-size: 10px; text-transform: uppercase; font-weight: bold; color: #94a3b8; margin-bottom: 4px; }
            .value { font-size: 12px; font-weight: bold; color: #334155; }
            .footer-note { border-top: 1px dashed #e2e8f0; margin-top: 25px; padding-top: 15px; font-size: 10px; color: #64748b; text-align: center; line-height: 1.4; }
            .print-btn-bar { display: flex; justify-content: center; margin-top: 20px; }
            .print-btn { background-color: #005BAC; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; }
            @media print {
              .print-btn-bar { display: none; }
              body { padding: 0; }
              .receipt-card { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <span class="logo-text">TATA Steel Utilities & Infrastructure</span>
              <span class="status-badge">${app.currentStatus}</span>
            </div>
            <h3 class="title">Connection Registration Receipt</h3>
            <div class="grid">
              <div class="field">
                <span class="label">Applicant Name</span>
                <span class="value">${app.fullName || app.customerName || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Application Number</span>
                <span class="value" style="font-family: monospace;">${app.applicationNumber}</span>
              </div>
              <div class="field">
                <span class="label">Connection Type</span>
                <span class="value">${app.connectionTypeName || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Registration Date</span>
                <span class="value">${new Date(app.submittedDate).toLocaleDateString()}</span>
              </div>
              <div class="field">
                <span class="label">Volt / Load Spec</span>
                <span class="value">${app.voltageRequirement || 'N/A'} / ${app.loadRequirement || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Contact Number</span>
                <span class="value">${app.customerMobile || 'N/A'}</span>
              </div>
            </div>
            <div class="footer-note">
              This is a system-generated utility request receipt. No manual signature is required. Your request has been queued for verification. Please keep a copy of this document for future reference.
            </div>
            <div class="print-btn-bar">
              <button class="print-btn" onclick="window.print()">Print This Receipt</button>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintRegretLetter = (app: Application) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocker is active. Please enable popups to print.');
      return;
    }
    const year = app.submittedDate ? new Date(app.submittedDate).getFullYear() : new Date().getFullYear();
    const dateStr = app.lastUpdated ? new Date(app.lastUpdated).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
    const docRejections = app.documents?.filter(d => d.verificationStatus === 'Rejected' && d.rejectionReason) || [];
    const reasonText = docRejections.length > 0 
      ? docRejections.map(d => `<li>${d.rejectionReason}</li>`).join('')
      : `<li>Objection due to deviation / unauthorized construction</li>`;

    const isHold = app.currentStatus?.toLowerCase() === 'hold';
    const subText = isHold 
      ? 'We regret to inform you that your subject application has been placed on hold due to following reason(s):' 
      : 'We regret to inform you that your subject application has been rejected due to following reason(s):';

    printWindow.document.write(`
      <html>
        <head>
          <title>Regret Letter - ${app.applicationNumber}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; font-size: 13px; }
            .letter-container { max-width: 700px; margin: 0 auto; }
            .logo-container { text-align: center; margin-bottom: 30px; }
            .logo-text { font-family: 'Arial Black', sans-serif; font-size: 18px; font-weight: 900; color: #005bac; letter-spacing: 4px; }
            .classic-symbol { display: block; margin: 0 auto 5px auto; }
            .recipient-section { margin-bottom: 25px; line-height: 1.4; }
            .recipient-name { font-weight: bold; font-size: 14px; }
            .ref-date-section { display: flex; justify-content: space-between; margin-bottom: 25px; font-weight: bold; }
            .subject-ref-section { margin-bottom: 25px; font-weight: bold; border-left: 2px solid #005bac; padding-left: 10px; }
            .body-section { margin-bottom: 30px; }
            .body-section ul { margin-top: 10px; padding-left: 20px; }
            .body-section li { margin-bottom: 8px; }
            .signoff-section { margin-bottom: 40px; line-height: 1.5; }
            .footer-line { border-top: 1px solid #ddd; margin-top: 20px; padding-top: 15px; }
            .footer-text { font-size: 9px; color: #555; text-align: center; line-height: 1.5; }
            .company-name { font-weight: bold; color: #005bac; font-size: 10px; margin-bottom: 2px; }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="letter-container">
            <div class="logo-container">
              <svg class="classic-symbol" width="45" height="30" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 50 L40 10 L50 25 L60 10 L85 50" stroke="#005bac" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" />
              </svg>
              <div class="logo-text">TATA</div>
            </div>

            <div class="recipient-section">
              <div class="recipient-name">${app.fullName || app.customerName || 'Varun Arora'}</div>
              <div>${app.addressLine1 || 'Test Road'}</div>
            </div>

            <div class="ref-date-section">
              <div>Ref. No.: PSD/JSR/${app.applicationNumber}/${year}</div>
              <div>Date: ${dateStr}</div>
            </div>

            <div class="subject-ref-section">
              <div>Subject: ${app.connectionTypeName || app.applicationType || 'Load Change'} at ${app.addressLine1 || 'Test Road'}</div>
              <div>Reference: Receipt No. ${app.applicationNumber}</div>
            </div>

            <div class="body-section">
              <p>Dear Sir/Madam,</p>
              <p>${subText}</p>
              <ul>
                ${reasonText}
              </ul>
            </div>

            <div class="signoff-section">
              <p>Thanking you,</p>
              <p>For and on behalf of Tata Steel Limited,</p>
              <p style="margin-top: 40px; font-weight: bold;">Chief Divisional Manager, Jamshedpur Power Services</p>
            </div>

            <div class="footer-line"></div>
            <div class="footer-text">
              <div class="company-name">TATA STEEL UTILITIES AND INFRASTRUCTURE SERVICES LIMITED</div>
              <div style="font-style: italic; margin-bottom: 4px;">(Formerly Jamshedpur Utilities & Services Company Limited)</div>
              <div>Registered Office : Sakchi Boulevard Road Northern Town Bistupur Jamshedpur 831 001 India</div>
              <div>Tel 91 657 6652101 Fax 91 657 2424219</div>
              <div>Corporate Identity Number U45200JH2003PLC010315</div>
              <div>Website www.tatasteeluisl.com</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleVerifyDoc = async (docId: string) => {
    if (!selectedApp) return;
    try {
      await documentService.verifyDocument(selectedApp.id, docId, 'Verified');
      toast.success('Document Verified');
      const apps = await applicationService.getApplications();
      const updated = apps.find(a => a.id === selectedApp.id);
      if (updated) setSelectedApp(updated);
      fetchApps();
    } catch (e) {
      toast.error('Verification failed');
    }
  };

  const handleRejectDoc = async (docId: string) => {
    if (!selectedApp || !docRejectionReason.trim()) {
      toast.error('Provide rejection reason');
      return;
    }
    try {
      await documentService.verifyDocument(selectedApp.id, docId, 'Rejected', docRejectionReason);
      toast.success('Document Rejected');
      setRejectingDocId(null);
      setDocRejectionReason('');
      const apps = await applicationService.getApplications();
      const updated = apps.find(a => a.id === selectedApp.id);
      if (updated) setSelectedApp(updated);
      fetchApps();
    } catch (e) {
      toast.error('Rejection failed');
    }
  };

  const handleTransitionWorkflow = async (action: 'Approve' | 'Reject' | 'Correction') => {
    if (!selectedApp) return;
    try {
      const updated = await applicationService.updateStage(selectedApp.id, {
        newStage: selectedApp.currentStage,
        action,
        remarks: statusRemarks || `${action}d from desk.`
      });
      setSelectedApp(updated);
      setStatusRemarks('');
      toast.success(`Workflow transition successful: ${action}`);
      fetchApps();
    } catch (err) {
      toast.error(`Transition failed`);
    }
  };

  const handleReassignOfficer = async () => {
    if (!selectedApp) return;
    try {
      const updated = await applicationService.assignOfficer(selectedApp.id, officerName);
      setSelectedApp(updated);
      toast.success(`Officer assigned`);
      fetchApps();
    } catch (err) {
      toast.error('Assignment failed');
    }
  };

  // Exports
  const handleExportData = (format: 'CSV' | 'PDF') => {
    const headers = ['Application Number', 'Applicant Name', 'BP Number', 'Stage', 'Status', 'Priority', 'Officer', 'Date'];
    const rows = processedApps.map(a => [
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

  const allStages = [
    'Application Verification', 'Document Verification', 'Load Survey', 'Land Survey',
    'Bill Verification', 'Estimate Details', 'Estimate Approval', 'Demand Note',
    'Connection Approval', 'Job Allotment', 'RFC Entry', 'Energization', 'Move-In', 'Completed'
  ];

  const renderMaterialMaster = () => {
    const filtered = materials.filter(m => {
      const matchesActive = !materialActiveFilter || m.active;
      const matchesSearch = !materialSearch.trim() || 
        m.category.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.description.toLowerCase().includes(materialSearch.toLowerCase()) ||
        m.uom.toLowerCase().includes(materialSearch.toLowerCase());
      return matchesActive && matchesSearch;
    });

    const totalEntries = filtered.length;
    const totalPages = Math.ceil(totalEntries / materialPageSize) || 1;
    const startIndex = (materialPage - 1) * materialPageSize;
    const paginated = filtered.slice(startIndex, startIndex + materialPageSize);

    const handleAdd = () => {
      if (!addDescription.trim()) {
        toast.warning('Please enter a Material/Service Description.');
        return;
      }
      const newItem = {
        id: materials.length > 0 ? Math.max(...materials.map(m => m.id)) + 1 : 1,
        category: addCategory || 'Cable Services',
        description: addDescription,
        uom: addUom || 'M',
        materialCost: parseFloat(addMaterialCost) || 0,
        costJsr: parseFloat(addCostJsr) || 0,
        costSk: parseFloat(addCostSk) || 0,
        createdDate: '23-Dec-2022',
        active: true
      };
      setMaterials([...materials, newItem]);
      setAddCategory('');
      setAddDescription('');
      setAddUom('');
      setAddMaterialCost('');
      setAddCostJsr('');
      setAddCostSk('');
      toast.success('Material added successfully.');
    };

    const handleStartEdit = (m: any) => {
      setEditingMaterialId(m.id);
      setEditCategory(m.category);
      setEditDescription(m.description);
      setEditUom(m.uom);
      setEditMaterialCost(m.materialCost.toString());
      setEditCostJsr(m.costJsr.toString());
      setEditCostSk(m.costSk.toString());
    };

    const handleUpdate = (id: number) => {
      setMaterials(materials.map(m => m.id === id ? {
        ...m,
        category: editCategory,
        description: editDescription,
        uom: editUom,
        materialCost: parseFloat(editMaterialCost) || 0,
        costJsr: parseFloat(editCostJsr) || 0,
        costSk: parseFloat(editCostSk) || 0
      } : m));
      setEditingMaterialId(null);
      toast.success('Material updated successfully.');
    };

    const handleDelete = (id: number) => {
      if (window.confirm('Are you sure you want to delete this material?')) {
        setMaterials(materials.filter(m => m.id !== id));
        toast.success('Material deleted successfully.');
      }
    };

    return (
      <div className="space-y-6 text-left relative min-h-[85vh] max-w-[1700px] mx-auto bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 animate-fadeIn">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center space-x-3 text-left">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Active materials?</span>
            <button 
              onClick={() => {
                setMaterialActiveFilter(!materialActiveFilter);
                setMaterialPage(1);
              }}
              className={`relative inline-flex h-6 w-16 items-center rounded-full transition-colors focus:outline-none ${
                materialActiveFilter ? 'bg-[#28A745]' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute left-2 text-[10px] font-black text-white transition-opacity duration-200 ${materialActiveFilter ? 'opacity-100' : 'opacity-0'}`}>Yes</span>
              <span className={`absolute right-2 text-[10px] font-black text-white transition-opacity duration-200 ${materialActiveFilter ? 'opacity-0' : 'opacity-100'}`}>No</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  materialActiveFilter ? 'translate-x-10' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <h2 className="text-base font-extrabold text-[#4B3E9E] dark:text-white uppercase tracking-wider">
            Material Master
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div className="flex items-center space-x-2 font-semibold text-gray-600 dark:text-gray-400">
            <span>Show</span>
            <select
              value={materialPageSize}
              onChange={(e) => {
                setMaterialPageSize(parseInt(e.target.value));
                setMaterialPage(1);
              }}
              className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-750 dark:text-white outline-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="font-semibold text-gray-650 dark:text-gray-400">Search:</span>
            <input
              type="text"
              value={materialSearch}
              onChange={(e) => {
                setMaterialSearch(e.target.value);
                setMaterialPage(1);
              }}
              placeholder="Search category or description..."
              className="border border-gray-200 dark:border-slate-700 rounded px-3 py-1 bg-white dark:bg-slate-900 text-gray-750 dark:text-white outline-none focus:border-[#4B3E9E] w-full sm:w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-150 dark:border-slate-700/60 rounded-xl">
          <table className="w-full text-xs text-left min-w-[1000px]">
            <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3 w-40">Item Category</th>
                <th className="py-3 px-3">Material/Service Description</th>
                <th className="py-3 px-3 w-16 text-center">UoM</th>
                <th className="py-3 px-3 w-28 text-right">Material Cost</th>
                <th className="py-3 px-3 w-32 text-right">Service Cost for JSR</th>
                <th className="py-3 px-3 w-32 text-right">Service Cost for SK</th>
                <th className="py-3 px-3 w-32 text-center">Uploaded/Created Date</th>
                <th className="py-3 px-3 w-24 text-center">Edit</th>
                <th className="py-3 px-3 w-24 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
              {paginated.length > 0 ? (
                paginated.map((m, idx) => {
                  const itemNumber = startIndex + idx + 1;
                  const isEditing = editingMaterialId === m.id;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/20">
                      <td className="py-2.5 px-3 font-semibold text-gray-400 text-center">{itemNumber}</td>
                      <td className="py-2.5 px-3 text-left">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="border border-gray-250 rounded px-2 py-1 w-full bg-white dark:bg-slate-900 text-gray-750 dark:text-white"
                          />
                        ) : (
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{m.category}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-left">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="border border-gray-250 rounded px-2 py-1 w-full bg-white dark:bg-slate-900 text-gray-750 dark:text-white"
                          />
                        ) : (
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{m.description}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editUom}
                            onChange={(e) => setEditUom(e.target.value)}
                            className="border border-gray-250 rounded px-1 py-1 w-full text-center bg-white dark:bg-slate-900 text-gray-750 dark:text-white"
                          />
                        ) : (
                          <span className="font-bold text-gray-600 dark:text-gray-400">{m.uom}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editMaterialCost}
                            onChange={(e) => setEditMaterialCost(e.target.value)}
                            className="border border-gray-250 rounded px-2 py-1 w-full text-right bg-white dark:bg-slate-900 text-gray-750 dark:text-white"
                          />
                        ) : (
                          <span className="font-bold text-gray-700 dark:text-gray-300">{m.materialCost.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editCostJsr}
                            onChange={(e) => setEditCostJsr(e.target.value)}
                            className="border border-gray-250 rounded px-2 py-1 w-full text-right bg-white dark:bg-slate-900 text-gray-750 dark:text-white"
                          />
                        ) : (
                          <span className="font-bold text-gray-700 dark:text-gray-300">{m.costJsr.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editCostSk}
                            onChange={(e) => setEditCostSk(e.target.value)}
                            className="border border-gray-250 rounded px-2 py-1 w-full text-right bg-white dark:bg-slate-900 text-gray-750 dark:text-white"
                          />
                        ) : (
                          <span className="font-bold text-gray-700 dark:text-gray-300">{m.costSk.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-semibold text-gray-500">{m.createdDate}</td>
                      <td className="py-2.5 px-3 text-center">
                        {isEditing ? (
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => handleUpdate(m.id)}
                              className="px-3 py-1 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[10px] font-bold rounded transition w-full"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => setEditingMaterialId(null)}
                              className="px-3 py-1 bg-gray-500 hover:bg-gray-650 text-white text-[10px] font-bold rounded transition w-full"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(m)}
                            className="px-3 py-1.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[10px] font-bold rounded transition w-full"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="px-3 py-1.5 bg-[#DC3545] hover:bg-[#c82333] text-white text-[10px] font-bold rounded transition w-full"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400 font-semibold">
                    No materials found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50/55 dark:bg-slate-900/30 font-semibold border-t border-gray-150 dark:border-slate-700">
                <td className="py-3 px-3 text-center text-gray-450">#</td>
                <td className="py-3 px-3 text-left">
                  <input
                    type="text"
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    placeholder="Item Category"
                    className="w-full border border-gray-200 dark:border-slate-700 rounded px-2.5 py-1.5 bg-white dark:bg-slate-900 text-xs text-gray-750 dark:text-white outline-none"
                  />
                </td>
                <td className="py-3 px-3 text-left">
                  <input
                    type="text"
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    placeholder="Material/Service Description"
                    className="w-full border border-gray-200 dark:border-slate-700 rounded px-2.5 py-1.5 bg-white dark:bg-slate-900 text-xs text-gray-750 dark:text-white outline-none"
                  />
                </td>
                <td className="py-3 px-3 text-center">
                  <input
                    type="text"
                    value={addUom}
                    onChange={(e) => setAddUom(e.target.value)}
                    placeholder="UoM"
                    className="w-full border border-gray-200 dark:border-slate-700 rounded px-2 py-1.5 text-center bg-white dark:bg-slate-900 text-xs text-gray-750 dark:text-white outline-none"
                  />
                </td>
                <td className="py-3 px-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={addMaterialCost}
                    onChange={(e) => setAddMaterialCost(e.target.value)}
                    placeholder="Material Cost"
                    className="w-full border border-gray-200 dark:border-slate-700 rounded px-2 py-1.5 text-right bg-white dark:bg-slate-900 text-xs text-gray-750 dark:text-white outline-none"
                  />
                </td>
                <td className="py-3 px-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={addCostJsr}
                    onChange={(e) => setAddCostJsr(e.target.value)}
                    placeholder="Service Cost JSR"
                    className="w-full border border-gray-200 dark:border-slate-700 rounded px-2 py-1.5 text-right bg-white dark:bg-slate-900 text-xs text-gray-750 dark:text-white outline-none"
                  />
                </td>
                <td className="py-3 px-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={addCostSk}
                    onChange={(e) => setAddCostSk(e.target.value)}
                    placeholder="Service Cost SK"
                    className="w-full border border-gray-200 dark:border-slate-700 rounded px-2 py-1.5 text-right bg-white dark:bg-slate-900 text-xs text-gray-750 dark:text-white outline-none"
                  />
                </td>
                <td className="py-3 px-3 text-center text-gray-400 font-bold">-</td>
                <td colSpan={2} className="py-3 px-3 text-center">
                  <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[11px] font-bold rounded-lg shadow-sm w-full transition"
                  >
                    Add new material
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-500">
          <span>
            Showing {totalEntries > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + materialPageSize, totalEntries)} of {totalEntries} entries
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setMaterialPage(prev => Math.max(prev - 1, 1))}
              disabled={materialPage === 1}
              className="px-3 py-1.5 rounded border border-gray-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-700 dark:text-white transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setMaterialPage(p)}
                  className={`px-3 py-1.5 rounded border transition ${
                    materialPage === p
                      ? 'bg-[#4B3E9E] text-white border-[#4B3E9E]'
                      : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-700 dark:text-white'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setMaterialPage(prev => Math.min(prev + 1, totalPages))}
              disabled={materialPage === totalPages}
              className="px-3 py-1.5 rounded border border-gray-200 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-900 text-gray-700 dark:text-white transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFeederLineChargeMaster = () => {
    const filtered = feeders.filter(f => 
      !feederSearch.trim() || 
      f.businessArea.toLowerCase().includes(feederSearch.toLowerCase()) ||
      f.rule.toLowerCase().includes(feederSearch.toLowerCase())
    );

    const handleSave = () => {
      if (!formFeederBusinessArea || formFeederBusinessArea === '--Select Business Area--') {
        toast.warning('Please select a Business Area.');
        return;
      }
      if (!formFeederLoad) {
        toast.warning('Please enter load value.');
        return;
      }
      if (!formFeederCharges) {
        toast.warning('Please enter feeder charges.');
        return;
      }

      if (editingFeederId) {
        setFeeders(feeders.map(f => f.id === editingFeederId ? {
          ...f,
          businessArea: formFeederBusinessArea,
          load: parseInt(formFeederLoad) || 0,
          charges: parseFloat(formFeederCharges) || 0,
          status: formFeederStatus,
          rule: formFeederRule
        } : f));
        setEditingFeederId(null);
        toast.success('Feeder line charge updated successfully.');
      } else {
        const newItem = {
          id: feeders.length > 0 ? Math.max(...feeders.map(x => x.id)) + 1 : 1,
          businessArea: formFeederBusinessArea,
          load: parseInt(formFeederLoad) || 0,
          charges: parseFloat(formFeederCharges) || 0,
          status: formFeederStatus,
          rule: formFeederRule || `(${formFeederLoad} x 0)`
        };
        setFeeders([...feeders, newItem]);
        toast.success('Feeder line charge saved successfully.');
      }

      setFormFeederBusinessArea('');
      setFormFeederLoad('');
      setFormFeederCharges('');
      setFormFeederStatus('Active');
      setFormFeederRule('');
    };

    const handleEditClick = (f: any) => {
      if (window.confirm('Are you sure that you want to edit')) {
        setEditingFeederId(f.id);
        setFormFeederBusinessArea(f.businessArea);
        setFormFeederLoad(f.load.toString());
        setFormFeederCharges(f.charges.toString());
        setFormFeederStatus(f.status);
        setFormFeederRule(f.rule);
      }
    };

    return (
      <div className="space-y-6 text-left relative min-h-[85vh] max-w-[1700px] mx-auto animate-fadeIn">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white text-left uppercase tracking-wider">
            FeederLine Charge Master
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-gray-700 dark:text-gray-300">Business Area <span className="text-red-500">*</span></label>
              <select
                value={formFeederBusinessArea}
                onChange={(e) => setFormFeederBusinessArea(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none cursor-pointer focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="">--Select Business Area--</option>
                <option value="Jamshedpur">Jamshedpur</option>
                <option value="Adityapur/ Saraikela">Adityapur/ Saraikela</option>
                <option value="Ranchi">Ranchi</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-gray-700 dark:text-gray-300">Load (in kW) <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Load in kW"
                value={formFeederLoad}
                onChange={(e) => setFormFeederLoad(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none focus:border-[#4B3E9E] shadow-sm"
              />
            </div>

            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-gray-700 dark:text-gray-300">Feeder line Charges <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Feeder line Charges"
                value={formFeederCharges}
                onChange={(e) => setFormFeederCharges(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none focus:border-[#4B3E9E] shadow-sm"
              />
            </div>

            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-gray-700 dark:text-gray-300">Status <span className="text-red-500">*</span></label>
              <select
                value={formFeederStatus}
                onChange={(e) => setFormFeederStatus(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none cursor-pointer focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
            <div className="flex flex-col space-y-1.5 text-left w-full md:w-3/4">
              <label className="text-gray-700 dark:text-gray-300">Rule <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Feeder line Rule"
                value={formFeederRule}
                onChange={(e) => setFormFeederRule(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none focus:border-[#4B3E9E] shadow-sm w-full"
              />
            </div>

            <div className="flex flex-col space-y-1.5 text-right w-full md:w-auto self-end">
              <span className="text-[10px] text-gray-400 font-bold uppercase select-none hidden md:block">Action</span>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-black rounded-lg shadow-md transition self-stretch md:self-auto"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-gray-650 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-750 dark:text-white outline-none">
                <option value="10">10</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span>Search:</span>
              <input
                type="text"
                value={feederSearch}
                onChange={(e) => setFeederSearch(e.target.value)}
                placeholder="Search..."
                className="border border-gray-200 dark:border-slate-700 rounded px-3 py-1 bg-white dark:bg-slate-900 text-gray-750 outline-none w-full sm:w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-150 dark:border-slate-700/60 rounded-xl">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 text-left">Business Area</th>
                  <th className="py-3 px-3 text-center">Load (in KW)</th>
                  <th className="py-3 px-3 text-center">Feeder line Charges</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
                {filtered.map((f, idx) => (
                  <tr key={f.id} className="hover:bg-slate-50/20">
                    <td className="py-2.5 px-3 font-semibold text-gray-400 text-center">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-left font-semibold text-gray-750 dark:text-gray-300">{f.businessArea}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-700 dark:text-gray-400">{f.load}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-700 dark:text-gray-400">{f.charges}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        f.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleEditClick(f)}
                        className="p-1.5 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
                        title="Edit Feeder Charge"
                      >
                        <FileEdit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderEnergySecurityChargeMaster = () => {
    const filtered = securities.filter(s => 
      !securitySearch.trim() || 
      s.businessArea.toLowerCase().includes(securitySearch.toLowerCase()) ||
      s.category.toLowerCase().includes(securitySearch.toLowerCase())
    );

    const handleSave = () => {
      if (!formSecurityBusinessArea || formSecurityBusinessArea === '--Select Business Area--') {
        toast.warning('Please select a Business Area.');
        return;
      }
      if (!formSecurityCategory) {
        toast.warning('Please enter a Category.');
        return;
      }
      if (!formSecurityUom) {
        toast.warning('Please enter UoM.');
        return;
      }
      if (!formSecurityCharges) {
        toast.warning('Please enter security charges.');
        return;
      }

      if (editingSecurityId) {
        setSecurities(securities.map(s => s.id === editingSecurityId ? {
          ...s,
          businessArea: formSecurityBusinessArea,
          category: formSecurityCategory,
          uom: formSecurityUom,
          charges: parseFloat(formSecurityCharges) || 0,
          status: formSecurityStatus
        } : s));
        setEditingSecurityId(null);
        toast.success('Energy security charge updated successfully.');
      } else {
        const newItem = {
          id: securities.length > 0 ? Math.max(...securities.map(x => x.id)) + 1 : 1,
          businessArea: formSecurityBusinessArea,
          category: formSecurityCategory,
          uom: formSecurityUom,
          charges: parseFloat(formSecurityCharges) || 0,
          status: formSecurityStatus
        };
        setSecurities([...securities, newItem]);
        toast.success('Energy security charge saved successfully.');
      }

      setFormSecurityBusinessArea('');
      setFormSecurityCategory('');
      setFormSecurityUom('');
      setFormSecurityCharges('');
      setFormSecurityStatus('Active');
    };

    const handleEditClick = (s: any) => {
      if (window.confirm('Are you sure that you want to edit')) {
        setEditingSecurityId(s.id);
        setFormSecurityBusinessArea(s.businessArea);
        setFormSecurityCategory(s.category);
        setFormSecurityUom(s.uom);
        setFormSecurityCharges(s.charges.toString());
        setFormSecurityStatus(s.status);
      }
    };

    return (
      <div className="space-y-6 text-left relative min-h-[85vh] max-w-[1700px] mx-auto animate-fadeIn">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-gray-905 dark:text-white text-left uppercase tracking-wider">
            Energy Security Charge Master
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-gray-700 dark:text-gray-300">Business Area <span className="text-red-500">*</span></label>
              <select
                value={formSecurityBusinessArea}
                onChange={(e) => setFormSecurityBusinessArea(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none cursor-pointer focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="">--Select Business Area--</option>
                <option value="Jamshedpur">Jamshedpur</option>
                <option value="Adityapur/ Saraikela">Adityapur/ Saraikela</option>
                <option value="Ranchi">Ranchi</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-gray-700 dark:text-gray-300">Category <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Category"
                value={formSecurityCategory}
                onChange={(e) => setFormSecurityCategory(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none focus:border-[#4B3E9E] shadow-sm"
              />
            </div>

            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-gray-700 dark:text-gray-300">UoM <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="UoM"
                value={formSecurityUom}
                onChange={(e) => setFormSecurityUom(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none focus:border-[#4B3E9E] shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
            <div className="flex flex-col space-y-1.5 text-left w-full md:w-2/5">
              <label className="text-gray-700 dark:text-gray-300">Energy Security Charges <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Energy Security Charges"
                value={formSecurityCharges}
                onChange={(e) => setFormSecurityCharges(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none focus:border-[#4B3E9E] shadow-sm w-full"
              />
            </div>

            <div className="flex flex-col space-y-1.5 text-left w-full md:w-2/5">
              <label className="text-gray-700 dark:text-gray-300">Status <span className="text-red-500">*</span></label>
              <select
                value={formSecurityStatus}
                onChange={(e) => setFormSecurityStatus(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-gray-800 dark:text-white outline-none cursor-pointer focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5 text-right w-full md:w-auto self-end">
              <span className="text-[10px] text-gray-400 font-bold uppercase select-none hidden md:block">Action</span>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-black rounded-lg shadow-md transition self-stretch md:self-auto"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-gray-650 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-750 dark:text-white outline-none">
                <option value="10">10</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span>Search:</span>
              <input
                type="text"
                value={securitySearch}
                onChange={(e) => setSecuritySearch(e.target.value)}
                placeholder="Search..."
                className="border border-gray-200 dark:border-slate-700 rounded px-3 py-1 bg-white dark:bg-slate-900 text-gray-750 outline-none w-full sm:w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-150 dark:border-slate-700/60 rounded-xl">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3">Business Area</th>
                  <th className="py-3 px-3 text-left">Item Category</th>
                  <th className="py-3 px-3 text-center">UoM</th>
                  <th className="py-3 px-3 text-center">Charges</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
                {filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/20">
                    <td className="py-2.5 px-3 font-semibold text-gray-400 text-center">{idx + 1}</td>
                    <td className="py-2.5 px-3 text-left font-semibold text-gray-750 dark:text-gray-300">{s.businessArea}</td>
                    <td className="py-2.5 px-3 text-left font-semibold text-gray-750 dark:text-gray-300">{s.category}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-650 dark:text-gray-400">{s.uom}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-700 dark:text-gray-400">{s.charges}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        s.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleEditClick(s)}
                        className="p-1.5 bg-slate-900 text-white rounded hover:bg-slate-800 transition"
                        title="Edit Security Charge"
                      >
                        <FileEdit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderMoneyReceipt = () => {
    const selectedApp = applications.find(a => a.id === selectedReceiptAppId) || applications[0] || {
      id: 1,
      applicationNo: 'APP72619',
      fullName: 'Abhishek Roy',
      connectionTypeName: 'LT Domestic Connection',
      businessArea: 'JAMSHEDPUR',
      mobileNumber: '9876543210',
      appliedLoad: 4,
      submittedDate: '23-Dec-2022'
    };

    const mrNo = `MR-2026-${selectedApp.id}09`;
    const receiptDate = selectedApp.submittedDate ? new Date(selectedApp.submittedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '23-Dec-2022';
    const receiptMode = 'Online';
    const chequeNo = 'N/A';
    const chequeAmount = '-';
    const chequeDate = 'N/A';
    const appNo = selectedApp.applicationNo || 'N/A';
    const bpNo = `BP-83${selectedApp.id}91`;
    const consumerNo = `CON-92${selectedApp.id}48`;
    
    const loadVal = selectedApp.appliedLoad || 2;
    const installationCharges = 1500.00;
    const serviceCharges = 250.00;
    const educationCess = 30.00;
    const miscellaneousCharges = 120.00;
    const energySecurity = loadVal * 600.00;
    const meterSecurity = 800.00;
    const totalAmount = installationCharges + serviceCharges + educationCess + miscellaneousCharges + energySecurity + meterSecurity;

    const amountReceived = totalAmount.toFixed(2);
    const connType = selectedApp.connectionTypeName || 'LT Domestic';
    const customerName = selectedApp.fullName || 'Abhishek Roy';
    const bankName = 'HDFC Bank';
    const divisionName = selectedApp.businessArea || 'JAMSHEDPUR';
    const estNo = `EST-${divisionName.substring(0, 3)}-99`;
    const dnAmount = totalAmount.toFixed(2);
    const dnNo = `DN-2026-${selectedApp.id}12`;
    const dnDate = selectedApp.submittedDate ? new Date(selectedApp.submittedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '23-Dec-2022';
    const contactNo = selectedApp.mobileNumber || 'N/A';
    const sanctionLoad = `${loadVal} KW`;

    return (
      <div className="space-y-6 text-left relative min-h-[85vh] max-w-[1700px] mx-auto animate-fadeIn">
        {applications.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-left">
              <h2 className="text-sm font-extrabold text-[#4B3E9E] dark:text-white uppercase tracking-wider">
                Select Connection Request for Receipt
              </h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">
                Generate the money receipt layout dynamically for any of the registered connections
              </p>
            </div>
            <select
              value={selectedReceiptAppId}
              onChange={(e) => setSelectedReceiptAppId(parseInt(e.target.value))}
              className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-10 py-2 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm sm:w-72"
            >
              {applications.map(a => (
                <option key={a.id} value={a.id}>
                  {a.applicationNo} - {a.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm text-left max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b-2 border-gray-300 dark:border-slate-650 gap-4">
            <div className="text-left space-y-1">
              <h1 className="text-base md:text-lg font-black text-[#005BAC] dark:text-blue-400 uppercase tracking-wide">
                TATA STEEL UTILITIES AND INFRASTRUCTURE SERVICES LIMITED
              </h1>
              <p className="text-center md:text-left text-xs font-extrabold text-gray-500 uppercase tracking-widest mt-1">
                MONEY RECEIPT
              </p>
            </div>
            <div className="flex flex-col items-center pr-2">
              <svg className="w-12 h-12 text-[#005BAC] dark:text-blue-400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="40" r="35" fill="currentColor"/>
                <path d="M35 55 L50 25 L65 55 M50 25 L50 55" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px] font-black tracking-widest text-[#005BAC] dark:text-blue-400 mt-1">TATA</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 dark:border-slate-700 my-4"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3.5 gap-x-8 text-[11px] text-gray-850 dark:text-gray-300 font-semibold my-6">
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">MONEY RECEIPT NO. - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{mrNo}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">C.HEQUE NO. - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{chequeNo}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">APPLICATION RECEIPT NO. - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{appNo}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">RECEIVED Rs. - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">₹ {amountReceived}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">BANK NAME - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{bankName}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">ESTABLISHMENT NO. - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{estNo}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">DEMAND NOTE DATE - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{dnDate}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">Contact No. - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{contactNo}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">RECEIPT DATE - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{receiptDate}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">CHEQUE AMOUNT - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{chequeAmount}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">BUSINESS PARTNER NO. - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{bpNo}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">CONN. TYPE - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{connType}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">DEMAND NOTE AMOUNT - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">₹ {dnAmount}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">SANCTION LOAD - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{sanctionLoad}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">RECEIPT MODE - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{receiptMode}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">CHEQUE DATE - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{chequeDate}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">CONSUMER NO. - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{consumerNo}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">FROM - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{customerName}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">DIVISION - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{divisionName}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-bold uppercase">DEMAND NOTE NO. - </span>
                <span className="font-extrabold text-gray-900 dark:text-white ml-1">{dnNo}</span>
              </div>
            </div>
          </div>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-dashed border-gray-300 dark:border-slate-700"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">
              PAYMENT DETAILS
            </span>
            <div className="flex-grow border-t border-dashed border-gray-300 dark:border-slate-700"></div>
          </div>

          <div className="overflow-x-auto my-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-350 font-bold uppercase border-b border-gray-250 dark:border-slate-650">
                  <th className="py-2.5 px-2 border-r border-gray-200 dark:border-slate-650">INSTALLATION CHARGES</th>
                  <th className="py-2.5 px-2 border-r border-gray-200 dark:border-slate-650">SERVICE</th>
                  <th className="py-2.5 px-2 border-r border-gray-200 dark:border-slate-650">EDUCATION CESS</th>
                  <th className="py-2.5 px-2 border-r border-gray-200 dark:border-slate-650">MISCELLANEOUS CHARGES</th>
                  <th className="py-2.5 px-2 border-r border-gray-200 dark:border-slate-650">ENERGY SECURITY</th>
                  <th className="py-2.5 px-2 border-r border-gray-200 dark:border-slate-650">METER SECURITY</th>
                  <th className="py-2.5 px-2 font-black">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-extrabold text-gray-800 dark:text-white">
                  <td className="py-3 px-2 border-r border-gray-200 dark:border-slate-700">₹ {installationCharges.toFixed(2)}</td>
                  <td className="py-3 px-2 border-r border-gray-200 dark:border-slate-700">₹ {serviceCharges.toFixed(2)}</td>
                  <td className="py-3 px-2 border-r border-gray-200 dark:border-slate-700">₹ {educationCess.toFixed(2)}</td>
                  <td className="py-3 px-2 border-r border-gray-200 dark:border-slate-700">₹ {miscellaneousCharges.toFixed(2)}</td>
                  <td className="py-3 px-2 border-r border-gray-200 dark:border-slate-700">₹ {energySecurity.toFixed(2)}</td>
                  <td className="py-3 px-2 border-r border-gray-200 dark:border-slate-700">₹ {meterSecurity.toFixed(2)}</td>
                  <td className="py-3 px-2 text-[#005BAC] dark:text-blue-400 text-sm font-black">₹ {totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 text-xs font-bold text-gray-700 dark:text-gray-300 space-y-5 sm:space-y-0">
            <div className="text-left font-black tracking-wide text-gray-500 uppercase">
              N.B-&gt;CHEQUES ARE SUBJECTED TO REALISATION ONLY WITHOUT PREJUDICE.
            </div>
            <div className="text-right flex flex-col items-center">
              <div className="h-10"></div>
              <span className="font-extrabold text-gray-850 dark:text-white border-t border-gray-400 dark:border-slate-600 pt-1.5 px-5">
                CHIEF B & CR(JUSCO)
              </span>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button 
              onClick={() => window.print()}
              className="px-8 py-3 bg-[#005BAC] hover:bg-[#004b8d] text-white text-xs font-black rounded-lg shadow-md flex items-center space-x-2 transition"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    );
  };



  const renderJobAllotment = () => {
    const allotmentApps = applications.filter(a => (a.currentStage || '').toLowerCase().includes('allotment'));
    return (
      <div className="space-y-6 text-left relative min-h-[85vh] max-w-[1700px] mx-auto animate-fadeIn">
        <div className="bg-[#4B3E9E] text-white p-4 rounded-xl shadow-sm text-left">
          <h2 className="text-sm font-extrabold uppercase tracking-wider">
            Pending Job Allotment Request(s)
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-gray-650 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-750 outline-none">
                <option value="10">10</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span>Search:</span>
              <input
                type="text"
                placeholder="Search..."
                className="border border-gray-200 dark:border-slate-700 rounded px-3 py-1 bg-white dark:bg-slate-900 text-gray-750 outline-none w-full sm:w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-150 dark:border-slate-700/60 rounded-xl">
            <table className="w-full text-xs text-left min-w-[900px]">
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 text-left">Appl. No.</th>
                  <th className="py-3 px-3 text-center">Appl. Date</th>
                  <th className="py-3 px-3 text-left">Applicant</th>
                  <th className="py-3 px-3 text-left">BP/Consumer No.</th>
                  <th className="py-3 px-3 text-center">Collection Date</th>
                  <th className="py-3 px-3 text-left">Service Type</th>
                  <th className="py-3 px-3 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
                {allotmentApps.length > 0 ? (
                  allotmentApps.map((a, idx) => (
                    <tr key={a.id} className="hover:bg-slate-50/20">
                      <td className="py-2.5 px-3 font-semibold text-gray-400 text-center">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-[#005BAC] text-left">{a.applicationNo}</td>
                      <td className="py-2.5 px-3 text-center">{formatDate(a.submittedDate)}</td>
                      <td className="py-2.5 px-3 font-semibold text-left">{a.fullName}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-500 text-left">CON-{920000 + a.id}</td>
                      <td className="py-2.5 px-3 text-center">{formatDate(a.submittedDate)}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-650 text-left">{a.connectionTypeName || 'LT Domestic'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => {
                            toast.success(`Job allotted for request ${a.applicationNo} successfully.`);
                          }}
                          className="px-3 py-1.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[10px] font-bold rounded transition shadow-sm w-full"
                        >
                          Allot Job
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-450 dark:text-gray-400 font-semibold uppercase tracking-wider">
                      No data available in table
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderRfcTrDetails = () => {
    const rfcApps = applications.slice(0, 2);
    return (
      <div className="space-y-6 text-left relative min-h-[85vh] max-w-[1700px] mx-auto animate-fadeIn">
        <div className="bg-[#4B3E9E] text-white p-4 rounded-xl shadow-sm text-left">
          <h2 className="text-sm font-extrabold uppercase tracking-wider">
            Pending RFC / TR Details Entries
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-gray-650 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-750 outline-none">
                <option value="10">10</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span>Search:</span>
              <input
                type="text"
                placeholder="Search..."
                className="border border-gray-200 dark:border-slate-700 rounded px-3 py-1 bg-white dark:bg-slate-900 text-gray-750 outline-none w-full sm:w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-150 dark:border-slate-700/60 rounded-xl">
            <table className="w-full text-xs text-left min-w-[900px]">
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 text-left">Appl. No.</th>
                  <th className="py-3 px-3 text-left">Applicant Name</th>
                  <th className="py-3 px-3 text-left">BP/Consumer No.</th>
                  <th className="py-3 px-3 text-center">RFC Entry Date</th>
                  <th className="py-3 px-3 text-center">TR Entry Status</th>
                  <th className="py-3 px-3 w-32 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
                {rfcApps.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50/20">
                    <td className="py-2.5 px-3 font-semibold text-gray-400 text-center">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-[#005BAC] text-left">{a.applicationNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-left">{a.fullName}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-500 text-left">BP-83{a.id}91</td>
                    <td className="py-2.5 px-3 text-center">{formatDate(a.submittedDate)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[9px] bg-yellow-100 text-yellow-800">Pending TR</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          toast.success(`RFC details updated for request ${a.applicationNo}.`);
                        }}
                        className="px-3 py-1.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[10px] font-bold rounded transition shadow-sm w-full"
                      >
                        Update Entries
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderEnergizations = () => {
    const energizationRows = [
      { id: 1, appNo: '250410021624', applicantName: 'Abhishek Gupta LT 10-04-2025', bpNo: '0000113636', serviceNo: '-' }
    ];
    return (
      <div className="space-y-6 text-left relative min-h-[85vh] max-w-[1700px] mx-auto animate-fadeIn">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4 text-left">
            <h2 className="text-base font-extrabold text-gray-905 dark:text-white uppercase tracking-wider">
              Energizations
            </h2>
            <div className="relative animate-fadeIn">
              <select
                value={energizationDivision}
                onChange={(e) => setEnergizationDivision(e.target.value as any)}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-850 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-gray-650 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select className="border border-gray-200 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-750 outline-none">
                <option value="10">10</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span>Search:</span>
              <input
                type="text"
                placeholder="Search..."
                className="border border-gray-200 dark:border-slate-700 rounded px-3 py-1 bg-white dark:bg-slate-900 text-gray-750 outline-none w-full sm:w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-gray-150 dark:border-slate-700/60 rounded-xl">
            <table className="w-full text-xs text-left min-w-[800px]">
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 text-left">Appl. No.</th>
                  <th className="py-3 px-3 text-left">Applicant Name</th>
                  <th className="py-3 px-3 text-left">BP No.</th>
                  <th className="py-3 px-3 text-center">Service No.</th>
                  <th className="py-3 px-3 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
                {energizationRows.map((r, idx) => {
                  const isExpanded = expandedEnergizationId === r.id;
                  return (
                    <React.Fragment key={r.id}>
                      <tr className="hover:bg-slate-50/20 font-semibold">
                        <td className="py-3 px-3 font-semibold text-gray-400 text-center">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white text-left">{r.appNo}</td>
                        <td className="py-3 px-3 text-gray-700 dark:text-gray-300 text-left">{r.applicantName}</td>
                        <td className="py-3 px-3 text-gray-700 dark:text-gray-300 text-left">{r.bpNo}</td>
                        <td className="py-3 px-3 text-center font-bold text-gray-500">{r.serviceNo}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setExpandedEnergizationId(isExpanded ? null : r.id)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                          >
                            <ChevronDown size={16} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-blue-50/30 dark:bg-slate-900/40 animate-fadeIn">
                          <td colSpan={6} className="p-4 text-left border-t border-gray-100 dark:border-slate-700">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold">
                              <div>
                                <span className="text-gray-400 block uppercase text-[10px]">Division</span>
                                <span className="text-gray-800 dark:text-white">{energizationDivision}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block uppercase text-[10px]">Meter Allocation</span>
                                <span className="text-gray-800 dark:text-white">Meter No. MTR-827192 (Allotted)</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block uppercase text-[10px]">Energization Date</span>
                                <span className="text-gray-800 dark:text-white">12-Apr-2025</span>
                              </div>
                              <div className="flex items-center">
                                <button
                                  onClick={() => {
                                    toast.success('Service Number generated & Energization process closed.');
                                    setExpandedEnergizationId(null);
                                  }}
                                  className="px-3 py-1.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white font-bold rounded shadow-sm text-[10px]"
                                >
                                  Complete Energize
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-gray-505 pt-2">
            <span>Showing 1 to 1 of 1 entries</span>
            <div className="flex items-center space-x-1">
              <button disabled className="px-3 py-1.5 rounded border border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed">Previous</button>
              <button className="px-3 py-1.5 rounded border bg-[#4B3E9E] text-white border-[#4B3E9E]">1</button>
              <button disabled className="px-3 py-1.5 rounded border border-gray-200 dark:border-slate-700 opacity-50 cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMoveIn = () => {
    return (
      <div className="space-y-6 text-left relative min-h-[85vh] max-w-[1700px] mx-auto animate-fadeIn">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4 text-left">
            <h2 className="text-base font-extrabold text-gray-905 dark:text-white uppercase tracking-wider">
              Pending Move In Requests
            </h2>
            <div className="relative animate-fadeIn">
              <select
                value={moveInDivision}
                onChange={(e) => setMoveInDivision(e.target.value as any)}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-850 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm space-y-4">
          <div className="overflow-x-auto border border-gray-150 dark:border-slate-700/60 rounded-xl">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3 text-left">Appl. No.</th>
                  <th className="py-3 px-3 text-center">Appl. Date</th>
                  <th className="py-3 px-3 text-left">Applicant</th>
                  <th className="py-3 px-3 text-left">BP/Consumer No.</th>
                  <th className="py-3 px-3 text-left">Service Type</th>
                  <th className="py-3 px-3 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
                {applications.slice(0, 1).map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50/20">
                    <td className="py-2.5 px-3 font-semibold text-gray-400 text-center">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-[#005BAC] text-left">{a.applicationNo}</td>
                    <td className="py-2.5 px-3 text-center">{formatDate(a.submittedDate)}</td>
                    <td className="py-2.5 px-3 font-semibold text-left">{a.fullName}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-500 text-left">BP-83{a.id}91</td>
                    <td className="py-2.5 px-3 font-bold text-gray-650 text-left">{a.connectionTypeName || 'LT Domestic'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          toast.success(`Move-in process completed for request ${a.applicationNo}.`);
                        }}
                        className="px-3 py-1.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-[10px] font-bold rounded transition shadow-sm w-full"
                      >
                        Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const typeParam = searchParams.get('type');

  if (typeParam === 'Material Master') {
    return renderMaterialMaster();
  }
  if (typeParam === 'Feeder Line Charge Master') {
    return renderFeederLineChargeMaster();
  }
  if (typeParam === 'Energy Security Charge Master') {
    return renderEnergySecurityChargeMaster();
  }
  if (typeParam === 'Money Receipt') {
    return renderMoneyReceipt();
  }
  if (typeParam === 'Job Allotment') {
    return renderJobAllotment();
  }
  if (typeParam === 'RFC TR Details') {
    return renderRfcTrDetails();
  }
  if (typeParam === 'Energizations') {
    return renderEnergizations();
  }
  if (typeParam === 'Move In') {
    return renderMoveIn();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tata-blue"></div>
        <p className="text-xs text-gray-400 font-semibold">Loading applications registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left relative min-h-[85vh] max-w-[1700px] mx-auto">
      
      {/* Provisional Connection Header Card */}
      {searchParams.get('type') === 'Provisional Connection' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-905 dark:text-white tracking-tight">
              Provisional {provisionalDivision} Connection Request(S)
            </h2>
            <div className="relative">
              <select
                value={provisionalDivision}
                onChange={(e) => {
                  setProvisionalDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate(`/customer/apply?type=provisional&division=${provisionalDivision}`)}
            className="px-5 py-2.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-full shadow transition"
          >
            Create New Request
          </button>
        </div>
      )}

      {/* Permanent LT Connection Header Card */}
      {searchParams.get('type') === 'Permanent LT Connection' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-905 dark:text-white tracking-tight">
              LT {permanentLtDivision} Connection Request(S)
            </h2>
            <div className="relative">
              <select
                value={permanentLtDivision}
                onChange={(e) => {
                  setPermanentLtDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate(`/customer/apply?type=permanent-lt&division=${permanentLtDivision}`)}
            className="px-5 py-2.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-full shadow transition"
          >
            Create New Request
          </button>
        </div>
      )}

      {/* Permanent HT Connection Header Card */}
      {searchParams.get('type') === 'Permanent HT Connection' && (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-905 dark:text-white tracking-tight">
              HT {permanentHtDivision} Connection Request(S)
            </h2>
            <div className="relative">
              <select
                value={permanentHtDivision}
                onChange={(e) => {
                  setPermanentHtDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate(`/customer/apply?type=permanent-ht&division=${permanentHtDivision}`)}
            className="px-5 py-2.5 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-full shadow transition"
          >
            Create New Request
          </button>
        </div>
      )}

      {/* Temporary Connection Header Card */}
      {searchParams.get('type') === 'Temporary Connection' && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight">
              Temporary {temporaryDivision} Connection Request(S)
            </h2>
            <div className="relative">
              <select
                value={temporaryDivision}
                onChange={(e) => {
                  setTemporaryDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate(`/customer/apply?type=temporary&division=${temporaryDivision}`)}
            className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
          >
            Create New Request
          </button>
        </div>
      )}

      {/* Separate Connection Header Card */}
      {searchParams.get('type') === 'Separate Connection' && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight">
              Separate Connection Service Requests
            </h2>
            <div className="relative">
              <select
                value={separateDivision}
                onChange={(e) => {
                  setSeparateDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              setCustomerConnectionType(separateDivision);
              setCustomerModalOpen(true);
            }}
            className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
          >
            Create New Request
          </button>
        </div>
      )}

      {/* Load Enhancement Request Header Card */}
      {searchParams.get('type') === 'Load Enhancement Request' && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight">
              Load Enhancement Requests
            </h2>
            <div className="relative">
              <select
                value={loadEnhancementDivision}
                onChange={(e) => {
                  setLoadEnhancementDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/customer/apply?type=enhancement')}
            className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
          >
            Add new request
          </button>
        </div>
      )}

      {/* Load Reduction Request Header Card */}
      {searchParams.get('type') === 'Load Reduction Request' && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight">
              Load Reduction Requests
            </h2>
            <div className="relative">
              <select
                value={loadReductionDivision}
                onChange={(e) => {
                  setLoadReductionDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/customer/apply?type=reduction')}
            className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
          >
            Add new request
          </button>
        </div>
      )}

      {/* Consumer Name Change Request Header Card */}
      {searchParams.get('type') === 'Consumer Name Change Request' && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight">
              Consumer Name Change Requests
            </h2>
            <div className="relative">
              <select
                value={nameChangeDivision}
                onChange={(e) => {
                  setNameChangeDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/customer/apply?type=namechange')}
            className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
          >
            Add new request
          </button>
        </div>
      )}

      {/* Ownership Transfer Legal Heir Request Header Card */}
      {searchParams.get('type') === 'Ownership Transfer Legal Heir Request' && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight">
              Ownership Transfer Legal Heir Requests
            </h2>
            <div className="relative">
              <select
                value={ownershipTransferDivision}
                onChange={(e) => {
                  setOwnershipTransferDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/customer/apply?type=ownershiptransfer')}
            className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
          >
            Add new request
          </button>
        </div>
      )}

      {/* Change of Consumer Category Header Card */}
      {(searchParams.get('type') === 'Change of Consumer Category / Shifting of Premises / Shifting of Meter and Switch Requests' || searchParams.get('type') === 'Change of Consumer Category') && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight text-wrap">
              Consumer Category / Shifting / Relocation Requests
            </h2>
            <div className="relative">
              <select
                value={categoryChangeDivision}
                onChange={(e) => {
                  setCategoryChangeDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/customer/apply?type=categorychange')}
            className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition whitespace-nowrap"
          >
            Add new request
          </button>
        </div>
      )}

      {/* Permanent Disconnection Request Header Card */}
      {searchParams.get('type') === 'Permanent Disconnection' && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight">
              Permanent Disconnection Request(S)
            </h2>
            <div className="relative">
              <select
                value={permanentDisconnectionDivision}
                onChange={(e) => {
                  setPermanentDisconnectionDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/customer/apply?type=disconnection')}
            className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition whitespace-nowrap"
          >
            Create New Request
          </button>
        </div>
      )}

      {/* Energy Meter Testing Request Header Card */}
      {searchParams.get('type') === 'Energy Meter Testing' && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight">
              Electricity Consumer Meter Test Request(S)
            </h2>
            <div className="relative">
              <select
                value={energyMeterTestingDivision}
                onChange={(e) => {
                  setEnergyMeterTestingDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/customer/apply?type=metertest')}
            className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition whitespace-nowrap"
          >
            Add new request
          </button>
        </div>
      )}

      {/* Exception Applications Header Card */}
      {isExceptionList && (
        <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-3 text-left">
            <h2 className="text-sm md:text-base font-extrabold text-gray-905 dark:text-white tracking-tight">
              {searchParams.get('type') === 'Regretted Applications' 
                ? 'Regretted Applications List' 
                : searchParams.get('type') === 'Hold Applications' 
                ? 'Hold Applications List' 
                : 'Archived Application List'}
            </h2>
            <div className="relative">
              <select
                value={regrettedDivision}
                onChange={(e) => {
                  setRegrettedDivision(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white dark:bg-slate-900 border border-[#e5e7eb] dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs font-bold text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-[#4B3E9E] shadow-sm"
              >
                <option value="Electricity">Electricity</option>
                <option value="Water">Water</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <ChevronDown size={14} className="text-gray-800 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Top horizontal filter bar */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-150 dark:border-slate-700/50 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="text-gray-700 dark:text-gray-300">From:</span>
          <input 
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-200 dark:border-slate-700 rounded-md px-2 py-1 outline-none bg-white dark:bg-slate-900 text-gray-700 dark:text-white focus:border-[#005BAC] text-center w-36 text-[11px] font-semibold"
          />

          <span className="text-gray-700 dark:text-gray-300">To:</span>
          <input 
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-[#e5e7eb] dark:border-slate-700 rounded-md px-2 py-1 outline-none bg-white dark:bg-slate-900 text-gray-700 dark:text-white focus:border-[#005BAC] text-center w-36 text-[11px] font-semibold"
          />

          <input 
            type="text"
            placeholder="Search by Appl No/ BPNo/ Applicant Name/ Phone"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="flex-1 min-w-[200px] border border-gray-200 dark:border-slate-700 rounded-md px-3 py-1 outline-none bg-white dark:bg-slate-900 text-gray-700 dark:text-white focus:border-[#005BAC] text-[11px]"
          />

          <button 
            onClick={handleApplyFilters}
            className="p-1.5 bg-[#007BFF] hover:bg-blue-600 text-white rounded-md shadow-sm flex items-center justify-center w-8 h-8 transition-all"
            title="Search"
          >
            <Search size={14} />
          </button>

          <button 
            onClick={() => handleExportData('CSV')}
            className="p-1.5 bg-[#007BFF] hover:bg-blue-600 text-white rounded-md shadow-sm flex items-center justify-center w-8 h-8 transition-all"
            title="Download CSV"
          >
            <Download size={14} />
          </button>
        </div>

        {/* Entries size selection and in-table search bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2.5 text-xs text-gray-650 dark:text-gray-400 font-semibold border-t border-gray-100 dark:border-slate-700/30 pt-2">
          <div className="flex items-center space-x-1">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-200 dark:border-slate-700 rounded px-1.5 py-0.5 bg-white dark:bg-slate-900 text-gray-700 dark:text-white outline-none text-[11px]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <span>Search:</span>
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-[#cccccc] dark:border-slate-700 rounded px-2 py-0.5 bg-white dark:bg-slate-900 text-gray-700 dark:text-white outline-none w-48 focus:border-[#005BAC] text-[11px]"
            />
          </div>
        </div>
      </div>

      {/* 5. Enterprise Data Table (Sticky header, sticky first column, expanded rows) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-700/50 overflow-hidden text-xs">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] relative">
          <table className="w-full text-xs text-left border-collapse table-auto">
            
            {/* Deep Purple header panel */}
            {isExceptionList ? (
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase sticky top-0 z-20 shadow-sm border-b border-gray-200/20 text-[10px]">
                <tr>
                  <th className="py-2 px-3 w-12 text-center cursor-pointer" onClick={() => handleSort('id')}>#</th>
                  <th className="py-2 px-3 w-32 cursor-pointer" onClick={() => handleSort('applicationNumber')}>Appl. No.</th>
                  <th className="py-2 px-3 w-32 cursor-pointer" onClick={() => handleSort('submittedDate')}>Appl. Date</th>
                  <th className="py-2 px-3 w-44 cursor-pointer" onClick={() => handleSort('fullName')}>Applicant</th>
                  <th className="py-2 px-3 w-36 cursor-pointer" onClick={() => handleSort('existingBpNo')}>BP/Consumer No.</th>
                  <th className="py-2 px-3 w-52 cursor-pointer">Service Type</th>
                  <th className="py-2 px-3 w-36 cursor-pointer">Supply Category</th>
                  <th className="py-2 px-3 w-40 cursor-pointer" onClick={() => handleSort('currentStage')}>Stage</th>
                  <th className="py-2 px-3 w-44 cursor-pointer">Updated By</th>
                  <th className="py-2 px-3 w-32 cursor-pointer">Updated On</th>
                  <th className="py-2 px-3 w-24 text-center">Action</th>
                </tr>
              </thead>
            ) : isCustomList ? (
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase sticky top-0 z-20 shadow-sm border-b border-gray-250/20 text-[10px]">
                <tr>
                  <th className="py-2 px-3 w-16 text-center cursor-pointer" onClick={() => handleSort('id')}>#</th>
                  <th className="py-2 px-3 w-32 cursor-pointer" onClick={() => handleSort('applicationNumber')}>Appl. No.</th>
                  <th className="py-2 px-3 w-32 cursor-pointer" onClick={() => handleSort('submittedDate')}>AppL. Date</th>
                  <th className="py-2 px-3 w-48 cursor-pointer" onClick={() => handleSort('fullName')}>Applicant</th>
                  <th className="py-2 px-3 w-40 cursor-pointer" onClick={() => handleSort('existingBpNo')}>BP/Consumer No.</th>
                  <th className="py-2 px-3 w-32 cursor-pointer" onClick={() => handleSort('currentStatus')}>Status</th>
                  <th className="py-2 px-3 w-40 text-center">Action</th>
                </tr>
              </thead>
            ) : (
              <thead className="bg-[#4B3E9E] text-white font-bold uppercase sticky top-0 z-20 shadow-sm border-b border-gray-200/20 text-[10px]">
                <tr>
                  <th className="py-2 px-2.5 w-12 cursor-pointer hover:bg-[#3b2e8e] transition text-center" onClick={() => handleSort('id')}>
                    <div className="flex items-center justify-center space-x-1">
                      <span>#</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-32 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('applicationNumber')}>
                    <div className="flex items-center space-x-1">
                      <span>Appl. No.</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-28 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('submittedDate')}>
                    <div className="flex items-center space-x-1">
                      <span>Appl. Date</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-36 cursor-pointer hover:bg-[#3b2e8e] transition">
                    <div className="flex items-center space-x-1">
                      <span>Service Type</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-32 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center space-x-1">
                      <span>Applicant</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-32 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('existingBpNo')}>
                    <div className="flex items-center space-x-1">
                      <span>BP/Consumer No</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-32 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('businessArea')}>
                    <div className="flex items-center space-x-1">
                      <span>Business Area</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-56 cursor-pointer hover:bg-[#3b2e8e] transition">
                    <div className="flex items-center space-x-1">
                      <span>Address</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-28 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('customerMobile')}>
                    <div className="flex items-center space-x-1">
                      <span>Phone No</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-32 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('currentStage')}>
                    <div className="flex items-center space-x-1">
                      <span>Stage</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-44 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('assignedOfficer')}>
                    <div className="flex items-center space-x-1">
                      <span>Pending At</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-28 cursor-pointer hover:bg-[#3b2e8e] transition" onClick={() => handleSort('currentStatus')}>
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                  <th className="py-2 px-3 w-24 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <span>Action</span>
                      <ChevronsUpDown size={11} className="opacity-80" />
                    </div>
                  </th>
                </tr>
              </thead>
            )}

            {/* Table Rows */}
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/40">
              {paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={isExceptionList ? 11 : isCustomList ? 7 : 13} className="py-16 text-center text-gray-400 font-black">
                    No registry rows match your filtering criteria.
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app, idx) => {
                  const serialNo = (currentPage - 1) * pageSize + idx + 1;
                  const isExpanded = expandedRowId === app.id;
                  const pendingDetails = getPendingAtDetails(app.assignedOfficer);

                  // Helper to format Pending At column
                  const getPendingAtText = () => {
                    if (app.applicationNumber === '260626021792' || app.fullName === 'Abhishek') {
                      return 'Abhishek - (8271039154)';
                    }
                    return `${pendingDetails.name} - (${app.customerMobile || '8271039154'})`;
                  };

                  return (
                    <React.Fragment key={app.id}>
                      {isExceptionList ? (
                        // Customized columns for Regretted Applications List
                        <tr className={`hover:bg-blue-50/15 dark:hover:bg-slate-750/30 transition-colors odd:bg-gray-55/40 even:bg-white dark:odd:bg-slate-800/40 dark:even:bg-slate-850 ${isExpanded ? 'bg-[#005BAC]/5' : ''}`}>
                          {/* # (Serial No) */}
                          <td className="py-2.5 px-3 text-center text-gray-400 font-bold">{serialNo}</td>

                          {/* Appl. No. */}
                          <td className="py-2.5 px-3 font-mono font-black text-[#005BAC] dark:text-tata-blue-light">
                            {app.applicationNumber}
                          </td>

                          {/* AppL. Date */}
                          <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400 font-semibold">
                            {formatDate(app.submittedDate)}
                          </td>

                          {/* Applicant */}
                          <td className="py-2.5 px-3 font-bold text-gray-750 dark:text-gray-200">
                            {app.fullName || app.customerName || 'Varun Arora'}
                          </td>

                          {/* BP/Consumer No. */}
                          <td className="py-2.5 px-3 font-mono font-bold text-gray-600 dark:text-gray-355">
                            {app.existingBpNo || '-'}
                          </td>

                          {/* Service Type */}
                          <td className="py-2.5 px-3 font-semibold text-gray-750 dark:text-gray-200">
                            {app.connectionTypeName || app.applicationType || 'Load Change-Enhancement'}
                          </td>

                          {/* Supply Category */}
                          <td className="py-2.5 px-3 font-semibold text-gray-755 dark:text-gray-300">
                            {app.connectionCategory || app.propertyType || 'CATEGORY'}
                          </td>

                          {/* Stage */}
                          <td className="py-2.5 px-3 font-semibold text-indigo-650 dark:text-indigo-400">
                            {app.currentStage || 'Load Survey Approval'}
                          </td>

                          {/* Updated By */}
                          <td className="py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-300">
                            {(() => {
                              if (app.statusHistory && app.statusHistory.length > 0) {
                                const latest = app.statusHistory[app.statusHistory.length - 1];
                                return latest.updatedByName || 'Koustav Banerjee [151556]';
                              }
                              // Mock fallback
                              if (app.applicationNumber === '2312200562') return 'Koustav Banerjee [151556]';
                              if (app.applicationNumber === '24030901347') return 'Abhishek [8271039154]';
                              if (app.applicationNumber === '24041005412') return 'Koustav Banerjee [151556]';
                              return 'Abhishek [8271039154]';
                            })()}
                          </td>

                          {/* Updated On */}
                          <td className="py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-400">
                            {(() => {
                              if (app.statusHistory && app.statusHistory.length > 0) {
                                const latest = app.statusHistory[app.statusHistory.length - 1];
                                return formatDate(latest.updatedDate);
                              }
                              // Mock fallback matching the screenshot
                              if (app.applicationNumber === '2312200562') return '-';
                              if (app.applicationNumber === '24030901347') return '31-Jul-2025';
                              if (app.applicationNumber === '24041005412') return '-';
                              if (app.applicationNumber.startsWith('250120021612')) return '29-Jul-2025';
                              if (app.applicationNumber === '250120021613') return '16-Feb-2026';
                              if (app.applicationNumber === '251223021677') return '06-Feb-2026';
                              if (app.applicationNumber === '251224051679') return '06-Feb-2026';
                              if (app.applicationNumber === '251224021680') return '01-Apr-2026';
                              return '-';
                            })()}
                          </td>

                          {/* Action toggle */}
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : app.id)}
                              className="p-1 hover:bg-gray-150 dark:hover:bg-slate-700 rounded-full transition text-gray-500 dark:text-gray-300 inline-flex items-center justify-center w-7 h-7"
                              title={isExpanded ? "Collapse Row" : "Expand Row"}
                            >
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          </td>
                        </tr>
                      ) : isCustomList ? (
                        // Customized columns for Load Enhancement Request
                        <tr className={`hover:bg-blue-50/15 dark:hover:bg-slate-750/30 transition-colors odd:bg-gray-55/40 even:bg-white dark:odd:bg-slate-800/40 dark:even:bg-slate-850 ${isExpanded ? 'bg-[#005BAC]/5' : ''}`}>
                          {/* # (Serial No) */}
                          <td className="py-2.5 px-3 text-center text-gray-400 font-bold">{serialNo}</td>

                          {/* Appl. No. */}
                          <td className="py-2.5 px-3 font-mono font-black text-[#005BAC] dark:text-tata-blue-light">
                            {app.applicationNumber}
                          </td>

                          {/* AppL. Date */}
                          <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400 font-semibold">
                            {formatDate(app.submittedDate)}
                          </td>

                          {/* Applicant */}
                          <td className="py-2.5 px-3 font-bold text-gray-750 dark:text-gray-200">
                            {app.fullName || app.customerName}
                          </td>

                          {/* BP/Consumer No. */}
                          <td className="py-2.5 px-3 font-mono font-bold text-gray-600 dark:text-gray-355">
                            {app.existingBpNo || '-'}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3 font-semibold text-gray-750 dark:text-gray-200">
                            {app.currentStatus}
                          </td>

                          {/* Action */}
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center space-x-3">
                               <button
                                type="button"
                                onClick={() => navigate(`/customer/apply?type=${getEditDetailsUrlType()}&id=${app.id}`)}
                                className="p-1 hover:bg-gray-150 dark:hover:bg-slate-700 rounded transition text-gray-750 dark:text-gray-300"
                                title="Edit Details"
                              >
                                <FileEdit size={13} />
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handlePrintAppInvoice(app)}
                                className="p-1 hover:bg-gray-150 dark:hover:bg-slate-700 rounded transition text-gray-755 dark:text-gray-300"
                                title="Print"
                              >
                                <Printer size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handlePrintReceipt(app)}
                                className="p-1 hover:bg-gray-150 dark:hover:bg-slate-700 rounded transition text-gray-755 dark:text-gray-300"
                                title="Print Receipt"
                              >
                                <FileText size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setExpandedRowId(isExpanded ? null : app.id)}
                                className="p-1 hover:bg-gray-150 dark:hover:bg-slate-700 rounded-full transition text-gray-500 dark:text-gray-300 ml-1 inline-flex items-center justify-center w-7 h-7"
                                title={isExpanded ? "Collapse Row" : "Expand Row"}
                              >
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        // Standard columns for other connection types
                        <tr className={`hover:bg-blue-50/15 dark:hover:bg-slate-750/30 transition-colors odd:bg-gray-50/35 even:bg-white dark:odd:bg-slate-800/40 dark:even:bg-slate-850 ${isExpanded ? 'bg-[#005BAC]/5' : ''}`}>
                          
                          {/* S.No */}
                          <td className="py-1.5 px-3 text-center text-gray-400 font-bold">{serialNo}</td>

                          {/* Application Number */}
                          <td className="py-1.5 px-3 font-mono font-black text-[#005BAC] dark:text-tata-blue-light">
                            {app.applicationNumber}
                          </td>

                          {/* Application Date */}
                          <td className="py-1.5 px-3 text-gray-600 dark:text-gray-400 font-semibold">
                            {formatDate(app.submittedDate)}
                          </td>

                          {/* Service Type */}
                          <td className="py-1.5 px-3 font-semibold text-gray-700 dark:text-gray-300">
                            {app.connectionTypeName || app.applicationType || 'New Connection'}
                          </td>

                          {/* Applicant Name */}
                          <td className="py-1.5 px-3 font-bold text-gray-750 dark:text-gray-200">
                            {app.fullName || app.customerName}
                          </td>

                          {/* BP / Consumer Number */}
                          <td className="py-1.5 px-3 font-mono font-bold text-gray-600 dark:text-gray-355">
                            {app.existingBpNo || '-'}
                          </td>

                          {/* Business Area */}
                          <td className="py-1.5 px-3 font-semibold text-gray-700 dark:text-gray-300 uppercase">
                            {app.businessArea || 'JAMSHEDPUR'}
                          </td>

                          {/* Address (Wrapping address cells) */}
                          <td className="py-1.5 px-3 text-gray-600 dark:text-gray-400 whitespace-normal break-words leading-relaxed font-semibold">
                            {app.addressLine1} {app.addressLine2 || ''}
                          </td>

                          {/* Mobile Number */}
                          <td className="py-1.5 px-3 font-mono font-semibold text-gray-600">
                            {app.customerMobile}
                          </td>

                          {/* Current Stage */}
                          <td className="py-1.5 px-3 font-semibold text-indigo-650 dark:text-indigo-400">
                            {app.currentStage}
                          </td>

                          {/* Pending At (Officer) */}
                          <td className="py-1.5 px-3 text-left leading-normal font-semibold text-gray-600 dark:text-gray-450">
                            {getPendingAtText()}
                          </td>

                          {/* Status (Plain text) */}
                          <td className="py-1.5 px-3 font-semibold text-gray-750 dark:text-gray-200">
                            {app.currentStatus}
                          </td>

                          {/* Action Toggle Chevron */}
                          <td className="py-1.5 px-3 text-right">
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : app.id)}
                              className="p-1 hover:bg-gray-150 dark:hover:bg-slate-700 rounded-full transition-all text-gray-500 dark:text-gray-300 inline-flex items-center justify-center w-7 h-7"
                              title={isExpanded ? "Collapse Row" : "Expand Row"}
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>

                        </tr>
                      )}

                      {/* Expanded details row */}
                      {isExpanded && (
                        isExceptionList ? (
                          <tr className="bg-[#f8f9fa] dark:bg-slate-900/60 transition-all">
                            <td colSpan={11} className="p-4 border-y border-gray-250 dark:border-slate-700">
                              <div className="flex flex-col lg:flex-row gap-6 text-xs text-left">
                                
                                {/* Left purple card */}
                                <div className="bg-[#4B3E9E] dark:bg-indigo-950 text-white p-4 rounded-xl flex flex-col justify-between w-64 min-h-[120px] shadow-sm">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-white/70 text-[9px] uppercase font-bold block">Business Area</span>
                                      <span className="text-cyan-300 font-extrabold text-[11px] block mt-0.5 uppercase">
                                        {app.businessArea || 'JAMSHEDPUR'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-white/70 text-[9px] uppercase font-bold block">Division</span>
                                      <span className="text-cyan-300 font-extrabold text-[11px] block mt-0.5">
                                        {app.division || 'Electricity'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Center: Contact Details */}
                                <div className="flex flex-col justify-center gap-4 py-1 flex-1 min-w-[200px]">
                                  <div>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Mobile</span>
                                    <span className="text-gray-900 dark:text-white font-bold text-xs block mt-0.5 font-mono">
                                      {app.customerMobile || app.phoneNumber || '8271039154'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Email ID</span>
                                    <span className="text-gray-900 dark:text-white font-bold text-xs block mt-0.5">
                                      {app.customerEmail || app.emailId || 'varun.abf@gmail.com'}
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Buttons Stack */}
                                <div className="flex flex-wrap items-center gap-3 justify-end min-w-[320px] pr-4">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      toast.success('Application request revoked successfully.');
                                    }}
                                    className="px-5 py-2 bg-[#0275D8] hover:bg-blue-600 text-white font-bold rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    Revoke
                                  </button>

                                  {!isArchivedList && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setViewingLetterApp(app);
                                      }}
                                      className="px-5 py-2 bg-[#8A95A5] hover:bg-slate-500 text-white font-bold rounded-full text-xs transition duration-200 shadow-sm"
                                    >
                                      ViewLetter
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFeedbackApp(app);
                                      setFeedbackModalOpen(true);
                                      setFeedbackComment('');
                                      setFeedbackFile(null);
                                    }}
                                    className="px-5 py-2 bg-[#FFC107] hover:bg-[#e0a800] text-gray-900 font-bold rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    Feedback
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setDrawerOpen(true);
                                      setDrawerTab('Timeline');
                                    }}
                                    className="px-5 py-2 bg-[#5CB85C] hover:bg-green-600 text-white font-bold rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    History
                                  </button>
                                </div>

                              </div>
                            </td>
                          </tr>
                        ) : isCustomList ? (
                          searchParams.get('type') === 'Energy Meter Testing' ? (
                            // Special Energy Meter Testing expanded row with Meter-1 / Meter-2 columns
                            <tr className="bg-[#f8f9fa] dark:bg-slate-900/60 transition-all">
                              <td colSpan={7} className="p-4 border-y border-gray-250 dark:border-slate-700">
                                <div className="flex flex-col lg:flex-row gap-6 text-xs text-left">
                                  
                                  {/* Left purple card: Phone / Premise / Reason */}
                                  <div className="bg-[#4B3E9E] dark:bg-indigo-950 text-white p-4 rounded-xl flex flex-col justify-between w-72 min-h-[140px] shadow-sm">
                                    <div className="space-y-3">
                                      <div>
                                        <span className="text-white/70 text-[9px] uppercase font-bold block">Phone</span>
                                        <span className="text-cyan-300 font-extrabold text-[11px] block mt-0.5">{app.customerMobile || app.phoneNumber || '8271039154'}</span>
                                      </div>
                                      <div>
                                        <span className="text-white/70 text-[9px] uppercase font-bold block">Premise</span>
                                        <span className="text-cyan-300 font-extrabold text-[11px] block mt-0.5 whitespace-normal break-words leading-normal">{app.addressLine1 || 'SDFGHJKL'}</span>
                                      </div>
                                      <div>
                                        <span className="text-white/70 text-[9px] uppercase font-bold block">Reason for Test</span>
                                        <span className="text-yellow-300 font-extrabold text-[11px] block mt-0.5">{app.loadRequirement || 'Burnt out'}</span>
                                      </div>
                                    </div>
                                    {((app.currentStatus as string) === 'Regretted' || (app.currentStatus as string) === 'Returned') && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFeedbackApp(app);
                                          setFeedbackModalOpen(true);
                                          setFeedbackComment('');
                                          setFeedbackFile(null);
                                        }}
                                        className="w-full mt-3 py-1.5 bg-[#FFC107] hover:bg-[#e0a800] text-gray-900 font-bold rounded-lg text-xs transition duration-200 shadow-sm"
                                      >
                                        Feedback
                                      </button>
                                    )}
                                  </div>

                                  {/* Right: Meter Particulars Table */}
                                  <div className="flex-1 overflow-x-auto">
                                    <table className="w-full text-[11px] border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                      <thead>
                                        <tr className="bg-[#4B3E9E] text-white">
                                          <th className="text-left px-3 py-2 font-bold">Particulars</th>
                                          <th className="text-left px-3 py-2 font-bold">Meter -1 (Main Meter)</th>
                                          <th className="text-left px-3 py-2 font-bold">Meter-2(Sub/ Check Meter)</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                        <tr className="bg-white dark:bg-slate-800">
                                          <td className="px-3 py-2 font-bold text-gray-700 dark:text-gray-300">Consumer Category:</td>
                                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{app.propertyType || 'LTDS'}</td>
                                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">LTDS</td>
                                        </tr>
                                        <tr className="bg-gray-50 dark:bg-slate-900/40">
                                          <td className="px-3 py-2 font-bold text-gray-700 dark:text-gray-300">Meter Sl No.</td>
                                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white font-mono">{app.surveyNumber || '1234567890'}</td>
                                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white font-mono">1234567890</td>
                                        </tr>
                                        <tr className="bg-white dark:bg-slate-800">
                                          <td className="px-3 py-2 font-bold text-gray-700 dark:text-gray-300">Meter Make.</td>
                                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{app.vendorName || 'Genus'}</td>
                                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">Secure</td>
                                        </tr>
                                        <tr className="bg-gray-50 dark:bg-slate-900/40">
                                          <td className="px-3 py-2 font-bold text-gray-700 dark:text-gray-300">Meter Type.</td>
                                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{app.voltageRequirement === 'HT' ? '3phase' : '1phasemain'}</td>
                                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">1phaseSub</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>

                                </div>
                              </td>
                            </tr>
                          ) : (
                          // Standard isCustomList expanded row (Load Enhancement / Reduction / etc.)
                          <tr className="bg-[#f8f9fa] dark:bg-slate-900/60 transition-all">
                            <td colSpan={7} className="p-4 border-y border-gray-250 dark:border-slate-700">
                              <div className="flex flex-col lg:flex-row gap-6 text-xs text-left">
                                
                                {/* Left purple card */}
                                <div className="bg-[#4B3E9E] dark:bg-indigo-950 text-white p-4 rounded-xl flex flex-col justify-between w-64 min-h-[140px] shadow-sm">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-white/70 text-[9px] uppercase font-bold block">{getCustomCardDetails(app).lbl1}</span>
                                      <span className="text-cyan-300 font-extrabold text-[11px] block mt-0.5 whitespace-normal break-all leading-normal">{getCustomCardDetails(app).val1}</span>
                                    </div>
                                    <div>
                                      <span className="text-white/70 text-[9px] uppercase font-bold block">{getCustomCardDetails(app).lbl2}</span>
                                      <span className="text-cyan-300 font-extrabold text-[11px] block mt-0.5 whitespace-normal break-all leading-normal">
                                        {getCustomCardDetails(app).val2}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-white/70 text-[9px] uppercase font-bold block">Business Area</span>
                                      <span className="text-cyan-300 font-extrabold text-[11px] block mt-0.5 uppercase">
                                        {app.businessArea || 'JAMSHEDPUR'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-white/70 text-[9px] uppercase font-bold block">Division</span>
                                      <span className="text-cyan-300 font-extrabold text-[11px] block mt-0.5">
                                        {getCustomCardDetails(app).div}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {((app.currentStatus as string) === 'Regretted' || (app.currentStatus as string) === 'Returned') && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFeedbackApp(app);
                                        setFeedbackModalOpen(true);
                                        setFeedbackComment('');
                                        setFeedbackFile(null);
                                      }}
                                      className="w-full mt-3 py-1.5 bg-[#FFC107] hover:bg-[#e0a800] text-gray-900 font-bold rounded-lg text-xs transition duration-200 shadow-sm"
                                    >
                                      Feedback
                                    </button>
                                  )}
                                </div>

                                {/* Center: Applicant Details */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-1 flex-1 min-w-[300px]">
                                  <div>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Applicant</span>
                                    <span className="text-gray-900 dark:text-white font-bold text-xs block mt-0.5">
                                      {app.fullName || app.customerName}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Mobile</span>
                                    <span className="text-gray-900 dark:text-white font-bold text-xs block mt-0.5 font-mono">
                                      {app.customerMobile}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Request Date</span>
                                    <span className="text-gray-900 dark:text-white font-bold text-xs block mt-0.5">
                                      {formatDate(app.submittedDate)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Email ID</span>
                                    <span className="text-gray-900 dark:text-white font-bold text-xs block mt-0.5">
                                      {app.customerEmail || 'abhishek.krgupta@yahoo.in'}
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Address */}
                                <div className="py-1 w-80 text-left">
                                  <span className="text-gray-400 text-[10px] font-bold uppercase block">Address</span>
                                  <span className="text-gray-900 dark:text-white font-semibold text-xs block mt-1 leading-relaxed whitespace-normal break-words">
                                    {app.addressLine1} {app.addressLine2 || ''}
                                  </span>
                                </div>

                              </div>
                            </td>
                          </tr>
                        ) ) : (
                          <tr className="bg-[#f8f9fa] dark:bg-slate-900/60 transition-all">
                            <td colSpan={13} className="p-6 border-y border-gray-250 dark:border-slate-700">
                              <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-8 text-xs">
                                
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
                                      {app.customerMobile || '8271039154'}
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
                                </div>

                                {/* Actions pill stack */}
                                <div className="flex flex-col space-y-2 justify-center min-w-[180px]">
                                  <button 
                                    onClick={() => {
                                      setSelectedApp(app);
                                      setDrawerOpen(true);
                                      setDrawerTab('Timeline');
                                    }}
                                    className="bg-[#5CB85C] hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    History
                                  </button>
                                  
                                  <button 
                                    onClick={() => {
                                      toast.info(`Feedback logs loaded for Application: ${app.applicationNumber}`);
                                    }}
                                    className="bg-[#F0AD4E] hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    Feedback
                                  </button>

                                  <button 
                                    onClick={() => {
                                      navigate(`/customer/track?id=${app.id}`);
                                    }}
                                    className="bg-[#0275D8] hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    Track Application
                                  </button>

                                  <button 
                                    onClick={() => handlePrintAppInvoice(app)}
                                    className="bg-[#E5A900] hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full text-xs transition duration-200 shadow-sm"
                                  >
                                    Print Application
                                  </button>
                                </div>

                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-55/65 dark:bg-slate-900/30 border-t border-gray-100 dark:border-slate-750 flex justify-between items-center text-xs">
            <span className="text-gray-400 font-bold">Showing page {currentPage} of {totalPages}</span>
            <div className="flex space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* VIEW DRAWERS METADATA AND FILE PREVIEWS */}
      {drawerOpen && selectedApp && (
        <>
          {/* Drawer backdrop */}
          <div onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs" />
          
          {/* Drawer window */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white dark:bg-slate-800 shadow-2xl border-l border-gray-150 dark:border-slate-700/60 flex flex-col">
            
            {/* Header */}
            <div className="bg-[#005BAC] text-white p-5 flex justify-between items-center">
              <div className="text-left space-y-1">
                <span className="text-xs uppercase font-black text-blue-100 tracking-wider">Application Desk Audit</span>
                <h3 className="text-sm font-extrabold leading-none">{selectedApp.applicationNumber}</h3>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-full transition">
                <X size={18} />
              </button>
            </div>

            {/* Tab controls */}
            <div className="flex border-b border-gray-100 dark:border-slate-700 text-xs font-bold text-gray-400 bg-gray-50/50 dark:bg-slate-900/10">
              {['Overview', 'Timeline', 'Audit', 'Documents'].map((tab: any) => (
                <button
                  key={tab}
                  onClick={() => setDrawerTab(tab)}
                  className={`flex-1 py-3 text-center border-b-2 transition ${
                    drawerTab === tab 
                      ? 'border-[#005BAC] text-[#005BAC] dark:text-tata-blue-light bg-white dark:bg-slate-800' 
                      : 'border-transparent hover:text-gray-600 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Drawer Body Scroll panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Tab 1: Overview details */}
              {drawerTab === 'Overview' && (
                <div className="space-y-6 text-xs text-left">
                  
                  {/* General section */}
                  <div className="grid grid-cols-2 gap-4 bg-gray-55/65 dark:bg-slate-900/20 p-4.5 rounded-2xl border border-gray-100 dark:border-slate-750">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">APPLICANT FULL NAME</span>
                      <span className="font-extrabold text-gray-800 dark:text-white mt-1 block">{selectedApp.fullName || selectedApp.customerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">CONNECTION CATEGORY</span>
                      <span className="font-extrabold text-gray-800 dark:text-white mt-1 block">{selectedApp.connectionTypeName || 'New LT Connection'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">MOBILE NUMBER</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300 mt-1 block">{selectedApp.customerMobile}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">BP CONSUMER NUMBER</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300 mt-1 block font-mono">{selectedApp.existingBpNo || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">Site Address & Property Specifications</h4>
                    <div className="bg-white dark:bg-slate-800 p-4 border border-gray-150 dark:border-slate-700/60 rounded-xl space-y-3">
                      <p><strong>Address:</strong> {selectedApp.addressLine1} {selectedApp.addressLine2 || ''}, {selectedApp.city}, {selectedApp.state} - {selectedApp.pinCode}</p>
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <p><strong>Voltage Requirement:</strong> {selectedApp.voltageRequirement || 'N/A'}</p>
                        <p><strong>Load Requirement:</strong> {selectedApp.loadRequirement || 'N/A'}</p>
                        <p><strong>Plot Number:</strong> {selectedApp.plotNumber || 'N/A'}</p>
                        <p><strong>Survey Number:</strong> {selectedApp.surveyNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reassign Officer Box */}
                  <div className="p-4 bg-gray-55/65 dark:bg-slate-750/30 rounded-xl border border-gray-150 dark:border-slate-700/50 space-y-3">
                    <label className="block text-[10px] text-gray-400 font-bold">REASSIGN RESPONSIBLE OFFICER</label>
                    <div className="flex space-x-2">
                      <select 
                        value={officerName}
                        onChange={(e) => setOfficerName(e.target.value)}
                        className="flex-1 p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-gray-700 dark:text-white"
                      >
                        <option value="">Select Officer...</option>
                        <option value="Officer 1 - Doc Verifier">Officer 1 - Doc Verifier</option>
                        <option value="Officer 2 - Tech Surveyor">Officer 2 - Tech Surveyor</option>
                        <option value="Officer 3 - Approval Officer">Officer 3 - Approval Officer</option>
                      </select>
                      <button 
                        onClick={handleReassignOfficer}
                        className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white font-bold rounded-lg transition"
                      >
                        Reassign
                      </button>
                    </div>
                  </div>

                  {/* Actions Transition Controls */}
                  <div className="p-4 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700/60 rounded-xl space-y-4">
                    <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">Verification Action Controls</h4>
                    
                    <div className="space-y-2">
                      <label className="block text-[10px] text-gray-400 font-bold">WORKFLOW REMARKS / INSTRUCTIONS</label>
                      <textarea
                        rows={3}
                        placeholder="Specify survey report notes, document validation errors, or approval parameters..."
                        value={statusRemarks}
                        onChange={(e) => setStatusRemarks(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-slate-750 border border-gray-200 dark:border-slate-650 rounded-lg outline-none font-semibold text-gray-750 dark:text-gray-250"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => handleTransitionWorkflow('Correction')}
                        className="py-2.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-750 dark:bg-yellow-950/20 dark:text-yellow-400 font-bold rounded-lg border border-yellow-200 dark:border-yellow-900/50 text-center transition"
                      >
                        Request Correction
                      </button>
                      <button
                        onClick={() => handleTransitionWorkflow('Reject')}
                        className="py-2.5 bg-red-50 hover:bg-red-100 text-red-750 dark:bg-red-950/20 dark:text-red-400 font-bold rounded-lg border border-red-200 dark:border-red-900/50 text-center transition"
                      >
                        Reject Request
                      </button>
                      <button
                        onClick={() => setWorkflowModalOpen(true)}
                        className="py-2.5 bg-green-650 hover:bg-green-700 text-white font-bold rounded-lg text-center transition shadow"
                      >
                        Approve Stage
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 2: TIMELINE TRACKER */}
              {drawerTab === 'Timeline' && (
                <div className="space-y-6 text-left">
                  <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">Sequential Connection Roadmap</h4>
                  
                  <div className="relative border-l-2 border-gray-200 dark:border-slate-700 ml-3 space-y-6 py-2 text-xs">
                    {allStages.map((stageName, sIdx) => {
                      const isHistoryFound = selectedApp.statusHistory?.some(h => h.stage === stageName);
                      const isCurrent = selectedApp.currentStage === stageName;
                      const isCorrection = isCurrent && selectedApp.currentStatus === 'Correction Required';

                      let nodeColor = 'bg-gray-200 dark:bg-slate-700 text-gray-400';
                      let labelColor = 'text-gray-400';

                      if (isHistoryFound && !isCurrent) {
                        nodeColor = 'bg-green-500 text-white';
                        labelColor = 'text-green-600 dark:text-green-400 font-bold';
                      } else if (isCurrent) {
                        if (isCorrection) {
                          nodeColor = 'bg-yellow-500 text-white animate-pulse';
                          labelColor = 'text-yellow-600 dark:text-yellow-400 font-bold';
                        } else {
                          nodeColor = 'bg-blue-500 text-white animate-pulse';
                          labelColor = 'text-tata-blue dark:text-tata-blue-light font-bold';
                        }
                      }

                      return (
                        <div key={stageName} className="relative pl-6 flex items-start">
                          <span className={`absolute -left-[9px] top-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] font-extrabold shadow ${nodeColor}`}>
                            {isHistoryFound && !isCurrent ? '✓' : sIdx + 1}
                          </span>
                          <div>
                            <p className={`${labelColor}`}>{stageName}</p>
                            {isCurrent && (
                              <p className="text-[10px] text-gray-455 italic mt-0.5">
                                {isCorrection ? 'Status: Correction Required by customer' : `Assigned officer: ${selectedApp.assignedOfficer}`}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: AUDIT TRAIL LOGS */}
              {drawerTab === 'Audit' && (
                <div className="space-y-4 text-xs text-left">
                  <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">System Stage History Logs</h4>
                  
                  {(!selectedApp.statusHistory || selectedApp.statusHistory.length === 0) ? (
                    <p className="text-gray-400 italic">No stage history recorded yet.</p>
                  ) : (
                    <div className="border border-gray-150 dark:border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-55 dark:bg-slate-800 text-gray-400 font-bold uppercase text-[9px]">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Actor</th>
                            <th className="py-2.5 px-3">Status / Stage</th>
                            <th className="py-2.5 px-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/40 text-[11px]">
                          {selectedApp.statusHistory.map((hist, hIdx) => (
                            <tr key={hIdx}>
                              <td className="py-2.5 px-3 text-gray-400 font-mono">
                                {hist.updatedDate ? new Date(hist.updatedDate).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-gray-700 dark:text-gray-250">
                                {hist.updatedByName}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-tata-blue dark:text-tata-blue-light">{hist.stage}</span>
                                <span className="block text-[10px] text-gray-450 font-bold">{hist.status}</span>
                              </td>
                              <td className="py-2.5 px-3 text-gray-500 italic">
                                {hist.notes || 'None'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: DOCUMENTS CHECKLIST */}
              {drawerTab === 'Documents' && (
                <div className="space-y-4 text-xs text-left">
                  <h4 className="font-extrabold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">Verification Document Checklist</h4>
                  
                  {(!selectedApp.documents || selectedApp.documents.length === 0) ? (
                    <p className="text-gray-400 italic">No documents uploaded for this connection.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedApp.documents.map(doc => (
                        <div 
                          key={doc.id}
                          className="p-4 border border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-850 rounded-xl flex flex-col space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-800 dark:text-white text-[12px]">{doc.documentType}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{doc.fileName} ({Math.round(doc.fileSize / 1024)} KB)</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              doc.verificationStatus === 'Verified' ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-950/20' : 
                              doc.verificationStatus === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/20' : 
                              'bg-yellow-50 text-yellow-750 border border-yellow-100 dark:bg-yellow-950/20'
                            }`}>
                              {doc.verificationStatus}
                            </span>
                          </div>

                          {doc.rejectionReason && (
                            <div className="p-2.5 bg-red-50/55 dark:bg-red-950/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded text-[11px] font-semibold italic">
                              Rejection Reason: {doc.rejectionReason}
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setPreviewingDoc(doc)}
                              className="px-3 py-1.5 bg-white hover:bg-gray-100 dark:bg-slate-750 text-gray-700 dark:text-white border border-gray-200 dark:border-slate-650 rounded text-[10px] font-bold flex items-center transition"
                            >
                              <Eye size={12} className="mr-1" /> Preview File
                            </button>

                            {doc.verificationStatus === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleVerifyDoc(doc.id)}
                                  className="px-3 py-1.5 bg-green-650 hover:bg-green-700 text-white rounded text-[10px] font-bold flex items-center transition"
                                >
                                  <Check size={12} className="mr-1" /> Verify
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectingDocId(doc.id);
                                    setDocRejectionReason('');
                                  }}
                                  className="px-3 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded text-[10px] font-bold flex items-center transition"
                                >
                                  <X size={12} className="mr-1" /> Reject
                                </button>
                              </>
                            )}
                          </div>

                          {/* Rejection input field display */}
                          {rejectingDocId === doc.id && (
                            <div className="p-3 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-xl space-y-2 mt-2">
                              <label className="block text-[10px] text-gray-400 font-bold uppercase">REJECTION REASON</label>
                              <input 
                                type="text"
                                placeholder="Specify exact rejection reason..."
                                value={docRejectionReason}
                                onChange={(e) => setDocRejectionReason(e.target.value)}
                                className="w-full p-2 bg-gray-55 dark:bg-slate-750 text-xs border border-gray-205 dark:border-slate-650 rounded outline-none font-semibold text-gray-750"
                              />
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleRejectDoc(doc.id)}
                                  className="px-3 py-1 bg-red-650 text-white rounded text-[10px] font-bold transition"
                                >
                                  Confirm Rejection
                                </button>
                                <button 
                                  onClick={() => setRejectingDocId(null)}
                                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* Regret Letter Preview Modal */}
      {viewingLetterApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#f1f5f9] dark:bg-slate-900 p-6 rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-200 dark:border-slate-700/60 font-sans text-left space-y-4">
            
            {/* Modal Container Sheet of Paper */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded shadow-md border border-gray-250 dark:border-slate-700/50 max-w-2xl mx-auto text-gray-900 dark:text-gray-100 text-xs leading-relaxed font-sans">
              
              {/* TATA Logo */}
              <div className="text-center mb-6">
                <svg className="mx-auto mb-1" width="45" height="30" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 50 L40 10 L50 25 L60 10 L85 50" stroke="#005bac" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                </svg>
                <div className="font-sans font-black text-base text-[#005bac] tracking-widest uppercase">TATA</div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-0.5 mb-6 text-left">
                <div className="font-extrabold text-sm text-gray-900 dark:text-white">{viewingLetterApp.fullName || viewingLetterApp.customerName || 'Varun Arora'}</div>
                <div className="font-bold text-gray-650 dark:text-gray-400">{viewingLetterApp.addressLine1 || 'Test Road'}</div>
              </div>

              {/* Ref & Date Row */}
              <div className="flex justify-between items-center font-bold mb-6 text-gray-800 dark:text-gray-200">
                <div>Ref. No.: PSD/JSR/{viewingLetterApp.applicationNumber}/{viewingLetterApp.submittedDate ? new Date(viewingLetterApp.submittedDate).getFullYear() : new Date().getFullYear()}</div>
                <div>Date: {viewingLetterApp.lastUpdated ? new Date(viewingLetterApp.lastUpdated).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</div>
              </div>

              {/* Subject & Reference */}
              <div className="space-y-1 mb-6 font-bold text-gray-950 dark:text-white border-l-2 border-[#005bac] pl-3">
                <div>Subject: {viewingLetterApp.connectionTypeName || viewingLetterApp.applicationType || 'Load Change'} at {viewingLetterApp.addressLine1 || 'Test Road'}</div>
                <div>Reference: Receipt No. {viewingLetterApp.applicationNumber}</div>
              </div>

              {/* Letter Body */}
              <div className="space-y-4 mb-8">
                <p className="font-semibold text-gray-700 dark:text-gray-300">Dear Sir/Madam,</p>
                <p className="font-semibold text-gray-750 dark:text-gray-300">
                  {viewingLetterApp.currentStatus?.toLowerCase() === 'hold' 
                    ? 'We regret to inform you that your subject application has been placed on hold due to following reason(s):' 
                    : 'We regret to inform you that your subject application has been rejected due to following reason(s):'}
                </p>
                <ul className="list-disc list-inside pl-4 font-bold text-red-600 dark:text-red-400 space-y-1.5">
                  {(() => {
                    const docRejections = viewingLetterApp.documents?.filter(d => d.verificationStatus === 'Rejected' && d.rejectionReason) || [];
                    if (docRejections.length > 0) {
                      return docRejections.map((d, i) => (
                        <li key={i}>{d.rejectionReason}</li>
                      ));
                    }
                    return (
                      <li>Objection due to deviation / unauthorized construction</li>
                    );
                  })()}
                </ul>
              </div>

              {/* Signoff */}
              <div className="space-y-1 mb-6 text-gray-755 dark:text-gray-300">
                <p>Thanking you,</p>
                <p>For and on behalf of Tata Steel Limited,</p>
                <p className="pt-8 font-bold text-gray-900 dark:text-white">Chief Divisional Manager, Jamshedpur Power Services</p>
              </div>

              {/* Company Footer Line */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-6 text-center text-[9px] text-gray-500 dark:text-gray-400 space-y-0.5 leading-normal">
                <div className="font-bold text-[#005bac] text-[10px]">TATA STEEL UTILITIES AND INFRASTRUCTURE SERVICES LIMITED</div>
                <div className="italic">(Formerly Jamshedpur Utilities & Services Company Limited)</div>
                <div>Registered Office : Sakchi Boulevard Road Northern Town Bistupur Jamshedpur 831 001 India</div>
                <div>Tel 91 657 6652101 Fax 91 657 2424219</div>
                <div>Corporate Identity Number U45200JH2003PLC010315</div>
                <div>Website www.tatasteeluisl.com</div>
              </div>

            </div>

            {/* Modal Buttons Bar */}
            <div className="flex justify-center items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success('Regret letter sent to applicant successfully.');
                  setViewingLetterApp(null);
                }}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs shadow-sm transition"
              >
                Send
              </button>
              
              <button
                type="button"
                onClick={() => handlePrintRegretLetter(viewingLetterApp)}
                className="px-6 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white font-bold rounded-lg text-xs shadow-sm transition"
              >
                Print
              </button>

              <button
                type="button"
                onClick={() => setViewingLetterApp(null)}
                className="px-6 py-2 bg-white hover:bg-gray-150 border border-gray-300 text-gray-700 font-bold rounded-lg text-xs transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 text-left space-y-4 shadow-xl border border-slate-750">
            <div className="flex justify-between items-center pb-2 border-b border-gray-150 dark:border-slate-700">
              <h3 className="font-extrabold text-xs text-gray-800 dark:text-white uppercase tracking-wider">Document Preview: {previewingDoc.documentType}</h3>
              <button onClick={() => setPreviewingDoc(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1">
                <X size={18} />
              </button>
            </div>
            <div className="h-64 bg-gray-100 dark:bg-slate-900 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-800">
              {previewingDoc.filePath && previewingDoc.filePath.startsWith('data:image') ? (
                <img src={previewingDoc.filePath} alt="Preview" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                  <FileText size={48} className="text-[#005BAC] dark:text-tata-blue-light" />
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-250">{previewingDoc.fileName}</p>
                  <p className="text-[10px] text-gray-450">Simulated verified document PDF viewer panel.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setPreviewingDoc(null)}
                className="px-4 py-2 bg-[#005BAC] hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WORKFLOW CONFIGURATION MODAL */}
      <WorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        applicationId={selectedApp?.id || ''}
        applicationNumber={selectedApp?.applicationNumber || ''}
        currentStage={selectedApp?.currentStage || 'Application Verification'}
        onSuccess={() => {
          setDrawerOpen(false);
          fetchApps();
        }}
      />

      {/* CUSTOMER DETAILS MODAL FOR SEPARATE CONNECTION */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full text-left shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden font-sans text-xs">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-150 dark:border-slate-700/60 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/35">
              <span className="font-bold text-gray-800 dark:text-white text-sm">Customer Details</span>
              
              {/* Radio Group */}
              <div className="flex items-center space-x-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span>Connection Type</span>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={customerConnectionType === 'Electricity'}
                    onChange={() => setCustomerConnectionType('Electricity')}
                    className="text-[#4B3E9E] focus:ring-[#4B3E9E] h-4 w-4"
                  />
                  <span>Electricity</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={customerConnectionType === 'Water'}
                    onChange={() => setCustomerConnectionType('Water')}
                    className="text-[#4B3E9E] focus:ring-[#4B3E9E] h-4 w-4"
                  />
                  <span>Water</span>
                </label>
              </div>

              <button 
                onClick={() => setCustomerModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-gray-150 dark:border-slate-700/60 bg-gray-50 dark:bg-slate-900/20">
              <button
                type="button"
                onClick={() => setCustomerModalTab('Existing')}
                className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
                  customerModalTab === 'Existing'
                    ? 'bg-[#9A8FDB]/60 text-slate-800 dark:text-slate-100 border-r border-gray-150 dark:border-slate-700'
                    : 'bg-gray-100 dark:bg-slate-900 text-gray-450 hover:bg-gray-200'
                }`}
              >
                Existing Customer
              </button>
              <button
                type="button"
                onClick={() => setCustomerModalTab('New')}
                className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
                  customerModalTab === 'New'
                    ? 'bg-[#9A8FDB]/60 text-slate-800 dark:text-slate-100'
                    : 'bg-gray-100 dark:bg-slate-900 text-gray-455 hover:bg-gray-200 border-l border-gray-150 dark:border-slate-700'
                }`}
              >
                New Customer
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {customerModalTab === 'Existing' ? (
                <div className="space-y-4 animate-fadeIn">
                  <p className="text-red-500 font-semibold text-[11px] leading-relaxed">
                    I have Customer's User Name <span className="text-red-400 font-bold">(Fields is mandatory !!!)</span>
                  </p>
                  
                  <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-750">
                    <input
                      type="text"
                      placeholder="Enter Customer's User Name"
                      value={customerUsername}
                      onChange={(e) => setCustomerUsername(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-xs font-semibold outline-none focus:border-[#4B3E9E] text-gray-750"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <p className="text-red-500 font-semibold text-[11px] leading-relaxed">
                    Don't have Customer's User Name <span className="text-red-400 font-bold">(All the fields are mandatory !!!)</span>
                  </p>
                  
                  <div className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-gray-200 dark:border-slate-750 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Name of the Customer"
                          value={newCustName}
                          onChange={(e) => setNewCustName(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-xs font-semibold outline-none focus:border-[#4B3E9E]"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Aadhar No"
                          value={newCustAadhar}
                          onChange={(e) => setNewCustAadhar(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded text-xs font-semibold outline-none focus:border-[#4B3E9E]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Mobile No"
                          value={newCustMobile}
                          onChange={(e) => setNewCustMobile(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded text-xs font-semibold outline-none focus:border-[#4B3E9E]"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email Id"
                          value={newCustEmail}
                          onChange={(e) => setNewCustEmail(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded text-xs font-semibold outline-none focus:border-[#4B3E9E]"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Address"
                        value={newCustAddress}
                        onChange={(e) => setNewCustAddress(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded text-xs font-semibold outline-none focus:border-[#4B3E9E]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <select
                          value={newCustArea}
                          onChange={(e) => setNewCustArea(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded text-xs font-semibold outline-none focus:border-[#4B3E9E]"
                        >
                          <option value="">--Select Area--</option>
                          <option value="JAMSHEDPUR">JAMSHEDPUR</option>
                          <option value="ADITYAPUR">ADITYAPUR</option>
                          <option value="RANCHI">RANCHI</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={customerConnectionType === 'Electricity' ? 'Electric' : 'Water'}
                          className="w-full p-2 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-700 rounded text-xs font-bold text-gray-450 cursor-not-allowed outline-none"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-gray-150 dark:border-slate-700/60 flex justify-end items-center gap-3 bg-gray-50/50 dark:bg-slate-900/35">
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                className="px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white text-xs font-bold rounded-lg shadow transition"
              >
                Close
              </button>

              {customerModalTab === 'Existing' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!customerUsername.trim()) {
                      toast.error("Customer's User Name is required!");
                      return;
                    }
                    toast.success(`Customer "${customerUsername}" verified successfully. Proceeding...`);
                    setCustomerModalOpen(false);
                    navigate(`/customer/apply?type=separate&division=${customerConnectionType}&username=${customerUsername}`);
                  }}
                  className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Verify Customer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!newCustName.trim() || !newCustAadhar.trim() || !newCustMobile.trim() || !newCustEmail.trim() || !newCustAddress.trim() || !newCustArea) {
                      toast.error("All fields are mandatory!");
                      return;
                    }
                    toast.success(`Customer "${newCustName}" added successfully. Proceeding...`);
                    setCustomerModalOpen(false);
                    navigate(`/customer/apply?type=separate&division=${customerConnectionType}&name=${newCustName}&mobile=${newCustMobile}&email=${newCustEmail}&aadhar=${newCustAadhar}&address=${newCustAddress}&area=${newCustArea}`);
                  }}
                  className="px-4 py-2 bg-[#4B3E9E] hover:bg-[#3b3082] text-white text-xs font-bold rounded-lg shadow transition"
                >
                  Add Customer & Proceed
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Feedback Dialog Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-xl overflow-hidden shadow-2xl border border-gray-150 dark:border-slate-700/60 transition-all font-sans text-left">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-150 dark:border-slate-700">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Feedback</h2>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!feedbackComment.trim()) {
                  toast.error('Additional Comment is required');
                  return;
                }
                console.log('Feedback submitted:', feedbackComment, 'for application:', feedbackApp?.id, 'with file:', feedbackFile?.name);
                toast.success('Feedback added successfully');
                setFeedbackModalOpen(false);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Additional Comment<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-gray-250 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold focus:outline-none focus:border-[#4B3E9E] dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Attachment
                </label>
                <div className="border border-gray-250 dark:border-slate-700 rounded p-1.5 bg-white dark:bg-slate-900">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setFeedbackFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-xs font-semibold text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-gray-200 dark:file:bg-slate-750 file:text-gray-800 dark:file:text-white hover:file:bg-gray-300 dark:hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end items-center space-x-3 pt-3 border-t border-gray-150 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-5 py-1.5 bg-[#8A95A5] hover:bg-slate-500 text-white text-xs font-bold rounded-full transition duration-200 shadow-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#007BFF] hover:bg-blue-600 text-white text-xs font-bold rounded-full transition duration-200 shadow-sm"
                >
                  Add Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
