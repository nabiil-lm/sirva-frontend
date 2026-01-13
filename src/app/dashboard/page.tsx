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
  const isAdmin = userRole === 'admin' || userRole === 'ADMIN';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dossiers
        const response = await apiClient.get('/dossiers/');
        const data = response.data.results || response.data;
        setDossiers(data);

        // Fetch admin stats if admin user
        if (isAdmin) {
          try {
            const statsResponse = await apiClient.get('/dossiers/admin_stats/');
            setStats({
              totalDossiers: statsResponse.data.total_dossiers,
              pendingActions: statsResponse.data.pending_reviews,
              avgScore: 85, // Still mocked
              highRisks: 12 // Still mocked
            });
          } catch (error) {
            console.error("Failed to fetch admin stats", error);
          }
        } else if (isSO) {
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
  }, [isSO, isAdmin]);

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDE': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
      case 'EN_EDITION': return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      case 'RISQUES_EN_COURS': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      case 'PRET_VALIDATION': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 dark:text-slate-100">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Welcome back, {user?.first_name || 'User'}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Assessments */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm h-full dark:bg-slate-900 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 dark:text-white">Recent Assessments</h3>
              <Link href="/dashboard/dossiers" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center dark:text-blue-400 dark:hover:text-blue-300">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Dossier Title</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Last Updated</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32 dark:bg-slate-700"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24 dark:bg-slate-700"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20 dark:bg-slate-700"></div></td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    ))
                  ) : dossiers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <p className="text-slate-500 dark:text-slate-400">No dossiers found. Start a new assessment to see it here.</p>
                      </td>
                    </tr>
                  ) : (
                    dossiers.slice(0, 5).map((dossier) => (
                      <tr key={dossier.id} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {dossier.title}
                          <div className="text-xs text-slate-500 font-normal mt-0.5 dark:text-slate-400">
                            {isSO ? `Owner: ${dossier.am?.email}` : `ID: #${dossier.id}`}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(dossier.status)}`}>
                            {dossier.status_display}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {new Date(dossier.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" asChild className="dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800">
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

        {/* Quick Actions & Activity */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm bg-slate-900 text-white dark:bg-slate-800 dark:border-slate-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              {isAdmin ? (
                <>
                  <Link href="/dashboard/admin/templates">
                    <QuickActionButton label="Manage Templates" />
                  </Link>
                  <Link href="/dashboard/dossiers">
                    <QuickActionButton label="View All Dossiers" count={stats.totalDossiers} />
                  </Link>
                  <Link href="/dashboard/admin/users">
                    <QuickActionButton label="Manage Users" />
                  </Link>
                </>
              ) : isSO ? (
                <>
                  <QuickActionButton label="Review Pending Risks" count={3} />
                  <QuickActionButton label="Validate Dossiers" count={1} />
                  <Link href="/dashboard/admin/templates">
                    <QuickActionButton label="Manage Templates" />
                  </Link>
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

          <Card className="p-6 border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 mb-4 dark:text-white">Recent Activity</h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
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

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'emerald' | 'amber' | 'red';
}

function StatCard({ title, value, trend, icon: Icon, color }: StatCardProps) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <Card className="p-6 border-slate-200 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colorStyles[color as keyof typeof colorStyles]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        <span className="text-emerald-600 font-medium flex items-center dark:text-emerald-400">
          {trend}
        </span>
        <span className="text-slate-400 ml-2 dark:text-slate-500">vs last month</span>
      </div>
    </Card>
  );
}

function QuickActionButton({ label, count }: { label: string, count?: number }) {
  return (
    <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
      <span>{label}</span>
      {count !== undefined && (
        <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}

interface ActivityItemProps {
  title: string;
  desc: string;
  time?: string;
  color?: string;
}

function ActivityItem({ title, desc, time, color }: ActivityItemProps) {
  return (
    <div className="relative pl-8">
      <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm dark:border-slate-800 ${color || 'bg-slate-200 dark:bg-slate-700'}`}></div>
      <h4 className="text-sm font-medium text-slate-900 dark:text-white">{title}</h4>
      <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">{desc}</p>
      <span className="text-xs text-slate-400 mt-1 block dark:text-slate-500">{time}</span>
    </div>
  );
}
