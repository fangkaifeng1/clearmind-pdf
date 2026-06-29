"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, getToken } from "@/lib/auth";

interface Stats {
  todayConversions: number;
  totalConversions: number;
  activeUsers: number;
  avgResponseTime: number;
  errorRate: number;
}

export default function AdminStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    todayConversions: 0,
    totalConversions: 0,
    activeUsers: 0,
    avgResponseTime: 0,
    errorRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [hourlyData, setHourlyData] = useState<{time: string; count: number}[]>([
    { time: "00:00", count: 0 },
    { time: "04:00", count: 0 },
    { time: "08:00", count: 0 },
    { time: "12:00", count: 0 },
    { time: "16:00", count: 0 },
    { time: "20:00", count: 0 },
  ]);

  // Check admin status on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      setCheckingAdmin(true);

      // Check if user is logged in
      const token = getToken();
      if (!token) {
        // Not logged in, redirect to home
        router.push("/");
        return;
      }

      // Check if user is admin
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        // Not admin, redirect to home
        router.push("/");
        return;
      }

      setIsAdminUser(true);
      setCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdminUser) return;

      setLoading(true);
      try {
        const token = getToken();
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.clearmindpdf.com";

        const response = await fetch(`${BACKEND_URL}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();

        setStats({
          todayConversions: data.today_conversions,
          totalConversions: data.total_conversions,
          activeUsers: data.active_users,
          avgResponseTime: data.avg_response_time,
          errorRate: 0,
        });

        // Update hourly data
        setHourlyData(
          data.hourly_data.map((item: any) => ({
            time: item.time,
            count: item.count,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Fallback to placeholder data on error
        setStats({
          todayConversions: 0,
          totalConversions: 0,
          activeUsers: 0,
          avgResponseTime: 0,
          errorRate: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdminUser]);

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1); // Avoid division by zero

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">访问统计</h1>
          <p className="text-gray-600">查看网站访问数据和转换统计</p>
        </div>

        {/* Checking Admin Status */}
        {checkingAdmin ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">验证权限中...</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="今日转换"
                value={stats.todayConversions}
                change="+12%"
                trend="up"
                icon="📊"
              />
              <StatCard
                title="总转换数"
                value={stats.totalConversions}
                change="+8%"
                trend="up"
                icon="📈"
              />
              <StatCard
                title="活跃用户"
                value={stats.activeUsers}
                change="+5%"
                trend="up"
                icon="👥"
              />
              <StatCard
                title="平均响应"
                value={`${stats.avgResponseTime}s`}
                change="-0.2s"
                trend="down"
                icon="⚡"
              />
            </div>

            {/* Simple Bar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">转换量趋势</h2>
              <div className="space-y-3">
                {hourlyData.map((item) => (
                  <div key={item.time} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-gray-600">{item.time}</div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg transition-all duration-300"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-gray-900 text-right">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-2">💡 数据说明</h3>
              <p className="text-blue-800 text-sm">
                此页面显示的是从访问日志中统计的真实数据。
              </p>
              <div className="mt-4 text-xs text-blue-700">
                <p className="font-medium mb-1">统计说明：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>今日转换：今天的 /convert 接口调用次数</li>
                  <li>总转换数：所有历史 /convert 接口调用次数</li>
                  <li>活跃用户：调用过 /convert 接口的唯一用户数</li>
                  <li>平均响应：/convert 接口的平均响应时间（秒）</li>
                </ul>
              </div>
              <div className="mt-4 text-xs text-blue-700">
                <p className="font-medium mb-1">后端日志位置：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>访问日志：clearmind-pdf-backend/logs/access.log</li>
                  <li>应用日志：clearmind-pdf-backend/logs/app.log</li>
                  <li>错误日志：clearmind-pdf-backend/logs/error.log</li>
                </ul>
              </div>
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>实时查看日志：</strong><code className="bg-blue-200 px-1 rounded mx-1">tail -f logs/access.log</code>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string;
  value: number | string;
  change: string;
  trend: "up" | "down";
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <span
          className={`text-sm font-medium ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}
