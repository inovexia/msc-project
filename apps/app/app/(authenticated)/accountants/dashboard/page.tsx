"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Inbox,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Users,
  Database,
  Beaker,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { mockInboxDocuments } from "@/lib/mock-inbox-documents";
import { mockPeriods } from "@/lib/mock-periods";

export default function AccountantDashboardPage() {
  const [dataMode, setDataMode] = React.useState<"mock" | "live">("mock");

  // Calculate metrics from mock data
  const metrics = React.useMemo(() => {
    const totalDocs = mockInboxDocuments.length;
    const pending = mockInboxDocuments.filter((d) => d.approvalStatus === "pending").length;
    const approved = mockInboxDocuments.filter((d) => d.approvalStatus === "approved").length;
    const needsReview = mockInboxDocuments.filter(
      (d) => d.status === "needs_review" || d.flags
    ).length;
    const flagged = mockInboxDocuments.filter((d) => d.approvalStatus === "flagged").length;

    const totalPeriods = mockPeriods.length;
    const openPeriods = mockPeriods.filter((p) => p.status === "open").length;
    const needsAttention = mockPeriods.filter(
      (p) => p.status === "open" && p.received < p.required
    ).length;

    return {
      totalDocs,
      pending,
      approved,
      needsReview,
      flagged,
      totalPeriods,
      openPeriods,
      needsAttention,
    };
  }, []);

  // Recent activity
  const recentActivity = React.useMemo(() => {
    return mockInboxDocuments
      .slice()
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 5);
  }, []);

  return (
    <div className="container max-w-7xl py-8 px-6 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Here's an overview of your document workflow
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
            {dataMode === "live" && (
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Documents awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.needsReview + metrics.flagged}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Flagged or review required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDocs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all periods
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Inbox className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle>Process Documents</CardTitle>
                <CardDescription>
                  Review and approve pending documents
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Inbox:</span>
                <Badge variant="secondary">{metrics.pending} pending</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Needs Review:</span>
                <Badge variant="destructive">{metrics.needsReview} flagged</Badge>
              </div>
              <Link href="/inbox">
                <Button className="w-full gap-2 mt-2">
                  Open Inbox
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <CardTitle>Manage Periods</CardTitle>
                <CardDescription>
                  Track month-end progress by client
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Open Periods:</span>
                <Badge variant="outline">{metrics.openPeriods} active</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Incomplete:</span>
                <Badge variant="destructive">{metrics.needsAttention} clients</Badge>
              </div>
              <Link href="/clients">
                <Button className="w-full gap-2 mt-2" variant="outline">
                  View Collections
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest document submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 bg-muted rounded">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{doc.filename}</p>
                      {doc.approvalStatus === "approved" && (
                        <Badge variant="default" className="bg-green-600 text-xs">
                          Approved
                        </Badge>
                      )}
                      {doc.approvalStatus === "flagged" && (
                        <Badge variant="outline" className="border-orange-600 text-orange-600 text-xs">
                          Flagged
                        </Badge>
                      )}
                      {doc.approvalStatus === "pending" && (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium">{doc.clientName}</span>
                      <span>•</span>
                      <span>{doc.uploaderName}</span>
                      {doc.extracted?.amount !== undefined && (
                        <>
                          <span>•</span>
                          <span className="font-medium">
                            ${doc.extracted.amount.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(doc.uploadedAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Link href="/inbox">
                    <Button variant="ghost" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
            <Link href="/inbox">
              <Button variant="ghost" className="w-full mt-4 gap-2">
                View All Documents
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Clients Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Status
            </CardTitle>
            <CardDescription>Period completion overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPeriods
                .filter((p) => p.status === "open")
                .slice(0, 5)
                .map((period) => {
                  const progressPercent = Math.round(
                    (period.received / period.required) * 100
                  );
                  const needsAttention = period.received < period.required;

                  return (
                    <Link key={period.id} href={`/clients/${period.clientId}`}>
                      <div className="space-y-2 hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate hover:underline">
                              {period.clientName}
                            </span>
                            {needsAttention && (
                              <AlertCircle className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              progressPercent >= 100
                                ? "bg-emerald-500"
                                : progressPercent >= 75
                                ? "bg-blue-500"
                                : progressPercent >= 50
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              <Link href="/clients">
                <Button variant="ghost" className="w-full mt-2 gap-2" size="sm">
                  View All Periods
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
