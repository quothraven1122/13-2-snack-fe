import { useQuery } from '@tanstack/react-query';

import * as adminOrderService from '@/lib/services/adminOrderService';
import * as budgetService from '@/lib/services/budgetService';

type UsePurchasesProps = {
  sort: adminOrderService.AdminOrderSort;
  page?: number;
  screenSize: 'mobile' | 'tablet' | 'desktop';
};
type UsePurchasesResult = {
  orderData: adminOrderService.AdminOrderListResponse | undefined;
  budgetData: budgetService.BudgetSummary | undefined;
  isPending: boolean;
};

export default function usePurchases({
  sort,
  page = 1,
  screenSize,
}: UsePurchasesProps): UsePurchasesResult {
  const limit = screenSize === 'desktop' ? 4 : 3;
  const status = 'APPROVED';

  //1. 구매 내역 데이터 가져오는 Query 함수
  const { data: orderData, isPending: isPurchasePending } = useQuery({
    queryKey: ['adminOrders', sort, page, limit],
    queryFn: () =>
      adminOrderService.getAdminOrders({
        sort,
        page,
        limit,
        status,
      }),
  });

  //2. Budget 관련 데이터 가져오는 Query 함수
  const { data: budgetData, isPending: isBudgetPending } = useQuery({
    queryKey: ['budget', 'summary'],
    queryFn: () => budgetService.getBudgetSummary(),
  });

  return {
    orderData,
    budgetData,
    isPending: isPurchasePending || isBudgetPending,
  };
}
