import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { getMyOrdersOnServer } from '@/lib/services/orderService';

import PurchasesView from './_components/PurchasesView';
import { getMyOrdersLimit, myOrdersQueryKey } from './_hooks/usePurchases';

// 화면이 처음 그려질 때의 정렬·페이지. PurchasesView의 useState 초기값과 같아야 한다.
const INITIAL_SORT = '';
const INITIAL_PAGE = 1;
// 서버는 화면 크기를 모른다. useScreenSize의 초기값이 'mobile'이라
// 브라우저의 첫 렌더링도 mobile 개수로 조회하므로, 같은 개수로 받아야 캐시를 이어받는다.
const INITIAL_LIMIT = getMyOrdersLimit('mobile');

// 첫 페이지를 서버에서 받아 HTML에 담는다. (자세한 이유는 orderService.getMyOrdersOnServer)
// PurchasesView는 같은 쿼리 키로 이 데이터를 이어받아 첫 요청을 다시 하지 않는다.
export default async function PurchasesPage() {
  const cookieStore = await cookies();
  const queryClient = new QueryClient();
  const firstPage = await getMyOrdersOnServer(
    { sort: INITIAL_SORT, page: INITIAL_PAGE, limit: INITIAL_LIMIT },
    cookieStore.toString(),
  );

  // 실패하면 비워 둔다. 화면이 기존처럼 브라우저에서 받는다.
  if (firstPage) {
    queryClient.setQueryData(
      myOrdersQueryKey(INITIAL_SORT, INITIAL_PAGE, INITIAL_LIMIT),
      firstPage,
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PurchasesView />
    </HydrationBoundary>
  );
}
