"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Badge } from "@repo/design-system/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/design-system/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/design-system/components/ui/dropdown-menu";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

type PeriodType = "monthly" | "quarterly" | "yearly";

type DocumentStatus = "completed" | "pending" | "rejected";

interface UploadedDocument {
  id: string;
  name: string;
  period: string;
  periodType: PeriodType;
  status: DocumentStatus;
  uploadedAt: string;
  size: string;
  category?: string;
}

// Mock data generator
const generateMockDocuments = (): UploadedDocument[] => {
  const documents: UploadedDocument[] = [];
  const currentYear = new Date().getFullYear();
  const statuses: DocumentStatus[] = ["completed", "pending", "rejected"];
  const categories = ["Financial", "Tax", "Legal", "Payroll"];
  const docTypes = [
    "Bank Statement",
    "Invoice",
    "Receipt",
    "Tax Form",
    "Contract",
    "Payroll Record",
  ];

  // Generate monthly documents
  for (let month = 1; month <= 12; month++) {
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      documents.push({
        id: `doc-monthly-${currentYear}-${month}-${i}`,
        name: `${
          docTypes[Math.floor(Math.random() * docTypes.length)]
        }_${month}_${i + 1}.pdf`,
        period: `${currentYear}-${String(month).padStart(2, "0")}`,
        periodType: "monthly",
        status: statuses[Math.floor(Math.random() * statuses.length)],
        uploadedAt: new Date(
          currentYear,
          month - 1,
          Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        size: `${(Math.random() * 5 + 0.5).toFixed(2)} MB`,
        category: categories[Math.floor(Math.random() * categories.length)],
      });
    }
  }

  // Generate quarterly documents
  for (let quarter = 1; quarter <= 4; quarter++) {
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
      documents.push({
        id: `doc-quarterly-${currentYear}-Q${quarter}-${i}`,
        name: `${
          docTypes[Math.floor(Math.random() * docTypes.length)]
        }_Q${quarter}_${i + 1}.pdf`,
        period: `${currentYear}-Q${quarter}`,
        periodType: "quarterly",
        status: statuses[Math.floor(Math.random() * statuses.length)],
        uploadedAt: new Date(
          currentYear,
          quarter * 3 - 1,
          Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        size: `${(Math.random() * 5 + 0.5).toFixed(2)} MB`,
        category: categories[Math.floor(Math.random() * categories.length)],
      });
    }
  }

  // Generate yearly documents
  for (let year = currentYear - 2; year <= currentYear; year++) {
    const count = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < count; i++) {
      documents.push({
        id: `doc-yearly-${year}-${i}`,
        name: `${
          docTypes[Math.floor(Math.random() * docTypes.length)]
        }_${year}_${i + 1}.pdf`,
        period: String(year),
        periodType: "yearly",
        status: statuses[Math.floor(Math.random() * statuses.length)],
        uploadedAt: new Date(
          year,
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ).toISOString(),
        size: `${(Math.random() * 5 + 0.5).toFixed(2)} MB`,
        category: categories[Math.floor(Math.random() * categories.length)],
      });
    }
  }

  return documents.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
};

export default function DocumentCollectionPage() {
  const searchParams = useSearchParams();

  const [periodType, setPeriodType] = React.useState<PeriodType>("monthly");
  const [selectedPeriod, setSelectedPeriod] = React.useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [allDocuments] = React.useState<UploadedDocument[]>(
    generateMockDocuments()
  );

  // Filter documents based on period type and selected period
  const filteredDocuments = React.useMemo(() => {
    return allDocuments.filter((doc) => {
      if (doc.periodType !== periodType) return false;
      if (periodType === "yearly") {
        return doc.period === selectedPeriod;
      }
      return doc.period === selectedPeriod;
    });
  }, [allDocuments, periodType, selectedPeriod]);

  // Generate period options based on type
  const getPeriodOptions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (periodType === "monthly") {
      const months = [];
      for (let year = currentYear; year >= currentYear - 2; year--) {
        for (let month = 12; month >= 1; month--) {
          if (year === currentYear && month > currentMonth) continue;
          months.push({
            value: `${year}-${String(month).padStart(2, "0")}`,
            label: new Date(year, month - 1).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            }),
          });
        }
      }
      return months;
    } else if (periodType === "quarterly") {
      const quarters = [];
      for (let year = currentYear; year >= currentYear - 2; year--) {
        for (let q = 4; q >= 1; q--) {
          const quarterMonth = q * 3;
          if (year === currentYear && quarterMonth > currentMonth) continue;
          quarters.push({
            value: `${year}-Q${q}`,
            label: `Q${q} ${year}`,
          });
        }
      }
      return quarters;
    } else {
      const years = [];
      for (let year = currentYear; year >= currentYear - 5; year--) {
        years.push({
          value: String(year),
          label: String(year),
        });
      }
      return years;
    }
  };

  const periodOptions = getPeriodOptions();

  const handleDownload = (doc: UploadedDocument) => {
    console.log("Download:", doc.name);
    alert(`Downloading ${doc.name}`);
  };

  const handleView = (doc: UploadedDocument) => {
    console.log("View:", doc.name);
    alert(`Opening ${doc.name}`);
  };

  const handleDelete = (doc: UploadedDocument) => {
    console.log("Delete:", doc.id);
    if (confirm(`Are you sure you want to delete ${doc.name}?`)) {
      alert(`${doc.name} deleted`);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
    }
  };

  const formatPeriod = (period: string, type: PeriodType) => {
    if (type === "monthly") {
      const [year, month] = period.split("-");
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
        "en-US",
        { month: "short", year: "numeric" }
      );
    }
    return period;
  };

  const stats = React.useMemo(() => {
    const total = filteredDocuments.length;
    const completed = filteredDocuments.filter(
      (d) => d.status === "completed"
    ).length;
    const pending = filteredDocuments.filter(
      (d) => d.status === "pending"
    ).length;
    const rejected = filteredDocuments.filter(
      (d) => d.status === "rejected"
    ).length;

    return { total, completed, pending, rejected };
  }, [filteredDocuments]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Document Collection</h1>
            <p className="text-muted-foreground">
              View and manage all your uploaded documents
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>

            <Select
              value={periodType}
              onValueChange={(value: PeriodType) => {
                setPeriodType(value);
                const now = new Date();
                if (value === "monthly") {
                  setSelectedPeriod(
                    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                      2,
                      "0"
                    )}`
                  );
                } else if (value === "quarterly") {
                  const quarter = Math.ceil((now.getMonth() + 1) / 3);
                  setSelectedPeriod(`${now.getFullYear()}-Q${quarter}`);
                } else {
                  setSelectedPeriod(String(now.getFullYear()));
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {stats.completed}
                </div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </div>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Documents for{" "}
              {periodType === "monthly" &&
                new Date(selectedPeriod + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              {periodType === "quarterly" && selectedPeriod}
              {periodType === "yearly" && selectedPeriod}
            </CardTitle>
            <CardDescription>
              {filteredDocuments.length} document(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No documents found
                </h3>
                <p className="text-muted-foreground">
                  No documents have been uploaded for this period yet.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Document Name</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {doc.size} • {doc.category}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatPeriod(doc.period, doc.periodType)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(doc)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(doc)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
