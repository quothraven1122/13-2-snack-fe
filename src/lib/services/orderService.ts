import { fetchClient } from './fetchClient';

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

// TODO: BE GET /admin/orders/:id 응답의 items에는 priceAtOrder, quantity, subtotal도 있는데 이 타입에 빠져 있다.
// 같은 응답 타입이 purchaseRequestService.ts의 OrderDetailItem에 BE와 맞게 정의되어 있다.
export type OrderDetailItem = {
  productId: number;
  productName: string;
  imageUrl: string | null;
};

export type CreateOrderItem = {
  cartItemId: number;
  quantity: number;
};

export type CreateOrderInput = {
  items: CreateOrderItem[];
  requestMessage?: string;
};

export type CreateOrderResult = {
  id: number;
};

export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  return fetchClient<CreateOrderResult>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export type MyOrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

export type MyOrderSort = 'latest' | 'lowPrice' | 'highPrice' | '';

export type MyOrder = {
  id: number;
  createdAt: string;
  representativeProductName: string;
  totalItemCount: number;
  totalPrice: number;
  status: MyOrderStatus;
};

export type MyOrdersResponse = {
  items: MyOrder[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export type GetMyOrdersParams = {
  sort?: MyOrderSort;
  page?: number;
  limit?: number;
};

export type MyOrderDetailItem = {
  productId: number;
  productName: string;
  imageUrl: string;
  priceAtOrder: number;
  quantity: number;
  subtotal: number;
};

export type OrderDetail = {
  id: number;
  status: OrderStatus;
  itemsTotal: number;
  deliveryFee: number;
  totalPrice: number;
  requestMessage: string | null;
  responseMessage: string | null;
  requester: { id: number; name: string };
  handler: { id: number; name: string } | null;
  createdAt: string;
  updatedAt: string;
  items: OrderDetailItem[];
};

// 안쓰이고 있는 코드들 전체 이것은 무엇인지 지워도 되는 것인지 확인필요 purchaseRequestService.ts에 있음
export function getOrderDetail(id: number | string): Promise<OrderDetail> {
  return fetchClient<OrderDetail>(`/admin/orders/${id}`);
}

export type OrderDecisionInput = {
  responseMessage: string;
};

export type OrderDecisionResult = {
  id: number;
  status: OrderStatus;
};

export function approveOrder(
  id: number | string,
  data: OrderDecisionInput,
): Promise<OrderDecisionResult> {
  return fetchClient<OrderDecisionResult>(`/admin/orders/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function rejectOrder(
  id: number | string,
  data: OrderDecisionInput,
): Promise<OrderDecisionResult> {
  return fetchClient<OrderDecisionResult>(`/admin/orders/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type MyOrderDetail = {
  id: number;
  status: MyOrderStatus;
  itemsTotal: number;
  deliveryFee: number;
  totalPrice: number;
  requestMessage: string;
  responseMessage: string;
  requester: {
    id: number;
    name: string;
  };
  handler: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  items: MyOrderDetailItem[];
};

export type CancelMyOrderResponse = {
  id: number;
  status: 'CANCELED';
};

// 브라우저 조회(getMyOrders)와 서버 조회(getMyOrdersOnServer)가 같은 주소를 만들도록 한곳에서 만든다.
function toMyOrdersPath(params?: GetMyOrdersParams): string {
  const searchParams = new URLSearchParams();

  if (params?.sort) {
    searchParams.set('sort', params.sort);
  }

  if (params?.page !== undefined) {
    searchParams.set('page', String(params.page));
  }

  if (params?.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();

  return `/me/orders${query ? `?${query}` : ''}`;
}

//GET /me/orders
export async function getMyOrders(
  params?: GetMyOrdersParams,
): Promise<MyOrdersResponse> {
  return fetchClient<MyOrdersResponse>(toMyOrdersPath(params));
}

/*
@ 서버 조회 (서버 컴포넌트 전용)
- 서버에서 데이터를 미리 조회해 상품명·이미지가 첫 HTML에 담기도록 해 LCP를 개선한다.
- 서버에서 직접 쿠키를 전달해 요청하며, 실패 시 null을 반환해 기존 클라이언트 조회로 대체한다.
- 이 파일은 클라이언트 컴포넌트도 import하므로 next/headers 대신 쿠키 문자열을 인자로 받는다.
*/
const SERVER_FETCH_TIMEOUT_MS = 3000;

async function fetchOnServer<T>(
  path: string,
  cookie: string,
): Promise<T | null> {
  // next.config의 /api 프록시와 같은 주소. 서버에서만 읽으므로 NEXT_PUBLIC_이 필요 없다.
  const apiBaseUrl = process.env.API_URL;

  if (!apiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { cookie },
      cache: 'no-store',
      signal: AbortSignal.timeout(SERVER_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getMyOrdersOnServer(
  params: GetMyOrdersParams,
  cookie: string,
): Promise<MyOrdersResponse | null> {
  return fetchOnServer<MyOrdersResponse>(toMyOrdersPath(params), cookie);
}

// GET /me/orders/:id
export async function getMyOrder(id: number): Promise<MyOrderDetail> {
  return fetchClient<MyOrderDetail>(`/me/orders/${id}`);
}

export async function getMyOrderOnServer(
  id: number,
  cookie: string,
): Promise<MyOrderDetail | null> {
  if (!Number.isInteger(id)) {
    return null;
  }

  return fetchOnServer<MyOrderDetail>(`/me/orders/${id}`, cookie);
}

//DELETE /me/orders/:id
export async function cancelMyOrder(
  id: number,
): Promise<CancelMyOrderResponse> {
  return fetchClient<CancelMyOrderResponse>(`/me/orders/${id}`, {
    method: 'DELETE',
  });
}
