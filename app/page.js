'use client';

import { useState, useEffect } from 'react';
import ConfigurationPanel from './(components)/ConfigurationPanel';
import ComparisonWorkbench from './(components)/ComparisonWorkbench';
import ResultsDashboard from './(components)/ResultsDashboard';

export default function Home() {
  const [materials, setMaterials] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default operational parameters
  const [opParams, setOpParams] = useState({
    electricity_cost: 0.08,
    lime_cost_ton: 150.0,
    fe_value_ton: 400.0,
    furnace_capacity_ton: 100.0,
    basicity_target: 2.5,
    target_c: 0.1,
    target_cu: 0.1,
    prime_diluent_price: 500.0,
    prime_diluent_pct_cu: 0.01,
  });

  // Fetch materials on initial load
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch('/api/materials');
        if (!res.ok) throw new Error('Failed to fetch materials');
        const data = await res.json();
        setMaterials(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchMaterials();
  }, []);

  const handleCompute = async (computePayload) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(computePayload),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Calculation failed');
      }
      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold tracking-tight">EAF Value-in-Use Modeler</h1>
          <p className="text-gray-500 dark:text-gray-400">Strategic Decision Support for Steelmakers</p>
        </div>
      </header>
      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <ConfigurationPanel
            materials={materials}
            opParams={opParams}
            setOpParams={setOpParams}
          />
        </div>
        <div className="lg:col-span-9">
          <ComparisonWorkbench
            materials={materials}
            opParams={opParams}
            onCompute={handleCompute}
            isLoading={isLoading}
          />
          {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md"><strong>Error:</strong> {error}</div>}
          {isLoading && <div className="mt-4 text-center">Loading results...</div>}
          {results && <ResultsDashboard results={results} />}
        </div>
      </main>
    </div>
  );
}
