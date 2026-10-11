import {
  type UseMutateAsyncFunction,
  useMutation,
  useQuery,
} from '@tanstack/react-query';

import * as cartService from '@/lib/services/cartService';
import * as orderService from '@/lib/services/orderService';

// 서버 페이지가 같은 키로 데이터를 미리 넣어두므로(HydrationBoundary) 키를 한곳에서 만든다.
export function myOrderQueryKey(id: number): readonly [string, number] {
  return ['myOrder', id];
}

// 서버에서 받은 데이터를 화면에 그리자마자 다시 요청하지 않도록 잠시 신선하다고 본다.
const MY_ORDER_STALE_TIME = 60 * 1000;

type UsePurchaseProps = {
  id: number;
};
type UsePurchaseResult = {
  isPending: boolean;
  isError: boolean;
  purchaseData: orderService.MyOrderDetail | undefined;
  addToCart: UseMutateAsyncFunction<
    unknown,
    Error,
    cartService.AddCartItemInput
  >;
};

export default function usePurchase({
  id,
}: UsePurchaseProps): UsePurchaseResult {
  const {
    data: purchaseData,
    isPending,
    isError,
  } = useQuery({
    queryKey: myOrderQueryKey(id),
    queryFn: () => orderService.getMyOrder(id),
    enabled: Number.isInteger(id),
    staleTime: MY_ORDER_STALE_TIME,
  });
  const { mutateAsync: addToCart } = useMutation({
    mutationFn: ({ productId, quantity }: cartService.AddCartItemInput) =>
      cartService.addCartItem({ productId, quantity }),
  });
  return { isPending, isError, purchaseData, addToCart };
}
