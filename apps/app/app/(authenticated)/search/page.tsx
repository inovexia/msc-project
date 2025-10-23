"use client";

import * as React from "react";
import { mockInboxDocuments, type InboxDocument } from "@/lib/mock-inbox-documents";
import { mockPeriods } from "@/lib/mock-periods";
import { Badge } from "@repo/design-system/components/ui/badge";
import { Button } from "@repo/design-system/components/ui/button";
import { Input } from "@repo/design-system/components/ui/input";
import { Label } from "@repo/design-system/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/design-system/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/design-system/components/ui/card";
import {
  Search,
  SlidersHorizontal,
  X,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  Clock,
  Filter,
  History,
  Database,
  Beaker,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

type SearchFilters = {
  query: string;
  client: string;
  vendor: string;
  documentType: string;
  approvalStatus: string;
  period: string;
  minAmount: string;
  maxAmount: string;
  startDate: string;
  endDate: string;
};

export default function SearchPage() {
  const [filters, setFilters] = React.useState<SearchFilters>({
    query: "",
    client: "",
    vendor: "",
    documentType: "",
    approvalStatus: "",
    period: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
  });

  const [showFilters, setShowFilters] = React.useState(true);
  const [dataMode, setDataMode] = React.useState<"mock" | "live">("mock");
  const [recentSearches, setRecentSearches] = React.useState<string[]>([
    "October invoices",
    "Vance Industries receipts",
    "Expenses over $1000",
  ]);

  // Get unique values for filters
  const uniqueClients = React.useMemo(() => {
    const clients = new Set(mockInboxDocuments.map((d) => d.clientName));
    return Array.from(clients).sort();
  }, []);

  const uniqueVendors = React.useMemo(() => {
    const vendors = new Set(
      mockInboxDocuments
        .map((d) => d.extracted?.vendor)
        .filter((v): v is string => !!v)
    );
    return Array.from(vendors).sort();
  }, []);

  const uniquePeriods = React.useMemo(() => {
    const periods = new Set(mockInboxDocuments.map((d) => d.periodName));
    return Array.from(periods).sort();
  }, []);

  // Filter documents
  const filteredDocuments = React.useMemo(() => {
    return mockInboxDocuments.filter((doc) => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const searchableText = [
          doc.filename,
          doc.clientName,
          doc.extracted?.vendor,
          doc.extracted?.invoiceNumber,
          doc.uploaderName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(query)) return false;
      }

      // Client filter
      if (filters.client && doc.clientName !== filters.client) return false;

      // Vendor filter
      if (filters.vendor && doc.extracted?.vendor !== filters.vendor) return false;

      // Document type filter
      if (filters.documentType && doc.documentType !== filters.documentType) return false;

      // Approval status filter
      if (filters.approvalStatus && doc.approvalStatus !== filters.approvalStatus) return false;

      // Period filter
      if (filters.period && doc.periodName !== filters.period) return false;

      // Amount range filter
      if (doc.extracted?.amount !== undefined) {
        if (filters.minAmount && doc.extracted.amount < parseFloat(filters.minAmount)) return false;
        if (filters.maxAmount && doc.extracted.amount > parseFloat(filters.maxAmount)) return false;
      }

      // Date range filter
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        const docDate = new Date(doc.uploadedAt);
        if (docDate < startDate) return false;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        const docDate = new Date(doc.uploadedAt);
        if (docDate > endDate) return false;
      }

      return true;
    });
  }, [filters]);

  // Active filters count
  const activeFiltersCount = React.useMemo(() => {
    return Object.values(filters).filter((v) => v !== "").length;
  }, [filters]);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      query: "",
      client: "",
      vendor: "",
      documentType: "",
      approvalStatus: "",
      period: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
    });
  };

  const clearFilter = (key: keyof SearchFilters) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const handleRecentSearch = (search: string) => {
    updateFilter("query", search);
  };

  const getStatusBadge = (doc: InboxDocument) => {
    if (doc.approvalStatus === "approved") {
      return <Badge variant="default" className="bg-green-600">Approved</Badge>;
    }
    if (doc.approvalStatus === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (doc.approvalStatus === "flagged") {
      return <Badge variant="outline" className="border-orange-600 text-orange-600">Flagged</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="container max-w-7xl py-8 px-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search Documents</h1>
            <p className="text-muted-foreground">
              Find documents across all clients and periods
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
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by filename, client, vendor, amount, invoice number..."
            value={filters.query}
            onChange={(e) => updateFilter("query", e.target.value)}
            className="pl-12 pr-12 h-12 text-base"
          />
          {filters.query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilter("query", "")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.client && (
              <Badge variant="secondary" className="gap-2">
                Client: {filters.client}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearFilter("client");
                  }}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.vendor && (
              <Badge variant="secondary" className="gap-2">
                Vendor: {filters.vendor}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearFilter("vendor");
                  }}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.documentType && (
              <Badge variant="secondary" className="gap-2">
                Type: {filters.documentType.replace("_", " ")}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearFilter("documentType");
                  }}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.approvalStatus && (
              <Badge variant="secondary" className="gap-2">
                Status: {filters.approvalStatus}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearFilter("approvalStatus");
                  }}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.period && (
              <Badge variant="secondary" className="gap-2">
                Period: {filters.period}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearFilter("period");
                  }}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.minAmount || filters.maxAmount) && (
              <Badge variant="secondary" className="gap-2">
                Amount: ${filters.minAmount || "0"} - $
                {filters.maxAmount || "∞"}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearFilter("minAmount");
                    clearFilter("maxAmount");
                  }}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.startDate || filters.endDate) && (
              <Badge variant="secondary" className="gap-2">
                Date range
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearFilter("startDate");
                    clearFilter("endDate");
                  }}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent className="space-y-4">
                {/* Client Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Client</Label>
                  <Select
                    value={filters.client}
                    onValueChange={(v) => updateFilter("client", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All clients" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueClients.map((client) => (
                        <SelectItem key={client} value={client}>
                          {client}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vendor Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Vendor</Label>
                  <Select
                    value={filters.vendor}
                    onValueChange={(v) => updateFilter("vendor", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All vendors" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueVendors.map((vendor) => (
                        <SelectItem key={vendor} value={vendor}>
                          {vendor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Document Type Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Document Type</Label>
                  <Select
                    value={filters.documentType}
                    onValueChange={(v) => updateFilter("documentType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="receipt">Receipt</SelectItem>
                      <SelectItem value="bill">Bill</SelectItem>
                      <SelectItem value="bank_statement">Bank Statement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Approval Status Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Status</Label>
                  <Select
                    value={filters.approvalStatus}
                    onValueChange={(v) => updateFilter("approvalStatus", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Period Filter */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Period</Label>
                  <Select
                    value={filters.period}
                    onValueChange={(v) => updateFilter("period", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All periods" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniquePeriods.map((period) => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Amount Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount}
                      onChange={(e) => updateFilter("minAmount", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAmount}
                      onChange={(e) => updateFilter("maxAmount", e.target.value)}
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Date Range</Label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => updateFilter("startDate", e.target.value)}
                    />
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => updateFilter("endDate", e.target.value)}
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            )}
          </Card>

          {/* Recent Searches */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentSearch(search)}
                  className="w-full text-left text-sm p-2 rounded hover:bg-muted transition-colors"
                >
                  {search}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right - Search Results */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {filteredDocuments.length} results
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredDocuments.length === mockInboxDocuments.length
                  ? "Showing all documents"
                  : `Filtered from ${mockInboxDocuments.length} total documents`}
              </p>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredDocuments.map((doc) => (
                <Link key={doc.id} href="/inbox">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate mb-1">
                                {doc.filename}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="font-medium">{doc.clientName}</span>
                                <span>•</span>
                                <span>{doc.periodName}</span>
                              </div>
                            </div>
                            {getStatusBadge(doc)}
                          </div>

                          {doc.extracted && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                              {doc.extracted.vendor && (
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate">{doc.extracted.vendor}</span>
                                </div>
                              )}
                              {doc.extracted.amount !== undefined && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    ${doc.extracted.amount.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              {doc.extracted.date && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {format(new Date(doc.extracted.date), "MMM dd, yyyy")}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {format(
                                    new Date(doc.uploadedAt),
                                    "MMM dd"
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
