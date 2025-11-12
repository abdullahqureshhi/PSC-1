import { useState } from "react";
import { mockRooms, mockRoomTypes } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";

export default function Rooms() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<any>(null);
  const [deleteRoom, setDeleteRoom] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { toast } = useToast();

  const filteredRooms = statusFilter === "ALL" 
    ? mockRooms 
    : mockRooms.filter(r => 
        statusFilter === "ACTIVE" ? r.isActive && !r.isOutOfOrder :
        statusFilter === "OUT_OF_ORDER" ? r.isOutOfOrder :
        !r.isActive
      );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Manage Rooms</h2>
          <p className="text-muted-foreground">Manage room inventory and status</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Rooms</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="OUT_OF_ORDER">Out of Order</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setImages([]); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Room Number</Label>
                    <Input placeholder="101" className="mt-2" />
                  </div>
                  <div>
                    <Label>Room Type</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockRoomTypes.map(type => (
                          <SelectItem key={type.id} value={type.type}>{type.type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Room description" className="mt-2" />
                </div>
                <div>
                  <Label>Room Images (Max 5)</Label>
                  <div className="mt-2">
                    <ImageUpload images={images} onChange={setImages} maxImages={5} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Out of Order</Label>
                  <Switch id="add-out-of-order" />
                </div>
                <div id="add-out-of-order-fields" className="hidden space-y-4">
                  <div>
                    <Label>Out of Order Reason</Label>
                    <Textarea placeholder="Maintenance, renovation, etc." className="mt-2" />
                  </div>
                  <div>
                    <Label>Out of Order Until</Label>
                    <Input type="date" className="mt-2" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddOpen(false); setImages([]); }}>Cancel</Button>
                <Button onClick={() => { toast({ title: "Room added" }); setIsAddOpen(false); setImages([]); }}>Add</Button>
              </DialogFooter>
              <script dangerouslySetInnerHTML={{__html: `
                document.getElementById('add-out-of-order')?.addEventListener('change', function(e) {
                  const fields = document.getElementById('add-out-of-order-fields');
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
                <TableHead>Room Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.roomNumber}</TableCell>
                  <TableCell>{room.roomType}</TableCell>
                  <TableCell>
                    {room.isOutOfOrder ? (
                      <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Out of Order</Badge>
                    ) : room.isActive ? (
                      <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
                    ) : (
                      <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{room.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditRoom(room)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteRoom(room)}>
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
      <Dialog open={!!editRoom} onOpenChange={() => setEditRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Room Number</Label>
                <Input defaultValue={editRoom?.roomNumber} className="mt-2" />
              </div>
              <div>
                <Label>Room Type</Label>
                <Select defaultValue={editRoom?.roomType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRoomTypes.map(type => (
                      <SelectItem key={type.id} value={type.type}>{type.type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea defaultValue={editRoom?.description} className="mt-2" />
            </div>
            <div>
              <Label>Room Images (Max 5)</Label>
              <div className="mt-2">
                <ImageUpload images={[]} onChange={() => {}} maxImages={5} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch defaultChecked={editRoom?.isActive} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Out of Order</Label>
              <Switch defaultChecked={editRoom?.isOutOfOrder} />
            </div>
            {editRoom?.isOutOfOrder && (
              <div className="space-y-4">
                <div>
                  <Label>Out of Order Reason</Label>
                  <Textarea defaultValue={editRoom?.outOfOrderReason} className="mt-2" placeholder="Maintenance, renovation, etc." />
                </div>
                <div>
                  <Label>Out of Order Until</Label>
                  <Input type="date" defaultValue={editRoom?.outOfOrderUntil} className="mt-2" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoom(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Room updated" }); setEditRoom(null); }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteRoom} onOpenChange={() => setDeleteRoom(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete room <strong>{deleteRoom?.roomNumber}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRoom(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Room deleted" }); setDeleteRoom(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
