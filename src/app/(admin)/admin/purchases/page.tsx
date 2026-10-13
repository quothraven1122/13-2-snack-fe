'use client';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

import Badge from '@/components/ui/Badge/Badge';
import EmptyProductState from '@/components/ui/EmptyProductState/EmptyProductState';
import InfoTable from '@/components/ui/Info/InfoTable';
import Pagination from '@/components/ui/List/Pagination';
import ProgressBar from '@/components/ui/ProgressBar/ProgressBar';
import { ApprovedPurchaseList } from '@/components/ui/Purchase/PurchaseListItem';
import { useScreenSize } from '@/hooks/common/useScreenSize';
import * as adminOrderService from '@/lib/services/adminOrderService';
import { formatDate } from '@/utils/date';

import OrganizationBudgetCard from './_components/OrganizationBudgetCard';
import PurchaseHeader from './_components/PurchaseHeader';
import usePurchases from './_hooks/usePurchases';

export default function MyOrganizationPurchasesManagement() {
  const router = useRouter();
  const screenSize = useScreenSize();

  const [sort, setSort] = useState<adminOrderService.AdminOrderSort>('latest');
  const [page, setPage] = useState(1);
  const { orderData, budgetData, isPending } = usePurchases({
    sort,
    page,
    screenSize,
  });

  const currentMonthBudget = budgetData?.currentMonthBudget;
  const previousMonthBudget = budgetData?.previousMonthBudget;

  if (orderData?.items.length === 0) {
    return (
      <EmptyProductState
        prefix={<PurchaseHeader sort={sort} setSort={setSort} />}
      />
    );
  }

  return (
    <div className="p-[24px] lg:w-[1400px] lg:m-auto">
      <PurchaseHeader sort={sort} setSort={setSort} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 mb-[40px]">
        <OrganizationBudgetCard
          title="이번 달 예산"
          budget={currentMonthBudget?.startingBudget ?? 0}
          text={`지난 달 예산은 \n ${(previousMonthBudget?.startingBudget ?? 0).toLocaleString()}원이었어요`}
        />
        <OrganizationBudgetCard
          title="이번 달 지출액"
          budget={currentMonthBudget?.spentAmount ?? 0}
          text={`지난 달: ${(previousMonthBudget?.spentAmount ?? 0).toLocaleString()}원`}
          suffix={
            <ProgressBar
              percentage={
                currentMonthBudget?.startingBudget
                  ? (currentMonthBudget.spentAmount ?? 0) /
                    currentMonthBudget.startingBudget
                  : 0
              }
              className="mt-[20px]"
            />
          }
          tooltip={
            <div className="flex flex-col gap-[8px]">
              <p className="text-16-extrabold">
                이번 달 남은 예산:
                {(
                  (currentMonthBudget?.startingBudget ?? 0) -
                  (currentMonthBudget?.spentAmount ?? 0)
                ).toLocaleString()}
                원
              </p>
              <p className="text-14-regular text-gray-300">
                지난 달 남은 예산:{' '}
                {(
                  (previousMonthBudget?.startingBudget ?? 0) -
                  (previousMonthBudget?.spentAmount ?? 0)
                ).toLocaleString()}
                원
              </p>
              <p className="text-14-regular text-gray-300">
                지난 달보다{' '}
                {Math.abs(
                  (currentMonthBudget?.spentAmount ?? 0) -
                    (previousMonthBudget?.spentAmount ?? 0),
                ).toLocaleString()}
                원{' '}
                {(currentMonthBudget?.spentAmount ?? 0) -
                  (previousMonthBudget?.spentAmount ?? 0) >=
                0
                  ? '더 사용했어요'
                  : '덜 사용했어요'}
              </p>
            </div>
          }
        />
        <OrganizationBudgetCard
          title="올해 총 지출액"
          budget={budgetData?.currentYearSpending ?? 0}
          text={`올해 작년보다\n ${((budgetData?.currentYearSpending ?? 0) - (budgetData?.previousYearSpending ?? 0)).toLocaleString()}원 더 지출했어요`}
          className="col-span-2 md:col-span-1"
        />
      </div>
      {screenSize === 'desktop' && (
        <div className="w-full h-[60px] pl-[40px] border-y border-primary-100 grid grid-cols-6 flex items-center text-16-bold text-primary-500">
          <p>구매 요청일</p>
          <p>요청인</p>
          <p>상품</p>
          <p>주문 금액</p>
          <p>구매 승인일</p>
          <p>담당자</p>
        </div>
      )}
      {orderData?.items !== undefined &&
        orderData.items.map((item) =>
          screenSize === 'desktop' ? (
            <ApprovedPurchaseList
              key={item.id}
              requestDate={item.createdAt}
              requester={item.requester}
              product={item.representativeProductName}
              totalItemCount={item.totalItemCount}
              price={item.totalPrice}
              approvalDate={item.createdAt}
              handler={item.handler}
              onClick={() => router.push(`/admin/purchases/${item.id}`)}
            />
          ) : (
            <InfoTable
              key={item.id}
              title={
                <div className="flex justify-between items-center text-16-bold text-primary-950">
                  <h2 className="flex gap-[8px] px-[8px] pb-[14px]">
                    {item.representativeProductName}
                    {item.totalItemCount > 1 &&
                      `외 ${item.totalItemCount - 1}건`}
                    <p className="text-12-regular text-primary-500">
                      총수량 {item.totalItemCount}개
                    </p>
                  </h2>
                  <h2>{item.totalPrice.toLocaleString()}원</h2>
                </div>
              }
              data={[
                {
                  label: '구매 요청일',
                  value: formatDate(item.createdAt),
                },
                {
                  label: '요청인',
                  value: (
                    <div className="flex gap-[8px]">
                      <p>{item.requester.name}</p>
                      {item.requester?.id === item.handler?.id && (
                        <Badge variant="REQUEST" message="즉시 요청" />
                      )}
                    </div>
                  ),
                },
                {
                  label: '구매 승인일',
                  value: formatDate(item.createdAt),
                },
                {
                  label: '담당자',
                  value: item.handler!.name,
                },
              ]}
              onClick={() => router.push(`/admin/purchases/${item.id}`)}
              className="grid-cols-1 md:grid-cols-2 cursor-pointer"
            />
          ),
        )}
      {orderData?.totalPages !== undefined && (
        <Pagination
          currentPage={page}
          totalPages={orderData.totalPages}
          onPageChange={setPage}
          className="mt-[30px]"
        />
      )}
    </div>
  );
}
