"use client";

import * as React from "react";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/design-system/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/design-system/components/ui/tabs";
import { Input } from "@repo/design-system/components/ui/input";
import {
  Users,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Search,
  Shield,
  UserCheck,
  Building2,
  Calendar,
} from "lucide-react";

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  joinedDate: string;
  status: "active" | "away" | "offline";
  avatar?: string;
  specialization?: string;
}

interface ClientEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  clientName: string;
  position: string;
  joiningDate: string;
  status: "active" | "terminated";
  sinNumber: string;
  hourlyPay?: number;
}

// Mock data for accounting firm team members
const mockTeamMembers: TeamMember[] = [
  {
    id: "acc-1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@accountingfirm.com",
    phone: "+1 (555) 123-4567",
    role: "Senior Accountant",
    department: "Tax Services",
    joinedDate: "2020-03-15",
    status: "active",
    specialization: "Corporate Tax",
  },
  {
    id: "acc-2",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@accountingfirm.com",
    phone: "+1 (555) 234-5678",
    role: "Accountant",
    department: "Audit",
    joinedDate: "2021-06-01",
    status: "active",
    specialization: "Financial Audit",
  },
  {
    id: "acc-3",
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@accountingfirm.com",
    phone: "+1 (555) 345-6789",
    role: "Junior Accountant",
    department: "Bookkeeping",
    joinedDate: "2023-01-10",
    status: "active",
    specialization: "Payroll & Bookkeeping",
  },
  {
    id: "acc-4",
    firstName: "David",
    lastName: "Williams",
    email: "david.williams@accountingfirm.com",
    phone: "+1 (555) 456-7890",
    role: "Tax Specialist",
    department: "Tax Services",
    joinedDate: "2019-09-20",
    status: "away",
    specialization: "Personal Tax",
  },
  {
    id: "acc-5",
    firstName: "Jessica",
    lastName: "Brown",
    email: "jessica.brown@accountingfirm.com",
    phone: "+1 (555) 567-8901",
    role: "Financial Analyst",
    department: "Advisory",
    joinedDate: "2022-04-12",
    status: "active",
    specialization: "Financial Planning",
  },
];

// Mock data for client employees
const mockClientEmployees: ClientEmployee[] = [
  {
    id: "emp-1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@clientcompany.com",
    clientName: "Tech Solutions Inc.",
    position: "Software Engineer",
    joiningDate: "2024-01-15",
    status: "active",
    sinNumber: "***-***-123",
    hourlyPay: 45.5,
  },
  {
    id: "emp-2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@clientcompany.com",
    clientName: "Tech Solutions Inc.",
    position: "Project Manager",
    joiningDate: "2023-08-20",
    status: "active",
    sinNumber: "***-***-456",
    hourlyPay: 55.0,
  },
  {
    id: "emp-3",
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.johnson@retailco.com",
    clientName: "Retail Co.",
    position: "Sales Associate",
    joiningDate: "2023-05-10",
    status: "active",
    sinNumber: "***-***-789",
    hourlyPay: 18.5,
  },
  {
    id: "emp-4",
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria.garcia@retailco.com",
    clientName: "Retail Co.",
    position: "Store Manager",
    joiningDate: "2022-11-01",
    status: "active",
    sinNumber: "***-***-321",
    hourlyPay: 32.0,
  },
  {
    id: "emp-5",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@manufacturing.com",
    clientName: "Manufacturing Corp.",
    position: "Production Supervisor",
    joiningDate: "2021-03-15",
    status: "terminated",
    sinNumber: "***-***-654",
    hourlyPay: 38.75,
  },
  {
    id: "emp-6",
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@clientcompany.com",
    clientName: "Tech Solutions Inc.",
    position: "UX Designer",
    joiningDate: "2024-02-01",
    status: "active",
    sinNumber: "***-***-987",
    hourlyPay: 42.0,
  },
];

export default function TeamsPage() {
  const [activeTab, setActiveTab] = React.useState("my-team");
  const [teamSearchQuery, setTeamSearchQuery] = React.useState("");
  const [employeeSearchQuery, setEmployeeSearchQuery] = React.useState("");

  // Filter team members based on search
  const filteredTeamMembers = React.useMemo(() => {
    if (!teamSearchQuery.trim()) return mockTeamMembers;
    const query = teamSearchQuery.toLowerCase();
    return mockTeamMembers.filter(
      (member) =>
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query)
    );
  }, [teamSearchQuery]);

  // Filter employees based on search
  const filteredEmployees = React.useMemo(() => {
    if (!employeeSearchQuery.trim()) return mockClientEmployees;
    const query = employeeSearchQuery.toLowerCase();
    return mockClientEmployees.filter(
      (employee) =>
        employee.firstName.toLowerCase().includes(query) ||
        employee.lastName.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.clientName.toLowerCase().includes(query) ||
        employee.position.toLowerCase().includes(query)
    );
  }, [employeeSearchQuery]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getStatusColor = (status: "active" | "away" | "offline") => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: "active" | "away" | "offline") => {
    switch (status) {
      case "active":
        return "Active";
      case "away":
        return "Away";
      case "offline":
        return "Offline";
    }
  };

  // Calculate stats
  const teamStats = {
    total: mockTeamMembers.length,
    active: mockTeamMembers.filter((m) => m.status === "active").length,
    departments: [...new Set(mockTeamMembers.map((m) => m.department))].length,
  };

  const employeeStats = {
    total: mockClientEmployees.length,
    active: mockClientEmployees.filter((e) => e.status === "active").length,
    clients: [...new Set(mockClientEmployees.map((e) => e.clientName))].length,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Teams</h1>
            <p className="text-muted-foreground">
              View your team members and client employees
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{teamStats.total}</div>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {teamStats.active}
                </div>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{employeeStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Client Employees
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {employeeStats.clients}
                </div>
                <p className="text-xs text-muted-foreground">Clients</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="my-team" className="gap-2">
              <Users className="h-4 w-4" />
              My Team
            </TabsTrigger>
            <TabsTrigger value="employee-list" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Employee List
            </TabsTrigger>
          </TabsList>

          {/* My Team Tab */}
          <TabsContent value="my-team" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Team</CardTitle>
                    <CardDescription>
                      Fellow accountants in your firm
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search team members..."
                      value={teamSearchQuery}
                      onChange={(e) => setTeamSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTeamMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No team members found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTeamMembers.map((member) => (
                      <Card key={member.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                  {getInitials(
                                    member.firstName,
                                    member.lastName
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute bottom-0 right-0 h-4 w-4 ${getStatusColor(
                                  member.status
                                )} rounded-full border-2 border-background`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg">
                                {member.firstName} {member.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {member.role}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {/* <Badge variant="secondary" className="text-xs">
                                  {member.department}
                                </Badge> */}
                                {/* <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    member.status === "active"
                                      ? "border-green-500 text-green-700"
                                      : member.status === "away"
                                      ? "border-yellow-500 text-yellow-700"
                                      : "border-gray-500 text-gray-700"
                                  }`}
                                >
                                  {getStatusText(member.status)}
                                </Badge> */}
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">
                                    {member.email}
                                  </span>
                                </div>
                                {member.phone && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{member.phone}</span>
                                  </div>
                                )}
                                {member.specialization && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>{member.specialization}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>
                                    Joined{" "}
                                    {new Date(
                                      member.joinedDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employee List Tab */}
          <TabsContent value="employee-list" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee List</CardTitle>
                    <CardDescription>
                      Employees across all your clients
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={employeeSearchQuery}
                      onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No employees found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredEmployees.map((employee) => (
                      <Card key={employee.id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 flex-shrink-0">
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getInitials(
                                  employee.firstName,
                                  employee.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h3 className="font-semibold text-lg">
                                  {employee.firstName} {employee.lastName}
                                </h3>
                                {employee.status === "active" ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800">
                                    Terminated
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {employee.position}
                              </p>
                              <div className="flex items-center gap-2 mb-3">
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm font-medium text-primary">
                                  {employee.clientName}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">
                                    {employee.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="font-mono">
                                    {employee.sinNumber}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>
                                      Joined{" "}
                                      {new Date(
                                        employee.joiningDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {employee.hourlyPay && (
                                    <span className="font-semibold text-primary">
                                      ${employee.hourlyPay.toFixed(2)}/hr
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
