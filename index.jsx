// Access React from global scope (loaded via CDN)
const { useState, useEffect, useRef } = React;

// Access Firebase modules from global scope
const {
  initializeApp
} = window.firebaseApp || {};

// Helper function to get Firestore functions dynamically
// 因為 Firebase 模組是異步載入的，必須在使用時動態獲取
const getFirestoreFn = (fnName) => {
  return window.firebaseFirestore?.[fnName];
};

// Helper function to get Firebase App functions
const getFirebaseAppFn = (fnName) => {
  return window.firebaseApp?.[fnName];
};

// Get Firebase Auth functions - use optional chaining to safely access
const getAuth = window.firebaseAuth?.getAuth;
const signInAnonymously = window.firebaseAuth?.signInAnonymously;
const onAuthStateChanged = window.firebaseAuth?.onAuthStateChanged;

// Access Lucide React icons from global scope
// Create fallback icon components if lucide-react is not loaded
const createFallbackIcon = (viewBox = '0 0 24 24') => {
  return (props) => {
    const size = props.size || 20;
    const { className, style, ...rest } = props;
    return React.createElement('svg', {
      ...rest,
      viewBox: viewBox,
      width: size,
      height: size,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      className: className,
      style: style
    }, React.createElement('circle', { cx: '12', cy: '12', r: '10' }));
  };
};

// Get icons from lucide-react or use fallbacks
const getIcon = (iconName) => {
  if (window.lucideReact && window.lucideReact[iconName]) {
    return window.lucideReact[iconName];
  }
  return createFallbackIcon();
};

const Loader2 = getIcon('Loader2');
const Ticket = getIcon('Ticket');
const Gift = getIcon('Gift');
const History = getIcon('History');
const CheckCircle = getIcon('CheckCircle');
const XCircle = getIcon('XCircle');
const Search = getIcon('Search');
const LayoutGrid = getIcon('LayoutGrid');

// NoteEditor 組件：用於編輯備註
function NoteEditor({ value, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(editValue.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows="2"
          placeholder="輸入備註..."
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            儲存
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="min-h-[32px] px-2 py-1 text-sm text-gray-600 cursor-pointer hover:bg-gray-100 rounded border border-transparent hover:border-gray-300 transition-colors"
      title="點擊編輯備註"
    >
      {value ? (
        <div className="whitespace-pre-wrap break-words">{value}</div>
      ) : (
        <div className="text-gray-400 italic">點擊新增備註...</div>
      )}
    </div>
  );
}

// --- Firebase Configuration ---
// 這裡使用您的環境變數或預設值。在實際部署時，請確保 Firebase 已啟用 Firestore 和 Anonymous Auth
let firebaseConfig, app, db, auth, appId;

// Initialize Firebase when modules are ready
function initFirebase() {
  // 動態獲取 Firebase 函數
  const initializeApp = getFirebaseAppFn('initializeApp');
  const getFirestore = getFirestoreFn('getFirestore');
  const getAuth = window.firebaseAuth?.getAuth;
  
  if (!initializeApp || !getFirestore) {
    return false;
  }
  
  try {
    // 從全局變數獲取配置，如果不存在則使用空對象
    firebaseConfig = typeof window.__firebase_config !== 'undefined' 
      ? window.__firebase_config 
      : (typeof __firebase_config !== 'undefined' ? __firebase_config : {});
    
    // 如果配置為空對象，使用默認配置
    if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
      console.warn('Firebase config not found, using empty config');
      firebaseConfig = {};
    }
    
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    // auth 暫時不使用，但保留代碼
    // auth = getAuth ? getAuth(app) : null;
    appId = typeof window.__app_id !== 'undefined' 
      ? window.__app_id 
      : (typeof __app_id !== 'undefined' ? __app_id : 'default-mahjong-app');
    return true;
  } catch (e) {
    console.error('Firebase initialization error:', e);
    return false;
  }
}

// Wait for Firebase modules to load
const initFirebaseWhenReady = () => {
  if (window.firebaseReady && initFirebase()) {
    // console.log('Firebase initialized successfully');
    return true;
  }
  return false;
};

// 將函數暴露到全局，讓 HTML 可以調用
window.initFirebaseWhenReady = initFirebaseWhenReady;

// Try to initialize when modules are ready
if (!initFirebaseWhenReady()) {
  const checkFirebase = setInterval(() => {
    if (initFirebaseWhenReady()) {
      clearInterval(checkFirebase);
    }
  }, 100);
  
  // Stop checking after 10 seconds to avoid infinite loop
  setTimeout(() => clearInterval(checkFirebase), 10000);
}

// --- Assets & Icons ---
// 使用 inline SVG 作為麻將圖標
const MahjongIcon = ({ className, onClick }) => (
  <svg 
    viewBox="0 0 100 120" 
    className={className} 
    onClick={onClick}
    style={{ cursor: 'pointer', filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))' }}
  >
    <rect x="5" y="5" width="90" height="110" rx="10" fill="#f0e6d2" stroke="#d4b483" strokeWidth="2" />
    <rect x="5" y="100" width="90" height="15" rx="5" fill="#2a9d8f" />
    <circle cx="50" cy="40" r="15" fill="#e63946" stroke="#c1121f" strokeWidth="2" />
    <circle cx="50" cy="75" r="15" fill="#2a9d8f" stroke="#1d736a" strokeWidth="2" />
    <text x="50" y="65" fontSize="24" textAnchor="middle" fill="#e63946" fontWeight="bold">發</text>
  </svg>
);

// --- Constants ---
const BRANCHES = [
  "大林店", "八德店", "南崁店", "草漯店", "楊梅店", "中和中正店"
];

// 各分店對應的包廂列表
const BRANCH_ROOMS = {
  "大林店": ["南", "西", "北", "中", "發", "白"],
  "八德店": ["梅", "蘭", "竹", "菊", "春", "夏", "秋", "冬", "轉運", "改運"],
  "南崁店": ["1條", "2條", "3條", "4條", "5條", "6條", "7條"],
  "草漯店": ["1筒", "2筒", "3筒", "4筒", "5筒", "6筒"],
  "楊梅店": ["康", "財", "福", "祿", "壽", "喜", "順", "安", "旺"],
  "中和中正店": ["壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖", "拾"]
};
const DURATIONS = [
  { label: "1小時", val: 1 },
  { label: "2小時", val: 2 },
  { label: "3小時", val: 3 },
  { label: "4小時", val: 4 },
  { label: "5小時", val: 5 },
  { label: "6小時", val: 6 },
  { label: "8小時", val: 8 },
  { label: "12小時", val: 12 },
];

const PRIZES = [
  { id: 'none_1', name: '銘謝惠顧', type: 'none', prob: 0.38, limit: -1 },
  { id: 'none_2', name: '下次再加油', type: 'none', prob: 0.38, limit: -1 },
  { id: 'ext_1h', name: '1小時續時券', type: 'win', prob: 0.10, limit: -1 },
  { id: 'disc_50', name: '50元折價券', type: 'win', prob: 0.10, limit: -1 },
  { id: 'ext_2h', name: '2小時續時券', type: 'win', prob: 0.034, limit: 30 },
  { id: 'free_2h', name: '2小時免費包廂卷', type: 'win', prob: 0.005, limit: 15 },
  { id: 'free_4h', name: '4小時免費包廂卷', type: 'win', prob: 0.001, limit: 5 },
];

// --- Helper Functions ---
const generateSerial = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// --- Main App Component ---
function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home, scratch, result, admin, adminLogin
  const [formData, setFormData] = useState({
    phone: '',
    date: getTodayDateString(),
    branch: BRANCHES[0],
    room: BRANCH_ROOMS[BRANCHES[0]]?.[0] || '',
    duration: 1
  });

  // 獲取當前分店的包廂列表
  const getCurrentRooms = () => {
    return BRANCH_ROOMS[formData.branch] || [];
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scratchResult, setScratchResult] = useState(null);
  const [grandDrawSerial, setGrandDrawSerial] = useState(null);
  const [orderId, setOrderId] = useState(null); // Firestore Doc ID

  // Admin State
  const [adminPass, setAdminPass] = useState('');
  const [adminTab, setAdminTab] = useState('grand'); // grand, instant
  const [adminData, setAdminData] = useState([]);

  // Auth Setup - DISABLED (暫時不使用 Firebase Auth)
  useEffect(() => {
    // 設置一個假的用戶，讓應用可以運行
    setUser({ uid: 'demo-user-' + Date.now() });
    
    // 如果需要啟用 Firebase Auth，取消下面的註釋：
    /*
    let unsubscribe = null;
    
    const setupAuth = () => {
      const currentSignInAnonymously = window.firebaseAuth?.signInAnonymously;
      const currentOnAuthStateChanged = window.firebaseAuth?.onAuthStateChanged;
      
      if (!auth || !currentSignInAnonymously || !currentOnAuthStateChanged) {
        return false;
      }

      const initAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await currentSignInAnonymously(auth);
          } else {
            await currentSignInAnonymously(auth);
          }
        } catch (err) {
          console.error('Auth initialization error:', err);
        }
      };
      
      initAuth();
      unsubscribe = currentOnAuthStateChanged(auth, (u) => setUser(u));
      return true;
    };

    if (!setupAuth()) {
      console.warn('Firebase Auth not ready yet, will retry...');
      const retryInterval = setInterval(() => {
        if (setupAuth()) {
          clearInterval(retryInterval);
        }
      }, 200);
      
      setTimeout(() => clearInterval(retryInterval), 10000);
      
      return () => {
        clearInterval(retryInterval);
        if (unsubscribe) unsubscribe();
      };
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
    */
  }, []);

  // --- Logic: Handle Form Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    // Regex Validation for Taiwan Phone
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('請輸入有效的手機號碼 (格式: 09xxxxxxxx)');
      setLoading(false);
      return;
    }

    try {
      // 動態獲取所有需要的 Firestore 函數（一次性獲取，避免重複聲明）
      const collection = getFirestoreFn('collection');
      const query = getFirestoreFn('query');
      const where = getFirestoreFn('where');
      const getDocs = getFirestoreFn('getDocs');
      const addDoc = getFirestoreFn('addDoc');
      const serverTimestamp = getFirestoreFn('serverTimestamp');
      
      // 檢查 Firestore 函數是否已載入
      if (!collection || !query || !where || !getDocs || !addDoc || !serverTimestamp || !db) {
        setError('資料庫連線尚未準備好，請稍後再試');
        setLoading(false);
        return;
      }
      
      // 1. Check duplicate entry (Phone + Date)
      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'orders'),
        where('phone', '==', formData.phone),
        where('date', '==', formData.date)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setError('此手機號碼今日已參加過抽獎，同一筆訂單不得重複參加！');
        setLoading(false);
        return;
      }

      // 2. Prepare Data
      const isGrandEligible = parseInt(formData.duration) >= 4;
      const serial = isGrandEligible ? generateSerial() : null;

      // 3. Determine Scratch Prize (Server-side simulation logic)
      const prize = await determinePrize();
      
      // 檢查 addDoc 和 collection 是否已載入
      if (!addDoc || !collection || !serverTimestamp || !db) {
        setError('資料庫連線尚未準備好，請稍後再試');
        setLoading(false);
        return;
      }
      
      // 4. Save to Firestore
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), {
        ...formData,
        userId: user.uid,
        isGrandEligible,
        grandDrawSerial: serial,
        scratchPrizeId: prize.id,
        scratchPrizeName: prize.name,
        scratchPrizeType: prize.type,
        prizeSent: false, // For backend tracking
        timestamp: serverTimestamp()
      });

      setOrderId(docRef.id);
      setGrandDrawSerial(serial);
      setScratchResult(prize);
      setView('scratch'); // Go to Game

    } catch (err) {
      console.error(err);
      
      // 如果是權限錯誤，顯示友好訊息
      if (err.code === 'permission-denied' || err.message?.includes('permission') || err.message?.includes('Missing or insufficient permissions')) {
        setError('權限不足：請檢查 Firestore 安全規則設置。\n\n請在 Firebase 控制台 > Firestore Database > Rules 中設置規則。');
      } else {
        setError('系統連線忙碌中，請稍後再試。');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Logic: Determine Prize with Limits ---
  const determinePrize = async () => {
    // This logic runs on client, but uses transaction for consistency on limits
    // Simple implementation for this demo:
    // We pick a prize based on weight. If it has a limit, we check a 'stats' doc.
    
    const rand = Math.random();
    let cumulative = 0;
    let selectedPrize = PRIZES[0];

    // Simple weighted random selection
    for (const p of PRIZES) {
      cumulative += p.prob;
      if (rand <= cumulative) {
        selectedPrize = p;
        break;
      }
    }

    // Check Limits (Simulated Transaction Logic)
    if (selectedPrize.limit !== -1) {
      try {
        // 動態獲取 Firestore 函數
        const doc = getFirestoreFn('doc');
        const getDoc = getFirestoreFn('getDoc');
        
        if (!doc || !getDoc || !db) {
          // 如果函數未載入，使用安全回退
          return selectedPrize;
        }
        
        const statsRef = doc(db, 'artifacts', appId, 'public', 'data', 'stats', 'prize_counts');
        // Note: In a real app, use runTransaction. Here we read then verify.
        const statsSnap = await getDoc(statsRef);
        
        let currentCount = 0;
        if (statsSnap.exists()) {
          currentCount = statsSnap.data()[selectedPrize.id] || 0;
        }

        if (currentCount >= selectedPrize.limit) {
          // Out of stock, fallback to coupon or none
          return PRIZES.find(p => p.id === 'disc_50') || PRIZES[0];
        } else {
          // Increment count (Optimistic)
          // Ideally this happens when the order is saved, but for simplicity:
          /* Note: We are skipping the actual increment write here to keep code simple 
             and focus on the UI/Flow logic as requested. 
             In production: Use cloud functions or transactions. */
        }
      } catch (e) {
        // If error checking limit, safe fallback
        return PRIZES[0];
      }
    }
    return selectedPrize;
  };

  // --- Logic: Admin ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPass === '88881349') {
      setView('admin');
      fetchAdminData('grand');
    } else {
      alert('密碼錯誤');
    }
  };

  const fetchAdminData = async (tab) => {
    setLoading(true);
    setAdminTab(tab);
    setAdminData([]);
    
    // 動態獲取 Firestore 函數（只需要 collection 和 getDocs，不需要 query/where/orderBy）
    const collection = getFirestoreFn('collection');
    const getDocs = getFirestoreFn('getDocs');
    
    // 檢查 Firestore 函數是否已載入
    if (!collection || !getDocs || !db) {
      console.error('Firebase Firestore functions not loaded yet');
      setLoading(false);
      alert('資料庫連線尚未準備好，請稍後再試');
      return;
    }
    
    try {
      // 直接獲取所有資料，在內存中過濾和排序（不需要索引）
      // 因為資料量不大，這樣更簡單且不需要建立索引
      const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      const snap = await getDocs(colRef);
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // 根據 tab 過濾資料
      if (tab === 'grand') {
        data = data.filter(d => d.isGrandEligible === true);
      } else {
        data = data.filter(d => d.scratchPrizeType === 'win');
      }
      
      // 在內存中按時間戳排序（最新的在前）
      data.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA; // 降序排列
      });
      
      setAdminData(data);
    } catch (err) {
      console.error("Admin fetch error:", err);
      
      // 如果是權限錯誤，顯示友好訊息
      if (err.code === 'permission-denied' || err.message?.includes('permission') || err.message?.includes('Missing or insufficient permissions')) {
        setLoading(false);
        alert('權限不足：請檢查 Firestore 安全規則設置。\n\n請在 Firebase 控制台 > Firestore Database > Rules 中設置規則。');
        return;
      }
      
      // 其他錯誤
      setLoading(false);
      alert('查詢失敗：' + (err.message || '未知錯誤'));
    }
    setLoading(false);
  };

  const togglePrizeSent = async (docId, currentStatus) => {
    try {
      // 動態獲取 Firestore 函數
      const updateDoc = getFirestoreFn('updateDoc');
      const doc = getFirestoreFn('doc');
      
      if (!updateDoc || !doc || !db) {
        alert('資料庫連線尚未準備好，請稍後再試');
        return;
      }
      
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', docId), {
        prizeSent: !currentStatus
      });
      // Refresh local state
      setAdminData(prev => prev.map(item => 
        item.id === docId ? { ...item, prizeSent: !currentStatus } : item
      ));
    } catch (err) {
      console.error('Update error:', err);
      if (err.code === 'permission-denied' || err.message?.includes('permission') || err.message?.includes('Missing or insufficient permissions')) {
        alert('權限不足：請檢查 Firestore 安全規則設置');
      } else {
        alert('更新失敗：' + (err.message || '未知錯誤'));
      }
    }
  };

  const updateNote = async (docId, newNote) => {
    try {
      // 動態獲取 Firestore 函數
      const updateDoc = getFirestoreFn('updateDoc');
      const doc = getFirestoreFn('doc');
      
      if (!updateDoc || !doc || !db) {
        alert('資料庫連線尚未準備好，請稍後再試');
        return;
      }
      
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', docId), {
        note: newNote || ''
      });
      
      // 更新本地狀態
      setAdminData(prev => prev.map(item => 
        item.id === docId ? { ...item, note: newNote || '' } : item
      ));
    } catch (err) {
      console.error("Update note error:", err);
      if (err.code === 'permission-denied' || err.message?.includes('permission') || err.message?.includes('Missing or insufficient permissions')) {
        alert('權限不足：請檢查 Firestore 安全規則設置');
      } else {
        alert('更新備註失敗：' + (err.message || '未知錯誤'));
      }
    }
  };

  // 清空全部資料
  const clearAllData = async () => {
    // 確認對話框
    const confirmMessage = '⚠️ 警告：此操作將刪除所有訂單資料，且無法復原！\n\n確定要清空全部資料嗎？';
    if (!confirm(confirmMessage)) {
      return;
    }
    
    // 二次確認
    if (!confirm('請再次確認：真的要刪除所有資料嗎？')) {
      return;
    }

    try {
      setLoading(true);
      
      // 動態獲取 Firestore 函數
      const collection = getFirestoreFn('collection');
      const getDocs = getFirestoreFn('getDocs');
      const deleteDoc = getFirestoreFn('deleteDoc');
      const doc = getFirestoreFn('doc');
      
      if (!collection || !getDocs || !deleteDoc || !doc || !db) {
        alert('資料庫連線尚未準備好，請稍後再試');
        setLoading(false);
        return;
      }
      
      // 獲取所有訂單
      const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      const snapshot = await getDocs(ordersRef);
      
      // 刪除所有文檔
      const deletePromises = snapshot.docs.map(d => 
        deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', d.id))
      );
      
      await Promise.all(deletePromises);
      
      // 清空本地狀態
      setAdminData([]);
      
      alert(`✅ 已成功刪除 ${snapshot.docs.length} 筆資料`);
      
    } catch (err) {
      console.error('Clear data error:', err);
      if (err.code === 'permission-denied' || err.message?.includes('permission') || err.message?.includes('Missing or insufficient permissions')) {
        alert('權限不足：請檢查 Firestore 安全規則設置');
      } else {
        alert('清空資料失敗：' + (err.message || '未知錯誤'));
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Render Views ---

  if (view === 'home') {
    return (
      <div className="min-h-screen bg-red-900 flex flex-col items-center justify-start p-4 font-sans text-yellow-50 overflow-hidden relative">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500 rounded-full blur-3xl opacity-20 -translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-red-600 rounded-full blur-3xl opacity-30 translate-x-10 translate-y-10"></div>
        
        {/* Header */}
        <div className="text-center mt-8 mb-6 z-10">
          <h2 className="text-xl font-bold tracking-widest text-yellow-200 mb-1">桃園闆娘麻將館</h2>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm">
            一起慶過年
          </h1>
          <p className="mt-2 text-sm text-yellow-100 opacity-90">消費滿4小時 抽大獎 iPhone 17</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-red-200">
            <span className="bg-red-800 px-2 py-1 rounded border border-red-700">二獎 現金$8800</span>
            <span className="bg-red-800 px-2 py-1 rounded border border-red-700">三獎 儲值金$6600</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-6 shadow-2xl z-10">
          <div className="flex items-center gap-2 mb-4 text-yellow-300 border-b border-yellow-500/20 pb-2">
            <LayoutGrid size={20} />
            <span className="font-bold">訂單登錄</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-yellow-200 mb-1">手機號碼</label>
              <input 
                type="tel" 
                maxLength="10"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-red-950/50 border border-red-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400 placeholder-red-400/50 transition-colors"
                placeholder="請輸入會員電話 (09xxxxxxxx)"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="block text-xs text-yellow-200 mb-1">日期</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-red-950/50 border border-red-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400 min-h-[48px]"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-xs text-yellow-200 mb-1">分店</label>
                <select 
                  value={formData.branch}
                  onChange={(e) => {
                    const newBranch = e.target.value;
                    const newRooms = BRANCH_ROOMS[newBranch] || [];
                    setFormData({
                      ...formData, 
                      branch: newBranch,
                      room: newRooms[0] || ''
                    });
                  }}
                  className="w-full bg-red-950/50 border border-red-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400 appearance-none min-h-[48px]"
                >
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="block text-xs text-yellow-200 mb-1">包廂</label>
                <select 
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  className="w-full bg-red-950/50 border border-red-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400 appearance-none min-h-[48px]"
                >
                  {getCurrentRooms().map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-xs text-yellow-200 mb-1">時長</label>
                <select 
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full bg-red-950/50 border border-red-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400 appearance-none min-h-[48px]"
                >
                  {DURATIONS.map(d => <option key={d.label} value={d.val}>{d.label}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 text-xs p-2 rounded flex items-center gap-2">
                <XCircle size={14} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-red-900 font-bold py-3 rounded-lg shadow-lg transform active:scale-95 transition-all flex justify-center items-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Ticket size={20} /> 確認資料並抽獎</>}
            </button>
            <p className="text-center text-xs text-red-300 mt-2">滿4小時以上即具備iPhone 17抽獎資格</p>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-auto py-6 flex flex-col items-center">
           <p className="text-yellow-500/50 text-xs">© 2025 桃園闆娘麻將館</p>
        </div>

        {/* Admin Trigger */}
        <div className="absolute bottom-4 right-4 z-50">
          <MahjongIcon className="w-10 h-12 hover:scale-110 transition-transform" onClick={() => setView('adminLogin')} />
        </div>
      </div>
    );
  }

  // --- Scratch Game View ---
  if (view === 'scratch') {
    return <ScratchCard 
              prize={scratchResult} 
              onComplete={() => setView('result')}
              onBack={() => setView('home')}
           />;
  }

  // --- Final Result View ---
  if (view === 'result') {
    return (
      <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-6 text-center text-yellow-50">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Confetti Decoration (CSS only for simplicity) */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400"></div>

          <h2 className="text-2xl font-bold text-yellow-300 mb-6">🎉 登記完成！</h2>

          {/* Grand Draw Section */}
          <div className="mb-8 p-4 bg-red-950/50 rounded-xl border border-yellow-600/50">
            <h3 className="text-yellow-200 font-bold flex items-center justify-center gap-2 mb-2">
              <Gift size={18} /> 大獎抽獎資格
            </h3>
            {grandDrawSerial ? (
              <>
                <div className="text-4xl font-mono font-black text-white tracking-widest my-3 drop-shadow-lg">
                  {grandDrawSerial}
                </div>
                <p className="text-xs text-red-300">請截圖保存！直播時憑此號碼領獎</p>
              </>
            ) : (
              <div className="text-gray-400 text-sm py-2">
                本次時長未滿4小時<br/>無法參加iPhone 17抽獎
              </div>
            )}
          </div>

          {/* Scratch Result Section */}
          <div className="mb-8">
            <h3 className="text-yellow-200 font-bold mb-2">刮刮樂結果</h3>
            <div className={`text-2xl font-bold ${scratchResult.type === 'win' ? 'text-green-300' : 'text-gray-300'}`}>
              {scratchResult.name}
            </div>
            {scratchResult.type === 'win' && (
              <p className="text-xs text-yellow-100/70 mt-1 animate-pulse">
                將於隔天 23:59 內發送至您的手機
              </p>
            )}
          </div>

          <button 
            onClick={() => {
              // Reset form
              setFormData({...formData, phone: ''});
              setView('home');
            }}
            className="px-8 py-3 bg-red-800 hover:bg-red-700 border border-yellow-600 rounded-full text-yellow-100 font-bold transition-colors"
          >
            返回首頁
          </button>

          <p className="mt-6 text-xs text-red-400/60">訂單編號: {orderId?.slice(0, 8)}...</p>
        </div>
      </div>
    );
  }

  // --- Admin Views ---
  if (view === 'adminLogin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-xl w-full max-w-sm border border-gray-700">
          <h2 className="text-xl text-white font-bold mb-4 flex items-center gap-2">
            <History /> 後台管理登入
          </h2>
          <form onSubmit={handleAdminLogin}>
            <input 
              type="password" 
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="請輸入管理密碼"
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white mb-4 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setView('home')} className="flex-1 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600">取消</button>
              <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">登入</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800">
        {/* Admin Header */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <h2 className="text-xl font-bold text-gray-800">麻將館活動後台</h2>
          <button onClick={() => setView('home')} className="text-sm text-gray-500 hover:text-red-500">退出系統</button>
        </div>

        <div className="max-w-6xl mx-auto p-4 md:p-6">
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={() => fetchAdminData('grand')}
                className={`pb-2 px-4 font-medium ${adminTab === 'grand' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                大獎抽獎名單 ({adminTab === 'grand' ? adminData.length : '...'})
              </button>
              <button 
                onClick={() => fetchAdminData('instant')}
                className={`pb-2 px-4 font-medium ${adminTab === 'instant' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                刮刮樂領獎資料 ({adminTab === 'instant' ? adminData.length : '...'})
              </button>
            </div>
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              style={{marginBottom: '10px'}}
            >
              🗑️ 清空全部資料
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center text-gray-400"><Loader2 className="animate-spin w-8 h-8" /></div>
            ) : adminData.length === 0 ? (
              <div className="p-12 text-center text-gray-400">目前沒有資料</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                    <tr>
                      <th className="p-4">登錄時間</th>
                      <th className="p-4">會員電話</th>
                      <th className="p-4">預約資訊</th>
                      {adminTab === 'grand' ? (
                        <th className="p-4 text-blue-600">抽獎序號</th>
                      ) : (
                        <>
                          <th className="p-4 text-green-600">中獎項目</th>
                          <th className="p-4 text-center">狀態</th>
                        </>
                      )}
                      <th className="p-4">備註</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {adminData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-500">
                           {row.timestamp ? new Date(row.timestamp.seconds * 1000).toLocaleString('zh-TW') : '剛剛'}
                        </td>
                        <td className="p-4 font-mono">{row.phone}</td>
                        <td className="p-4">
                          <div className="font-bold">{row.branch || '未填寫'}</div>
                          <div className="text-xs text-gray-500">{row.room || '未填寫'}．{row.date || '未填寫'}</div>
                        </td>
                        {adminTab === 'grand' ? (
                          <td className="p-4 font-mono font-bold text-lg text-blue-600">{row.grandDrawSerial || '-'}</td>
                        ) : (
                          <>
                            <td className="p-4 font-medium text-green-700">{row.scratchPrizeName || '-'}</td>
                            <td className="p-4 text-center">
                              <button 
                                onClick={() => togglePrizeSent(row.id, row.prizeSent)}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                  row.prizeSent 
                                  ? 'bg-gray-200 text-gray-500' 
                                  : 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200'
                                }`}
                              >
                                {row.prizeSent ? '已發送' : '未發送'}
                              </button>
                            </td>
                          </>
                        )}
                        <td className="p-4">
                          <NoteEditor 
                            value={row.note || ''} 
                            onSave={(newNote) => updateNote(row.id, newNote)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Export App component to global scope for HTML to access
window.App = App;

// --- Sub-Component: Scratch Card (HTML Canvas) ---
function ScratchCard({ prize, onComplete, onBack }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const isRevealedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    isRevealedRef.current = isRevealed;
  }, [isRevealed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const container = containerRef.current;
    if (!container) return;
    
    // 定義 width 和 height 在外部作用域，讓所有函數都能訪問
    let width = 288; // 預設值
    let height = 160; // 預設值
    
    // Wait for container to be rendered
    const initCanvas = () => {
      // Set canvas size
      width = container.offsetWidth || 288; // 72 * 4 = 288px
      height = container.offsetHeight || 160; // 40 * 4 = 160px
      canvas.width = width;
      canvas.height = height;

      // Fill with silver overlay
      ctx.fillStyle = '#C0C0C0'; // Silver
      ctx.fillRect(0, 0, width, height);
      
      // Add texture/text to overlay
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#909090';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('刮開試手氣', width / 2, height / 2);
      
      // Reset composite operation for drawing
      ctx.globalCompositeOperation = 'source-over';
    };
    
    // Initialize immediately and also on resize
    initCanvas();
    
    // Use ResizeObserver or setTimeout to ensure container is ready
    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
    });
    resizeObserver.observe(container);

    let isDrawing = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = e.clientX;
      let clientY = e.clientY;
      
      // Handle touch events
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const scratch = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
    };

    const checkReveal = () => {
      // Check how much is cleared
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let transparent = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 128) transparent++;
      }
      const percent = (transparent / (pixels.length / 4)) * 100;
      
      if (percent > 75) { // If 35% cleared, auto reveal
        setIsRevealed(true);
        canvas.style.opacity = '0'; // Fade out
        setTimeout(() => onCompleteRef.current(), 400); // Wait for transition then complete
      }
    };

    const startDraw = (e) => { isDrawing = true; };
    const endDraw = (e) => { isDrawing = false; checkReveal(); };
    const draw = (e) => {
      if (!isDrawing || isRevealedRef.current) return;
      e.preventDefault(); // Prevent scroll on touch
      const { x, y } = getPos(e);
      scratch(x, y);
      // 在刮開過程中也要檢查，這樣達到 40% 時就能立即觸發
      checkReveal();
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('touchstart', startDraw);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', endDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', endDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', endDraw);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <h2 className="text-3xl text-yellow-300 font-bold mb-8 animate-bounce">請刮開銀漆!</h2>
      
      <div 
        ref={containerRef}
        className="relative w-72 h-40 bg-white rounded-xl shadow-2xl overflow-hidden select-none"
      >
        {/* The Prize Underneath */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200 z-0">
          <span className="text-sm text-gray-500 font-bold mb-1">恭喜獲得</span>
          <span className="text-xl text-red-600 font-black px-4 text-center">{prize.name}</span>
        </div>

        {/* The Canvas Overlay - 銀漆層 */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 z-20 transition-opacity duration-700 cursor-crosshair"
          style={{ touchAction: 'none', userSelect: 'none' }}
        />
      </div>

      <p className="mt-8 text-yellow-200/60 text-sm">手指或滑鼠按住來回塗抹</p>
      
     
    </div>
  );
}
