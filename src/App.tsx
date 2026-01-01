import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './lib/supabase'

type Tab = 'ingredients' | 'recipes' | 'events' | 'settings'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('ingredients')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading"><p>Φόρτωση...</p></div>
  }

  if (!session) {
    return (
      <div className="auth-container">
        <div className="auth-header">
          <span style={{ fontSize: '3rem' }}>🍳</span>
          <h1>FnB Cost Calculator</h1>
          <p style={{ color: '#94a3b8' }}>Υπολογισμός κόστους για εστιατόρια</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Κωδικός',
                button_label: 'Σύνδεση',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Κωδικός',
                button_label: 'Εγγραφή',
              },
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-brand">
          <span>🍳</span>
          <h1>FnB Cost</h1>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-item ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            📦 Υλικά
          </button>
          <button
            className={`nav-item ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            📖 Συνταγές
          </button>
          <button
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            🎪 Events
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Ρυθμίσεις
          </button>
        </div>
        <div className="nav-actions">
          <span className="user-email">{session.user.email}</span>
          <button className="logout-btn" onClick={() => supabase.auth.signOut()}>
            Έξοδος
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="tab-content">
          {activeTab === 'ingredients' && (
            <div>
              <h2>📦 Υλικά</h2>
              <p>Διαχείριση υλικών και τιμών</p>
              <button className="btn btn-primary">+ Νέο Υλικό</button>
            </div>
          )}
          {activeTab === 'recipes' && (
            <div>
              <h2>📖 Συνταγές</h2>
              <p>Δημιουργία και κοστολόγηση συνταγών</p>
              <button className="btn btn-primary">+ Νέα Συνταγή</button>
            </div>
          )}
          {activeTab === 'events' && (
            <div>
              <h2>🎪 Events</h2>
              <p>Διαχείριση catering events</p>
              <button className="btn btn-primary">+ Νέο Event</button>
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              <h2>⚙️ Ρυθμίσεις</h2>
              <p>Ρυθμίσεις εφαρμογής</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
