import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { api } from '../api';
import { Users, Activity, TrendingUp, Calendar, ShoppingCart, Scan } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600 dark:text-slate-400">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/20 dark:to-indigo-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Users',
      value: stats.active_users,
      icon: Activity,
      color: 'bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-900/20 dark:to-teal-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Admin Users',
      value: stats.users_by_role?.admin || 0,
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/20 dark:to-violet-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Regular Users',
      value: stats.users_by_role?.user || 0,
      icon: Users,
      color: 'bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/20 dark:to-orange-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`${stat.color} border-0 shadow-lg`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-white/50 dark:bg-black/20`}>
                    <IconComponent className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Timeline */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.activity_timeline && stats.activity_timeline.length > 0 ? (
            <div className="space-y-2">
              {stats.activity_timeline.slice(0, 10).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {activity.count} {activity.count === 1 ? 'activity' : 'activities'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No recent activity
            </p>
          )}
        </CardContent>
      </Card>

      {/* User Activity Details */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Activity Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Role
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-center gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      Items
                    </div>
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center justify-center gap-1">
                      <Scan className="h-4 w-4" />
                      Scans
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.user_activities && stats.user_activities.length > 0 ? (
                  stats.user_activities.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                        {user.username}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-700 dark:text-slate-300">
                        {user.item_count}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-700 dark:text-slate-300">
                        {user.scan_count}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">
                        {user.last_activity
                          ? new Date(user.last_activity).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Never'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No user activity data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;

