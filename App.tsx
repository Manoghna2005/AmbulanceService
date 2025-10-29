// AmbuFlow: Real-Time Emergency Management System
// High-Fidelity Frontend Mockup

import React, { useState, useEffect, useMemo, useRef, SVGProps, ReactElement } from 'react';
import {
  Shield, Hospital, Ambulance, User, BarChart2, Siren, LogOut, Lock,
  BedDouble, Stethoscope, Users, PieChart, AreaChart, Clock, Building2,
  Menu, X
} from 'lucide-react';

// =================================================================================
// TYPES & MOCK DATA
// =================================================================================

type Page = 'Login' | 'Home' | 'Hospital' | 'Ambulance' | 'Admin' | 'Analytics';
type UserRole = 'guest' | 'admin' | 'user';

interface HospitalData {
  id: number;
  name: string;
  icu_beds: { total: number; available: number };
  general_beds: { total: number; available: number };
  emergency_beds: { total: number; available: number };
  status: 'Operational' | 'Disabled';
}

const MOCK_HOSPITALS: HospitalData[] = [
  { id: 1, name: 'Apollo Hospital', icu_beds: { total: 20, available: 5 }, general_beds: { total: 100, available: 30 }, emergency_beds: { total: 15, available: 2 }, status: 'Operational' },
  { id: 2, name: 'MIOT Hospital', icu_beds: { total: 25, available: 8 }, general_beds: { total: 120, available: 45 }, emergency_beds: { total: 20, available: 7 }, status: 'Operational' },
  { id: 3, name: 'Kauvery Hospital', icu_beds: { total: 15, available: 0 }, general_beds: { total: 80, available: 12 }, emergency_beds: { total: 10, available: 3 }, status: 'Operational' },
];

const MOCK_GLOBAL_STATS = {
  activeAmbulances: 8,
  totalHospitals: 12,
};

// =================================================================================
// HELPER COMPONENTS & HOOKS
// =================================================================================

// Custom hook for animating numbers
const useAnimatedCounter = (targetValue: number, duration = 500) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const frameRate = 1000 / 60;
  const totalFrames = Math.round(duration / frameRate);

  useEffect(() => {
    let currentFrame = 0;
    const startValue = countRef.current;
    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const newCount = Math.round(startValue + (targetValue - startValue) * progress);
      setCount(newCount);
      
      if (currentFrame === totalFrames) {
        clearInterval(counter);
        countRef.current = targetValue;
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [targetValue, duration, totalFrames]);
  
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  return count;
};


const StatCard = ({ icon, label, value, color }: { icon: ReactElement<SVGProps<SVGSVGElement>>, label: string, value: number, color: string }) => {
  const animatedValue = useAnimatedCounter(value);
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center">
        {React.cloneElement(icon, { className: `h-8 w-8 mr-4`, style: { color } })}
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{animatedValue}</p>
        </div>
      </div>
    </div>
  );
};

const BedStatusCard = ({ type, available, total }: { type: string, available: number, total: number }) => {
  const percentage = total > 0 ? (available / total) * 100 : 0;
  const animatedAvailable = useAnimatedCounter(available);

  const getStatusColor = () => {
    if (percentage === 0) return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', glow: 'shadow-red-500/20' };
    if (percentage <= 25) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', glow: 'shadow-yellow-500/20' };
    return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', glow: 'shadow-green-500/20' };
  };

  const colors = getStatusColor();

  return (
    <div className={`p-6 rounded-lg shadow-lg transition-all duration-300 ${colors.bg} ${colors.text} border-2 ${colors.border} ${colors.glow}`}>
      <h3 className="text-lg font-semibold">{type} Beds</h3>
      <div className="flex items-baseline justify-center space-x-2 mt-4">
        <p className="text-6xl font-extrabold">{animatedAvailable}</p>
        <p className="text-2xl font-medium text-gray-600">/ {total}</p>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-2.5 mt-4">
        <div className={`${colors.bg.replace('100', '500')} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const LoginButton = ({ icon, label, onClick, userRole, requiredRole }: { icon: ReactElement<SVGProps<SVGSVGElement>>, label: string, onClick: () => void, userRole: UserRole, requiredRole?: 'admin' }) => {
  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center w-full h-40 bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-primary transition-all duration-300 ease-in-out"
    >
      {React.cloneElement(icon, { className: "h-16 w-16 text-primary group-hover:scale-110 transition-transform duration-300"})}
      <span className="mt-4 text-xl font-bold text-gray-800">{label}</span>
    </button>
  );
};

const AnimatedContent = ({ children, keyProp }: { children: React.ReactNode, keyProp: string }) => (
    <div key={keyProp} className="animate-fadeInUp">
        {children}
    </div>
);

// =================================================================================
// DASHBOARD COMPONENTS
// =================================================================================

const LoginPage = ({ onLogin }: { onLogin: (role: UserRole) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setError('');
    if (username === 'admin' && password === 'admin123') {
      onLogin('admin');
    } else {
      onLogin('user');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl animate-fadeInUp">
        <div className="text-center">
          <Siren className="w-16 h-16 mx-auto text-primary" />
          <h1 className="mt-4 text-4xl font-extrabold text-gray-900">AmbuFlow</h1>
          <p className="mt-2 text-gray-600">Real-Time Emergency Management</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <div className="text-xs text-center text-gray-500">
            <p>Demo Admin: <span className="font-mono">admin</span> / <span className="font-mono">admin123</span></p>
            <p>Any other credentials for User access.</p>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-primary-light group-hover:text-indigo-400" aria-hidden="true" />
              </span>
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HomePage = ({ onNavigate, globalStats, userRole }: { onNavigate: (page: Page) => void; globalStats: typeof MOCK_GLOBAL_STATS, userRole: UserRole }) => (
    <>
        <div className="text-center p-8 bg-white rounded-lg shadow-md mb-8">
            <h1 className="text-4xl font-extrabold text-primary flex items-center justify-center">
                <Siren className="w-10 h-10 mr-4" /> AmbuFlow
            </h1>
            <p className="text-lg text-gray-600 mt-2">Smarter Emergency Response, Faster Lives Saved.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <StatCard icon={<Ambulance />} label="Active Ambulances" value={globalStats.activeAmbulances} color="#3B82F6" />
            <StatCard icon={<Hospital />} label="Total Hospitals" value={globalStats.totalHospitals} color="#10B981" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LoginButton icon={<User />} label="Hospital Dashboard" onClick={() => onNavigate('Hospital')} userRole={userRole} />
            <LoginButton icon={<Ambulance />} label="Ambulance Dispatch" onClick={() => onNavigate('Ambulance')} userRole={userRole} />
            <LoginButton icon={<BarChart2 />} label="Analytics Dashboard" onClick={() => onNavigate('Analytics')} userRole={userRole} />
            <LoginButton icon={<Shield />} label="Admin Console" onClick={() => onNavigate('Admin')} userRole={userRole} requiredRole="admin" />
        </div>
    </>
);

const HospitalDashboard = ({ hospitals, setHospitals, userRole }: { hospitals: HospitalData[], setHospitals: React.Dispatch<React.SetStateAction<HospitalData[]>>, userRole: UserRole }) => {
    const [selectedHospital, setSelectedHospital] = useState<HospitalData>(hospitals[0]);
    const [tempCounts, setTempCounts] = useState({
        icu: selectedHospital.icu_beds.available,
        general: selectedHospital.general_beds.available,
        emergency: selectedHospital.emergency_beds.available
    });
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        setTempCounts({
            icu: selectedHospital.icu_beds.available,
            general: selectedHospital.general_beds.available,
            emergency: selectedHospital.emergency_beds.available
        });
    }, [selectedHospital]);

    const handleUpdate = () => {
        setHospitals(prev => prev.map(h => h.id === selectedHospital.id ? {
            ...h,
            icu_beds: { ...h.icu_beds, available: tempCounts.icu },
            general_beds: { ...h.general_beds, available: tempCounts.general },
            emergency_beds: { ...h.emergency_beds, available: tempCounts.emergency },
        } : h));
        setSelectedHospital(prev => ({
            ...prev,
            icu_beds: { ...prev.icu_beds, available: tempCounts.icu },
            general_beds: { ...prev.general_beds, available: tempCounts.general },
            emergency_beds: { ...prev.emergency_beds, available: tempCounts.emergency },
        }));
        setSuccessMessage('Bed counts updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Hospital Dashboard</h2>
                <select
                    value={selectedHospital.id}
                    onChange={(e) => setSelectedHospital(hospitals.find(h => h.id === parseInt(e.target.value))!)}
                    className="mt-2 md:mt-0 p-2 border rounded-md shadow-sm"
                >
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <BedStatusCard type="ICU" available={selectedHospital.icu_beds.available} total={selectedHospital.icu_beds.total} />
                <BedStatusCard type="General" available={selectedHospital.general_beds.available} total={selectedHospital.general_beds.total} />
                <BedStatusCard type="Emergency" available={selectedHospital.emergency_beds.available} total={selectedHospital.emergency_beds.total} />
            </div>

            {userRole === 'admin' ? (
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Update Bed Count (Admin)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="flex flex-col">
                            <label htmlFor="icu_update" className="text-sm font-medium text-gray-600 mb-1">ICU Beds</label>
                            <input type="number" id="icu_update" value={tempCounts.icu} onChange={e => setTempCounts({...tempCounts, icu: parseInt(e.target.value)})} className="p-2 border rounded-md" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="general_update" className="text-sm font-medium text-gray-600 mb-1">General Beds</label>
                            <input type="number" id="general_update" value={tempCounts.general} onChange={e => setTempCounts({...tempCounts, general: parseInt(e.target.value)})} className="p-2 border rounded-md" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="emergency_update" className="text-sm font-medium text-gray-600 mb-1">Emergency Beds</label>
                            <input type="number" id="emergency_update" value={tempCounts.emergency} onChange={e => setTempCounts({...tempCounts, emergency: parseInt(e.target.value)})} className="p-2 border rounded-md" />
                        </div>
                        <button onClick={handleUpdate} className="bg-primary text-white p-2 rounded-md hover:bg-primary-dark transition-colors h-10">Update</button>
                    </div>
                    {successMessage && <p className="text-green-600 mt-4 animate-fadeInUp">{successMessage}</p>}
                </div>
            ) : (
                <div className="bg-gray-100 p-6 rounded-lg shadow-inner text-center">
                    <h3 className="text-lg font-semibold text-gray-700">Administrator Access Required</h3>
                    <p className="text-gray-600 mt-2">Please contact an administrator to update bed counts.</p>
                </div>
            )}
           
            <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm" role="alert">
                <p className="font-bold">Live Alert</p>
                <p>🚑 AMB07 is arriving with emergency case (ETA: 4 min).</p>
            </div>
        </div>
    );
};

const AmbulanceDashboard = () => {
    const [assignment, setAssignment] = useState('');
    const handleFind = () => {
        setAssignment('✅ Assigned to MIOT Hospital (3 km away) — 8 ICU beds left.');
        setTimeout(() => setAssignment(''), 5000);
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Ambulance Dispatch</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Dispatch Control</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="ambulance_id" className="text-sm font-medium text-gray-600 mb-1 block">Ambulance ID</label>
                            <select id="ambulance_id" className="w-full p-2 border rounded-md">
                                {Array.from({ length: 5 }, (_, i) => <option key={i}>AMB0{i + 1}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="patient_type" className="text-sm font-medium text-gray-600 mb-1 block">Patient Type</label>
                            <select id="patient_type" className="w-full p-2 border rounded-md">
                                <option>ICU</option>
                                <option>Emergency</option>
                                <option>General</option>
                            </select>
                        </div>
                        <button onClick={handleFind} className="w-full bg-primary text-white p-3 rounded-md font-bold text-lg hover:bg-primary-dark transition-colors">Find Nearest Hospital</button>
                    </div>
                    {assignment && (
                        <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md animate-fadeInUp">
                            <p className="font-semibold">Assignment Result:</p>
                            <p>{assignment}</p>
                        </div>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Live Route Map</h3>
                    <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center">
                        <p className="text-gray-500">Map Placeholder</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = ({ hospitals, setHospitals }: { hospitals: HospitalData[], setHospitals: React.Dispatch<React.SetStateAction<HospitalData[]>> }) => {
    const handleToggleStatus = (id: number) => {
        setHospitals(prev => prev.map(h => h.id === id ? { ...h, status: h.status === 'Operational' ? 'Disabled' : 'Operational' } : h));
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Admin Control Panel</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Hospital Status Overview</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ICU (Avail/Total)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {hospitals.map(h => (
                                <tr key={h.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{h.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{h.icu_beds.available} / {h.icu_beds.total}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${h.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {h.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleToggleStatus(h.id)} className="text-indigo-600 hover:text-indigo-900">
                                            Toggle Status
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h3 className="text-xl font-semibold mb-4 text-gray-700">System Notifications</h3>
                 <ul className="space-y-2 text-gray-600">
                    <li className="p-3 bg-red-50 rounded-md"> Kauvery Hospital ICU full – redirecting to Apollo.</li>
                    <li className="p-3 bg-blue-50 rounded-md"> System maintenance scheduled for 2 AM.</li>
                 </ul>
            </div>
        </div>
    );
};

const AnalyticsDashboard = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center"><PieChart className="mr-3"/>Analytics Dashboard</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Bed Utilization Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center"><AreaChart className="mr-2"/>Bed Utilization Trends (Past 24h)</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {/* Mock bars for chart */}
                        {[60, 45, 70, 55, 80, 75, 90, 85].map((height, i) => (
                            <div key={i} className="w-full bg-primary-light rounded-t-md hover:bg-primary transition-colors" style={{ height: `${height}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Ambulance Response Times Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center"><Clock className="mr-2"/>Ambulance Response Times (Average)</h3>
                    <div className="h-64 bg-gray-100 rounded-md p-4 flex items-center justify-center">
                       <p className="text-gray-500">-- Mock Line Chart --</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Peak Hour Table */}
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center"><Users className="mr-2"/>Peak Hour Analysis</h3>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Time Slot</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b"><td className="px-4 py-2">10:00 - 11:00</td><td className="px-4 py-2 font-semibold">12</td></tr>
                            <tr className="border-b"><td className="px-4 py-2">18:00 - 19:00</td><td className="px-4 py-2 font-semibold">15 (Peak)</td></tr>
                            <tr className="border-b"><td className="px-4 py-2">02:00 - 03:00</td><td className="px-4 py-2 font-semibold">3</td></tr>
                        </tbody>
                    </table>
                 </div>

                 {/* Hospital Performance Table */}
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 flex items-center"><Building2 className="mr-2"/>Hospital Performance</h3>
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg. Wait Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b"><td className="px-4 py-2">MIOT Hospital</td><td className="px-4 py-2 font-semibold">8 min</td></tr>
                            <tr className="border-b"><td className="px-4 py-2">Apollo Hospital</td><td className="px-4 py-2 font-semibold">11 min</td></tr>
                            <tr className="border-b"><td className="px-4 py-2">Kauvery Hospital</td><td className="px-4 py-2 font-semibold">14 min</td></tr>
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};


// =================================================================================
// MAIN APP COMPONENT
// =================================================================================

const App = () => {
  const [currentPage, setCurrentPage] = useState<Page>('Login');
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [hospitals, setHospitals] = useState<HospitalData[]>(MOCK_HOSPITALS);
  const [globalStats, setGlobalStats] = useState(MOCK_GLOBAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simulate initial loading
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    if (userRole === 'guest') return;

    const interval = setInterval(() => {
      setHospitals(prev => prev.map(h => ({
        ...h,
        icu_beds: { ...h.icu_beds, available: Math.max(0, h.icu_beds.available + (Math.random() > 0.5 ? 1 : -1)) },
        general_beds: { ...h.general_beds, available: Math.max(0, h.general_beds.available + (Math.random() > 0.7 ? 2 : -1)) }
      })));
      setGlobalStats(prev => ({...prev, activeAmbulances: Math.max(5, prev.activeAmbulances + (Math.random() > 0.5 ? 1 : -1))}))
    }, 5000);

    return () => clearInterval(interval);
  }, [userRole]);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setCurrentPage('Home');
  };

  const handleLogout = () => {
    setUserRole('guest');
    setCurrentPage('Login');
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'Login':
        return <AnimatedContent keyProp="login"><LoginPage onLogin={handleLogin} /></AnimatedContent>;
      case 'Home':
        return <AnimatedContent keyProp="home"><HomePage onNavigate={setCurrentPage} globalStats={globalStats} userRole={userRole} /></AnimatedContent>;
      case 'Hospital':
        return <AnimatedContent keyProp="hospital"><HospitalDashboard hospitals={hospitals} setHospitals={setHospitals} userRole={userRole} /></AnimatedContent>;
      case 'Ambulance':
        return <AnimatedContent keyProp="ambulance"><AmbulanceDashboard /></AnimatedContent>;
      case 'Admin':
        return userRole === 'admin' ? <AnimatedContent keyProp="admin"><AdminDashboard hospitals={hospitals} setHospitals={setHospitals}/></AnimatedContent> : <p>Access Denied</p>;
      case 'Analytics':
        return <AnimatedContent keyProp="analytics"><AnalyticsDashboard /></AnimatedContent>;
      default:
        return <p>Page not found</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 animate-spin border-t-primary"></div>
      </div>
    );
  }
  
  if (currentPage === 'Login') {
      return renderContent();
  }

  // FIX: Added an explicit type definition for navLinks to ensure TypeScript
  // correctly infers the type of `link.icon`, which resolves an error with
  // `React.cloneElement` when passing a `className` prop.
  const navLinks: {
    name: string;
    page: Page;
    icon: ReactElement<SVGProps<SVGSVGElement>>;
    role: UserRole[];
  }[] = [
    { name: 'Home', page: 'Home', icon: <Siren/>, role: ['user', 'admin'] },
    { name: 'Hospitals', page: 'Hospital', icon: <Hospital/>, role: ['user', 'admin'] },
    { name: 'Ambulances', page: 'Ambulance', icon: <Ambulance/>, role: ['user', 'admin'] },
    { name: 'Analytics', page: 'Analytics', icon: <PieChart/>, role: ['user', 'admin'] },
    { name: 'Admin', page: 'Admin', icon: <Shield/>, role: ['admin'] },
  ];

  const availableLinks = navLinks.filter(link => link.role.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-100">
       {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Siren className="w-8 h-8 text-primary" />
              <span className="font-bold text-xl ml-2 text-gray-800">AmbuFlow</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
               {availableLinks.map(link => (
                 <button key={link.name} onClick={() => setCurrentPage(link.page)} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === link.page ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-200'}`}>
                    {link.name}
                 </button>
               ))}
               <button onClick={handleLogout} className="flex items-center ml-4 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
                  <LogOut className="w-4 h-4 mr-1" /> Logout
               </button>
            </div>
            <div className="md:hidden flex items-center">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X/> : <Menu/>}
                </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
            <div className="md:hidden animate-fadeInUp">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {availableLinks.map(link => (
                         <button key={link.name} onClick={() => {setCurrentPage(link.page); setIsMobileMenuOpen(false);}} className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${currentPage === link.page ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-200'}`}>
                            {link.name}
                         </button>
                    ))}
                    <button onClick={handleLogout} className="w-full text-left flex items-center mt-4 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-100">
                        <LogOut className="w-5 h-5 mr-2" /> Logout
                    </button>
                </div>
            </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      
      {/* Mobile Footer Navigation */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex justify-around items-center h-16">
            {availableLinks.map(link => (
                 <button key={link.name} onClick={() => setCurrentPage(link.page)} className={`flex flex-col items-center justify-center text-xs font-medium transition-colors w-full ${currentPage === link.page ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
                    {React.cloneElement(link.icon, {className: "w-6 h-6 mb-1"})}
                    {link.name}
                 </button>
            ))}
          </div>
      </footer>
       <div className="h-16 md:hidden"></div> {/* Spacer for mobile footer */}
    </div>
  );
};

export default App;
