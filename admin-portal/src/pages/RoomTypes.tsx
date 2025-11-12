import { useState } from "react";
import { mockRoomTypes } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, FileDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { exportRoomTypesReport } from "@/lib/pdfExport";

export default function RoomTypes() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editType, setEditType] = useState<any>(null);
  const [deleteType, setDeleteType] = useState<any>(null);
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Room Types</h2>
          <p className="text-muted-foreground">Manage room categories and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportRoomTypesReport(mockRoomTypes)} className="gap-2">
            <FileDown className="h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Room Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Room Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Type Name</Label>
                <Input placeholder="e.g., Studio" className="mt-2" />
              </div>
              <div>
                <Label>Member Price Per Day (PKR)</Label>
                <Input type="number" placeholder="3000" className="mt-2" />
              </div>
              <div>
                <Label>Guest Price Per Day (PKR)</Label>
                <Input type="number" placeholder="4500" className="mt-2" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast({ title: "Room type added" }); setIsAddOpen(false); }}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Member Price (per day)</TableHead>
                <TableHead>Guest Price (per day)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRoomTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.type}</TableCell>
                  <TableCell>PKR {type.pricePerDayMember.toLocaleString()}</TableCell>
                  <TableCell>PKR {type.pricePerDayGuest.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditType(type)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteType(type)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editType} onOpenChange={() => setEditType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Type Name</Label>
              <Input defaultValue={editType?.type} className="mt-2" />
            </div>
            <div>
              <Label>Member Price Per Day (PKR)</Label>
              <Input type="number" defaultValue={editType?.pricePerDayMember} className="mt-2" />
            </div>
            <div>
              <Label>Guest Price Per Day (PKR)</Label>
              <Input type="number" defaultValue={editType?.pricePerDayGuest} className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditType(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Room type updated" }); setEditType(null); }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteType} onOpenChange={() => setDeleteType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room Type</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete <strong>{deleteType?.type}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteType(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Room type deleted" }); setDeleteType(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
