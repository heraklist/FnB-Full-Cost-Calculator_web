import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { ArrowUpRight, ArrowDownRight, Package, UtensilsCrossed, Calendar, ChefHat, TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react'
import * as api from '../lib/api'
import type { Ingredient, Recipe, Event, Transaction } from '../lib/api'

const COLORS = ['#6366F1', '#F43F5E', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor }: any) => (
  <div className={`${bgColor} rounded-lg p-6 border border-gray-700`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg bg-gray-800/50`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
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
    <div className="space-y-8">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Σύνολο Εσόδων"
          value={`€${totalIncome.toFixed(2)}`}
          icon={TrendingUp}
          bgColor="bg-emerald-900/50"
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Σύνολο Εξόδων"
          value={`€${totalExpense.toFixed(2)}`}
          icon={TrendingDown}
          bgColor="bg-red-900/50"
          iconColor="text-red-400"
        />
        <StatCard
          title="Κέρδος"
          value={`€${profit.toFixed(2)}`}
          icon={Wallet}
          bgColor={profit >= 0 ? "bg-blue-900/50" : "bg-red-900/50"}
          iconColor={profit >= 0 ? "text-blue-400" : "text-red-400"}
        />
      </div>

      {/* Charts Section */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Chart */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Μηνιαία Έσοδα & Έξοδα</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Έσοδα" />
                <Bar dataKey="expense" fill="#EF4444" name="Έξοδα" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Profit Trend Chart */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Τάση Κέρδους</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#E5E7EB' }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Κέρδος"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Expense Breakdown Chart */}
      {expenseByCategory.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Κατανομή Εξόδων κατά Κατηγορία</h3>
          <ResponsiveContainer width="100%" height={300}>
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
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Πρώτες Ύλες"
          value={ingredients.length}
          icon={Package}
          bgColor="bg-purple-900/50"
          iconColor="text-purple-400"
        />
        <StatCard
          title="Συνταγές"
          value={recipes.length}
          icon={ChefHat}
          bgColor="bg-blue-900/50"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Εκδηλώσεις"
          value={confirmedEvents.length}
          icon={Calendar}
          bgColor="bg-emerald-900/50"
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Σύνολο Κόστος"
          value={`€${totalRecipesCost.toFixed(2)}`}
          icon={DollarSign}
          bgColor="bg-orange-900/50"
          iconColor="text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Ingredients */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Πιο Ακριβές Πρώτες Ύλες</h3>
          {topIngredients.length > 0 ? (
            <div className="space-y-3">
              {topIngredients.map((ing, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                  <span className="text-gray-300">{ing.name}</span>
                  <span className="text-emerald-400 font-semibold">€{ing.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Δεν υπάρχουν πρώτες ύλες</p>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Επερχόμενες Εκδηλώσεις</h3>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-lg border border-indigo-700/50"
                >
                  <p className="font-semibold text-indigo-200">{event.name}</p>
                  <p className="text-sm text-gray-400">
                    {event.event_date && new Date(event.event_date).toLocaleDateString('el-GR')}
                  </p>
                  <p className="text-sm text-gray-300 mt-1">
                    {event.event_recipes?.length || 0} συνταγές
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Δεν υπάρχουν επερχόμενες εκδηλώσεις</p>
          )}
        </div>
      </div>

      {/* Recipe Costs Chart */}
      {recipeCostData.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Κόστος Συνταγών</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recipeCostData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#E5E7EB' }}
              />
              <Legend />
              <Bar dataKey="cost" fill="#F59E0B" name="Σύνολο Κόστος" />
              <Bar dataKey="costPerServing" fill="#3B82F6" name="Κόστος ανά Μερίδα" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
