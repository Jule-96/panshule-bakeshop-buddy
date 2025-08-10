import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  id: string;
  timestamp: string; // ISO string
  cliente: string;
  producto: string;
  cantidad: number;
  precio: number; // unit price per item
  comentarios?: string;
  direccion?: string;
  estado: "Pedido" | "En proceso" | "Listo" | "Entregado";
  cobrado: boolean;
}

const currency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

const OrdersTab = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const raw = localStorage.getItem("orders");
    if (raw) {
      try {
        const parsed: Order[] = JSON.parse(raw);
        setOrders(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesText = [o.cliente, o.producto, o.comentarios, o.direccion]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : o.estado === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const updateOrder = (id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    toast({ title: "Orden actualizada" });
  };

  const totalFor = (o: Order) => o.cantidad * o.precio;

  return (
    <section>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-foreground">Orders (Pedidos)</h1>
        <p className="text-muted-foreground">Administra pedidos con estado y cobro, similar a tu tabla.</p>
      </header>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Cliente, producto, comentario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Label>Estado</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pedido">Pedido</SelectItem>
                <SelectItem value="En proceso">En proceso</SelectItem>
                <SelectItem value="Listo">Listo</SelectItem>
                <SelectItem value="Entregado">Entregado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              {filtered.length === 0 ? "No hay pedidos. Agrega ventas o crea pedidos para verlos aquí." : ""}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>fecha de pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio de venta</TableHead>
                <TableHead>Comentarios</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cobrado</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{new Date(o.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{o.cliente}</TableCell>
                  <TableCell>{o.producto}</TableCell>
                  <TableCell className="text-right">{o.cantidad}</TableCell>
                  <TableCell className="text-right">{currency.format(o.precio)}</TableCell>
                  <TableCell className="max-w-[260px] truncate" title={o.comentarios}>{o.comentarios}</TableCell>
                  <TableCell className="max-w-[220px] truncate" title={o.direccion}>{o.direccion}</TableCell>
                  <TableCell>
                    <Select value={o.estado} onValueChange={(v) => updateOrder(o.id, { estado: v as Order["estado"] })}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pedido">Pedido</SelectItem>
                        <SelectItem value="En proceso">En proceso</SelectItem>
                        <SelectItem value="Listo">Listo</SelectItem>
                        <SelectItem value="Entregado">Entregado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.cobrado ? "Yes" : "No"}
                      onValueChange={(v) => updateOrder(o.id, { cobrado: v === "Yes" })}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right font-medium">{currency.format(totalFor(o))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </section>
  );
};

export default OrdersTab;
