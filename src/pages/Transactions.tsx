import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import * as api from '../lib/api'
import type { Transaction, NewTransaction } from '../lib/api'

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState<NewTransaction>({
    type: 'income',
    category: 'Πωλήσεις',
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    event_id: null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await api.getTransactions()
      setTransactions(data)
    } catch (err) {
      console.error('Error loading transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.updateTransaction(editingId, formData)
      } else {
        await api.createTransaction(formData)
      }
      await loadData()
      resetForm()
    } catch (err) {
      console.error('Error saving transaction:', err)
      alert('Σφάλμα κατά την αποθήκευση')
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      transaction_date: transaction.transaction_date,
      event_id: transaction.event_id
    })
    setEditingId(transaction.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Διαγραφή συναλλαγής;')) return
    try {
      await api.deleteTransaction(id)
      await loadData()
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Σφάλμα κατά τη διαγραφή')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'income',
      category: 'Πωλήσεις',
      amount: 0,
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
      event_id: null
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    return matchesSearch && matchesType
  })

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  const categories = formData.type === 'income' ? api.INCOME_CATEGORIES : api.EXPENSE_CATEGORIES

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Έσοδα / Έξοδα</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Νέα Συναλλαγή
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Συνολικά Έσοδα</p>
              <p className="text-2xl font-bold text-green-400">€{totalIncome.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500/20">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Συνολικά Έξοδα</p>
              <p className="text-2xl font-bold text-red-400">€{totalExpense.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-500/20">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Υπόλοιπο</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                €{balance.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {balance >= 0 ? (
                <ArrowUpRight className="w-6 h-6 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-6 h-6 text-red-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Αναζήτηση..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">Όλα</option>
          <option value="income">Έσοδα</option>
          <option value="expense">Έξοδα</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Ημερομηνία</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Τύπος</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Κατηγορία</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Περιγραφή</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Ποσό</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">Φόρτωση...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">Δεν βρέθηκαν συναλλαγές</td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {new Date(t.transaction_date).toLocaleDateString('el-GR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        t.type === 'income' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {t.type === 'income' ? 'Έσοδο' : 'Έξοδο'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{t.category}</td>
                    <td className="px-6 py-4 text-gray-400">{t.description || '-'}</td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                      t.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}€{t.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(t)}
                          className="text-indigo-400 hover:text-indigo-300 p-1"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
          <div
            className="bg-gray-800 rounded-xl w-full max-w-md border border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Επεξεργασία Συναλλαγής' : 'Νέα Συναλλαγή'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Τύπος</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === 'income'}
                      onChange={() => setFormData({ ...formData, type: 'income', category: 'Πωλήσεις' })}
                      className="text-indigo-600"
                    />
                    <span className="text-green-400">Έσοδο</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === 'expense'}
                      onChange={() => setFormData({ ...formData, type: 'expense', category: 'Πρώτες Ύλες' })}
                      className="text-indigo-600"
                    />
                    <span className="text-red-400">Έξοδο</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Κατηγορία</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Ποσό (€) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  required
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Ημερομηνία</label>
                <input
                  type="date"
                  value={formData.transaction_date}
                  onChange={e => setFormData({ ...formData, transaction_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Περιγραφή</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingId ? 'Αποθήκευση' : 'Προσθήκη'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
