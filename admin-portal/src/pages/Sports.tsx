import { useState } from "react";
import { mockSports } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Sports() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSport, setEditSport] = useState<any>(null);
  const [deleteSport, setDeleteSport] = useState<any>(null);
  const { toast } = useToast();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Sports Activities</h2>
          <p className="text-muted-foreground">Manage sports facilities and pricing</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Sport
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Sport Activity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Activity Name</Label>
                <Input placeholder="e.g., Swimming Pool" className="mt-2" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea placeholder="Activity description" className="mt-2" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch defaultChecked />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast({ title: "Sport added" }); setIsAddOpen(false); }}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Charge Type</TableHead>
                <TableHead>Charges</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSports.map((sport) => (
                <TableRow key={sport.id}>
                  <TableCell className="font-medium">{sport.activity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{sport.description}</TableCell>
                  <TableCell>{sport.charges[0].type.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Member: PKR {sport.charges[0].memberCharges}</div>
                      <div>Guest: PKR {sport.charges[0].guestCharges}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sport.isActive ? (
                      <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
                    ) : (
                      <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditSport(sport)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteSport(sport)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit & Delete Dialogs */}
      <Dialog open={!!editSport} onOpenChange={() => setEditSport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Sport Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Activity Name</Label>
              <Input defaultValue={editSport?.activity} className="mt-2" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea defaultValue={editSport?.description} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch defaultChecked={editSport?.isActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSport(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Sport updated" }); setEditSport(null); }}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteSport} onOpenChange={() => setDeleteSport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sport</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to delete <strong>{deleteSport?.activity}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSport(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { toast({ title: "Sport deleted" }); setDeleteSport(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
