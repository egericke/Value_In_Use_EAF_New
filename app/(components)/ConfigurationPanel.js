'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export default function ConfigurationPanel({ materials, opParams, setOpParams }) {
  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setOpParams(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Operational Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(opParams).map(([key, value]) => (
            <div key={key}>
              <Label htmlFor={key} className="capitalize">{key.replace(/_/g, ' ')}</Label>
              <Input
                id={key}
                name={key}
                type="number"
                value={value}
                onChange={handleParamChange}
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Material Library</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            {materials.length > 0 ? `${materials.length} materials loaded from DB.` : 'No materials found.'}
          </p>
          {/* In a full app, you'd have a list and a modal to view/edit */}
        </CardContent>
      </Card>
    </div>
  );
}
