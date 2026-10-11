import {
  type UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import * as orderService from '@/lib/services/orderService';

type UsePurchasesProps = {
  sort: orderService.MyOrderSort;
  page: number;
  screenSize: 'mobile' | 'tablet' | 'desktop';
};
type UsePurchasesResult = {
  isPending: boolean;
  purchaseDataList: orderService.MyOrdersResponse | undefined;
  cancelOrder: UseMutateFunction<
    orderService.CancelMyOrderResponse,
    Error,
    number
  >;
};

export default function usePurchases({
  sort,
  page,
  screenSize,
}: UsePurchasesProps): UsePurchasesResult {
  const queryClient = useQueryClient();
  const limit = screenSize === 'desktop' ? 6 : screenSize === 'tablet' ? 8 : 3;

  //1. 구매 데이터 불러오는 query 함수
  const { data: purchaseDataList, isPending } = useQuery({
    queryKey: ['myOrders', sort, page, limit],
    queryFn: () => orderService.getMyOrders({ sort, page, limit }),
    enabled: !!screenSize,
  });

  //2. 본인의 주문 취소하는 mutation 함수
  const { mutate: cancelOrder } = useMutation({
    mutationFn: (id: number) => orderService.cancelMyOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['myOrders'],
      });
    },
  });
  return { isPending, purchaseDataList, cancelOrder };
}
