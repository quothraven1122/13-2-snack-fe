import {
  type UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import * as orderService from '@/lib/services/orderService';

type ScreenSize = 'mobile' | 'tablet' | 'desktop';

// 화면 크기별 한 페이지 개수. 서버 페이지도 같은 규칙으로 첫 페이지를 미리 받는다.
export function getMyOrdersLimit(screenSize: ScreenSize): number {
  return screenSize === 'desktop' ? 6 : screenSize === 'tablet' ? 8 : 3;
}

// 서버 페이지가 같은 키로 데이터를 미리 넣어두므로(HydrationBoundary) 키를 한곳에서 만든다.
export function myOrdersQueryKey(
  sort: orderService.MyOrderSort,
  page: number,
  limit: number,
): readonly [string, orderService.MyOrderSort, number, number] {
  return ['myOrders', sort, page, limit];
}

// 서버에서 받은 데이터를 화면에 그리자마자 다시 요청하지 않도록 잠시 신선하다고 본다.
const MY_ORDERS_STALE_TIME = 60 * 1000;

type UsePurchasesProps = {
  sort: orderService.MyOrderSort;
  page: number;
  screenSize: ScreenSize;
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
  const limit = getMyOrdersLimit(screenSize);

  //1. 구매 데이터 불러오는 query 함수
  const { data: purchaseDataList, isPending } = useQuery({
    queryKey: myOrdersQueryKey(sort, page, limit),
    queryFn: () => orderService.getMyOrders({ sort, page, limit }),
    enabled: !!screenSize,
    staleTime: MY_ORDERS_STALE_TIME,
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
