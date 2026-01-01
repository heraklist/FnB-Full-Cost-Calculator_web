import { SkeletonText } from '../shared/Skeleton';
import { useState, memo } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { useRecipes } from '../../hooks/useRecipes';
import { useIngredients } from '../../hooks/useIngredients';
import { useSettings } from '../../hooks/useSettings';
import type { Event, Recipe } from '../../types';
import {
  getRecipePricing as sharedGetRecipePricing,
  calculateEventTotals as sharedCalculateEventTotals,
} from '../../lib/costCalculations';

function ReportsTab() {
  const { events, loading } = useEvents();
  const { recipes } = useRecipes();
  const { ingredients } = useIngredients();
  const { settings } = useSettings();

  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Dynamically extract unique years from events
  const eventYears = Array.from(
    new Set(
      (events || [])
        .map(e => e.event_date && !isNaN(new Date(e.event_date).getFullYear()) ? new Date(e.event_date).getFullYear() : null)
        .filter((y): y is number => y !== null)
    )
  ).sort((a, b) => b - a);

  // Use shared cost calculations
  const getRecipePricing = (recipe: Recipe) => {
    return sharedGetRecipePricing(recipe, ingredients, settings);
  };

  const calculateEventTotals = (event: Event) => {
    return sharedCalculateEventTotals(event, recipes, ingredients, settings);
  };

  // Calculate statistics
  const getFilteredEvents = () => {
    return events.filter(e => {
      if (!e.event_date) return false;
      const eventDate = new Date(e.event_date);
      const eventYear = eventDate.getFullYear();
      const eventMonth = eventDate.getMonth();

      if (period === 'month') {
        return eventYear === selectedYear && eventMonth === selectedMonth;
      } else if (period === 'quarter') {
        const quarter = Math.floor(selectedMonth / 3);
        const eventQuarter = Math.floor(eventMonth / 3);
        return eventYear === selectedYear && eventQuarter === quarter;
      } else {
        return eventYear === selectedYear;
      }
    });
  };

  const filteredEvents = getFilteredEvents();

  // Stats calculations
  const totalEvents = filteredEvents.length;
  const completedEvents = filteredEvents.filter(e => e.status === 'completed').length;
  const confirmedEvents = filteredEvents.filter(e => e.status === 'confirmed').length;
  const cancelledEvents = filteredEvents.filter(e => e.status === 'cancelled').length;

  const calculateRevenue = () => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalGuests = 0;

    filteredEvents.forEach(event => {
      if (event.status === 'completed' || event.status === 'confirmed') {
        const totals = calculateEventTotals(event);
        if (totals) {
          totalRevenue += totals.total;
          totalCost += totals.costTotal + totals.staffCost + totals.transportCost + totals.equipmentCost;
          totalGuests += event.guests;
        }
      }
    });

    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalCost, profit, profitMargin, totalGuests };
  };

  const { totalRevenue, totalCost, profit, profitMargin, totalGuests } = calculateRevenue();

  // Top recipes
  const getTopRecipes = () => {
    const recipeCounts: Record<number, { name: string; count: number; revenue: number }> = {};

    filteredEvents.forEach(event => {
      if (event.status === 'completed' || event.status === 'confirmed') {
        event.recipes.forEach(er => {
          const recipe = recipes.find(r => r.id === er.recipe_id);
          if (!recipe) return;
          
          if (!recipeCounts[er.recipe_id]) {
            recipeCounts[er.recipe_id] = { 
              name: er.recipe_name || 'Unknown', 
              count: 0, 
              revenue: 0 
            };
          }
          recipeCounts[er.recipe_id].count += er.servings;
          
          const pricing = getRecipePricing(recipe);
          const pricePerServing = er.price_override ?? pricing.pricePerServing;
          recipeCounts[er.recipe_id].revenue += pricePerServing * er.servings;
        });
      }
    });

    return Object.values(recipeCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const topRecipes = getTopRecipes();

  // Monthly trend data
  const getMonthlyTrend = () => {
    const months: Record<string, { revenue: number; events: number }> = {};

    events.forEach(event => {
      if (!event.event_date) return;
      if (event.status !== 'completed' && event.status !== 'confirmed') return;

      const date = new Date(event.event_date);
      if (date.getFullYear() !== selectedYear) return;

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { revenue: 0, events: 0 };
      }

      const totals = calculateEventTotals(event);
      if (totals) {
        months[monthKey].revenue += totals.total;
        months[monthKey].events += 1;
      }
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: monthNames[parseInt(month.split('-')[1]) - 1].substring(0, 3),
        ...data
      }));
  };

  const monthlyTrend = getMonthlyTrend();
  const maxRevenue = Math.max(...monthlyTrend.map(m => m.revenue), 1);

  const monthNames = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
    'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
    'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];

  const quarterNames = ['Ιαν-Μαρ', 'Απρ-Ιουν', 'Ιουλ-Σεπ', 'Οκτ-Δεκ'];

  return (
    <div className="reports-container">
      {loading && <SkeletonText lines={10} />}
      <h2 className="section-title">📊 Αναφορές & Στατιστικά</h2>

      {/* Period Selectors */}
      <div className="period-selectors">
        <div>
          <label>Περίοδος:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value as 'month' | 'quarter' | 'year')}>
            <option value="month">Μήνας</option>
            <option value="quarter">Τρίμηνο</option>
            <option value="year">Έτος</option>
          </select>
        </div>
        <div>
          <label>Έτος:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
            {eventYears.length === 0 ? (
              <option value={selectedYear}>{selectedYear}</option>
            ) : (
              eventYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))
            )}
          </select>
        </div>
        {period === 'month' && (
          <div>
            <label>Μήνας:</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx}>{name}</option>
              ))}
            </select>
          </div>
        )}
        {period === 'quarter' && (
          <div>
            <label>Τρίμηνο:</label>
            <select value={Math.floor(selectedMonth / 3) * 3} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
              {quarterNames.map((name, idx) => (
                <option key={idx} value={idx * 3}>{name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Row - 4 cards with card backgrounds */}
      <div className="reports-stats-grid">
        <div className="reports-stat-card blue">
          <div className="stat-icon">📅</div>
          <div className="stat-number">{totalEvents}</div>
          <div className="stat-label">Συνολικά Events</div>
        </div>
        <div className="reports-stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{completedEvents}</div>
          <div className="stat-label">Ολοκληρωμένα</div>
        </div>
        <div className="reports-stat-card yellow">
          <div className="stat-icon">⏳</div>
          <div className="stat-number">{confirmedEvents}</div>
          <div className="stat-label">Επιβεβαιωμένα</div>
        </div>
        <div className="reports-stat-card red">
          <div className="stat-icon">❌</div>
          <div className="stat-number">{cancelledEvents}</div>
          <div className="stat-label">Ακυρωμένα</div>
        </div>
      </div>

      {/* Financial Row - 6 cards */}
      <div className="reports-financial-grid">
        <div className="financial-card green">
          <div className="label">Συνολικά Έσοδα</div>
          <div className="number">{totalRevenue.toFixed(2)} €</div>
        </div>
        <div className="financial-card red">
          <div className="label">Συνολικό Κόστος</div>
          <div className="number">{totalCost.toFixed(2)} €</div>
        </div>
        <div className="financial-card yellow">
          <div className="label">Καθαρό Κέρδος</div>
          <div className="number">{profit.toFixed(2)} €</div>
        </div>
        <div className="financial-card purple">
          <div className="label">Περιθώριο Κέρδους</div>
          <div className="number">{profitMargin.toFixed(1)}%</div>
        </div>
        <div className="financial-card cyan">
          <div className="label">Συνολικοί Καλεσμένοι</div>
          <div className="number">{totalGuests}</div>
        </div>
        <div className="financial-card blue">
          <div className="label">Μέσος Όρος / Event</div>
          <div className="number">{totalEvents > 0 ? (totalRevenue / totalEvents).toFixed(2) : '0.00'} €</div>
        </div>
      </div>

      {/* Monthly Chart */}
      {period === 'year' && monthlyTrend.length > 0 && (
        <div className="report-section">
          <h3>📈 Μηνιαία Εξέλιξη {selectedYear}</h3>
          <div className="chart-container">
            {monthlyTrend.map((data, idx) => (
              <div key={idx} className="chart-bar-wrapper">
                <div className="chart-bar-value">{data.revenue.toFixed(0)}€</div>
                <div 
                  className="chart-bar" 
                  style={{ height: `${(data.revenue / maxRevenue) * 150}px` }}
                >
                  <span className="chart-bar-events">{data.events}</span>
                </div>
                <div className="chart-bar-label">{data.month}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Recipes */}
      {topRecipes.length > 0 && (
        <div className="report-section">
          <h3>🏆 Top 5 Συνταγές</h3>
          <div className="top-recipes-list">
            {topRecipes.map((recipe, idx) => (
              <div key={idx} className="top-recipe-item">
                <span className="recipe-rank">#{idx + 1}</span>
                <span className="recipe-name">{recipe.name}</span>
                <span className="recipe-count">{recipe.count} μερίδες</span>
                <span className="recipe-revenue">{recipe.revenue.toFixed(2)} €</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalEvents === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p>Δεν υπάρχουν δεδομένα για την επιλεγμένη περίοδο</p>
        </div>
      )}
    </div>
  );
}

export default memo(ReportsTab);
