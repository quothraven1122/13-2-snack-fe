'use client';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import EmptyProductState from '@/components/ui/EmptyProductState/EmptyProductState';
import Pagination from '@/components/ui/List/Pagination';
import {
  PurchaseListItem,
  PurchaseListItemMobile,
} from '@/components/ui/Purchase/PurchaseListItem';
import { sortMenu } from '@/constants/dropdownMenu';
import { useScreenSize } from '@/hooks/common/useScreenSize';
import type { MyOrderSort } from '@/lib/services/orderService';

import useCancelPurchaseModal from './_hooks/useCancelPurchaseModal';
import usePurchases from './_hooks/usePurchases';

export default function MyPurchasesPage() {
  const router = useRouter();

  const [sort, setSort] = useState<MyOrderSort>('');
  const [page, setPage] = useState(1);
  const screenSize = useScreenSize();

  const { isPending, purchaseDataList, cancelOrder } = usePurchases({
    sort,
    page,
    screenSize,
  });
  const openCancelModal = useCancelPurchaseModal({ onCancel: cancelOrder });

  if (purchaseDataList?.items.length === 0) {
    return <EmptyProductState />;
  }

  return (
    <div className="w-[80%] m-auto pb-[20px]">
      <div className="w-full flex justify-between items-center text-18-bold mb-[40px]">
        <h1>구매 요청 내역</h1>
        <DropdownButton
          value={sort}
          onChange={(value) => setSort(value as MyOrderSort)}
          placeholder="정렬"
          listClassName="border border-primary-100"
          containerClassName="border border-primary-100 text-16-regular"
          className="border-0"
        >
          {sortMenu.map(({ label, name }) => (
            <DropdownItem
              key={label}
              value={label}
              className="text-center justify-center text-16-regular"
            >
              {name}
            </DropdownItem>
          ))}
        </DropdownButton>
      </div>
      {screenSize === 'desktop' && (
        <div className="w-full h-[60px] pl-[40px] border-y border-primary-100 grid grid-cols-5 flex items-center text-16-bold text-primary-500">
          <p>구매 요청일</p>
          <p>상품 정보</p>
          <p>주문 금액</p>
          <p>상태</p>
          <p>비고</p>
        </div>
      )}
      {purchaseDataList?.items !== undefined &&
        (screenSize !== 'desktop'
          ? purchaseDataList.items.map((item) => (
              <PurchaseListItemMobile
                key={item.id}
                date={item.createdAt}
                product={item.representativeProductName}
                totalItemCount={item.totalItemCount}
                price={item.totalPrice}
                status={item.status}
                onClick={() => router.push(`/purchases/${item.id}`)}
                onCancel={() => openCancelModal(item)}
              />
            ))
          : purchaseDataList.items.map((item) => (
              <PurchaseListItem
                key={item.id}
                date={item.createdAt}
                product={item.representativeProductName}
                totalItemCount={item.totalItemCount}
                price={item.totalPrice}
                status={item.status}
                onClick={() => router.push(`/purchases/${item.id}`)}
                onCancel={() => openCancelModal(item)}
              />
            )))}
      {purchaseDataList?.totalPages !== undefined && (
        <Pagination
          currentPage={page}
          totalPages={purchaseDataList.totalPages}
          onPageChange={setPage}
          className="mt-[30px]"
        />
      )}
    </div>
  );
}
