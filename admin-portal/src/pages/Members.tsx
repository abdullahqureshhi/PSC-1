import { useState } from "react";
import { mockMembers } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Upload, UserCheck, UserX, Ban, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Members() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DEACTIVATED" | "BLOCKED">("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);
  const [deleteMember, setDeleteMember] = useState<any>(null);
  const { toast } = useToast();

  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch =
      member.Membership_No.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "ALL" || member.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-success text-success-foreground"><UserCheck className="h-3 w-3 mr-1" />Active</Badge>;
      case "DEACTIVATED":
        return <Badge className="bg-warning text-warning-foreground"><UserX className="h-3 w-3 mr-1" />Deactivated</Badge>;
      case "BLOCKED":
        return <Badge className="bg-destructive text-destructive-foreground"><Ban className="h-3 w-3 mr-1" />Blocked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Members</h2>
          <p className="text-muted-foreground">Manage club members and their information</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Upload Members</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Upload CSV/Excel File</Label>
                  <Input type="file" accept=".csv,.xlsx,.xls" className="mt-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV or Excel file with columns: Membership Number, Name, Email, Contact Number
                </p>
              </div>
              <DialogFooter>
                <Button className="w-full" onClick={() => toast({ title: "Upload started", description: "Mock: File processing..." })}>
                  Upload File
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Membership Number</Label>
                  <Input placeholder="PSC001" className="mt-2" />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input placeholder="John Doe" className="mt-2" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@example.com" className="mt-2" />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input placeholder="0300-1234567" className="mt-2" />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select defaultValue="ACTIVE">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                      <SelectItem value="BLOCKED">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button onClick={() => { toast({ title: "Member added", description: "New member created successfully" }); setIsAddOpen(false); }}>
                  Create Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by membership number or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "ALL" ? "default" : "outline"}
                  onClick={() => setStatusFilter("ALL")}
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "ACTIVE" ? "default" : "outline"}
                  onClick={() => setStatusFilter("ACTIVE")}
                  size="sm"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "DEACTIVATED" ? "default" : "outline"}
                  onClick={() => setStatusFilter("DEACTIVATED")}
                  size="sm"
                >
                  Deactivated
                </Button>
                <Button
                  variant={statusFilter === "BLOCKED" ? "default" : "outline"}
                  onClick={() => setStatusFilter("BLOCKED")}
                  size="sm"
                >
                  Blocked
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>Membership No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead>Last Booking</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.Sno} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{member.Membership_No}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.Name}</div>
                          <div className="text-sm text-muted-foreground">{member.Email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{member.Contact_No}</TableCell>
                      <TableCell>{getStatusBadge(member.Status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        PKR {member.Balance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">{member.totalBookings}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{member.lastBookingDate}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditMember(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteMember(member)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredMembers.length} of {mockMembers.length} members
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Membership Number</Label>
              <Input defaultValue={editMember?.Membership_No} disabled className="mt-2" />
            </div>
            <div>
              <Label>Name</Label>
              <Input defaultValue={editMember?.Name} className="mt-2" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" defaultValue={editMember?.Email} className="mt-2" />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input defaultValue={editMember?.Contact_No} className="mt-2" />
            </div>
            <div>
              <Label>Status</Label>
              <Select defaultValue={editMember?.Status}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Member updated", description: "Member details updated successfully" }); setEditMember(null); }}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Dialog */}
      <Dialog open={!!deleteMember} onOpenChange={() => setDeleteMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{deleteMember?.Name}</strong> (Membership: {deleteMember?.Membership_No})? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMember(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Member deleted", description: "Member removed successfully" }); setDeleteMember(null); }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
