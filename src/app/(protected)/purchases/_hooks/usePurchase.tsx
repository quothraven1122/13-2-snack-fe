import {
  type UseMutateFunction,
  useMutation,
  useQuery,
} from '@tanstack/react-query';

import * as cartService from '@/lib/services/cartService';
import * as orderService from '@/lib/services/orderService';

type UsePurchaseProps = {
  id: number;
};
type UsePurchaseResult = {
  isPending: boolean;
  isError: boolean;
  purchaseData: orderService.MyOrderDetail | undefined;
  addToCart: UseMutateFunction<unknown, Error, cartService.AddCartItemInput>;
};

export default function usePurchase({
  id,
}: UsePurchaseProps): UsePurchaseResult {
  const {
    data: purchaseData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['myOrder', id],
    queryFn: () => orderService.getMyOrder(Number(id)),
  });
  const { mutateAsync: addToCart } = useMutation({
    mutationFn: ({ productId, quantity }: cartService.AddCartItemInput) =>
      cartService.addCartItem({ productId, quantity }),
  });
  return { isPending, isError, purchaseData, addToCart };
}
