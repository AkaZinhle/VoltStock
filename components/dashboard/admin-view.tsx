"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, FileText, Settings, Plus, Filter } from "lucide-react"

const users = [
  { name: "John Smith", email: "john@voltstock.com", role: "Admin", lastLogin: "Dec 15, 2024" },
  { name: "Sarah Johnson", email: "sarah@voltstock.com", role: "Manager", lastLogin: "Dec 15, 2024" },
  { name: "Mike Davis", email: "mike@voltstock.com", role: "Manager", lastLogin: "Dec 14, 2024" },
  { name: "Emily Chen", email: "emily@voltstock.com", role: "Viewer", lastLogin: "Dec 13, 2024" },
]

const auditLogs = [
  {
    timestamp: "Dec 15, 14:32",
    user: "John Smith",
    action: "Adjusted Stock: Pro Widget X",
    details: "+200 units",
    ip: "192.168.1.100",
  },
  {
    timestamp: "Dec 15, 12:15",
    user: "Sarah Johnson",
    action: "Created Order: ORD-1234",
    details: "5 items for Acme Corp",
    ip: "192.168.1.101",
  },
  {
    timestamp: "Dec 15, 10:45",
    user: "System",
    action: "Auto-Order Triggered",
    details: "Pro Widget X - 200 units",
    ip: "-",
  },
  {
    timestamp: "Dec 14, 16:20",
    user: "Mike Davis",
    action: "Updated Shipping Status",
    details: "ORD-1235 → Shipped",
    ip: "192.168.1.102",
  },
  {
    timestamp: "Dec 14, 14:00",
    user: "Emily Chen",
    action: "Generated Report",
    details: "Monthly Inventory Report",
    ip: "192.168.1.103",
  },
]

const roleColors: Record<string, string> = {
  Admin: "bg-primary/20 text-primary border-primary/30",
  Manager: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Viewer: "bg-gray-500/20 text-gray-400 border-gray-500/30",
}

export function AdminView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Admin & Audit</h2>
        <p className="text-muted-foreground">Manage users, view audit trails, and configure settings</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="h-4 w-4 mr-2" />
            User Access
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-4 w-4 mr-2" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </TabsTrigger>
        </TabsList>

        {/* User Access Tab */}
        <TabsContent value="users" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Team Members</CardTitle>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground">Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={index} className="border-border">
                      <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[user.role]}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">Activity Log</CardTitle>
                <Button variant="outline" className="border-border text-foreground bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Timestamp</TableHead>
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Action</TableHead>
                    <TableHead className="text-muted-foreground">Details</TableHead>
                    <TableHead className="text-muted-foreground">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log, index) => (
                    <TableRow key={index} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.timestamp}</TableCell>
                      <TableCell className="text-foreground">{log.user}</TableCell>
                      <TableCell className="text-primary">{log.action}</TableCell>
                      <TableCell className="text-muted-foreground">{log.details}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          {/* Notifications */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Notifications</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure email alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive email when items fall below minimum stock</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Order Updates</p>
                  <p className="text-sm text-muted-foreground">Notify on order status changes</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Auto-Order Notifications</p>
                  <p className="text-sm text-muted-foreground">Alert when auto-orders are triggered</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">General</CardTitle>
              <CardDescription className="text-muted-foreground">System-wide preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-foreground">
                    Currency
                  </Label>
                  <Select defaultValue="usd">
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-foreground">
                    Timezone
                  </Label>
                  <Select defaultValue="pst">
                    <SelectTrigger className="bg-secondary border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Integrations</CardTitle>
              <CardDescription className="text-muted-foreground">Connect external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shipping-api" className="text-foreground">
                  Shipping Carrier API Key
                </Label>
                <Input
                  id="shipping-api"
                  type="password"
                  placeholder="Enter API key..."
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="erp-api" className="text-foreground">
                  ERP Integration Key
                </Label>
                <Input
                  id="erp-api"
                  type="password"
                  placeholder="Enter API key..."
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Data Management</CardTitle>
              <CardDescription className="text-muted-foreground">Backup and data settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Automatic Backups</p>
                  <p className="text-sm text-muted-foreground">Daily backup at 2:00 AM</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-border text-foreground bg-transparent">
                  Export All Data
                </Button>
                <Button variant="outline" className="border-border text-foreground bg-transparent">
                  Run Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
