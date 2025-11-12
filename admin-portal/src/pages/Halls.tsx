import { useState } from "react";
import { mockHalls } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, CheckCircle, XCircle, FileDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { exportHallsReport } from "@/lib/pdfExport";

export default function Halls() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editHall, setEditHall] = useState<any>(null);
  const [deleteHall, setDeleteHall] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { toast } = useToast();

  const filteredHalls = statusFilter === "ALL" 
    ? mockHalls 
    : statusFilter === "ACTIVE" 
      ? mockHalls.filter(h => h.isActive)
      : mockHalls.filter(h => !h.isActive);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Manage Halls</h2>
          <p className="text-muted-foreground">Manage event halls and their availability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportHallsReport(mockHalls)} className="gap-2">
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Halls</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setImages([]); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Hall
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Hall</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hall Name</Label>
                  <Input placeholder="Main Hall" className="mt-2" />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input type="number" placeholder="200" className="mt-2" />
                </div>
                <div>
                  <Label>Member Charges (PKR)</Label>
                  <Input type="number" placeholder="50000" className="mt-2" />
                </div>
                <div>
                  <Label>Guest Charges (PKR)</Label>
                  <Input type="number" placeholder="75000" className="mt-2" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Hall description" className="mt-2" />
              </div>
              <div>
                <Label>Hall Images (Max 5)</Label>
                <div className="mt-2">
                  <ImageUpload images={images} onChange={setImages} maxImages={5} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label>Out of Service</Label>
                <Switch id="add-hall-out-of-service" />
              </div>
              <div id="add-hall-out-of-service-fields" className="hidden space-y-4">
                <div>
                  <Label>Out of Service Reason</Label>
                  <Textarea placeholder="Maintenance, renovation, etc." className="mt-2" />
                </div>
                <div>
                  <Label>Out of Service Until</Label>
                  <Input type="date" className="mt-2" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddOpen(false); setImages([]); }}>Cancel</Button>
              <Button onClick={() => { toast({ title: "Hall added" }); setIsAddOpen(false); setImages([]); }}>Add</Button>
            </DialogFooter>
            <script dangerouslySetInnerHTML={{__html: `
              document.getElementById('add-hall-out-of-service')?.addEventListener('change', function(e) {
                const fields = document.getElementById('add-hall-out-of-service-fields');
                if (e.target.checked) {
                  fields?.classList.remove('hidden');
                } else {
                  fields?.classList.add('hidden');
                }
              });
            `}} />
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Member Charges</TableHead>
                <TableHead>Guest Charges</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHalls.map((hall) => (
                <TableRow key={hall.id}>
                  <TableCell className="font-medium">{hall.name}</TableCell>
                  <TableCell>{hall.capacity} guests</TableCell>
                  <TableCell>PKR {hall.chargesMembers.toLocaleString()}</TableCell>
                  <TableCell>PKR {hall.chargesGuests.toLocaleString()}</TableCell>
                  <TableCell>
                    {hall.isActive ? (
                      <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
                    ) : (
                      <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditHall(hall)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteHall(hall)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit & Delete Dialogs similar to Rooms */}
      <Dialog open={!!editHall} onOpenChange={() => setEditHall(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hall</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hall Name</Label>
                <Input defaultValue={editHall?.name} className="mt-2" />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" defaultValue={editHall?.capacity} className="mt-2" />
              </div>
              <div>
                <Label>Member Charges (PKR)</Label>
                <Input type="number" defaultValue={editHall?.chargesMembers} className="mt-2" />
              </div>
              <div>
                <Label>Guest Charges (PKR)</Label>
                <Input type="number" defaultValue={editHall?.chargesGuests} className="mt-2" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea defaultValue={editHall?.description} className="mt-2" />
            </div>
            <div>
              <Label>Hall Images (Max 5)</Label>
              <div className="mt-2">
                <ImageUpload images={[]} onChange={() => {}} maxImages={5} />
              </div>
            </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch defaultChecked={editHall?.isActive} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Out of Service</Label>
                <Switch defaultChecked={editHall?.isOutOfService} />
              </div>
              {editHall?.isOutOfService && (
                <div className="space-y-4">
                  <div>
                    <Label>Out of Service Reason</Label>
                    <Textarea defaultValue={editHall?.outOfServiceReason} className="mt-2" placeholder="Maintenance, renovation, etc." />
                  </div>
                  <div>
                    <Label>Out of Service Until</Label>
                    <Input type="date" defaultValue={editHall?.outOfServiceUntil} className="mt-2" />
                  </div>
                </div>
              )}
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditHall(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Hall updated" }); setEditHall(null); }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteHall} onOpenChange={() => setDeleteHall(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Hall</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete <strong>{deleteHall?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteHall(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Hall deleted" }); setDeleteHall(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
