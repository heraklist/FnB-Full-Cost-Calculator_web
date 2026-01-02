import { supabase } from '../lib/supabase'

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Ρυθμίσεις</h1>
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Λογαριασμός</h3>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Αποσύνδεση
        </button>
      </div>
    </div>
  )
}
