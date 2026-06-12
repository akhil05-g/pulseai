import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Upload, FileSpreadsheet, CheckCircle, ArrowRight, ArrowLeft,
  Users, ShoppingBag, X, AlertCircle, Rocket, Building2, Download
} from 'lucide-react';
import api from '../../utils/api';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'customers', title: 'Import Customers', icon: Users },
  { id: 'orders', title: 'Import Orders', icon: ShoppingBag },
  { id: 'done', title: 'Ready!', icon: Rocket },
];

const CUSTOMER_HEADERS = ['name', 'email', 'phone', 'city', 'lifetime_value', 'total_orders', 'preferred_channel', 'favorite_category', 'churn_risk'];
const ORDER_HEADERS = ['customer_email', 'amount', 'category', 'status'];

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
    if (vals.length >= 2) {
      const row = {};
      headers.forEach((h, j) => { row[h] = vals[j] || ''; });
      rows.push(row);
    }
  }
  return { headers, rows };
}

function CSVDropZone({ onParsed, expectedHeaders, label, sampleFilename }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setError('');
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers, rows } = parseCSV(e.target.result);
      if (rows.length === 0) {
        setError('CSV file is empty or invalid');
        return;
      }
      setPreview({ headers, rowCount: rows.length, sample: rows.slice(0, 3) });
      onParsed(rows);
    };
    reader.readAsText(file);
  }, [onParsed]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const downloadSample = () => {
    const header = expectedHeaders.join(',');
    let rows = '';
    if (sampleFilename === 'customers') {
      rows = [
        'Aarav Sharma,aarav@email.com,9876543210,Mumbai,15000,12,whatsapp,Sneakers,low',
        'Priya Patel,priya@email.com,9876543211,Delhi,8500,6,email,Apparel,medium',
        'Rohit Kumar,rohit@email.com,9876543212,Bangalore,22000,18,sms,Watches,low',
      ].join('\n');
    } else {
      rows = [
        'aarav@email.com,2500,Sneakers,completed',
        'priya@email.com,1800,Apparel,completed',
        'rohit@email.com,4200,Watches,completed',
      ].join('\n');
    }
    const blob = new Blob([header + '\n' + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_${sampleFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-primary-400 bg-primary-50/50'
            : fileName
            ? 'border-emerald-300 bg-emerald-50/30'
            : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50/50'
        }`}
      >
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

        {fileName ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">{fileName}</p>
            <p className="text-sm text-emerald-600 mt-1">{preview?.rowCount} rows detected</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Upload size={36} className={dragActive ? 'text-primary-500' : 'text-slate-300'} />
            </motion.div>
            <p className="text-sm font-semibold text-slate-600 mt-4">{label}</p>
            <p className="text-xs text-slate-400 mt-1">Drag & drop your CSV here, or click to browse</p>
          </>
        )}
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-xl">
          <AlertCircle size={16} /> {error}
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={downloadSample} className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
          <Download size={13} /> Download sample CSV
        </button>
        <div className="flex flex-wrap gap-1.5">
          {expectedHeaders.slice(0, 5).map(h => (
            <span key={h} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">{h}</span>
          ))}
          {expectedHeaders.length > 5 && <span className="text-[10px] text-slate-400">+{expectedHeaders.length - 5} more</span>}
        </div>
      </div>

      {/* Preview Table */}
      {preview && preview.sample.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
            <FileSpreadsheet size={14} className="text-primary-500" />
            <span className="text-xs font-bold text-slate-600">Preview (first 3 rows)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/50">
                  {preview.headers.map(h => (
                    <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.sample.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {preview.headers.map(h => (
                      <td key={h} className="px-3 py-2 text-slate-700 max-w-[120px] truncate">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const navigate = useNavigate();

  const handleImportAll = async () => {
    setImporting(true);
    const result = { customers: 0, orders: 0, errors: [] };

    try {
      if (customers.length > 0) {
        const custPayload = customers.map(c => ({
          name: c.name || 'Unknown',
          email: c.email || '',
          phone: c.phone || '',
          city: c.city || '',
          lifetime_value: parseFloat(c.lifetime_value) || 0,
          total_orders: parseInt(c.total_orders) || 0,
          preferred_channel: c.preferred_channel || 'email',
          favorite_category: c.favorite_category || '',
          churn_risk: c.churn_risk || 'low',
        }));
        const res = await api.post('/customers/bulk', { customers: custPayload });
        result.customers = res.data.imported || custPayload.length;
      }
    } catch (e) {
      result.errors.push('Customer import failed: ' + (e.response?.data?.error || e.message));
    }

    try {
      if (orders.length > 0) {
        const orderPayload = orders.map(o => ({
          customer_email: o.customer_email || '',
          amount: parseFloat(o.amount) || 0,
          category: o.category || '',
          status: o.status || 'completed',
        }));
        const res = await api.post('/orders/bulk', { orders: orderPayload });
        result.orders = res.data.imported || orderPayload.length;
      }
    } catch (e) {
      result.errors.push('Order import failed: ' + (e.response?.data?.error || e.message));
    }

    setImportResult(result);
    setImporting(false);
    setStep(3);
  };

  const canSkipCustomers = customers.length === 0;
  const canSkipOrders = orders.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 flex items-center justify-center p-6">
      {/* Background decoration */}
      <motion.div
        className="fixed top-20 right-20 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], x: [0, 20, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />
      <motion.div
        className="fixed bottom-20 left-20 w-72 h-72 bg-accent-200/15 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
      />

      <div className="w-full max-w-2xl relative z-10">
        {/* Step Indicator */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <motion.div
                animate={step === i ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > i ? 'bg-emerald-500 text-white' : step === i ? 'bg-primary-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                }`}
                style={step >= i ? { boxShadow: step === i ? '0 0 15px rgba(99,102,241,0.3)' : '' } : {}}
              >
                {step > i ? <CheckCircle size={16} /> : <s.icon size={16} />}
              </motion.div>
              <span className={`text-xs font-medium hidden sm:block ${step >= i ? 'text-slate-800' : 'text-slate-400'}`}>{s.title}</span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 rounded-full ${step > i ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-card-xl border border-slate-200/60 p-10 text-center"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <Sparkles size={36} className="text-white" />
              </motion.div>

              <h2 className="text-3xl font-display font-bold text-slate-900 mb-3">Welcome to PulseAI! 🎉</h2>
              <p className="text-slate-500 text-lg mb-2">Let's set up your marketing command center.</p>
              <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">
                Import your customer and order data to unlock AI-powered campaigns, smart segments, and deep analytics.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
                {[
                  { icon: '📊', label: 'AI Analytics' },
                  { icon: '🎯', label: 'Smart Segments' },
                  { icon: '🚀', label: 'Auto Campaigns' },
                ].map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center"
                  >
                    <span className="text-2xl">{f.icon}</span>
                    <p className="text-[10px] font-semibold text-slate-500 mt-1">{f.label}</p>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(99,102,241,0.25)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(1)}
                className="btn-primary text-base py-3 px-10"
              >
                Let's Get Started <ArrowRight size={18} />
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => navigate('/')}
                className="block mx-auto mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip for now — I'll import later
              </motion.button>
            </motion.div>
          )}

          {/* Step 1: Import Customers */}
          {step === 1 && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-card-xl border border-slate-200/60 p-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <Users size={20} className="text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Import Customers</h2>
                  <p className="text-xs text-slate-400">Upload a CSV file with your customer data</p>
                </div>
              </div>

              <div className="mt-6">
                <CSVDropZone
                  onParsed={setCustomers}
                  expectedHeaders={CUSTOMER_HEADERS}
                  label="Drop your customers CSV here"
                  sampleFilename="customers"
                />
              </div>

              <div className="flex items-center justify-between mt-8">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(0)} className="btn-secondary">
                  <ArrowLeft size={16} /> Back
                </motion.button>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                    Skip this step
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(2)}
                    disabled={customers.length === 0}
                    className="btn-primary"
                  >
                    Next: Orders <ArrowRight size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Import Orders */}
          {step === 2 && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-card-xl border border-slate-200/60 p-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900">Import Orders</h2>
                  <p className="text-xs text-slate-400">Upload a CSV file with your order history</p>
                </div>
              </div>

              {customers.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-xs text-emerald-700 font-medium">{customers.length} customers ready to import</span>
                </motion.div>
              )}

              <div className="mt-5">
                <CSVDropZone
                  onParsed={setOrders}
                  expectedHeaders={ORDER_HEADERS}
                  label="Drop your orders CSV here"
                  sampleFilename="orders"
                />
              </div>

              <div className="flex items-center justify-between mt-8">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)} className="btn-secondary">
                  <ArrowLeft size={16} /> Back
                </motion.button>
                <div className="flex gap-3">
                  {customers.length === 0 && orders.length === 0 && (
                    <button onClick={() => navigate('/')} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                      Skip all
                    </button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(16,185,129,0.25)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleImportAll}
                    disabled={importing || (customers.length === 0 && orders.length === 0)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-40"
                  >
                    {importing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> Import & Continue
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Done */}
          {step === 3 && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-card-xl border border-slate-200/60 p-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
              >
                <Rocket size={36} className="text-emerald-500" />
              </motion.div>

              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">You're All Set! 🚀</h2>
              <p className="text-slate-500 mb-6">Your data has been imported successfully.</p>

              {importResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8"
                >
                  <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                    <p className="text-2xl font-mono font-bold text-primary-600">{importResult.customers}</p>
                    <p className="text-xs text-primary-500 font-medium">Customers</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-2xl font-mono font-bold text-amber-600">{importResult.orders}</p>
                    <p className="text-xs text-amber-500 font-medium">Orders</p>
                  </div>
                </motion.div>
              )}

              {importResult?.errors?.length > 0 && (
                <div className="mb-6 p-3 bg-red-50 rounded-xl border border-red-200 text-left">
                  {importResult.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600">{e}</p>
                  ))}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(99,102,241,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/')}
                className="btn-primary text-base py-3 px-10"
              >
                Launch Dashboard <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
