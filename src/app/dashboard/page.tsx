'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Edit3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  BarChart3,
  Wallet,
  Home,
  Car,
  CreditCard,
  Banknote,
  Target,
  Shield,
  Settings
} from 'lucide-react';

// Importar componentes
import ClientProfile from './components/ClientProfile';
import FinancialProfile from './components/FinancialProfile';
import FinancialIndicators from './components/FinancialIndicators';
import PatrimonyChart from './components/PatrimonyChart';
import CashFlowChart from './components/CashFlowChart';

interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  age?: number;
  civil_status?: string;
  children_count?: number;
  monthly_income?: number;
  monthly_expenses?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_savings?: number;
  onboarding_completed: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        router.push('/auth/login');
        return;
      }

      setUser(authUser);

      // Obtener perfil del usuario
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error obteniendo perfil:', profileError?.message || profileError);
        // Si no tiene perfil, redirigir a onboarding
        if (profileError.code === 'PGRST116') {
          router.push('/onboarding');
          return;
        }
      } else if (profileData) {
        setProfile(profileData);
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const updateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu perfil financiero...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido a FINCO!</h2>
          <p className="text-gray-600 mb-6">Necesitas completar tu onboarding para acceder al dashboard.</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Completar Onboarding
          </button>
        </div>
      </div>
    );
  }

  // Calcular indicadores financieros
  const patrimony = (profile.total_assets || 0) - (profile.total_liabilities || 0);
  const savingsCapacity = (profile.monthly_income || 0) - (profile.monthly_expenses || 0);
  const debtRatio = profile.monthly_income ? ((profile.total_liabilities || 0) / 12) / profile.monthly_income * 100 : 0;

  const navigationItems = [
    { id: 'overview', name: 'Resumen', icon: BarChart3 },
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'budget', name: 'Presupuesto', icon: Wallet, comingSoon: true },
    { id: 'investments', name: 'Inversiones', icon: TrendingUp, comingSoon: true },
    { id: 'goals', name: 'Metas', icon: Target, comingSoon: true },
    { id: 'insurance', name: 'Seguros', icon: Shield, comingSoon: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">FINCO</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.comingSoon && setActiveSection(item.id)}
                disabled={item.comingSoon}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : item.comingSoon
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
                {item.comingSoon && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                    Próximamente
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Financial Indicators */}
            <FinancialIndicators 
              profile={profile}
              patrimony={patrimony}
              savingsCapacity={savingsCapacity}
              debtRatio={debtRatio}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PatrimonyChart profile={profile} />
              <CashFlowChart profile={profile} />
            </div>

            {/* Profile Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ClientProfile profile={profile} onUpdate={updateProfile} compact={true} />
              <FinancialProfile profile={profile} onUpdate={updateProfile} compact={true} />
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ClientProfile profile={profile} onUpdate={updateProfile} />
            <FinancialProfile profile={profile} onUpdate={updateProfile} />
          </div>
        )}

        {/* Coming Soon Sections */}
        {['budget', 'investments', 'goals', 'insurance'].includes(activeSection) && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sección en Construcción</h2>
            <p className="text-gray-600 mb-6">
              Estamos trabajando en esta funcionalidad. ¡Pronto estará disponible!
            </p>
            <button
              onClick={() => setActiveSection('overview')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Volver al Resumen
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 