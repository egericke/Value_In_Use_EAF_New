'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import WaterfallChart from './WaterfallChart';

export default function ResultsDashboard({ results }) {
    if (!results) return null;

    const { material1, material2, blend, names } = results;

    const KPICard = ({ title, value, unit }) => (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}<span className="text-base font-normal ml-1">{unit}</span></p>
        </div>
    );
    
    return (
        <div className="mt-8 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>VIU Summary ($/Net Ton)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KPICard title={names.material1} value={material1.costPerNetTon} unit="USD" />
                    <KPICard title="Blended" value={blend.costPerNetTon} unit="USD" />
                    <KPICard title={names.material2} value={material2.costPerNetTon} unit="USD" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-96 w-full">
                        <WaterfallChart data={{
                            mat1: material1.costBreakdown,
                            mat2: material2.costBreakdown,
                            blend: blend.costBreakdown,
                            names: names
                        }}/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Key Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>KPI</TableHead>
                                <TableHead className="text-right">{names.material1}</TableHead>
                                <TableHead className="text-right">{names.material2}</TableHead>
                                <TableHead className="text-right">Blended</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Yield (%)</TableCell>
                                <TableCell className="text-right">{material1.kpis.yieldPct}</TableCell>
                                <TableCell className="text-right">{material2.kpis.yieldPct}</TableCell>
                                <TableCell className="text-right">{blend.kpis.yieldPct}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Slag Volume (kg/t)</TableCell>
                                <TableCell className="text-right">{material1.kpis.slagVolumeKgPerTon}</TableCell>
                                <TableCell className="text-right">{material2.kpis.slagVolumeKgPerTon}</TableCell>
                                <TableCell className="text-right">{blend.kpis.slagVolumeKgPerTon}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Energy Credit (kWh/t)</TableCell>
                                <TableCell className="text-right">{material1.kpis.kwhCreditPerTon}</TableCell>
                                <TableCell className="text-right">{material2.kpis.kwhCreditPerTon}</TableCell>
                                <TableCell className="text-right">{blend.kpis.kwhCreditPerTon}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
