"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth.context";
import apiClient from "@/lib/api-client";
import { 
  FolderPlus, 
  FileCheck, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Types for our data
interface Dossier {
  id: number;
  title: string;
  status: string;
  status_display: string;
  updated_at: string;
  am: { email: string };
  secure_score?: number;
}

interface DashboardStats {
  totalDossiers: number;
  pendingActions: number;
  avgScore: number;
  highRisks: number;
}

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDossiers: 0,
    pendingActions: 0,
    avgScore: 0,
    highRisks: 0
  });

  const isSO = userRole === 'security_officer' || userRole === 'SO';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dossiers
        const response = await apiClient.get('/dossiers/');
        const data = response.data.results || response.data; // Handle pagination if present
        setDossiers(data);

        // Calculate simple stats based on role
        if (isSO) {
          // SO Stats Logic
          const pendingReview = data.filter((d: Dossier) => 
            ['QUESTIONNAIRE_SOUMIS', 'RISQUES_EN_COURS', 'PRET_VALIDATION'].includes(d.status)
          ).length;
          
          setStats({
            totalDossiers: data.length,
            pendingActions: pendingReview,
            avgScore: 78, // Mocked for now, would come from aggregation endpoint
            highRisks: 12 // Mocked
          });
        } else {
          // AM Stats Logic
          const active = data.filter((d: Dossier) => d.status !== 'VALIDE').length;
          const pending = data.filter((d: Dossier) => 
            ['EN_EDITION', 'ARCHI_UPLOAD_EN_COURS', 'RISQUES_EN_COURS'].includes(d.status)
          ).length;

          setStats({
            totalDossiers: active,
            pendingActions: pending,
            avgScore: 85, // Mocked
            highRisks: 3 // Mocked
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast.error("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isSO]);

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'EN_EDITION': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'RISQUES_EN_COURS': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PRET_VALIDATION': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, {user?.name || user?.email?.split('@')[0]}. Here's what's happening today.
          </p>
        </div>
        {!isSO && (
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={isSO ? "Assigned Dossiers" : "Active Assessments"}
          value={stats.totalDossiers}
          trend="+12%"
          icon={FolderPlus}
          color="blue"
        />
        <StatCard 
          title={isSO ? "Pending Reviews" : "Actions Required"}
          value={stats.pendingActions}
          trend="Urgent"
          icon={Clock}
          color="amber"
        />
        <StatCard 
          title="Avg. Security Score"
          value={`${stats.avgScore}%`}
          trend="+5%"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard 
          title={isSO ? "Critical Risks" : "Open Risks"}
          value={stats.highRisks}
          trend="-2"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Dossiers (Takes up 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Recent Assessments</h2>
              <Link href="/dashboard/dossiers" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3">Dossier Title</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Last Updated</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    ))
                  ) : dossiers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No dossiers found. Start a new assessment to see it here.
                      </td>
                    </tr>
                  ) : (
                    dossiers.slice(0, 5).map((dossier) => (
                      <tr key={dossier.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {dossier.title}
                          <div className="text-xs text-slate-500 font-normal mt-0.5">
                            {isSO ? `Owner: ${dossier.am?.email}` : `ID: #${dossier.id}`}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(dossier.status)}`}>
                            {dossier.status_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(dossier.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/dossiers/${dossier.id}`}>
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Activity & Quick Actions (Takes up 1/3) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="p-6 border-slate-200 shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              {isSO ? (
                <>
                  <QuickActionButton label="Review Pending Risks" count={3} />
                  <QuickActionButton label="Validate Dossiers" count={1} />
                  <QuickActionButton label="Manage Templates" />
                </>
              ) : (
                <>
                  <QuickActionButton label="Continue Questionnaire" count={1} />
                  <QuickActionButton label="Upload Documents" count={2} />
                  <QuickActionButton label="Accept Risks" count={4} />
                </>
              )}
            </div>
          </Card>

          {/* Recent Activity (Mocked for visual) */}
          <Card className="p-6 border-slate-200 shadow-sm">
            <h3 className="font-semibold mb-4 text-slate-900">Recent Activity</h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <ActivityItem 
                title="Risk Register Created"
                desc="Security Officer created risk register for Project Alpha"
                time="2 hours ago"
                color="bg-blue-500"
              />
              <ActivityItem 
                title="Document Uploaded"
                desc="Architecture diagram uploaded for Payment Gateway"
              />
              <ActivityItem 
                title="Assessment Submitted"
                desc="Initial questionnaire submitted for review"
                time="1 day ago"
                color="bg-amber-500"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components for cleaner code ---

function StatCard({ title, value, trend, icon: Icon, color }: any) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colorStyles[color as keyof typeof colorStyles]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        <span className="text-emerald-600 font-medium flex items-center">
          {trend}
        </span>
        <span className="text-slate-400 ml-2">vs last month</span>
      </div>
    </Card>
  );
}

function QuickActionButton({ label, count }: { label: string, count?: number }) {
  return (
    <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
      <span>{label}</span>
      {count && (
        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

function ActivityItem({ title, desc, time, color }: any) {
  return (
    <div className="relative pl-8">
      <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${color}`}></div>
      <h4 className="text-sm font-medium text-slate-900">{title}</h4>
      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      <span className="text-xs text-slate-400 mt-1 block">{time}</span>
    </div>
  );
}
