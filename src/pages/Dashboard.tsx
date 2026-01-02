import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Package, UtensilsCrossed, Calendar, ChefHat, TrendingUp, TrendingDown, Wallet, DollarSign, BarChart3 } from 'lucide-react'
import * as api from '../lib/api'
import type { Ingredient, Recipe, Event, Transaction } from '../lib/api'

const COLORS = ['#6366F1', '#F43F5E', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center">
        {trend === 'up' ? (
          <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {trendValue}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">από τον προηγούμενο μήνα</span>
      </div>
    )}
  </div>
)

export default function Dashboard() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [ingredientsData, recipesData, eventsData, transactionsData] = await Promise.all([
        api.getIngredients(),
        api.getRecipes(),
        api.getEvents(),
        api.getTransactions()
      ])
      setIngredients(ingredientsData)
      setRecipes(recipesData)
      setEvents(eventsData)
      setTransactions(transactionsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const profit = totalIncome - totalExpense

  const totalRecipesCost = recipes.reduce((sum, recipe) => {
    return sum + api.calculateRecipeCost(recipe)
  }, 0)

  const confirmedEvents = events.filter(e => e.status === 'confirmed' || e.status === 'completed')
  
  const upcomingEvents = events.filter(e => {
    if (!e.event_date) return false
    return new Date(e.event_date) >= new Date() && e.status !== 'cancelled'
  })

  // Monthly data for charts
  const monthlyData = api.getMonthlyStats(transactions)

  // If no data, show last 6 months with zeros
  const chartData = monthlyData.length > 0 ? monthlyData.slice(-6) : [
    { name: 'Ιαν', income: 0, expense: 0, profit: 0 },
    { name: 'Φεβ', income: 0, expense: 0, profit: 0 },
    { name: 'Μαρ', income: 0, expense: 0, profit: 0 },
    { name: 'Απρ', income: 0, expense: 0, profit: 0 },
    { name: 'Μαι', income: 0, expense: 0, profit: 0 },
    { name: 'Ιουν', income: 0, expense: 0, profit: 0 },
  ]

  // Category breakdown for ingredients
  const categoryData = ingredients.reduce((acc: any[], ing) => {
    const existing = acc.find(item => item.name === ing.category)
    if (existing) {
      existing.value += 1
    } else {
      acc.push({ name: ing.category, value: 1 })
    }
    return acc
  }, [])

  // Top 5 expensive ingredients
  const topIngredients = [...ingredients]
    .sort((a, b) => b.price - a.price)
    .slice(0, 5)
    .map(ing => ({ name: ing.name, price: ing.price }))

  // Recipe costs for chart
  const recipeCostData = recipes
    .slice(0, 6)
    .map(recipe => ({
      name: recipe.name.length > 15 ? recipe.name.substring(0, 15) + '...' : recipe.name,
      cost: api.calculateRecipeCost(recipe),
      costPerServing: api.calculateRecipeCost(recipe) / (recipe.servings || 1)
    }))

  // Expense by category
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.name === t.category)
      if (existing) {
        existing.value += t.amount
      } else {
        acc.push({ name: t.category, value: t.amount })
      }
      return acc
    }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Φόρτωση...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Πίνακας Ελέγχου</h1>
        <div className="flex space-x-2">
          <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>Τελευταίες 30 ημέρες</option>
            <option>Τελευταίο τρίμηνο</option>
            <option>Τρέχον έτος</option>
          </select>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Συνολικά Έσοδα"
          value={`€${totalIncome.toFixed(2)}`}
          trend="up"
          trendValue="+12.5%"
          icon={DollarSign}
          color="bg-indigo-500"
        />
        <StatCard
          title="Κόστος Πρώτων Υλών"
          value={`€${totalExpense.toFixed(2)}`}
          trend="down"
          trendValue="-2.4%"
          icon={TrendingUp}
          color="bg-rose-500"
        />
        <StatCard
          title="Μικτό Κέρδος"
          value={`€${profit.toFixed(2)}`}
          trend="up"
          trendValue="+8.2%"
          icon={BarChart3}
          color="bg-emerald-500"
        />
        <StatCard
          title="Food Cost %"
          value={totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) + '%' : '0%'}
          trend="down"
          trendValue="-1.2%"
          icon={DollarSign}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Έσοδα vs Κόστος</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
                />
                <Legend />
                <Bar dataKey="income" name="Έσοδα" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Κόστος" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Τάση Κερδοφορίας</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="profit" name="Κέρδος" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expense Breakdown Chart */}
      {expenseByCategory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Κατανομή Εξόδων</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: €${value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `€${typeof value === 'number' ? value.toFixed(2) : '0.00'}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Πρώτες Ύλες"
          value={ingredients.length}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Συνταγές"
          value={recipes.length}
          icon={UtensilsCrossed}
          color="bg-green-500"
        />
        <StatCard
          title="Εκδηλώσεις"
          value={confirmedEvents.length}
          icon={Calendar}
          color="bg-purple-500"
        />
        <StatCard
          title="Σύνολο Κόστος"
          value={`€${totalRecipesCost.toFixed(2)}`}
          icon={ChefHat}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ingredients */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Πιο Ακριβές Πρώτες Ύλες</h3>
          {topIngredients.length > 0 ? (
            <div className="space-y-2">
              {topIngredients.map((ing, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{ing.name}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">€{ing.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Δεν υπάρχουν πρώτες ύλες</p>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Επερχόμενες Εκδηλώσεις</h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border border-indigo-100 dark:border-indigo-700/50"
                >
                  <p className="font-semibold text-indigo-900 dark:text-indigo-200">{event.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {event.event_date && new Date(event.event_date).toLocaleDateString('el-GR')}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {event.guests} επισκέπτες
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Δεν υπάρχουν επερχόμενες εκδηλώσεις</p>
          )}
        </div>
      </div>

      {/* Recipe Costs Chart */}
      {recipeCostData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Κόστος Συνταγών</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recipeCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem', color: '#F3F4F6' }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#F59E0B" name="Σύνολο Κόστος" />
                <Bar dataKey="costPerServing" fill="#3B82F6" name="Κόστος ανά Μερίδα" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
