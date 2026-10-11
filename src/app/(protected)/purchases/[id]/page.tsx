import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { getMyOrderOnServer } from '@/lib/services/orderService';

import PurchaseDetailView from '../_components/PurchaseDetailView';
import { myOrderQueryKey } from '../_hooks/usePurchase';

type PurchaseDetailPageProps = {
  params: Promise<{ id: string }>;
};

// 상세를 서버에서 받아 HTML에 담는다. (자세한 이유는 orderService의 서버 조회 주석)
// PurchaseDetailView는 같은 쿼리 키로 이 데이터를 이어받아 첫 요청을 다시 하지 않는다.
export default async function PurchaseDetailPage({
  params,
}: PurchaseDetailPageProps) {
  const { id } = await params;
  const purchaseId = Number(id);

  const cookieStore = await cookies();
  const queryClient = new QueryClient();
  const purchase = await getMyOrderOnServer(purchaseId, cookieStore.toString());

  // 실패하면 비워 둔다. 화면이 기존처럼 브라우저에서 받는다.
  if (purchase) {
    queryClient.setQueryData(myOrderQueryKey(purchaseId), purchase);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PurchaseDetailView id={purchaseId} />
    </HydrationBoundary>
  );
}
