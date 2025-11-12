import { useState } from "react";
import { mockLawns } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, FileDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { exportLawnsReport } from "@/lib/pdfExport";

export default function Lawns() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editLawn, setEditLawn] = useState<any>(null);
  const [deleteLawn, setDeleteLawn] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const { toast } = useToast();

  const filteredLawns = categoryFilter === "ALL" 
    ? mockLawns 
    : mockLawns.filter(l => l.lawnCategory === categoryFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Manage Lawns</h2>
          <p className="text-muted-foreground">Manage outdoor lawn spaces</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportLawnsReport(mockLawns)} className="gap-2">
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="Standard Lawn">Standard</SelectItem>
              <SelectItem value="Premium Lawn">Premium</SelectItem>
              <SelectItem value="VIP Lawn">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setImages([]); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lawn
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Lawn</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lawn Category</Label>
                  <Input placeholder="Premium Lawn" className="mt-2" />
                </div>
                <div>
                  <Label>Min Guests</Label>
                  <Input type="number" placeholder="50" className="mt-2" />
                </div>
                <div>
                  <Label>Max Guests</Label>
                  <Input type="number" placeholder="200" className="mt-2" />
                </div>
                <div>
                  <Label>Member Charges (PKR)</Label>
                  <Input type="number" placeholder="40000" className="mt-2" />
                </div>
                <div>
                  <Label>Guest Charges (PKR)</Label>
                  <Input type="number" placeholder="60000" className="mt-2" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Lawn description" className="mt-2" />
              </div>
              <div>
                <Label>Lawn Images (Max 5)</Label>
                <div className="mt-2">
              <ImageUpload images={images} onChange={setImages} maxImages={5} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Out of Service</Label>
            <Switch id="add-lawn-out-of-service" />
          </div>
          <div id="add-lawn-out-of-service-fields" className="hidden space-y-4">
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
          <Button onClick={() => { toast({ title: "Lawn added" }); setIsAddOpen(false); setImages([]); }}>Add</Button>
        </DialogFooter>
        <script dangerouslySetInnerHTML={{__html: `
          document.getElementById('add-lawn-out-of-service')?.addEventListener('change', function(e) {
            const fields = document.getElementById('add-lawn-out-of-service-fields');
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
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Member Charges</TableHead>
                <TableHead>Guest Charges</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLawns.map((lawn) => (
                <TableRow key={lawn.id}>
                  <TableCell className="font-medium">{lawn.lawnCategory}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{lawn.description}</TableCell>
                  <TableCell>{lawn.minGuests} - {lawn.maxGuests}</TableCell>
                  <TableCell>PKR {lawn.memberCharges.toLocaleString()}</TableCell>
                  <TableCell>PKR {lawn.guestCharges.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditLawn(lawn)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteLawn(lawn)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit & Delete Dialogs similar to previous pages */}
      <Dialog open={!!editLawn} onOpenChange={() => setEditLawn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lawn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lawn Category</Label>
                <Input defaultValue={editLawn?.lawnCategory} className="mt-2" />
              </div>
              <div>
                <Label>Min Guests</Label>
                <Input type="number" defaultValue={editLawn?.minGuests} className="mt-2" />
              </div>
              <div>
                <Label>Max Guests</Label>
                <Input type="number" defaultValue={editLawn?.maxGuests} className="mt-2" />
              </div>
              <div>
                <Label>Member Charges (PKR)</Label>
                <Input type="number" defaultValue={editLawn?.memberCharges} className="mt-2" />
              </div>
              <div>
                <Label>Guest Charges (PKR)</Label>
                <Input type="number" defaultValue={editLawn?.guestCharges} className="mt-2" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea defaultValue={editLawn?.description} className="mt-2" />
            </div>
            <div>
              <Label>Lawn Images (Max 5)</Label>
              <div className="mt-2">
                <ImageUpload images={[]} onChange={() => {}} maxImages={5} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Out of Service</Label>
              <Switch defaultChecked={editLawn?.isOutOfService} />
            </div>
            {editLawn?.isOutOfService && (
              <div className="space-y-4">
                <div>
                  <Label>Out of Service Reason</Label>
                  <Textarea defaultValue={editLawn?.outOfServiceReason} className="mt-2" placeholder="Maintenance, renovation, etc." />
                </div>
                <div>
                  <Label>Out of Service Until</Label>
                  <Input type="date" defaultValue={editLawn?.outOfServiceUntil} className="mt-2" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLawn(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Lawn updated" }); setEditLawn(null); }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteLawn} onOpenChange={() => setDeleteLawn(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lawn</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete this lawn?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteLawn(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Lawn deleted" }); setDeleteLawn(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
