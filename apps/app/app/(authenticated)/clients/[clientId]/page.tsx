"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { mockInboxDocuments } from "@/lib/mock-inbox-documents";
import { mockPeriods } from "@/lib/mock-periods";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/design-system/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Beaker,
  Download,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [dataMode, setDataMode] = React.useState<"mock" | "live">("mock");
  const [activeTab, setActiveTab] = React.useState("overview");

  // Get client data
  const clientData = React.useMemo(() => {
    // Find client info from periods
    const clientPeriod = mockPeriods.find((p) => p.clientId === clientId);
    if (!clientPeriod) return null;

    // Get all periods for this client
    const clientPeriods = mockPeriods.filter((p) => p.clientId === clientId);

    // Get all documents for this client
    const clientDocuments = mockInboxDocuments.filter((d) => d.clientId === clientId);

    return {
      id: clientId,
      name: clientPeriod.clientName,
      periods: clientPeriods,
      documents: clientDocuments,
    };
  }, [clientId]);

  // Calculate metrics
  const metrics = React.useMemo(() => {
    if (!clientData) return null;

    const totalDocs = clientData.documents.length;
    const approved = clientData.documents.filter((d) => d.approvalStatus === "approved").length;
    const rejected = clientData.documents.filter((d) => d.approvalStatus === "rejected").length;
    const pending = clientData.documents.filter((d) => d.approvalStatus === "pending").length;
    const flagged = clientData.documents.filter((d) => d.approvalStatus === "flagged").length;

    const approvalRate = totalDocs > 0 ? ((approved / totalDocs) * 100).toFixed(1) : "0";

    const totalAmount = clientData.documents.reduce((sum, doc) => {
      return sum + (doc.extracted?.amount || 0);
    }, 0);

    // Period stats
    const openPeriods = clientData.periods.filter((p) => p.status === "open").length;
    const completedPeriods = clientData.periods.filter((p) => p.status === "closed").length;
    const totalPeriods = clientData.periods.length;

    // Calculate average docs per period
    const avgDocsPerPeriod = totalPeriods > 0 ? (totalDocs / totalPeriods).toFixed(1) : "0";

    return {
      totalDocs,
      approved,
      rejected,
      pending,
      flagged,
      approvalRate,
      totalAmount,
      openPeriods,
      completedPeriods,
      totalPeriods,
      avgDocsPerPeriod,
    };
  }, [clientData]);

  // Performance data by period
  const periodPerformance = React.useMemo(() => {
    if (!clientData) return [];

    return clientData.periods.map((period) => {
      const periodDocs = clientData.documents.filter((d) => d.periodId === period.id);
      const approved = periodDocs.filter((d) => d.approvalStatus === "approved").length;
      const total = periodDocs.length;
      const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(0) : "0";
      const totalAmount = periodDocs.reduce((sum, doc) => sum + (doc.extracted?.amount || 0), 0);

      return {
        ...period,
        documentCount: total,
        approvedCount: approved,
        approvalRate,
        totalAmount,
      };
    }).sort((a, b) => {
      // Sort by year and month (most recent first)
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [clientData]);

  // Document type breakdown
  const documentTypeBreakdown = React.useMemo(() => {
    if (!clientData) return [];

    const types: Record<string, number> = {
      invoice: 0,
      receipt: 0,
      bill: 0,
      bank_statement: 0,
      other: 0,
    };

    clientData.documents.forEach((doc) => {
      types[doc.documentType] += 1;
    });

    return Object.entries(types)
      .map(([type, count]) => ({
        type: type.replace("_", " "),
        count,
        percentage: metrics ? ((count / metrics.totalDocs) * 100).toFixed(1) : "0",
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [clientData, metrics]);

  // Activity timeline (recent actions)
  const activityTimeline = React.useMemo(() => {
    if (!clientData) return [];

    return clientData.documents
      .slice()
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 10)
      .map((doc) => ({
        id: doc.id,
        timestamp: doc.uploadedAt,
        action: `Document ${doc.approvalStatus}`,
        document: doc.filename,
        user: doc.uploaderName,
        status: doc.approvalStatus,
      }));
  }, [clientData]);

  if (!clientData) {
    return (
      <div className="container max-w-7xl py-8 px-6 md:px-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Client not found</h2>
          <p className="text-muted-foreground mb-4">The client you're looking for doesn't exist.</p>
          <Link href="/clients">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8 px-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <Link href="/clients">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{clientData.name}</h1>
                <Badge variant="outline" className="text-sm">
                  Client ID: {clientId}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@{clientData.name.toLowerCase().replace(/\s+/g, '')}.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Client since Jan 2024</span>
                </div>
              </div>
            </div>
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
              Export Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalDocs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {metrics?.totalPeriods} periods
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics?.approvalRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics?.approved} of {metrics?.totalDocs} approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${metrics?.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time document value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Periods</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.openPeriods}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics?.completedPeriods} completed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">All Documents</TabsTrigger>
          <TabsTrigger value="periods">Period History</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Scorecard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Scorecard
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Approval Rate</span>
                    <Badge variant="default" className="bg-green-600">
                      {metrics?.approvalRate}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all"
                      style={{ width: `${metrics?.approvalRate}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Document Quality</span>
                    <Badge variant="secondary">95%</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all" style={{ width: "95%" }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on OCR confidence scores
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">On-Time Submission</span>
                    <Badge variant="secondary">88%</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 transition-all" style={{ width: "88%" }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Documents submitted before period deadline
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{metrics?.avgDocsPerPeriod}</div>
                      <p className="text-xs text-muted-foreground">Avg docs/period</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {metrics?.completedPeriods}
                      </div>
                      <p className="text-xs text-muted-foreground">Periods closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Document Type Distribution
                </CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
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

          {/* Recent Period Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Period Performance</CardTitle>
              <CardDescription>Document submission and approval trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Documents</TableHead>
                    <TableHead className="text-right">Approved</TableHead>
                    <TableHead className="text-right">Approval Rate</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodPerformance.slice(0, 5).map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/clients/${clientId}/periods/${period.id}`}
                          className="hover:underline"
                        >
                          {period.periodName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {period.status === "open" && (
                          <Badge variant="outline" className="border-blue-600 text-blue-600">
                            Open
                          </Badge>
                        )}
                        {period.status === "in_review" && (
                          <Badge variant="outline" className="border-orange-600 text-orange-600">
                            In Review
                          </Badge>
                        )}
                        {period.status === "closed" && (
                          <Badge variant="default" className="bg-green-600">
                            Closed
                          </Badge>
                        )}
                        {period.status === "locked" && (
                          <Badge variant="secondary">Locked</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{period.documentCount}</TableCell>
                      <TableCell className="text-right">{period.approvedCount}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={parseFloat(period.approvalRate) >= 80 ? "default" : "secondary"}
                          className={parseFloat(period.approvalRate) >= 80 ? "bg-green-600" : ""}
                        >
                          {period.approvalRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${period.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Documents</CardTitle>
                  <CardDescription>
                    {clientData.documents.length} documents across all periods
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientData.documents
                    .slice()
                    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                    .map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <Link href="/inbox" className="hover:underline">
                            {doc.filename}
                          </Link>
                        </TableCell>
                        <TableCell>{doc.periodName}</TableCell>
                        <TableCell className="capitalize">
                          {doc.documentType.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          {doc.approvalStatus === "approved" && (
                            <Badge variant="default" className="bg-green-600">
                              Approved
                            </Badge>
                          )}
                          {doc.approvalStatus === "rejected" && (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                          {doc.approvalStatus === "flagged" && (
                            <Badge variant="outline" className="border-orange-600 text-orange-600">
                              Flagged
                            </Badge>
                          )}
                          {doc.approvalStatus === "pending" && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>{format(new Date(doc.uploadedAt), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          {doc.extracted?.amount !== undefined
                            ? `$${doc.extracted.amount.toFixed(2)}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Period History Tab */}
        <TabsContent value="periods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Period Timeline</CardTitle>
              <CardDescription>Historical period performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {periodPerformance.map((period, index) => (
                  <div
                    key={period.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link
                          href={`/clients/${clientId}/periods/${period.id}`}
                          className="text-lg font-semibold hover:underline"
                        >
                          {period.periodName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {period.status === "open" && (
                            <Badge variant="outline" className="border-blue-600 text-blue-600">
                              Open
                            </Badge>
                          )}
                          {period.status === "in_review" && (
                            <Badge variant="outline" className="border-orange-600 text-orange-600">
                              In Review
                            </Badge>
                          )}
                          {period.status === "closed" && (
                            <Badge variant="default" className="bg-green-600">
                              Closed
                            </Badge>
                          )}
                          {period.status === "locked" && (
                            <Badge variant="secondary">Locked</Badge>
                          )}
                          {period.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Due: {format(new Date(period.dueDate), "MMM dd, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {period.documentCount}
                        </div>
                        <p className="text-xs text-muted-foreground">documents</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Submitted</div>
                        <div className="font-semibold">{period.received}/{period.required}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Approved</div>
                        <div className="font-semibold text-green-600">{period.approvedCount}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Approval Rate</div>
                        <div className="font-semibold">{period.approvalRate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Total Value</div>
                        <div className="font-semibold">
                          ${period.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            (period.received / period.required) * 100 >= 100
                              ? "bg-emerald-500"
                              : (period.received / period.required) * 100 >= 75
                              ? "bg-blue-500"
                              : (period.received / period.required) * 100 >= 50
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min((period.received / period.required) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Activity Timeline
              </CardTitle>
              <CardDescription>Recent document activity and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityTimeline.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="p-2 bg-muted rounded-lg">
                      {activity.status === "approved" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      )}
                      {activity.status === "rejected" && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      {activity.status === "flagged" && (
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                      )}
                      {activity.status === "pending" && (
                        <Clock className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(activity.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.document}</p>
                      <p className="text-xs text-muted-foreground mt-1">by {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
