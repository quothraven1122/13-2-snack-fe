import { useQuery } from '@tanstack/react-query';

import * as adminOrderService from '@/lib/services/adminOrderService';

type UsePurchaseProps = {
  id: number;
};
type UsePurchaseResult = {
  purchaseData: adminOrderService.AdminOrderDetail | undefined;
  isPending: boolean;
  isError: boolean;
};

export default function usePurchase({
  id,
}: UsePurchaseProps): UsePurchaseResult {
  const {
    data: purchaseData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['adminOrder', id],
    queryFn: () => adminOrderService.getAdminOrder(id),
    enabled: Number.isInteger(id),
  });

  return { purchaseData, isPending, isError };
}
