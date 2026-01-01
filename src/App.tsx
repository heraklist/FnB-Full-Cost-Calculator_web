import { useState, lazy, Suspense, useCallback, useMemo, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { useIngredients } from './hooks/useIngredients';
import { useRecipes } from './hooks/useRecipes';
import { useSettings } from './hooks/useSettings';
import { useEvents } from './hooks/useEvents';
import { MODE_LABELS } from './types';
import * as api from './lib/api';
import './App.css';

// Lazy load tab components for better initial load performance
const IngredientsTab = lazy(() => import('./components/tabs/IngredientsTab'));
const RecipesTab = lazy(() => import('./components/tabs/RecipesTab'));
const EventsTab = lazy(() => import('./components/tabs/EventsTab'));
const ReportsTab = lazy(() => import('./components/tabs/ReportsTab'));
const SettingsTab = lazy(() => import('./components/tabs/SettingsTab'));
const AdminTab = lazy(() => import('./components/tabs/AdminTab'));

// Loading spinner component
const TabLoader = () => (
  <div className="tab-loader">
    <div className="spinner"></div>
    <p>Φόρτωση...</p>
  </div>
);

type Tab = 'recipes' | 'events' | 'ingredients' | 'reports' | 'settings' | 'admin';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('recipes');

  const isAuthenticated = !!session?.user;

  const { ingredients } = useIngredients(isAuthenticated);
  const { recipes } = useRecipes(isAuthenticated);
  const { settings } = useSettings(isAuthenticated);
  const { events } = useEvents(isAuthenticated);

  // Check session on mount
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check admin status when user changes
  useEffect(() => {
    if (session?.user) {
      api.checkAdmin().then(setIsAdminUser).catch(() => setIsAdminUser(false));
    } else {
      setIsAdminUser(false);
    }
  }, [session?.user?.id]);

  // Memoize mode to prevent unnecessary re-renders
  const currentMode = useMemo(() => settings?.mode || 'restaurant', [settings?.mode]);

  // Memoize counts
  const counts = useMemo(() => ({
    recipes: recipes.length,
    events: events.length,
    ingredients: ingredients.length,
  }), [recipes.length, events.length, ingredients.length]);

  // Tab change handler
  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Φόρτωση...</p>
      </div>
    );
  }

  // Not authenticated - show login
  if (!session) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <span className="logo">🍳</span>
            <h1>FnB Cost Calculator</h1>
            <p>Υπολογισμός κόστους για εστιατόρια και catering</p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4f46e5',
                    brandAccent: '#4338ca',
                  }
                }
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Κωδικός',
                  button_label: 'Σύνδεση',
                  loading_button_label: 'Σύνδεση...',
                  social_provider_text: 'Σύνδεση με {{provider}}',
                  link_text: 'Έχετε ήδη λογαριασμό; Συνδεθείτε'
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Κωδικός',
                  button_label: 'Εγγραφή',
                  loading_button_label: 'Εγγραφή...',
                  social_provider_text: 'Εγγραφή με {{provider}}',
                  link_text: 'Δεν έχετε λογαριασμό; Εγγραφείτε'
                },
                forgotten_password: {
                  email_label: 'Email',
                  button_label: 'Αποστολή οδηγιών',
                  loading_button_label: 'Αποστολή...',
                  link_text: 'Ξεχάσατε τον κωδικό σας;'
                }
              }
            }}
            providers={[]}
          />
        </div>
      </div>
    );
  }

  // Authenticated - show app
  return (
    <>
      <a href="#main-content" className="skip-link">Μετάβαση στο περιεχόμενο</a>
      <div className="app-container">
        {/* Top Navigation Bar */}
        <nav className="top-nav" role="tablist" aria-label="Κύρια πλοήγηση">
          <div className="nav-brand">
            <span className="logo">🍳</span>
            <h1>FnB Cost</h1>
          </div>
          <div className="nav-tabs">
            <button
              role="tab"
              aria-selected={activeTab === 'ingredients'}
              aria-controls="panel-ingredients"
              id="tab-ingredients"
              className={`nav-item ${activeTab === 'ingredients' ? 'active' : ''}`}
              onClick={() => handleTabChange('ingredients')}
            >
              <span className="nav-icon">📦</span>
              <span className="nav-label">Υλικά</span>
              <span className="nav-badge">{counts.ingredients}</span>
            </button>
            
            <button
              role="tab"
              aria-selected={activeTab === 'recipes'}
              aria-controls="panel-recipes"
              id="tab-recipes"
              className={`nav-item ${activeTab === 'recipes' ? 'active' : ''}`}
              onClick={() => handleTabChange('recipes')}
            >
              <span className="nav-icon">📖</span>
              <span className="nav-label">Συνταγές</span>
              <span className="nav-badge">{counts.recipes}</span>
            </button>
            
            <button
              role="tab"
              aria-selected={activeTab === 'events'}
              aria-controls="panel-events"
              id="tab-events"
              className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => handleTabChange('events')}
            >
              <span className="nav-icon">🎪</span>
              <span className="nav-label">Events</span>
              <span className="nav-badge">{counts.events}</span>
            </button>
            
            <button
              role="tab"
              aria-selected={activeTab === 'reports'}
              aria-controls="panel-reports"
              id="tab-reports"
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => handleTabChange('reports')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Αναφορές</span>
            </button>
            
            <button
              role="tab"
              aria-selected={activeTab === 'settings'}
              aria-controls="panel-settings"
              id="tab-settings"
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Ρυθμίσεις</span>
            </button>

            {isAdminUser && (
              <button
                role="tab"
                aria-selected={activeTab === 'admin'}
                aria-controls="panel-admin"
                id="tab-admin"
                className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => handleTabChange('admin')}
              >
                <span className="nav-icon">🛡️</span>
                <span className="nav-label">Admin</span>
              </button>
            )}
          </div>
          <div className="nav-actions">
            <div className="mode-badge" title={`Τρέχον Mode: ${MODE_LABELS[currentMode]}`}>
              {currentMode === 'restaurant' && '🍽️'}
              {currentMode === 'catering' && '🚚'}
              {currentMode === 'private_chef' && '👨‍🍳'}
              <span className="mode-text">{MODE_LABELS[currentMode]}</span>
            </div>
            <div className="user-info">
              <span className="user-email">{session.user.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Έξοδος
            </button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main id="main-content" className="main-content" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          <Suspense fallback={<TabLoader />}>
            {activeTab === 'ingredients' && <IngredientsTab />}
            {activeTab === 'recipes' && <RecipesTab />}
            {activeTab === 'events' && <EventsTab />}
            {activeTab === 'reports' && <ReportsTab />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'admin' && isAdminUser && <AdminTab />}
          </Suspense>
        </main>
      </div>
    </>
  );
}

export default App;
