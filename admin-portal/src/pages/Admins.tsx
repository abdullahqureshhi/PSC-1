import { useState } from "react";
import { mockAdmins } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Shield, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const modules = [
  "Members", "Admins", "Rooms", "Room Bookings", "Halls", "Hall Bookings", 
  "Lawns", "Lawn Bookings", "Photoshoot", "Photoshoot Bookings", "Sports", "Accounts", "Affiliated Clubs"
];

export default function Admins() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<any>(null);
  const [deleteAdmin, setDeleteAdmin] = useState<any>(null);
  const [permissions, setPermissions] = useState<Record<number, Record<string, boolean>>>({});
  const { toast } = useToast();

  const handlePermissionChange = (adminId: number, module: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [adminId]: {
        ...(prev[adminId] || {}),
        [module]: checked
      }
    }));
  };

  const handleAdd = () => {
    toast({ title: "Admin added", description: "New admin created successfully" });
    setIsAddOpen(false);
  };

  const handleUpdate = () => {
    toast({ title: "Admin updated", description: "Admin details updated successfully" });
    setEditAdmin(null);
  };

  const handleDelete = () => {
    toast({ title: "Admin deleted", description: "Admin removed successfully" });
    setDeleteAdmin(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Admins</h2>
          <p className="text-muted-foreground">Manage admin users and their permissions</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Name</Label>
                <Input placeholder="Admin Name" className="mt-2" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="admin@psc.com" className="mt-2" />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" className="mt-2" />
              </div>
              <div>
                <Label>Role</Label>
                <Select defaultValue="ADMIN">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Admin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {mockAdmins.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{admin.name}</h3>
                    {admin.role === "SUPER_ADMIN" ? (
                      <Badge className="bg-primary text-primary-foreground">
                        <ShieldCheck className="h-3 w-3 mr-1" />Super Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Shield className="h-3 w-3 mr-1" />Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditAdmin(admin)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteAdmin(admin)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {admin.role !== "SUPER_ADMIN" && (
                <div>
                  <h4 className="text-sm font-medium mb-4">Module Permissions</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {modules.map((module) => (
                      <div key={module} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <Checkbox 
                          id={`${admin.id}-${module}`}
                          checked={permissions[admin.id]?.[module] || false}
                          onCheckedChange={(checked) => handlePermissionChange(admin.id, module, !!checked)}
                        />
                        <Label 
                          htmlFor={`${admin.id}-${module}`} 
                          className="cursor-pointer text-sm flex-1"
                        >
                          {module}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => toast({ title: "Permissions updated", description: `Permissions saved for ${admin.name}` })}>
                      Save Permissions
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editAdmin} onOpenChange={() => setEditAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input defaultValue={editAdmin?.name} className="mt-2" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" defaultValue={editAdmin?.email} className="mt-2" />
            </div>
            <div>
              <Label>Role</Label>
              <Select defaultValue={editAdmin?.role}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAdmin(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteAdmin} onOpenChange={() => setDeleteAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Admin</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete <strong>{deleteAdmin?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAdmin(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
