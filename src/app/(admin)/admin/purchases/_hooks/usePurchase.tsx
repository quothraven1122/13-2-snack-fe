import { useQuery } from '@tanstack/react-query';

import * as adminOrderService from '@/lib/services/adminOrderService';

// 서버 페이지가 같은 키로 데이터를 미리 넣어두므로(HydrationBoundary) 키를 한곳에서 만든다.
export function purchaseQueryKey(id: number): readonly [string, number] {
  return ['adminOrder', id];
}

// 서버에서 받은 데이터를 화면에 그리자마자 다시 요청하지 않도록 잠시 신선하다고 본다.
const PURCHASE_STALE_TIME = 60 * 1000;

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
    queryKey: purchaseQueryKey(id),
    queryFn: () => adminOrderService.getAdminOrder(id),
    enabled: Number.isInteger(id),
    staleTime: PURCHASE_STALE_TIME,
  });

  return { purchaseData, isPending, isError };
}
