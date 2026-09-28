"use client";

import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  UserCheck,
  Briefcase,
  Users,
  Award,
  ChevronDown,
  FileDown,
  Search,
  BarChart,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Layers,
  BookOpen,
  Star,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { GlossyHero } from "@/components/ui/glossy-hero";
import { PageContainer } from "@/components/page-container";

// Create interfaces for our data types
interface Student {
  id: string;
  name: string;
  avatar: string;
  email: string;
  batchId: string;
  courses: string[];
  progress: number;
  status: string;
  lastActive: string;
  completedModules: number;
  totalModules: number;
  performanceScore: number;
  assignments: {
    completed: number;
    total: number;
  };
}

interface Batch {
  id: string;
  name: string;
  students: number;
  startDate: string;
  endDate: string;
  progress: number;
  courses: string[];
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  totalLearners: number;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("All Time");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedProject, setSelectedProject] = useState("all");
  
  // Sample organization data
  const organizationData = {
    name: "Gamut Studios VFX",
    totalStudents: 124,
    activeCohorts: 5,
    activeProjects: 3,
    completionRate: 76,
    placementRate: 82,
    certifications: 96
  };
  
  // Sample project data
  const projectsData = [
    { 
      id: "proj-01", 
      name: "VFX Foundations Training Program",
      clientName: "DreamWorks Animation",
      description: "A comprehensive training program for junior VFX artists",
      startDate: "Jan 10, 2025",
      endDate: "Jun 15, 2025",
      status: "active",
      totalLearners: 42
    },
    { 
      id: "proj-02", 
      name: "Pipeline TD Development",
      clientName: "Industrial Light & Magic",
      description: "Advanced pipeline TD training for mid-level developers",
      startDate: "Feb 1, 2025",
      endDate: "Aug 1, 2025",
      status: "active",
      totalLearners: 38
    },
    { 
      id: "proj-03", 
      name: "Technical Artist Workshop Series",
      clientName: "Epic Games",
      description: "Workshop series for technical artists focusing on real-time technologies",
      startDate: "Jan 5, 2025", 
      endDate: "May 15, 2025",
      status: "active",
      totalLearners: 44
    }
  ];
  
  // Sample cohorts/batches data with projectId
  const batchesData = [
    { id: "batch-01", name: "VFX Foundations 2025-Q1", students: 24, startDate: "Jan 15, 2025", endDate: "Apr 15, 2025", progress: 65, courses: ["VFX Foundations", "Python for VFX"], projectId: "proj-01" },
    { id: "batch-02", name: "Pipeline TD 2025-Q1", students: 18, startDate: "Feb 1, 2025", endDate: "May 1, 2025", progress: 58, courses: ["Pipeline Fundamentals", "Houdini Python"], projectId: "proj-02" },
    { id: "batch-03", name: "Technical Artist 2025-Q1", students: 22, startDate: "Feb 15, 2025", endDate: "May 15, 2025", progress: 42, courses: ["Maya Rigging", "Shader Development"], projectId: "proj-03" },
    { id: "batch-04", name: "VFX Developer 2024-Q4", students: 20, startDate: "Nov 1, 2024", endDate: "Feb 1, 2025", progress: 89, courses: ["VFX Foundations", "C++ for VFX"], projectId: "proj-02" },
    { id: "batch-05", name: "Lighting & FX 2025-Q1", students: 16, startDate: "Jan 5, 2025", endDate: "Apr 5, 2025", progress: 52, courses: ["Lighting Fundamentals", "Houdini FX"], projectId: "proj-01" },
  ];
  
  // Add state for cohort leaderboard selection - placed after batchesData is defined
  const [selectedLeaderboardCohort, setSelectedLeaderboardCohort] = useState(batchesData[0].id);
  
  // Sample course completion data
  const courseCompletionData = [
    { course: "VFX Foundations", completed: 85, target: 100 },
    { course: "Python for VFX", completed: 62, target: 100 },
    { course: "3D Modeling", completed: 45, target: 100 },
    { course: "Nuke Fundamentals", completed: 78, target: 100 },
  ];
  
  // Sample student data
  const studentsData = [
    { 
      id: "std-001", 
      name: "Alex Johnson", 
      avatar: "/placeholder-user.jpg", 
      email: "alex.j@example.com",
      batchId: "batch-01", 
      courses: ["VFX Foundations", "Python for VFX"], 
      progress: 78, 
      status: "active", 
      lastActive: "Today", 
      completedModules: 12,
      totalModules: 16,
      performanceScore: 92,
      assignments: {
        completed: 18,
        total: 22
      }
    },
    { 
      id: "std-002", 
      name: "Sarah Miller", 
      avatar: "/placeholder-user.jpg", 
      email: "sarah.m@example.com",
      batchId: "batch-01", 
      courses: ["VFX Foundations"], 
      progress: 63, 
      status: "active", 
      lastActive: "Yesterday", 
      completedModules: 10,
      totalModules: 16,
      performanceScore: 85,
      assignments: {
        completed: 14,
        total: 22
      }
    },
    { 
      id: "std-003", 
      name: "David Chen", 
      avatar: "/placeholder-user.jpg", 
      email: "david.c@example.com",
      batchId: "batch-02", 
      courses: ["Pipeline Fundamentals", "Houdini Python"], 
      progress: 94, 
      status: "active", 
      lastActive: "Today", 
      completedModules: 15,
      totalModules: 16,
      performanceScore: 98,
      assignments: {
        completed: 21,
        total: 22
      }
    },
    { 
      id: "std-004", 
      name: "Michael Patel", 
      avatar: "/placeholder-user.jpg", 
      email: "michael.p@example.com",
      batchId: "batch-02", 
      courses: ["Pipeline Fundamentals"], 
      progress: 45, 
      status: "at-risk", 
      lastActive: "3 days ago", 
      completedModules: 7,
      totalModules: 16,
      performanceScore: 65,
      assignments: {
        completed: 10,
        total: 22
      }
    },
    { 
      id: "std-005", 
      name: "Emily Rodriguez", 
      avatar: "/placeholder-user.jpg", 
      email: "emily.r@example.com",
      batchId: "batch-03", 
      courses: ["Maya Rigging", "Shader Development"], 
      progress: 82, 
      status: "active", 
      lastActive: "Today", 
      completedModules: 13,
      totalModules: 16,
      performanceScore: 88,
      assignments: {
        completed: 19,
        total: 22
      }
    },
    { 
      id: "std-006", 
      name: "James Wilson", 
      avatar: "/placeholder-user.jpg", 
      email: "james.w@example.com",
      batchId: "batch-03", 
      courses: ["Maya Rigging"], 
      progress: 38, 
      status: "at-risk", 
      lastActive: "5 days ago", 
      completedModules: 6,
      totalModules: 16,
      performanceScore: 58,
      assignments: {
        completed: 8,
        total: 22
      }
    },
    { 
      id: "std-007", 
      name: "Emma Thompson", 
      avatar: "/placeholder-user.jpg", 
      email: "emma.t@example.com",
      batchId: "batch-04", 
      courses: ["VFX Foundations", "C++ for VFX"], 
      progress: 100, 
      status: "completed", 
      lastActive: "Yesterday", 
      completedModules: 16,
      totalModules: 16,
      performanceScore: 96,
      assignments: {
        completed: 22,
        total: 22
      }
    },
    { 
      id: "std-008", 
      name: "Noah Garcia", 
      avatar: "/placeholder-user.jpg", 
      email: "noah.g@example.com",
      batchId: "batch-04", 
      courses: ["VFX Foundations", "C++ for VFX"], 
      progress: 91, 
      status: "active", 
      lastActive: "Today", 
      completedModules: 14,
      totalModules: 16,
      performanceScore: 90,
      assignments: {
        completed: 20,
        total: 22
      }
    },
    { 
      id: "std-009", 
      name: "Olivia Brown", 
      avatar: "/placeholder-user.jpg", 
      email: "olivia.b@example.com",
      batchId: "batch-05", 
      courses: ["Lighting Fundamentals", "Houdini FX"], 
      progress: 72, 
      status: "active", 
      lastActive: "Today", 
      completedModules: 11,
      totalModules: 16,
      performanceScore: 84,
      assignments: {
        completed: 16,
        total: 22
      }
    },
    { 
      id: "std-010", 
      name: "William Taylor", 
      avatar: "/placeholder-user.jpg", 
      email: "william.t@example.com",
      batchId: "batch-05", 
      courses: ["Lighting Fundamentals"], 
      progress: 29, 
      status: "at-risk", 
      lastActive: "1 week ago", 
      completedModules: 4,
      totalModules: 16,
      performanceScore: 45,
      assignments: {
        completed: 6,
        total: 22
      }
    }
  ];
  
  // All courses from student data
  const allCourses = [...new Set(studentsData.flatMap(student => student.courses))];
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  // Filter students based on search, batch, course, and status
  const filteredStudents = useMemo(() => {
    return studentsData.filter(student => {
      // Filter by search term
      const matchesSearch = searchTerm === "" || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by batch
      const matchesBatch = selectedBatch === "all" || student.batchId === selectedBatch;
      
      // Filter by course
      const matchesCourse = selectedCourse === "all" || student.courses.includes(selectedCourse);
      
      // Filter by status
      const matchesStatus = selectedStatus === "all" || student.status === selectedStatus;
      
      return matchesSearch && matchesBatch && matchesCourse && matchesStatus;
    });
  }, [searchTerm, selectedBatch, selectedCourse, selectedStatus, studentsData]);
  
  // Get batch name by ID
  const getBatchName = (batchId: string): string => {
    const batch = batchesData.find(b => b.id === batchId);
    return batch ? batch.name : 'Unknown Batch';
  };
  
  // Get project name by ID
  const getProjectName = (projectId: string): string => {
    const project = projectsData.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  // Get client name by project ID
  const getClientName = (projectId: string): string => {
    const project = projectsData.find(p => p.id === projectId);
    return project ? project.clientName : 'Unknown Client';
  };
  
  // Get cohorts by project ID
  const getCohortsByProject = (projectId: string): Batch[] => {
    return batchesData.filter(batch => batch.projectId === projectId);
  };
  
  // Get students by project ID
  const getStudentsByProject = (projectId: string): Student[] => {
    const cohortIds = batchesData
      .filter(batch => batch.projectId === projectId)
      .map(batch => batch.id);
    
    return studentsData.filter(student => cohortIds.includes(student.batchId));
  };
  
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "at-risk":
        return <Badge className="bg-red-500">At Risk</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Top performers - sort by performance score
  const topPerformers = [...studentsData]
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 5);
  
  // View student details
  const handleViewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
  };
  
  // Add a function to generate and download an individual student's PDF report
  const exportIndividualStudentReport = (student: Student) => {
    // In a real implementation, we would use a proper PDF library
    // For this demo, we'll create a simple HTML page and simulate a download
    
    try {
      // Create a hidden iframe to simulate PDF content
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      // Create the document content with styling
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Student Report: ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            h1 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
            h2 { color: #4b5563; margin-top: 30px; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .date { color: #6b7280; }
            .section { margin: 25px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .progress-container { background: #f3f4f6; height: 20px; border-radius: 10px; margin: 10px 0; }
            .progress-bar { background: #2563eb; height: 20px; border-radius: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
            .stat-box { padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
            .stat-title { font-weight: bold; color: #6b7280; }
            .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0; }
            .courses { list-style-type: none; padding: 0; }
            .courses li { padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
            .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
            .badge { 
              display: inline-block; 
              padding: 5px 10px; 
              border-radius: 15px; 
              font-size: 12px;
              color: white;
              font-weight: bold;
            }
            .badge-active { background-color: #10b981; }
            .badge-at-risk { background-color: #ef4444; }
            .badge-completed { background-color: #3b82f6; }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Gamut Studios VFX</div>
            <div class="date">Generated on: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
          
          <h1>Student Performance Report</h1>
          
          <div class="section">
            <h2>Student Profile</h2>
            <div class="grid">
              <div>
                <p><strong>Name:</strong> ${student.name}</p>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Cohort:</strong> ${getBatchName(student.batchId)}</p>
                <p><strong>Status:</strong> 
                  <span class="badge badge-${student.status}">${
                    student.status === 'active' ? 'Active' : 
                    student.status === 'at-risk' ? 'At Risk' : 
                    'Completed'
                  }</span>
                </p>
                <p><strong>Last Active:</strong> ${student.lastActive}</p>
              </div>
              <div>
                <div class="stat-box">
                  <div class="stat-title">Overall Performance</div>
                  <div class="stat-value">${student.performanceScore}%</div>
                  <div class="progress-container">
                    <div class="progress-bar" style="width: ${student.performanceScore}%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Course Progress</h2>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${student.progress}%"></div>
            </div>
            <p><strong>Overall Progress:</strong> ${student.progress}%</p>
            
            <h3>Enrolled Courses</h3>
            <ul class="courses">
              ${student.courses.map(course => `
                <li>
                  <strong>${course}</strong>
                  <div class="progress-container">
                    <div class="progress-bar" style="width: ${Math.round(student.progress * (0.9 + Math.random() * 0.2))}%"></div>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
          
          <div class="section">
            <h2>Learning Metrics</h2>
            <div class="grid">
              <div class="stat-box">
                <div class="stat-title">Modules Completed</div>
                <div class="stat-value">${student.completedModules}/${student.totalModules}</div>
                <div class="progress-container">
                  <div class="progress-bar" style="width: ${(student.completedModules / student.totalModules) * 100}%"></div>
                </div>
              </div>
              <div class="stat-box">
                <div class="stat-title">Assignments</div>
                <div class="stat-value">${student.assignments.completed}/${student.assignments.total}</div>
                <div class="progress-container">
                  <div class="progress-bar" style="width: ${(student.assignments.completed / student.assignments.total) * 100}%"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <h2>Notes & Recommendations</h2>
            <p>${student.status === 'at-risk' ? 
              'This student requires immediate attention. We recommend scheduling a one-on-one session to discuss progress and address challenges. Consider adjusting their learning path or providing additional resources.' : 
              'Student is progressing well. Continue to monitor progress and provide regular feedback. Consider providing advanced materials to maintain engagement and challenge the student appropriately.'
            }</p>
          </div>
          
          <div class="footer">
            <p>This report is confidential and intended only for authorized personnel.</p>
            <p>Gamut Studios VFX Learning Management System &copy; ${new Date().getFullYear()}</p>
          </div>
          
          <script>
            // Auto-print when loaded
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;
      
      // Write the content to the iframe
      const iframeDocument = iframe.contentWindow?.document;
      if (!iframeDocument) {
        throw new Error("Cannot access iframe document");
      }
      iframeDocument.open();
      iframeDocument.write(content);
      iframeDocument.close();
      
      // Wait a bit to ensure content is loaded before printing
      setTimeout(() => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            
            // Remove the iframe after printing dialog is shown
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }
        } catch (err: unknown) {
          document.body.removeChild(iframe);
        }
      }, 500);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };
  
  // Student detail component
  const StudentDetailView = ({ student }: { student: Student | null }) => {
    if (!student) return null;
    
    // Get all assignments based on modules
    const assignmentCount = student.assignments.total;
    const completedCount = student.assignments.completed;
    const pendingCount = assignmentCount - completedCount;

    // Create calculated performance metrics
    const engagementScore = Math.min(90, Math.round(Math.random() * 30) + student.performanceScore - 10);
    const consistencyScore = Math.min(95, Math.round(Math.random() * 20) + student.performanceScore - 5);
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-3">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="text-xl">{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Badge className={`
              ${student.status === 'active' ? 'bg-green-500' : 
                student.status === 'at-risk' ? 'bg-red-500' : 
                'bg-blue-500'}
            `}>
              {student.status === 'active' ? 'Active' : 
               student.status === 'at-risk' ? 'At Risk' : 
               'Completed'}
            </Badge>
          </div>
          
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold">{student.name}</h2>
            <div className="text-muted-foreground">{student.email}</div>
            
            <div className="grid grid-cols-1 gap-2 mt-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Cohort: <span className="font-medium">{getBatchName(student.batchId)}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Courses: <span className="font-medium">{student.courses.join(", ")}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Last Active: <span className="font-medium">{student.lastActive}</span></span>
              </div>
            </div>
          </div>
          
          <div className="sm:border-l sm:pl-6 space-y-2 min-w-[140px]">
            <div className="text-center p-3 border rounded-md">
              <div className="text-3xl font-bold text-blue-600">{student.performanceScore}%</div>
              <div className="text-sm text-muted-foreground">Performance</div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-medium mb-2">Course Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Overall Progress</span>
                <span className="text-sm font-medium">{student.progress}%</span>
              </div>
              <Progress value={student.progress} className="h-2" />

              {student.courses.map((course, idx) => (
                <div key={idx} className="mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{course}</span>
                    <span className="text-sm font-medium">{Math.round(student.progress * (0.9 + Math.random() * 0.2))}%</span>
                  </div>
                  <Progress 
                    value={Math.round(student.progress * (0.9 + Math.random() * 0.2))} 
                    className="h-2 mt-1" 
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 border rounded-md bg-background shadow-sm">
              <div className="flex items-center mb-3">
                <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                <h4 className="text-base font-medium">Modules Completed</h4>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{Math.round((student.completedModules / student.totalModules) * 100)}%</span>
                </div>
                <Progress value={(student.completedModules / student.totalModules) * 100} className="h-3 mb-3" />
                <div className="mt-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{student.completedModules}/{student.totalModules}</div>
                  <div className="text-sm text-muted-foreground mt-1">Modules</div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border rounded-md bg-background shadow-sm">
              <div className="flex items-center mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="text-base font-medium">Assignments</h4>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Completion</span>
                  <span className="text-sm font-medium">{Math.round((completedCount / assignmentCount) * 100)}%</span>
                </div>
                <Progress value={(completedCount / assignmentCount) * 100} className="h-3 mb-3" />
                <div className="mt-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{completedCount}/{assignmentCount}</div>
                  <div className="text-sm text-muted-foreground mt-1">Completed</div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border rounded-md bg-background shadow-sm">
              <div className="flex items-center mb-3">
                <Award className="h-5 w-5 text-purple-500 mr-2" />
                <h4 className="text-base font-medium">Tasks Pending</h4>
              </div>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Remaining</span>
                  <span className="text-sm font-medium">{Math.round((pendingCount / assignmentCount) * 100)}%</span>
                </div>
                <Progress value={(pendingCount / assignmentCount) * 100} className="h-3 mb-3" />
                <div className="mt-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{pendingCount}</div>
                  <div className="text-sm text-muted-foreground mt-1">Tasks</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <h4 className="text-base font-medium">Overall Score</h4>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div className="text-2xl font-bold">{student.performanceScore}%</div>
                  <Progress value={student.performanceScore} className="h-2 w-24" />
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <div className="flex items-center mb-2">
                  <BarChart className="h-5 w-5 text-blue-500 mr-2" />
                  <h4 className="text-base font-medium">Engagement</h4>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div className="text-2xl font-bold">{engagementScore}%</div>
                  <Progress value={engagementScore} className="h-2 w-24" />
                </div>
              </div>
              
              <div className="p-4 border rounded-md">
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  <h4 className="text-base font-medium">Consistency</h4>
                </div>
                <div className="flex items-end justify-between mt-3">
                  <div className="text-2xl font-bold">{consistencyScore}%</div>
                  <Progress value={consistencyScore} className="h-2 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-medium mb-2">Course Activity</h3>
            <div className="p-5 border rounded-md bg-background">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Weekly Activity (Last 12 Weeks)</h4>
                <div className="text-xs text-muted-foreground">Time spent on course materials</div>
              </div>
              
              {/* Fixed bar chart with explicit styling */}
              <div className="w-full h-60 flex items-end justify-between mb-8 mt-4">
                {[65, 80, 45, 90, 70, 95, 60, 75, 50, 85, 100, 80].map((height, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-blue-500 rounded-t"
                      style={{ 
                        height: `${height * 0.5}px`,
                        minHeight: '20px' 
                      }}
                    ></div>
                    <div className="mt-2 text-xs font-medium">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-center text-sm">
                <div className="flex items-center justify-center text-muted-foreground">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Weekly Activity in Minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => exportIndividualStudentReport(student)}>
              <FileText className="mr-2 h-4 w-4" />
              Download PDF Report
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </div>
    );
  };
  
  // Add export functions
  const exportDashboardData = () => {
    // Simulate file generation delay
    setTimeout(() => {
      // Create a dummy CSV content
      const csvContent = "data:text/csv;charset=utf-8,Date,Students,Completion Rate,Placement Rate\n" + 
        new Date().toISOString().split('T')[0] + "," + 
        organizationData.totalStudents + "," + 
        organizationData.completionRate + "%," + 
        organizationData.placementRate + "%";
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "organization_dashboard_report.csv");
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
    }, 500);
  };
  
  const exportStudentReport = () => {
    // Simulate file generation delay
    setTimeout(() => {
      // Create a dummy CSV content
      const csvContent = "data:text/csv;charset=utf-8,ID,Name,Email,Cohort,Progress,Status,Performance\n" + 
        studentsData.map(s => 
          `${s.id},${s.name},${s.email},${getBatchName(s.batchId)},${s.progress}%,${s.status},${s.performanceScore}%`
        ).join("\n");
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "student_report.csv");
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
    }, 500);
  };
  
  const exportCohortReport = (batchId: string) => {
    const batch = batchesData.find(b => b.id === batchId);
    
    // Get students in this cohort
    const cohortStudents = studentsData.filter(s => s.batchId === batchId);
    
    // Simulate file generation delay
    setTimeout(() => {
      // Create CSV header
      let csvContent = "data:text/csv;charset=utf-8,Cohort Report\n\n";
      
      // Add cohort details
      csvContent += `Cohort Name,${batch?.name || 'Unknown'}\n`;
      csvContent += `Start Date,${batch?.startDate || 'N/A'}\n`;
      csvContent += `End Date,${batch?.endDate || 'N/A'}\n`;
      csvContent += `Total Students,${batch?.students || 0}\n`;
      csvContent += `Overall Progress,${batch?.progress || 0}%\n\n`;
      
      // Add courses
      csvContent += "Courses\n";
      batch?.courses.forEach(course => {
        csvContent += `${course}\n`;
      });
      csvContent += "\n";
      
      // Add student details
      csvContent += "Student Details\n";
      csvContent += "ID,Name,Email,Progress,Status,Performance Score\n";
      
      cohortStudents.forEach(student => {
        csvContent += `${student.id},${student.name},${student.email},${student.progress}%,${student.status},${student.performanceScore}%\n`;
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `cohort_report_${batch?.name.replace(/\s+/g, '_') || batchId}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
    }, 500);
  };
  
  const exportCourseReport = (course: string) => {
    // Simulate file generation delay
    setTimeout(() => {
      // Create a dummy CSV content
      const studentsInCourse = studentsData.filter(s => s.courses.includes(course));
      const avgScore = studentsInCourse.length ? 
        Math.round(studentsInCourse.reduce((acc, s) => acc + s.performanceScore, 0) / studentsInCourse.length) : 0;
      
      const csvContent = "data:text/csv;charset=utf-8,Course Name,Total Students,Completion Rate,Average Score\n" + 
        `${course},${studentsInCourse.length},${studentsInCourse.filter(s => s.progress >= 90).length / studentsInCourse.length * 100}%,${avgScore}%`;
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `course_report_${course.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
    }, 500);
  };
  
  // Export project report function
  const exportProjectReport = (projectId: string) => {
    const project = projectsData.find(p => p.id === projectId);
    const projectCohorts = getCohortsByProject(projectId);
    const projectStudents = getStudentsByProject(projectId);
    
    // Calculate project metrics
    const totalStudents = projectStudents.length;
    const avgProgress = totalStudents ? 
      Math.round(projectStudents.reduce((acc, s) => acc + s.progress, 0) / totalStudents) : 0;
    const completedStudents = projectStudents.filter(s => s.progress === 100).length;
    const completionRate = totalStudents ? Math.round((completedStudents / totalStudents) * 100) : 0;
    const avgPerformance = totalStudents ? 
      Math.round(projectStudents.reduce((acc, s) => acc + s.performanceScore, 0) / totalStudents) : 0;
    
    // Simulate file generation delay
    setTimeout(() => {
      // Create CSV header
      let csvContent = "data:text/csv;charset=utf-8,Project Report\n\n";
      
      // Add project details
      csvContent += `Project Name,${project?.name || 'Unknown'}\n`;
      csvContent += `Client,${project?.clientName || 'Unknown'}\n`;
      csvContent += `Description,${project?.description || 'N/A'}\n`;
      csvContent += `Start Date,${project?.startDate || 'N/A'}\n`;
      csvContent += `End Date,${project?.endDate || 'N/A'}\n`;
      csvContent += `Status,${project?.status || 'Unknown'}\n`;
      csvContent += `Total Learners,${totalStudents}\n`;
      csvContent += `Average Progress,${avgProgress}%\n`;
      csvContent += `Completion Rate,${completionRate}%\n`;
      csvContent += `Average Performance,${avgPerformance}%\n\n`;
      
      // Add cohorts section
      csvContent += "Cohorts\n";
      csvContent += "ID,Name,Students,Start Date,End Date,Progress\n";
      projectCohorts.forEach(cohort => {
        csvContent += `${cohort.id},${cohort.name},${cohort.students},${cohort.startDate},${cohort.endDate},${cohort.progress}%\n`;
      });
      csvContent += "\n";
      
      // Add student details section
      csvContent += "Student Details\n";
      csvContent += "ID,Name,Email,Cohort,Progress,Status,Performance Score\n";
      projectStudents.forEach(student => {
        csvContent += `${student.id},${student.name},${student.email},${getBatchName(student.batchId)},${student.progress}%,${student.status},${student.performanceScore}%\n`;
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `project_report_${project?.name.replace(/\s+/g, '_') || projectId}.csv`);
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
    }, 500);
  };
  
  return (
    <PageContainer>
      {/* Glossy Hero Section */}
      <GlossyHero 
        title="Organization Reports"
        subtitle={`${organizationData.name} - Analytics and insights`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Select defaultValue="All Time" onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] bg-background/80 backdrop-blur-sm">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="This Week">This Week</SelectItem>
              <SelectItem value="This Month">This Month</SelectItem>
              <SelectItem value="This Quarter">This Quarter</SelectItem>
              <SelectItem value="This Year">This Year</SelectItem>
              <SelectItem value="All Time">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="default" 
            className="flex items-center gap-2 bg-primary/80 backdrop-blur-sm hover:bg-primary" 
            onClick={exportDashboardData}
          >
            <FileDown className="h-4 w-4" />
            <span>Export Dashboard</span>
          </Button>
        </div>
      </GlossyHero>
      
      {/* KPI cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6"
        variants={itemVariants}
      >
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{organizationData.totalStudents}</div>
              <div className="rounded-full p-2 bg-green-100 dark:bg-green-900/30">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-xs">
              <Badge variant="outline" className="text-green-600 border-green-600 font-medium">
                +12% <TrendingUp className="ml-1 h-3 w-3" />
              </Badge>
              <span className="ml-2 text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{organizationData.activeCohorts}</div>
              <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900/30">
                <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{organizationData.activeProjects}</div>
              <div className="rounded-full p-2 bg-violet-100 dark:bg-violet-900/30">
                <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{organizationData.completionRate}%</div>
              <div className="rounded-full p-2 bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{organizationData.placementRate}%</div>
              <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900/30">
                <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{organizationData.certifications}</div>
              <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900/30">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Main content tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="batches">Cohorts</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Course Completion</CardTitle>
                  <CardDescription>Progress across top courses</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FileDown className="mr-2 h-4 w-4" />
                      <span>Download Chart</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Full Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courseCompletionData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{item.course}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.completed}/{item.target} students
                        </div>
                      </div>
                      <Progress value={(item.completed / item.target) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Student Distribution</CardTitle>
                <CardDescription>By cohort and status</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <div className="h-[200px] w-[200px] relative flex justify-center">
                  <div className="absolute inset-0">
                    <div className="relative w-full h-full">
                      {/* Green section (72%) */}
                      <div 
                        className="absolute inset-0 bg-green-500"
                        style={{ clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0, 50% 0)' }}
                      ></div>
                      {/* Red section (18%) */}
                      <div 
                        className="absolute inset-0 bg-red-500"
                        style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0 100%)' }}
                      ></div>
                      {/* Blue section (10%) */}
                      <div 
                        className="absolute inset-0 bg-blue-500"
                        style={{ clipPath: 'polygon(50% 50%, 100% 40%, 100% 100%)' }}
                      ></div>
                      {/* White center circle */}
                      <div className="absolute inset-[25%] rounded-full bg-card flex items-center justify-center">
                        <div className="text-sm font-medium">{studentsData.length} Students</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full space-y-2 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-sm">Active</span>
                    </div>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm">At Risk</span>
                    </div>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Progress</CardTitle>
                <CardDescription>Progress across active cohorts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batchesData.map((batch, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{batch.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {batch.progress}% • {batch.students} students
                        </div>
                      </div>
                      <Progress value={batch.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Students with highest performance scores</CardDescription>
                </div>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{getBatchName(student.batchId)}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-lg">{student.performanceScore}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Student Analytics</CardTitle>
              <CardDescription>
                Comprehensive view of all students across all cohorts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-1 flex-col sm:flex-row gap-4">
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cohorts</SelectItem>
                      {batchesData.map(batch => (
                        <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {allCourses.map(course => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="at-risk">At Risk</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" className="sm:max-w-[150px]" onClick={exportStudentReport}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
              </div>
              
              {/* Results Stats */}
              <div className="text-sm text-muted-foreground mb-4">
                Showing {filteredStudents.length} of {studentsData.length} students
              </div>
              
              {/* Students Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox id="select-all" />
                      </TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Cohort</TableHead>
                      <TableHead>Course(s)</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox id={`select-${student.id}`} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground">{student.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getBatchName(student.batchId)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {student.courses.map((course, i) => (
                              <Badge key={i} variant="outline" className="whitespace-nowrap">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={student.progress} className="h-2 w-[60px]" />
                            <span className="text-sm">{student.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewStudentDetails(student)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Analytics</CardTitle>
              <CardDescription>Performance metrics for all cohorts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batchesData.map((batch) => (
                  <Card key={batch.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{batch.name}</CardTitle>
                          <CardDescription>{batch.startDate} - {batch.endDate}</CardDescription>
                        </div>
                        <Badge variant="outline">{batch.students} Students</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className="font-medium">{batch.progress}%</span>
                        </div>
                        <Progress value={batch.progress} className="h-2" />
                        
                        <div className="pt-2 space-y-1">
                          <div className="text-sm font-medium">Courses:</div>
                          <div className="flex flex-wrap gap-1">
                            {batch.courses.map((course, i) => (
                              <Badge key={i} variant="secondary">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button variant="outline" size="sm" onClick={() => exportCohortReport(batch.id)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          Export Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>Detailed course performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-muted/40">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Courses</p>
                        <p className="text-2xl font-bold">{allCourses.length}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-primary/60" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/40">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Active Enrollments</p>
                        <p className="text-2xl font-bold">217</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500/60" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/40">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Avg. Completion</p>
                        <p className="text-2xl font-bold">76%</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500/60" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/40">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rating Average</p>
                        <p className="text-2xl font-bold">4.7</p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Course Enrollment & Completion</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Completion Rate</TableHead>
                        <TableHead>Average Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allCourses.map((course, index) => {
                        // Calculate metrics for this course
                        const studentsInCourse = studentsData.filter(s => s.courses.includes(course));
                        const studentsCount = studentsInCourse.length;
                        const completedCount = studentsInCourse.filter(s => s.progress >= 90).length;
                        const completionRate = studentsCount ? Math.round((completedCount / studentsCount) * 100) : 0;
                        const avgScore = studentsCount ? 
                          Math.round(studentsInCourse.reduce((acc, s) => acc + s.performanceScore, 0) / studentsCount) : 0;
                        
                        return (
                          <TableRow key={course}>
                            <TableCell><div className="font-medium">{course}</div></TableCell>
                            <TableCell>{studentsCount}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={completionRate} className="h-2 w-24" />
                                <span>{completionRate}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{avgScore}%</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => exportCourseReport(course)}>
                                <FileDown className="mr-2 h-4 w-4" />
                                Export
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Course Popularity</CardTitle>
                    <CardDescription>Student enrollment by course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px] w-full flex flex-col">
                      <div className="h-[220px] w-full flex items-end gap-2 pt-10 mb-2">
                        {allCourses.map((course, index) => {
                          const studentsCount = studentsData.filter(s => s.courses.includes(course)).length;
                          const percentage = Math.round((studentsCount / studentsData.length) * 100);
                          
                          return (
                            <div key={course} className="group relative flex-1 min-w-8 flex flex-col items-center">
                              <div className="absolute -top-8 text-sm font-semibold text-center">
                                {percentage}%
                              </div>
                              <div 
                                className="w-full bg-blue-500 rounded-t-sm"
                                style={{ height: `${Math.max(15, percentage * 2)}px` }}
                              ></div>
                              <div className="mt-2 text-xs text-muted-foreground truncate max-w-full text-center" title={course}>
                                {course.split(' ').slice(0, 2).join(' ')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground pt-4 border-t">
                        <div>Total Students: {studentsData.length}</div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                          <span>Enrollment %</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Performance Analysis</CardTitle>
                    <CardDescription>Which courses have the best outcomes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allCourses.map((course, index) => {
                        const studentsInCourse = studentsData.filter(s => s.courses.includes(course));
                        const avgScore = studentsInCourse.length ? 
                          Math.round(studentsInCourse.reduce((acc, s) => acc + s.performanceScore, 0) / studentsInCourse.length) : 0;
                        
                        return (
                          <div key={course} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-medium">{course}</div>
                              <div className="text-sm">{avgScore}%</div>
                            </div>
                            <Progress value={avgScore} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects">
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Project Overview</h2>
              <Button onClick={() => selectedProject !== "all" ? exportProjectReport(selectedProject) : null} disabled={selectedProject === "all"} className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                <span>Export Project Report</span>
              </Button>
            </div>
            
            <div className="grid gap-4">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projectsData.map((project) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedProject === "all" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden md:table-cell">Start Date</TableHead>
                      <TableHead className="hidden md:table-cell">End Date</TableHead>
                      <TableHead>Cohorts</TableHead>
                      <TableHead>Learners</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsData.map((project) => {
                      const projectCohorts = getCohortsByProject(project.id);
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{project.clientName}</TableCell>
                          <TableCell className="hidden md:table-cell">{project.startDate}</TableCell>
                          <TableCell className="hidden md:table-cell">{project.endDate}</TableCell>
                          <TableCell>{projectCohorts.length}</TableCell>
                          <TableCell>{project.totalLearners}</TableCell>
                          <TableCell>
                            <Badge variant={project.status === "active" ? "default" : "secondary"}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => exportProjectReport(project.id)}>
                              <FileDown className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-6">
                  {/* Single project view */}
                  {(() => {
                    const project = projectsData.find(p => p.id === selectedProject);
                    if (!project) return <div>Project not found</div>;
                    
                    const projectCohorts = getCohortsByProject(project.id);
                    const projectStudents = getStudentsByProject(project.id);
                    
                    // Calculate project metrics
                    const totalStudents = projectStudents.length;
                    const avgProgress = totalStudents ? 
                      Math.round(projectStudents.reduce((acc, s) => acc + s.progress, 0) / totalStudents) : 0;
                    const completedStudents = projectStudents.filter(s => s.progress === 100).length;
                    const completionRate = totalStudents ? Math.round((completedStudents / totalStudents) * 100) : 0;
                    const avgPerformance = totalStudents ? 
                      Math.round(projectStudents.reduce((acc, s) => acc + s.performanceScore, 0) / totalStudents) : 0;
                    
                    return (
                      <>
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl">{project.name}</CardTitle>
                                <CardDescription className="mt-1">Client: {project.clientName}</CardDescription>
                              </div>
                              <Badge variant={project.status === "active" ? "default" : "secondary"}>
                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Description</p>
                                <p>{project.description}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <p className="text-sm text-muted-foreground">Start Date</p>
                                  <p>{project.startDate}</p>
                                </div>
                                <div className="flex justify-between">
                                  <p className="text-sm text-muted-foreground">End Date</p>
                                  <p>{project.endDate}</p>
                                </div>
                                <div className="flex justify-between">
                                  <p className="text-sm text-muted-foreground">Total Cohorts</p>
                                  <p>{projectCohorts.length}</p>
                                </div>
                                <div className="flex justify-between">
                                  <p className="text-sm text-muted-foreground">Total Learners</p>
                                  <p>{totalStudents}</p>
                                </div>
                              </div>
                            </div>
                            
                            <Separator />
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">{avgProgress}%</div>
                                  <Progress value={avgProgress} className="mt-2" />
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">{completionRate}%</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {completedStudents} of {totalStudents} students
                                  </div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">{avgPerformance}%</div>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="text-2xl font-bold">
                                    {projectStudents.filter(s => s.status === "at-risk").length}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {Math.round((projectStudents.filter(s => s.status === "at-risk").length / totalStudents) * 100)}% of total
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Cohorts in this project */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Project Cohorts</CardTitle>
                              <CardDescription>All cohorts in this project</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[300px]">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Cohort Name</TableHead>
                                      <TableHead>Students</TableHead>
                                      <TableHead>Progress</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {projectCohorts.map((cohort) => (
                                      <TableRow key={cohort.id}>
                                        <TableCell className="font-medium">{cohort.name}</TableCell>
                                        <TableCell>{cohort.students}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Progress value={cohort.progress} className="w-[60px]" />
                                            <span>{cohort.progress}%</span>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </ScrollArea>
                            </CardContent>
                            <CardFooter>
                              <Button variant="outline" className="w-full" onClick={() => exportProjectReport(project.id)}>
                                Export Project Report
                              </Button>
                            </CardFooter>
                          </Card>
                          
                          {/* Students in this project */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Project Students</CardTitle>
                              <CardDescription>All students across cohorts</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[300px]">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Student Name</TableHead>
                                      <TableHead>Cohort</TableHead>
                                      <TableHead>Progress</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {projectStudents.map((student) => (
                                      <TableRow key={student.id} className="cursor-pointer" onClick={() => handleViewStudentDetails(student)}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{getBatchName(student.batchId)}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Progress value={student.progress} className="w-[60px]" />
                                            <span>{student.progress}%</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
      
      {/* Student Detail Modal */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogHeader>
            <StudentDetailView student={selectedStudent} />
          </DialogContent>
        </Dialog>
      )}
    </PageContainer>
  );
}