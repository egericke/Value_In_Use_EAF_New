'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

export default function ComparisonWorkbench({ materials, opParams, onCompute, isLoading }) {
  const [mat1, setMat1] = useState(null);
  const [mat2, setMat2] = useState(null);
  const [blendPct, setBlendPct] = useState(50);

  const handleSelectMaterial = (setter) => (e) => {
    const selectedMaterial = materials.find(m => m.id === e.target.value);
    setter(selectedMaterial);
  };

  const handleComputeClick = () => {
    if (!mat1 || !mat2) {
      alert("Please select two materials to compare.");
      return;
    }
    const payload = {
      material1: mat1,
      material2: mat2,
      blend_pct_mat1: blendPct,
      params: opParams,
    };
    onCompute(payload);
  };
  
  const MaterialSelector = ({ selected, onChange, title }) => (
    <div>
      <Label>{title}</Label>
      <select
        onChange={onChange}
        value={selected ? selected.id : ""}
        className="w-full mt-1 p-2 border rounded-md bg-white dark:bg-gray-700"
      >
        <option value="" disabled>Select Material</option>
        {materials.map(m => <option key={m.id} value={m.id}>{m.name} - ${m.price_per_ton}/t</option>)}
      </select>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Workbench</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MaterialSelector selected={mat1} onChange={handleSelectMaterial(setMat1)} title="Scenario A" />
          <MaterialSelector selected={mat2} onChange={handleSelectMaterial(setMat2)} title="Scenario B" />
        </div>
        <div>
          <Label>Blend Percentage (A / B)</Label>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-mono">{blendPct}%</span>
            <Slider
              value={[blendPct]}
              onValueChange={(value) => setBlendPct(value[0])}
              max={100}
              step={1}
            />
            <span className="font-mono">{100 - blendPct}%</span>
          </div>
        </div>
        <Button onClick={handleComputeClick} disabled={isLoading || !mat1 || !mat2} className="w-full">
          {isLoading ? 'Calculating...' : 'Compute VIU'}
        </Button>
      </CardContent>
    </Card>
  );
}
