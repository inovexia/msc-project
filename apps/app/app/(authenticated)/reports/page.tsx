"use client";

import * as React from "react";
import { mockInboxDocuments } from "@/lib/mock-inbox-documents";
import { mockPeriods } from "@/lib/mock-periods";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  DollarSign,
  Users,
  Calendar,
  Activity,
  Database,
  Beaker,
  Download,
} from "lucide-react";
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";

export default function ReportsPage() {
  const [dataMode, setDataMode] = React.useState<"mock" | "live">("mock");
  const [dateRange, setDateRange] = React.useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  // Filter documents by date range
  const filteredDocuments = React.useMemo(() => {
    const startDate = startOfDay(new Date(dateRange.start));
    const endDate = endOfDay(new Date(dateRange.end));

    return mockInboxDocuments.filter((doc) => {
      const docDate = new Date(doc.uploadedAt);
      return isAfter(docDate, startDate) && isBefore(docDate, endDate);
    });
  }, [dateRange]);

  // Calculate key metrics
  const metrics = React.useMemo(() => {
    const total = filteredDocuments.length;
    const approved = filteredDocuments.filter((d) => d.approvalStatus === "approved").length;
    const rejected = filteredDocuments.filter((d) => d.approvalStatus === "rejected").length;
    const flagged = filteredDocuments.filter((d) => d.approvalStatus === "flagged").length;
    const pending = filteredDocuments.filter((d) => d.approvalStatus === "pending").length;

    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : "0";
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : "0";

    const totalAmount = filteredDocuments.reduce((sum, doc) => {
      return sum + (doc.extracted?.amount || 0);
    }, 0);

    return {
      total,
      approved,
      rejected,
      flagged,
      pending,
      approvalRate,
      rejectionRate,
      totalAmount,
    };
  }, [filteredDocuments]);

  // Client performance data
  const clientPerformance = React.useMemo(() => {
    const clientMap = new Map<string, {
      name: string;
      total: number;
      approved: number;
      rejected: number;
      flagged: number;
      pending: number;
      totalAmount: number;
    }>();

    filteredDocuments.forEach((doc) => {
      const existing = clientMap.get(doc.clientId) || {
        name: doc.clientName,
        total: 0,
        approved: 0,
        rejected: 0,
        flagged: 0,
        pending: 0,
        totalAmount: 0,
      };

      existing.total += 1;
      existing.totalAmount += doc.extracted?.amount || 0;

      if (doc.approvalStatus === "approved") existing.approved += 1;
      if (doc.approvalStatus === "rejected") existing.rejected += 1;
      if (doc.approvalStatus === "flagged") existing.flagged += 1;
      if (doc.approvalStatus === "pending") existing.pending += 1;

      clientMap.set(doc.clientId, existing);
    });

    return Array.from(clientMap.values()).sort((a, b) => b.total - a.total);
  }, [filteredDocuments]);

  // Top vendors
  const topVendors = React.useMemo(() => {
    const vendorMap = new Map<string, { count: number; amount: number }>();

    filteredDocuments.forEach((doc) => {
      const vendor = doc.extracted?.vendor;
      if (!vendor) return;

      const existing = vendorMap.get(vendor) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += doc.extracted?.amount || 0;
      vendorMap.set(vendor, existing);
    });

    return Array.from(vendorMap.entries())
      .map(([vendor, data]) => ({ vendor, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredDocuments]);

  // Document type breakdown
  const documentTypeBreakdown = React.useMemo(() => {
    const types = {
      invoice: 0,
      receipt: 0,
      bill: 0,
      bank_statement: 0,
      other: 0,
    };

    filteredDocuments.forEach((doc) => {
      types[doc.documentType] += 1;
    });

    return Object.entries(types).map(([type, count]) => ({
      type: type.replace("_", " "),
      count,
      percentage: metrics.total > 0 ? ((count / metrics.total) * 100).toFixed(1) : "0",
    }));
  }, [filteredDocuments, metrics.total]);

  return (
    <div className="container max-w-7xl py-8 px-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Insights into document processing and client performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Data Mode Toggle */}
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
              <Button
                variant={dataMode === "mock" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setDataMode("mock")}
                className="gap-2 h-8"
              >
                <Beaker className="h-3.5 w-3.5" />
                Mock
              </Button>
              <Button
                variant={dataMode === "live" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setDataMode("live")}
                className="gap-2 h-8"
              >
                <Database className="h-3.5 w-3.5" />
                Live
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2">Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2">End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateRange({
                      start: format(subDays(new Date(), 7), "yyyy-MM-dd"),
                      end: format(new Date(), "yyyy-MM-dd"),
                    });
                  }}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateRange({
                      start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
                      end: format(new Date(), "yyyy-MM-dd"),
                    });
                  }}
                >
                  Last 30 days
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In selected date range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.approvalRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.approved} of {metrics.total} documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Approval Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Approval Status Breakdown
            </CardTitle>
            <CardDescription>Distribution of document statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{metrics.approved}</span>
                  <Badge variant="secondary">{metrics.approvalRate}%</Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${metrics.approvalRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{metrics.rejected}</span>
                  <Badge variant="secondary">{metrics.rejectionRate}%</Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 transition-all"
                  style={{ width: `${metrics.rejectionRate}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{metrics.flagged}</span>
                  <Badge variant="secondary">
                    {metrics.total > 0 ? ((metrics.flagged / metrics.total) * 100).toFixed(1) : "0"}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600 transition-all"
                  style={{
                    width: `${metrics.total > 0 ? ((metrics.flagged / metrics.total) * 100).toFixed(1) : "0"}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{metrics.pending}</span>
                  <Badge variant="secondary">
                    {metrics.total > 0 ? ((metrics.pending / metrics.total) * 100).toFixed(1) : "0"}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${metrics.total > 0 ? ((metrics.pending / metrics.total) * 100).toFixed(1) : "0"}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Document Type Distribution
            </CardTitle>
            <CardDescription>Breakdown by document category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentTypeBreakdown.map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <Badge variant="secondary">{item.percentage}%</Badge>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Vendors
            </CardTitle>
            <CardDescription>By total transaction value</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Documents</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topVendors.map((vendor) => (
                  <TableRow key={vendor.vendor}>
                    <TableCell className="font-medium">{vendor.vendor}</TableCell>
                    <TableCell className="text-right">{vendor.count}</TableCell>
                    <TableCell className="text-right">
                      ${vendor.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Client Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Performance
            </CardTitle>
            <CardDescription>Document submission statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientPerformance.slice(0, 5).map((client) => (
                  <TableRow key={client.name}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-right">{client.total}</TableCell>
                    <TableCell className="text-right">{client.approved}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={client.total > 0 && (client.approved / client.total) >= 0.8 ? "default" : "secondary"} className={client.total > 0 && (client.approved / client.total) >= 0.8 ? "bg-green-600" : ""}>
                        {client.total > 0 ? ((client.approved / client.total) * 100).toFixed(0) : "0"}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
