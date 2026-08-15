import { Schedule } from "@/Types";
import { listMySchedules } from "@/lib/api/customer";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type OrderListItem = Schedule & {
  tag: string;
  customerName: string;
  phone: string;
  preferences?: string[];
};

interface OrderContextData {
  orders: OrderListItem[];
  loading: boolean;
  refreshOrders: () => Promise<void>;
  addOrder: (order: OrderListItem) => void;
}

const OrderContext = createContext<OrderContextData | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = async () => {
    try {
      setLoading(true);
      const rawSchedules = await listMySchedules();
      if (Array.isArray(rawSchedules)) {
        const formatted: OrderListItem[] = rawSchedules.map((s: any, idx: number) => {
          const carObj = s.car || {
            id: "temp-car",
            model: "Sedan",
            company: "Standard",
            type: "sedan",
            carNumber: "DL 01 AB 1234",
          };

          const customerObj = s.customer || {};
          const userObj = customerObj.user || {};
          const custName = customerObj.name || userObj.name || customerObj.phone || "Customer";
          const custPhone = customerObj.phone || userObj.phone || "+91 98765 43210";
          const tagNum = 1000 + idx;

          return {
            id: s._id || String(idx + 1),
            tag: "A-" + tagNum,
            customerName: custName,
            customer: customerObj._id || "cust-" + idx,
            phone: custPhone,
            car: {
              id: carObj._id || carObj.id || "car-" + idx,
              model: carObj.model || "Sedan",
              company: carObj.company || "Standard",
              type: carObj.type || "sedan",
              carNumber: carObj.carNumber || "DL 01 AB 1234",
            },
            appointmentDate: s.appointmentDate || new Date().toISOString(),
            time: s.time || "10:00 AM",
            status: s.status || "pending",
            preferences: s.preferences || ["Standard Wash"],
          };
        });
        setOrders(formatted);
      }
    } catch (err) {
      console.log("[OrderContext] Note: using cached or empty orders list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const addOrder = (order: OrderListItem) => {
    setOrders((prev) => [order, ...prev]);
  };

  return (
    <OrderContext.Provider value={{ orders, loading, refreshOrders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
};
